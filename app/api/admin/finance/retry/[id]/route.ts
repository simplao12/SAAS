import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const session = await auth()

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            user: true,
            plan: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      )
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Apenas pagamentos pendentes podem ser reenviados' },
        { status: 400 }
      )
    }

    // Verificar se Mercado Pago está configurado
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Mercado Pago não configurado' },
        { status: 500 }
      )
    }

    // Verificar se as URLs estão configuradas
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json(
        { error: 'URL da aplicação não configurada' },
        { status: 500 }
      )
    }

    // Criar nova preferência no Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    })
    const preference = new Preference(client)

    // Garantir que o usuário tenha um email
    if (!payment.subscription.user.email) {
      return NextResponse.json(
        { error: 'Usuário não possui email cadastrado' },
        { status: 400 }
      )
    }

    // Validar valor do pagamento
    const amount = Number(payment.amount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor do pagamento inválido' },
        { status: 400 }
      )
    }

    const result = await preference.create({
      body: {
        items: [
          {
            id: payment.id,
            title: `Assinatura ${payment.subscription.plan.name}`,
            description: `Pagamento referente à assinatura do plano ${payment.subscription.plan.name}`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: payment.subscription.user.email,
          name: payment.subscription.user.name || '',
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=pending`,
        },
        auto_return: 'approved',
        expires: true,
        expiration_date_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        external_reference: payment.id,
        statement_descriptor: payment.subscription.plan.name.substring(0, 22),
        notification_url: process.env.MERCADOPAGO_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mercado-pago`,
      },
    })

    // Atualizar o payment com novo mercadoPagoId e resetar status se necessário
    await prisma.payment.update({
      where: { id },
      data: {
        mercadoPagoId: result.id,
        mercadoPagoPreferenceId: typeof result === 'object' && 'id' in result ? result.id : null,
        mercadoPagoUrl: result.init_point || result.sandbox_init_point || null,
        mercadoPagoStatus: 'pending',
        updatedAt: new Date(),
      },
    })

    // Registrar log de atividade
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'resend_payment',
        entity: 'payment',
        entityId: id,
        details: {
          paymentId: id,
          newMercadoPagoId: result.id,
          amount: payment.amount.toString(),
          userId: session.user.id,
          userName: session.user.name,
          subscriptionId: payment.subscription.id,
          planName: payment.subscription.plan.name,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Link de pagamento reenviado com sucesso',
      paymentLink: result.init_point || result.sandbox_init_point,
      mercadoPagoId: result.id,
      paymentId: id,
    })
  } catch (error) {
    console.error('Erro ao reenviar pagamento:', error)
    
    // Registrar erro no sistema
    try {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorStack = error instanceof Error ? error.stack : undefined
      
      await prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: 'Erro ao reenviar link de pagamento',
          details: {
            error: errorMessage,
            timestamp: new Date().toISOString(),
            endpoint: 'POST /api/payments/[id]/resend',
          },
          stack: errorStack,
        },
      })
    } catch (logError) {
      console.error('Erro ao registrar log:', logError)
    }

    return NextResponse.json(
      { 
        error: 'Erro ao reenviar link de pagamento',
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    )
  }
}