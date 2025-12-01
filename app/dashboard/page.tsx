import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, CreditCard, Plus } from "lucide-react"

export default async function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Bem-vindo ao painel de gerenciamento de clientes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Nenhum cliente cadastrado ainda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Clientes com status ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assinatura
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Free</div>
            <p className="text-xs text-muted-foreground">
              Faça upgrade para adicionar mais clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Começar Agora</CardTitle>
            <CardDescription>
              Configure seu sistema e comece a gerenciar seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Cadastrar Cliente</h3>
                <p className="text-sm text-gray-600">
                  Adicione seu primeiro cliente
                </p>
              </div>
              <Link href="/dashboard/customers/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Ver Clientes</h3>
                <p className="text-sm text-gray-600">
                  Liste todos os seus clientes
                </p>
              </div>
              <Link href="/dashboard/customers">
                <Button variant="outline">Ver Lista</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sua Assinatura</CardTitle>
            <CardDescription>
              Gerencie seu plano e pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Plano Gratuito</h3>
              <p className="text-sm text-gray-600 mb-4">
                Você está no plano gratuito com funcionalidades limitadas.
              </p>
              <Link href="/dashboard/subscription">
                <Button className="w-full">Ver Planos</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📚 Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Cadastre seu primeiro cliente</li>
            <li>Explore as funcionalidades do sistema</li>
            <li>Configure suas preferências de email</li>
            <li>Escolha um plano que atenda suas necessidades</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
