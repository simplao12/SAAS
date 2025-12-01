import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Listar clientes do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const customers = await prisma.customer.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Erro ao listar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao listar clientes' },
      { status: 500 }
    )
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const {
      name,
      email,
      phone,
      document,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      country,
      notes,
      tags,
    } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe um cliente com este email para este usuário
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        userId: session.user.id,
        email,
      },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Já existe um cliente com este email' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        userId: session.user.id,
        name,
        email,
        phone: phone || null,
        document: document || null,
        street: street || null,
        number: number || null,
        complement: complement || null,
        neighborhood: neighborhood || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        country: country || 'BR',
        notes: notes || null,
        tags: tags || [],
        active: true,
      },
    })

    return NextResponse.json(
      { message: 'Cliente criado com sucesso', customer },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}
