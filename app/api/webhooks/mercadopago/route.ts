import { NextRequest, NextResponse } from 'next/server'
import { processPaymentWebhook } from '@/lib/mercadopago'
import { sendPaymentConfirmation } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Webhook recebido:', body)

    if (body.type === 'payment') {
      const paymentId = body.data.id
      
      if (!paymentId) {
        return NextResponse.json(
          { error: 'ID de pagamento não fornecido' },
          { status: 400 }
        )
      }

      const result = await processPaymentWebhook({
        paymentId,
        status: body.action,
        externalReference: body.external_reference,
      })

      if (result.success && result.subscription.status === 'ACTIVE') {
        const user = await prisma.user.findUnique({
          where: { id: result.subscription.userId },
        })

        const plan = await prisma.plan.findUnique({
          where: { id: result.subscription.planId },
        })

        if (user && plan) {
          await sendPaymentConfirmation(
            user.email,
            user.name || 'Cliente',
            plan.name,
            Number(plan.price)
          )
        }
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
