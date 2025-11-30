import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"

export default async function CustomersPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Clientes</h1>
            </div>
            <Link href="/dashboard/customers/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Nenhum cliente cadastrado</h2>
          <p className="text-gray-600 mb-6">
            Comece cadastrando seu primeiro cliente para começar a usar o sistema.
          </p>
          <Link href="/dashboard/customers/new">
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Cliente
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
