import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { RetryPaymentButton, ExportCSVButton } from "@/components/admin/FinanceActions"
import Link from "next/link"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" | "CANCELLED"

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: {
    search?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }
}) {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Filtros
  const where: any = {}

  if (searchParams.status && searchParams.status !== "all") {
    where.status = searchParams.status
  }

  if (searchParams.dateFrom || searchParams.dateTo) {
    where.createdAt = {}
    if (searchParams.dateFrom) {
      where.createdAt.gte = new Date(searchParams.dateFrom)
    }
    if (searchParams.dateTo) {
      where.createdAt.lte = new Date(searchParams.dateTo)
    }
  }

  // Buscar dados
  const [payments, stats, monthlyRevenue] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        subscription: {
          include: {
            user: {
              select: {
                id: true,
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
        createdAt: "desc",
      },
      take: 50,
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _sum: {
        amount: true,
      },
      _count: true,
    }),
    prisma.payment.groupBy({
      by: ["createdAt"],
      where: {
        status: "APPROVED",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ])

  // Calcular estatísticas
  const totalApproved = stats.find((s) => s.status === "APPROVED")?._sum.amount || 0
  const totalPending = stats.find((s) => s.status === "PENDING")?._sum.amount || 0
  const totalRejected = stats.find((s) => s.status === "REJECTED")?._sum.amount || 0
  const totalPayments = stats.reduce((acc, s) => acc + s._count, 0)

  // Receita do mês atual
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthRevenue = monthlyRevenue
    .filter((r) => {
      const date = new Date(r.createdAt)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((acc, r) => acc + Number(r._sum.amount || 0), 0)

  const statsCards = [
    {
      title: "Total Recebido",
      value: `R$ ${Number(totalApproved).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: `+${((thisMonthRevenue / Number(totalApproved)) * 100).toFixed(1)}% este mês`,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pagamentos Pendentes",
      value: `R$ ${Number(totalPending).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: Clock,
      change: `${stats.find((s) => s.status === "PENDING")?._count || 0} transações`,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Pagamentos Rejeitados",
      value: `R$ ${Number(totalRejected).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: XCircle,
      change: `${stats.find((s) => s.status === "REJECTED")?._count || 0} transações`,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Total de Transações",
      value: totalPayments,
      icon: TrendingUp,
      change: "Todas as transações",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ]

  const getStatusBadge = (status: PaymentStatus) => {
    const variants = {
      APPROVED: { variant: "success" as const, label: "Aprovado", icon: CheckCircle },
      PENDING: { variant: "warning" as const, label: "Pendente", icon: Clock },
      REJECTED: { variant: "destructive" as const, label: "Rejeitado", icon: XCircle },
      REFUNDED: { variant: "secondary" as const, label: "Reembolsado", icon: RefreshCw },
      CANCELLED: { variant: "secondary" as const, label: "Cancelado", icon: XCircle },
    }
    const config = variants[status] || variants.PENDING
    const Icon = config.icon
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gestão Financeira</h1>
        <p className="text-gray-600">
          Acompanhe pagamentos, transações e receitas do sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                name="status"
                defaultValue={searchParams.status || "all"}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Todos</option>
                <option value="APPROVED">Aprovados</option>
                <option value="PENDING">Pendentes</option>
                <option value="REJECTED">Rejeitados</option>
                <option value="REFUNDED">Reembolsados</option>
                <option value="CANCELLED">Cancelados</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <Input
                type="date"
                name="dateFrom"
                defaultValue={searchParams.dateFrom}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <Input
                type="date"
                name="dateTo"
                defaultValue={searchParams.dateTo}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
            <div className="flex items-end">
              <ExportCSVButton
                status={searchParams.status}
                dateFrom={searchParams.dateFrom}
                dateTo={searchParams.dateTo}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes ({payments.length})</CardTitle>
          <CardDescription>
            Últimas 50 transações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma transação encontrada</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      payment.status === "APPROVED" ? "bg-green-100" :
                      payment.status === "PENDING" ? "bg-yellow-100" :
                      "bg-red-100"
                    }`}>
                      <DollarSign className={`h-5 w-5 ${
                        payment.status === "APPROVED" ? "text-green-600" :
                        payment.status === "PENDING" ? "text-yellow-600" :
                        "text-red-600"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {payment.subscription.user.name || "Sem nome"}
                        </p>
                        {getStatusBadge(payment.status as PaymentStatus)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {payment.subscription.user.email}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>Plano: {payment.subscription.plan.name}</span>
                        <span>•</span>
                        <span>{new Date(payment.createdAt).toLocaleString("pt-BR")}</span>
                        {payment.paymentMethod && (
                          <>
                            <span>•</span>
                            <span>Método: {payment.paymentMethod}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        R$ {Number(payment.amount).toFixed(2)}
                      </p>
                      {payment.mercadoPagoId && (
                        <p className="text-xs text-gray-500">
                          ID: {payment.mercadoPagoId.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/finance/${payment.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      </Link>
                      {payment.status === "PENDING" && (
                        <RetryPaymentButton paymentId={payment.id} />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
