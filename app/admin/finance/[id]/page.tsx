import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  ArrowLeft,
  DollarSign,
  User,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Mail,
  FileText,
} from "lucide-react"

type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" | "CANCELLED"

export default async function AdminFinanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      subscription: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
          plan: {
            select: {
              name: true,
              price: true,
              interval: true,
            },
          },
        },
      },
    },
  })

  if (!payment) {
    notFound()
  }

  const getStatusConfig = (status: PaymentStatus) => {
    const configs = {
      APPROVED: {
        variant: "success" as const,
        label: "Aprovado",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      PENDING: {
        variant: "warning" as const,
        label: "Pendente",
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      },
      REJECTED: {
        variant: "destructive" as const,
        label: "Rejeitado",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
      REFUNDED: {
        variant: "secondary" as const,
        label: "Reembolsado",
        icon: RefreshCw,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      },
      CANCELLED: {
        variant: "secondary" as const,
        label: "Cancelado",
        icon: XCircle,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      },
    }
    return configs[status] || configs.PENDING
  }

  const statusConfig = getStatusConfig(payment.status as PaymentStatus)
  const StatusIcon = statusConfig.icon

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/finance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Financeiro
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Informações da Transação */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    Transação #{payment.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription>
                    Criada em {new Date(payment.createdAt).toLocaleString("pt-BR")}
                  </CardDescription>
                </div>
                <Badge variant={statusConfig.variant} className="text-lg px-4 py-2">
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {statusConfig.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Valor */}
              <div className={`p-6 rounded-lg ${statusConfig.bgColor} border-2 border-${statusConfig.color.replace('text-', 'border-')}`}>
                <p className="text-sm text-gray-600 mb-2">Valor da Transação</p>
                <p className={`text-4xl font-bold ${statusConfig.color}`}>
                  R$ {Number(payment.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Detalhes da Transação */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    Status do Pagamento
                  </label>
                  <Badge variant={statusConfig.variant} className="text-base px-3 py-1">
                    {statusConfig.label}
                  </Badge>
                </div>

                {payment.paymentMethod && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      Método de Pagamento
                    </label>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                      <span className="font-medium capitalize">{payment.paymentMethod}</span>
                    </div>
                  </div>
                )}

                {payment.paymentType && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      Tipo de Pagamento
                    </label>
                    <span className="font-medium capitalize">{payment.paymentType}</span>
                  </div>
                )}

                {payment.mercadoPagoId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      ID Mercado Pago
                    </label>
                    <span className="font-mono text-sm">{payment.mercadoPagoId}</span>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    Data de Criação
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span>{new Date(payment.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                </div>

                {payment.paidAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      Data do Pagamento
                    </label>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{new Date(payment.paidAt).toLocaleString("pt-BR")}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações da Assinatura */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Assinatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    Plano Contratado
                  </label>
                  <p className="text-lg font-semibold">{payment.subscription.plan.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    Valor do Plano
                  </label>
                  <p className="text-lg font-semibold">
                    R$ {Number(payment.subscription.plan.price).toFixed(2)}/
                    {payment.subscription.plan.interval === "MONTHLY" ? "mês" : "ano"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    Status da Assinatura
                  </label>
                  <Badge variant={
                    payment.subscription.status === "ACTIVE" ? "success" : "secondary"
                  }>
                    {payment.subscription.status}
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">
                    Período Atual
                  </label>
                  <p className="text-sm">
                    {new Date(payment.subscription.currentPeriodStart).toLocaleDateString("pt-BR")}
                    {" até "}
                    {new Date(payment.subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Informações do Cliente */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{payment.subscription.user.name || "Sem nome"}</p>
                  <p className="text-sm text-gray-500">{payment.subscription.user.email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  ID do Usuário
                </label>
                <p className="font-mono text-sm">{payment.subscription.user.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Cliente desde
                </label>
                <p className="text-sm">
                  {new Date(payment.subscription.user.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Link href={`/admin/clients/${payment.subscription.user.id}`}>
                  <Button className="w-full" variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Ver Perfil do Cliente
                  </Button>
                </Link>
                <a href={`mailto:${payment.subscription.user.email}`}>
                  <Button className="w-full" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Email
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Administrativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {payment.status === "PENDING" && (
                <>
                  <Button className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reenviar Link de Pagamento
                  </Button>
                  <Button className="w-full" variant="outline">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Transação
                  </Button>
                </>
              )}

              {payment.status === "APPROVED" && (
                <Button className="w-full" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Processar Reembolso
                </Button>
              )}

              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Gerar Recibo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}