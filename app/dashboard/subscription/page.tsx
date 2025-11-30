import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"

export default async function SubscriptionPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const plans = [
    {
      name: "Básico",
      price: "R$ 29,90",
      interval: "/mês",
      features: [
        "Até 100 clientes",
        "Suporte por email",
        "Relatórios básicos",
        "Backup diário",
      ],
    },
    {
      name: "Pro",
      price: "R$ 59,90",
      interval: "/mês",
      features: [
        "Até 500 clientes",
        "Suporte prioritário",
        "Relatórios avançados",
        "Backup em tempo real",
        "Integração API",
      ],
      popular: true,
    },
    {
      name: "Business",
      price: "R$ 99,90",
      interval: "/mês",
      features: [
        "Clientes ilimitados",
        "Suporte 24/7",
        "Relatórios personalizados",
        "Backup em tempo real",
        "Integração API completa",
        "Gerente de conta dedicado",
      ],
    },
  ]

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
            <h1 className="text-2xl font-bold">Assinatura</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Escolha seu plano</h2>
          <p className="text-gray-600">
            Planos flexíveis para atender suas necessidades
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? "border-blue-500 border-2 relative" : ""}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">{plan.interval}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Assinar {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Assinatura Atual</CardTitle>
              <CardDescription>Você está no plano gratuito</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Nota:</strong> A integração completa com Mercado Pago para processar 
                  pagamentos será ativada quando você configurar suas credenciais nas variáveis de ambiente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
