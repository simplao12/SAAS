import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar parâmetros de filtro
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Construir filtros
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    // Buscar todos os pagamentos
    const payments = await prisma.payment.findMany({
      where,
      include: {
        subscription: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            plan: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Criar CSV
    const headers = [
      'ID Transação',
      'Cliente',
      'Email',
      'Plano',
      'Valor',
      'Status',
      'Método',
      'Mercado Pago ID',
      'Data Criação',
      'Data Pagamento',
    ]

    const rows = payments.map((payment) => [
      payment.id,
      payment.subscription.user.name || 'Sem nome',
      payment.subscription.user.email,
      payment.subscription.plan.name,
      `R$ ${Number(payment.amount).toFixed(2)}`,
      payment.status,
      payment.paymentMethod || 'N/A',
      payment.mercadoPagoId || 'N/A',
      new Date(payment.createdAt).toLocaleString('pt-BR'),
      payment.paidAt ? new Date(payment.paidAt).toLocaleString('pt-BR') : 'N/A',
    ])

    // Montar CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => 
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    // Registrar log
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'export_transactions',
        entity: 'payment',
        details: {
          count: payments.length,
          filters: { status, dateFrom, dateTo },
        },
      },
    })

    // Retornar CSV
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="transacoes_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Erro ao exportar transações:', error)
    
    return NextResponse.json(
      { error: 'Erro ao exportar transações' },
      { status: 500 }
    )
  }
}
