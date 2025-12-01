import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Mail, Phone, MapPin } from "lucide-react"
import { formatPhone, formatDocument } from "@/lib/utils"

export default async function CustomersPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect("/login")
  }

  const customers = await prisma.customer.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Clientes</h1>
          <p className="text-gray-600">
            Gerencie todos os seus clientes cadastrados
          </p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Plus className="h-10 w-10 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Nenhum cliente cadastrado</h2>
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
        </Card>
      ) : (
        <div className="grid gap-4">
          {customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{customer.name}</CardTitle>
                    <CardDescription>
                      Cadastrado em {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!customer.active && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        Inativo
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {formatPhone(customer.phone)}
                      </div>
                    )}
                    {customer.document && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">CPF/CNPJ:</span>
                        {formatDocument(customer.document)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {(customer.city || customer.state) && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>
                          {customer.city && customer.state
                            ? `${customer.city}, ${customer.state}`
                            : customer.city || customer.state}
                        </span>
                      </div>
                    )}
                    {customer.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {customer.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{customer.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {customers.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            📊 Total de {customers.length} cliente{customers.length !== 1 ? 's' : ''} cadastrado{customers.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
