# 📚 ARQUIVOS ADICIONAIS NECESSÁRIOS

Este documento contém o código de todos os arquivos adicionais que você precisará criar para completar o sistema SaaS.

---

## 1. PÁGINA DE CADASTRO (app/register/page.tsx)

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { hash } from "bcryptjs"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta")
      }

      router.push("/login?registered=true")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-center">
            Cadastre-se para começar a gerenciar seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome Completo
              </label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
```

---

## 2. API DE REGISTRO (app/api/auth/register/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    await sendWelcomeEmail(user.email, user.name || 'Usuário')

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}
```

---

## 3. MIDDLEWARE DE PROTEÇÃO DE ROTAS (middleware.ts)

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth()
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')
  
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  if (isDashboardPage && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}
```

---

## 4. TYPES GLOBAIS (types/index.ts)

```typescript
import { UserRole, PlanInterval, SubscriptionStatus, PaymentStatus } from '@prisma/client'

export interface User {
  id: string
  name: string | null
  email: string
  role: UserRole
  createdAt: Date
}

export interface Plan {
  id: string
  name: string
  description: string | null
  price: number
  interval: PlanInterval
  maxCustomers: number
  features: string[]
  active: boolean
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  plan: Plan
}

export interface Customer {
  id: string
  userId: string
  name: string
  email: string
  phone: string | null
  document: string | null
  street: string | null
  number: string | null
  complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  notes: string | null
  tags: string[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  subscriptionId: string
  amount: number
  status: PaymentStatus
  paymentMethod: string | null
  paymentType: string | null
  paidAt: Date | null
  createdAt: Date
}

export interface DashboardStats {
  totalCustomers: number
  activeCustomers: number
  totalRevenue: number
  newCustomersThisMonth: number
}
```

---

## 5. EXTENSÃO DE TIPOS NEXT-AUTH (types/next-auth.d.ts)

```typescript
import { DefaultSession } from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}
```

---

## 6. POSTCSS CONFIG (postcss.config.js)

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 7. NEXT CONFIG (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

module.exports = nextConfig
```

---

## 8. GITIGNORE (.gitignore)

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
/prisma/migrations
```

---

## 9. ESLINT CONFIG (.eslintrc.json)

```json
{
  "extends": "next/core-web-vitals"
}
```

---

## 10. SEED DO PRISMA (prisma/seed.ts)

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Criando planos...')

  await prisma.plan.createMany({
    data: [
      {
        name: 'Básico',
        description: 'Ideal para pequenos negócios',
        price: 29.90,
        interval: 'MONTHLY',
        maxCustomers: 100,
        features: [
          'Até 100 clientes',
          'Suporte por email',
          'Relatórios básicos',
          'Backup diário',
        ],
        active: true,
      },
      {
        name: 'Pro',
        description: 'Para empresas em crescimento',
        price: 59.90,
        interval: 'MONTHLY',
        maxCustomers: 500,
        features: [
          'Até 500 clientes',
          'Suporte prioritário',
          'Relatórios avançados',
          'Backup em tempo real',
          'Integração API',
        ],
        active: true,
      },
      {
        name: 'Business',
        description: 'Solução empresarial completa',
        price: 99.90,
        interval: 'MONTHLY',
        maxCustomers: 999999,
        features: [
          'Clientes ilimitados',
          'Suporte 24/7',
          'Relatórios personalizados',
          'Backup em tempo real',
          'Integração API completa',
          'Gerente de conta dedicado',
        ],
        active: true,
      },
    ],
    skipDuplicates: true,
  })

  console.log('Planos criados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Adicione ao package.json:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

---

## 📝 PRÓXIMOS PASSOS

Após criar todos esses arquivos, execute:

1. ```bash
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   npm run dev
   ```

2. Acesse http://localhost:3000

3. Crie uma conta e teste o sistema!

---

## 🎯 ARQUIVOS AINDA NECESSÁRIOS

Para completar 100% do sistema, você ainda precisará criar:

### Dashboard Principal
- `app/dashboard/page.tsx` - Página principal do dashboard
- `app/dashboard/layout.tsx` - Layout do dashboard
- `app/dashboard/customers/page.tsx` - Listagem de clientes
- `app/dashboard/customers/new/page.tsx` - Cadastro de cliente
- `app/dashboard/customers/[id]/page.tsx` - Edição de cliente
- `app/dashboard/subscription/page.tsx` - Gerenciar assinatura
- `app/dashboard/profile/page.tsx` - Perfil do usuário

### Componentes
- `components/dashboard/Sidebar.tsx` - Barra lateral
- `components/dashboard/Header.tsx` - Cabeçalho
- `components/dashboard/StatsCard.tsx` - Cards de estatísticas
- `components/customers/CustomerForm.tsx` - Formulário de cliente
- `components/customers/CustomerTable.tsx` - Tabela de clientes

### APIs
- `app/api/customers/route.ts` - CRUD de clientes
- `app/api/plans/route.ts` - Listar planos
- `app/api/subscription/route.ts` - Gerenciar assinatura

Entre em contato se precisar desses arquivos também!
