# 🚀 SaaS Clientes - Sistema Completo de Gestão

Sistema SaaS moderno para cadastro e gestão de clientes com sistema de cobrança integrado ao Mercado Pago.

## 📋 Funcionalidades Principais

### ✅ Autenticação e Usuários
- Login com email/senha
- Login com Google (OAuth)
- Verificação de email
- Controle de níveis de acesso (Admin e Usuário)
- Perfil de usuário editável

### 💳 Sistema de Assinaturas
- Planos flexíveis (Mensal/Anual)
- Integração completa com Mercado Pago
- Webhooks para processar pagamentos automaticamente
- Renovação automática de assinaturas
- Controle de limites por plano

### 👥 Gestão de Clientes
- Cadastro completo de clientes
- Dados pessoais e de contato
- Endereço completo
- Notas e observações
- Sistema de tags para categorização
- Busca e filtros avançados

### 📧 Sistema de Emails
- Emails de boas-vindas
- Confirmação de pagamento
- Notificação de expiração de assinatura
- Templates profissionais em HTML

### 📊 Dashboard Administrativo
- Estatísticas de vendas
- Métricas de usuários
- Controle de assinaturas
- Relatórios de clientes

## 🛠️ Stack Tecnológica

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript 5
- **UI/Styling:** Tailwind CSS, Shadcn UI, Radix UI
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Autenticação:** Auth.js (NextAuth v5)
- **Pagamentos:** Mercado Pago SDK
- **Email:** Nodemailer (SendGrid)
- **Deploy:** Vercel (recomendado)

## 📦 Estrutura do Projeto

```
saas-cliente/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # Rotas de autenticação
│   │   └── webhooks/mercadopago/  # Webhook do Mercado Pago
│   ├── dashboard/                  # Painel principal
│   ├── login/                      # Página de login
│   ├── register/                   # Página de cadastro
│   ├── layout.tsx                  # Layout principal
│   ├── page.tsx                    # Landing page
│   └── globals.css                 # Estilos globais
├── components/
│   └── ui/                         # Componentes UI (Shadcn)
├── lib/
│   ├── auth.ts                     # Configuração Auth.js
│   ├── email.ts                    # Serviço de email
│   ├── mercadopago.ts              # Integração Mercado Pago
│   ├── prisma.ts                   # Cliente Prisma
│   └── utils.ts                    # Utilitários
├── prisma/
│   └── schema.prisma               # Schema do banco de dados
├── types/                          # Tipos TypeScript
├── .env.example                    # Variáveis de ambiente
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd saas-cliente
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saas_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="seu-access-token"
MERCADOPAGO_PUBLIC_KEY="sua-public-key"
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="sua-public-key"

# Email
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="sua-api-key"
EMAIL_FROM="noreply@seudominio.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Configure o banco de dados

```bash
# Execute as migrations
npx prisma migrate dev

# Gere o client do Prisma
npx prisma generate

# (Opcional) Visualize o banco com Prisma Studio
npx prisma studio
```

### 5. Crie os planos iniciais

Execute este script para criar os planos básicos:

```bash
npx prisma db seed
```

Ou adicione manualmente via Prisma Studio os planos:

- **Básico:** R$ 29,90/mês - Até 100 clientes
- **Pro:** R$ 59,90/mês - Até 500 clientes
- **Business:** R$ 99,90/mês - Clientes ilimitados

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:3000

## 🔧 Configuração do Mercado Pago

### 1. Crie uma conta no Mercado Pago

Acesse: https://www.mercadopago.com.br/developers

### 2. Obtenha suas credenciais

- Acesse "Suas integrações" > "Credenciais"
- Copie o **Access Token** e a **Public Key**
- Use as credenciais de teste para desenvolvimento
- Use as credenciais de produção para ambiente real

### 3. Configure o Webhook

No painel do Mercado Pago:
- Vá em "Webhooks"
- Adicione a URL: `https://seudominio.com/api/webhooks/mercadopago`
- Selecione o evento: "Pagamentos"

## 📧 Configuração de Email

### Usando SendGrid (Recomendado)

1. Crie uma conta: https://sendgrid.com
2. Crie uma API Key
3. Configure as variáveis de ambiente:

```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="sua-api-key-aqui"
EMAIL_FROM="noreply@seudominio.com"
```

### Usando Gmail

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="seuemail@gmail.com"
EMAIL_SERVER_PASSWORD="senha-de-app"
EMAIL_FROM="seuemail@gmail.com"
```

**Nota:** Para Gmail, você precisa habilitar "Acesso de apps menos seguros" ou usar uma senha de app.

## 🗃️ Modelos do Banco de Dados

### User
- Usuários do sistema
- Níveis de acesso (ADMIN, USER)
- Relação com assinatura e clientes

### Plan
- Planos disponíveis
- Preço e intervalo (mensal/anual)
- Limite de clientes

### Subscription
- Assinaturas ativas
- Status e datas de período
- Integração com Mercado Pago

### Customer
- Clientes cadastrados
- Dados completos e endereço
- Tags e notas

### Payment
- Histórico de pagamentos
- Status e métodos
- Referência ao Mercado Pago

## 🎨 Componentes UI Disponíveis

O projeto usa Shadcn UI com os seguintes componentes:

- Button
- Input
- Card
- Dialog
- DropdownMenu
- Select
- Tabs
- Toast
- Avatar
- Badge
- Table
- Form

Para adicionar mais componentes:

```bash
npx shadcn-ui@latest add [nome-do-componente]
```

## 🔐 Níveis de Acesso

### USER (Padrão)
- Gerenciar próprios clientes
- Visualizar própria assinatura
- Editar perfil

### ADMIN
- Todas as permissões de USER
- Gerenciar todos os usuários
- Gerenciar planos
- Visualizar estatísticas globais
- Acesso ao painel administrativo

## 📱 Deploy

### Vercel (Recomendado)

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça o deploy:
```bash
vercel
```

3. Configure as variáveis de ambiente no painel da Vercel

4. Configure o banco de dados (Vercel Postgres ou outro provedor)

### Outras Plataformas

O projeto pode ser deployado em:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify
- Azure

## 🧪 Testes

```bash
# Execute os testes
npm test

# Teste de tipos TypeScript
npm run type-check
```

## 📝 Scripts Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Inicia servidor de produção
npm start

# Lint
npm run lint

# Prisma Studio (visualizar banco)
npx prisma studio

# Criar migration
npx prisma migrate dev --name nome-da-migration

# Reset do banco de dados
npx prisma migrate reset
```

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme a DATABASE_URL no .env
- Execute `npx prisma generate`

### Webhook não funciona
- Verifique se a URL está acessível publicamente
- Use ngrok para testes locais: `ngrok http 3000`
- Confirme as credenciais do Mercado Pago

### Emails não estão sendo enviados
- Verifique as credenciais SMTP
- Teste a conexão com o servidor de email
- Verifique logs de erro no console

## 📚 Documentação Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth.js Documentation](https://authjs.dev)
- [Mercado Pago SDK](https://www.mercadopago.com.br/developers/pt/docs)
- [Shadcn UI](https://ui.shadcn.com)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido com ❤️ usando as melhores práticas de desenvolvimento

## 🆘 Suporte

Para suporte, envie um email para suporte@seudominio.com ou abra uma issue no GitHub.
