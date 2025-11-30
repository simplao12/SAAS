import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewCustomerPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Novo Cliente</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Cadastro de Cliente</CardTitle>
            <CardDescription>
              Preencha as informações do cliente abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Em desenvolvimento:</strong> Esta funcionalidade completa estará disponível em breve. 
                Por enquanto, o sistema está configurado para autenticação e gerenciamento de assinaturas.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                O formulário completo de cadastro de clientes será implementado aqui, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Dados pessoais (nome, email, telefone, documento)</li>
                <li>Endereço completo</li>
                <li>Notas e observações</li>
                <li>Tags para categorização</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
          <Link href="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
