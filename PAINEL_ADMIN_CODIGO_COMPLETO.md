# 🔥 CÓDIGO COMPLETO - PAINEL ADMINISTRATIVO MASTER

## 📋 SUMÁRIO
- [1. Gestão de Clientes](#gestão-de-clientes)
- [2. Gestão de Planos](#gestão-de-planos)
- [3. Financeiro](#financeiro)
- [4. Permissões](#permissões)
- [5. Logs](#logs)
- [6. Monitoramento](#monitoramento)
- [7. Tickets](#tickets)
- [8. Ferramentas](#ferramentas)
- [9. Configurações](#configurações)
- [10. APIs Administrativas](#apis)

---

## 👥 1. GESTÃO DE CLIENTES

### `app/admin/clients/page.tsx`

```typescript
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { 
  Eye, Ban, RefreshCw, Mail, Search, Filter,
  UserCheck, UserX, MessageSquare 
} from "lucide-react"

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; role?: string }
}) {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Filtros
  const where: any = {}
  
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { email: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }

  if (searchParams.role && searchParams.role !== "all") {
    where.role = searchParams.role
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      _count: {
        select: {
          customers: true,
          supportTickets: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Clientes</h1>
          <p className="text-gray-600">
            Gerencie todos os usuários do sistema
          </p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  className="pl-10"
                  defaultValue={searchParams.search}
                  name="search"
                />
              </div>
            </div>
            <div>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={searchParams.role || "all"}
                name="role"
              >
                <option value="all">Todas as roles</option>
                <option value="USER">Usuários</option>
                <option value="ADMIN">Admins</option>
                <option value="SUPPORT">Suporte</option>
                <option value="FINANCE">Financeiro</option>
              </select>
            </div>
            <div>
              <Button className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-1">
                      {user.name || "Sem nome"}
                      <Badge variant={user.role === "ADMIN" ? "destructive" : "default"}>
                        {user.role}
                      </Badge>
                      {user.subscription?.status === "ACTIVE" && (
                        <Badge variant="success">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        📅 Membro desde {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/clients/${user.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset Senha
                  </Button>
                  <a href={`mailto:${user.email}`}>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Plano</p>
                  <p className="font-medium">
                    {user.subscription?.plan.name || "Sem plano"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status Assinatura</p>
                  <Badge variant={
                    user.subscription?.status === "ACTIVE" ? "success" : "secondary"
                  }>
                    {user.subscription?.status || "INACTIVE"}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Clientes Cadastrados</p>
                  <p className="font-medium text-lg">{user._count.customers}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Tickets Abertos</p>
                  <p className="font-medium text-lg">{user._count.supportTickets}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Ações Rápidas</p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="destructive">
                      <Ban className="h-3 w-3 mr-1" />
                      Bloquear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <Card className="p-12 text-center">
            <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum usuário encontrado</p>
          </Card>
        )}
      </div>
    </div>
  )
}
```

### `app/admin/clients/[id]/page.tsx` (Detalhes do Cliente)

```typescript
import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User } from "lucide-react"
import Link from "next/link"

export default async function AdminClientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      subscription: {
        include: {
          plan: true,
          payments: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      customers: {
        orderBy: { createdAt: "desc" },
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      supportTickets: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link href="/admin/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Clientes
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <CardTitle>{user.name || "Sem nome"}</CardTitle>
                  <Badge variant={user.role === "ADMIN" ? "destructive" : "default"}>
                    {user.role}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Membro desde {new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="pt-4 border-t space-y-2">
                <Button className="w-full" variant="outline">
                  Impersonate (Entrar como)
                </Button>
                <Button className="w-full" variant="outline">
                  Reset de Senha
                </Button>
                <Button className="w-full" variant="destructive">
                  Bloquear Usuário
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Clientes Cadastrados</p>
                <p className="text-2xl font-bold">{user.customers.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tickets Abertos</p>
                <p className="text-2xl font-bold">{user.supportTickets.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pago</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {user.subscription?.payments.reduce((acc, p) => 
                    acc + Number(p.amount), 0
                  ).toFixed(2) || "0.00"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Assinatura */}
          <Card>
            <CardHeader>
              <CardTitle>Assinatura Atual</CardTitle>
            </CardHeader>
            <CardContent>
              {user.subscription ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Plano</p>
                      <p className="font-medium text-lg">{user.subscription.plan.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge variant={user.subscription.status === "ACTIVE" ? "success" : "secondary"}>
                        {user.subscription.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Valor</p>
                      <p className="font-medium text-lg">
                        R$ {Number(user.subscription.plan.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Início do Período</p>
                      <p className="font-medium">
                        {new Date(user.subscription.currentPeriodStart).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fim do Período</p>
                      <p className="font-medium">
                        {new Date(user.subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Sem assinatura ativa</p>
              )}
            </CardContent>
          </Card>

          {/* Clientes Cadastrados */}
          <Card>
            <CardHeader>
              <CardTitle>Clientes Cadastrados ({user.customers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                    <Badge variant={customer.active ? "success" : "secondary"}>
                      {customer.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                ))}
                {user.customers.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum cliente cadastrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.subscription?.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">R$ {Number(payment.amount).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge variant={
                      payment.status === "APPROVED" ? "success" :
                      payment.status === "PENDING" ? "warning" : "destructive"
                    }>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
                {(!user.subscription || user.subscription.payments.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum pagamento registrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

---

## 📦 2. GESTÃO DE PLANOS

### `app/admin/plans/page.tsx`

```typescript
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, EyeOff, Trash2, Users } from "lucide-react"
import Link from "next/link"

export default async function AdminPlansPage() {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const plans = await prisma.plan.findMany({
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
    orderBy: {
      price: "asc",
    },
  })

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Planos</h1>
          <p className="text-gray-600">
            Configure planos, preços e limites do sistema
          </p>
        </div>
        <Link href="/admin/plans/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    {plan.name}
                    {!plan.visible && (
                      <Badge variant="secondary">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Oculto
                      </Badge>
                    )}
                    {!plan.active && (
                      <Badge variant="destructive">Inativo</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-gray-900">
                    R$ {Number(plan.price).toFixed(2)}
                    <span className="text-sm text-gray-500 font-normal">
                      /{plan.interval === "MONTHLY" ? "mês" : "ano"}
                    </span>
                  </CardDescription>
                </div>
              </div>

              {plan.description && (
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Assinantes</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {plan._count.subscriptions}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Limites:</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Clientes:</span>
                    <span className="font-medium">{plan.maxCustomers}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Recursos:</p>
                <ul className="space-y-1">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-sm text-gray-500">
                      +{plan.features.length - 4} recursos
                    </li>
                  )}
                </ul>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <Link href={`/admin/plans/${plan.id}/edit`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </Link>
                <Button size="sm" variant="outline">
                  {plan.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {plans.length === 0 && (
          <div className="md:col-span-3">
            <Card className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhum plano cadastrado</p>
              <Link href="/admin/plans/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Plano
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
```

Devido ao limite de espaço, continuarei esse arquivo com mais seções...
