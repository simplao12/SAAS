import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

const preference = new Preference(client)
const payment = new Payment(client)

interface CreatePreferenceParams {
  userId: string
  planId: string
  userEmail: string
  userName: string
}

export async function createMercadoPagoPreference({
  userId,
  planId,
  userEmail,
  userName,
}: CreatePreferenceParams) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      throw new Error('Plano não encontrado')
    }

    const response = await preference.create({
      body: {
        items: [
          {
            id: plan.id,
            title: `Assinatura ${plan.name}`,
            description: plan.description || '',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: Number(plan.price),
          },
        ],
        payer: {
          email: userEmail,
          name: userName,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
        metadata: {
          userId,
          planId,
        },
        statement_descriptor: 'SAAS CLIENTES',
        external_reference: `${userId}-${planId}-${Date.now()}`,
      },
    })

    return response
  } catch (error) {
    console.error('Erro ao criar preferência:', error)
    throw new Error('Erro ao criar preferência de pagamento')
  }
}

export async function getPaymentDetails(paymentId: string) {
  try {
    const paymentDetails = await payment.get({ id: paymentId })
    return paymentDetails
  } catch (error) {
    console.error('Erro ao buscar detalhes do pagamento:', error)
    throw new Error('Erro ao buscar detalhes do pagamento')
  }
}

interface ProcessPaymentParams {
  paymentId: string
  status: string
  externalReference: string
}

export async function processPaymentWebhook({
  paymentId,
  status,
  externalReference,
}: ProcessPaymentParams) {
  try {
    const paymentDetails = await getPaymentDetails(paymentId)
    
    const userId = paymentDetails.metadata?.user_id as string
    const planId = paymentDetails.metadata?.plan_id as string

    if (!userId || !planId) {
      throw new Error('Dados de pagamento inválidos')
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      throw new Error('Plano não encontrado')
    }

    let subscriptionStatus: 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' = 'PENDING'
    let paymentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'CANCELLED' = 'PENDING'

    if (status === 'approved') {
      subscriptionStatus = 'ACTIVE'
      paymentStatus = 'APPROVED'
    } else if (status === 'rejected') {
      paymentStatus = 'REJECTED'
    } else if (status === 'cancelled') {
      paymentStatus = 'CANCELLED'
    } else if (status === 'refunded') {
      paymentStatus = 'REFUNDED'
    }

    const currentPeriodStart = new Date()
    const currentPeriodEnd = new Date()
    
    if (plan.interval === 'MONTHLY') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId,
        status: subscriptionStatus,
        mercadoPagoId: paymentId,
        mercadoPagoStatus: status,
        currentPeriodStart,
        currentPeriodEnd,
      },
      update: {
        status: subscriptionStatus,
        mercadoPagoStatus: status,
      },
    })

    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.price,
        status: paymentStatus,
        mercadoPagoId: paymentId,
        paymentMethod: paymentDetails.payment_method_id || 'unknown',
        paymentType: paymentDetails.payment_type_id || 'unknown',
        paidAt: paymentStatus === 'APPROVED' ? new Date() : null,
      },
    })

    return { success: true, subscription }
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    throw error
  }
}
