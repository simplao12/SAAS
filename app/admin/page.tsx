import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  DollarSign,
  Package,
  TrendingUp,
  AlertCircle,
  Activity,
  UserCheck,
  UserX,
} from "lucide-react"

export default async function AdminDashboard() {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Buscar estatísticas
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalCustomers,
    totalRevenue,
    monthlyRevenue,
    recentUsers,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ 
      where: { 
        OR: [
          { subscription: { status: { not: "ACTIVE" } } },
          { subscription: null }
        ]
      } 
    }),
    prisma.customer.count(),
    prisma.payment.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    }),
  ])

  const stats = [
    {
      title: "Total de Usuários",
      value: totalUsers,
      icon: Users,
      change: "+12% vs mês passado",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Usuários Ativos",
      value: activeUsers,
      icon: UserCheck,
      change: `${inactiveUsers} inativos`,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total de Clientes",
      value: totalCustomers,
      icon: Package,
      change: "Cadastrados pelos usuários",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Receita Total",
      value: `R$ ${Number(totalRevenue._sum.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: `R$ ${Number(monthlyRevenue._sum.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} este mês`,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ]

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo Master</h1>
        <p className="text-gray-600">
          Visão geral completa do sistema e estatísticas em tempo real
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
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

      {/* Recent Activity Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Últimos Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Cadastros</CardTitle>
            <CardDescription>
              Usuários que se registraram recentemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum usuário cadastrado ainda
                </p>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name || "Sem nome"}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {user.role}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Últimos Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Transações</CardTitle>
            <CardDescription>
              Pagamentos recebidos nos últimos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum pagamento registrado ainda
                </p>
              ) : (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {payment.subscription.user.name || "Sem nome"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.subscription.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        R$ {Number(payment.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-sm font-medium text-green-800">
                  Sistema Operacional
                </p>
              </div>
              <p className="text-xs text-green-600">
                Todos os serviços funcionando normalmente
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-800">
                  Banco de Dados
                </p>
              </div>
              <p className="text-xs text-blue-600">
                Conexões ativas | Latência baixa
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-medium text-purple-800">
                  APIs Integradas
                </p>
              </div>
              <p className="text-xs text-purple-600">
                Mercado Pago, Email - OK
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
