import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Criar nova preferência no Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    })
    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: [
          {
            title: `Assinatura ${payment.subscription.plan.name}`,
            quantity: 1,
            unit_price: Number(payment.amount),
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: payment.subscription.user.email,
          name: payment.subscription.user.name || undefined,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=pending`,
        },
        auto_return: 'approved',
        external_reference: payment.id,
      },
    })

    // Atualizar o payment com novo mercadoPagoId
    await prisma.payment.update({
      where: { id },
      data: {
        mercadoPagoId: result.id,
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
        },
      },
    })

    // TODO: Enviar email com novo link de pagamento
    // await sendPaymentEmail(payment.subscription.user.email, result.init_point)

    return NextResponse.json({
      success: true,
      message: 'Link de pagamento reenviado com sucesso',
      paymentLink: result.init_point,
      mercadoPagoId: result.id,
    })
  } catch (error) {
    console.error('Erro ao reenviar pagamento:', error)
    
    // Registrar erro no sistema
    try {
      await prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: 'Erro ao reenviar link de pagamento',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          stack: error instanceof Error ? error.stack : undefined,
        },
      })
    } catch (logError) {
      console.error('Erro ao registrar log:', logError)
    }

    return NextResponse.json(
      { error: 'Erro ao reenviar link de pagamento' },
      { status: 500 }
    )
  }
}