import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function ProfilePage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Configurações</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais e configurações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <p className="text-lg">{session.user?.name || "Não informado"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-lg">{session.user?.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tipo de Conta</label>
              <p className="text-lg capitalize">{session.user?.role?.toLowerCase() || "Usuário"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Configurações da Conta</CardTitle>
            <CardDescription>
              Altere suas preferências e configurações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Em desenvolvimento:</strong> A edição de perfil e outras 
                configurações estarão disponíveis em breve.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Link href="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
