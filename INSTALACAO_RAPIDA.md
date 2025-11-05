# 🚀 GUIA RÁPIDO DE INSTALAÇÃO

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Instale as dependências
```bash
cd saas-cliente
npm install
```

### 2️⃣ Configure o banco de dados PostgreSQL

Opção A - Docker (recomendado):
```bash
docker run --name saas-postgres -e POSTGRES_PASSWORD=senha123 -e POSTGRES_DB=saas_db -p 5432:5432 -d postgres
```

Opção B - PostgreSQL local:
Instale PostgreSQL e crie o banco `saas_db`

### 3️⃣ Configure o .env
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/saas_db"
NEXTAUTH_SECRET="cole-resultado-do-comando-abaixo"
```

Gere o NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4️⃣ Execute as migrations
```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

### 5️⃣ Inicie o servidor
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 📋 Checklist Pós-Instalação

### Configuração Mercado Pago (Essencial para pagamentos)

1. ✅ Crie conta em: https://www.mercadopago.com.br/developers
2. ✅ Acesse "Credenciais" e copie:
   - Access Token (teste)
   - Public Key (teste)
3. ✅ Adicione no .env:
```env
MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxxxx"
MERCADOPAGO_PUBLIC_KEY="APP_USR-xxxxx"
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="APP_USR-xxxxx"
```

### Configuração Email (Essencial para notificações)

**Opção 1 - SendGrid (Recomendado):**
1. ✅ Crie conta: https://sendgrid.com
2. ✅ Crie API Key em Settings > API Keys
3. ✅ Adicione no .env:
```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="SG.xxxxx"
EMAIL_FROM="noreply@seudominio.com"
```

**Opção 2 - Gmail:**
1. ✅ Ative verificação em 2 fatores
2. ✅ Crie senha de app: https://myaccount.google.com/apppasswords
3. ✅ Adicione no .env:
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="seuemail@gmail.com"
EMAIL_SERVER_PASSWORD="senha-de-16-digitos"
EMAIL_FROM="seuemail@gmail.com"
```

### Login Social (Opcional)

**Google OAuth:**
1. ✅ Acesse: https://console.cloud.google.com
2. ✅ Crie projeto > APIs e Serviços > Credenciais
3. ✅ Crie OAuth 2.0 Client ID
4. ✅ Adicione redirect URI: `http://localhost:3000/api/auth/callback/google`
5. ✅ Adicione no .env:
```env
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxxxx"
```

---

## 🧪 Testando o Sistema

### 1. Crie uma conta
```
http://localhost:3000/register
```

### 2. Faça login
```
http://localhost:3000/login
```

### 3. Acesse o dashboard
```
http://localhost:3000/dashboard
```

### 4. Cadastre um cliente
```
http://localhost:3000/dashboard/customers/new
```

---

## 🐛 Resolução de Problemas

### Erro: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Erro: "Connection refused" (Banco de dados)
- Verifique se PostgreSQL está rodando
- Confirme DATABASE_URL no .env
- Teste conexão: `npx prisma studio`

### Erro: Webhook não funciona localmente
Use ngrok para expor localhost:
```bash
ngrok http 3000
# Use a URL do ngrok no Mercado Pago
```

### Emails não estão enviando
- Verifique credenciais SMTP no .env
- Teste: Crie conta e veja se recebe email de boas-vindas
- Cheque logs do console

---

## 📊 Dados de Teste

Após o seed, você terá 3 planos criados:

| Plano | Preço | Limite |
|-------|-------|--------|
| Básico | R$ 29,90 | 100 clientes |
| Pro | R$ 59,90 | 500 clientes |
| Business | R$ 99,90 | Ilimitado |

---

## 🚀 Deploy em Produção

### Vercel (Recomendado - Grátis)

1. Instale CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configure:
- Adicione todas as variáveis do .env no painel Vercel
- Configure Vercel Postgres ou use outro provedor
- Atualize NEXTAUTH_URL e NEXT_PUBLIC_APP_URL
- Configure webhook do Mercado Pago com URL de produção

### Banco de Dados em Produção

**Opções:**
- Vercel Postgres (integrado)
- Supabase (grátis)
- Railway (grátis)
- Neon (grátis)

---

## 📚 Documentação Completa

Consulte:
- `README.md` - Documentação completa
- `ARQUIVOS_COMPLEMENTARES.md` - Código adicional necessário

---

## ✅ Próximos Passos

Após configuração básica:

1. ✅ Personalize visual (cores em tailwind.config.ts)
2. ✅ Configure domínio personalizado
3. ✅ Adicione logo e favicon
4. ✅ Configure analytics
5. ✅ Implemente dashboard completo
6. ✅ Adicione mais funcionalidades

---

## 🆘 Precisa de Ajuda?

- 📖 Leia README.md completo
- 🐛 Verifique troubleshooting no README
- 💬 Abra uma issue no GitHub

**Importante:** Use credenciais de TESTE do Mercado Pago durante desenvolvimento!

---

## 🎉 Pronto!

Seu sistema SaaS está configurado! 

Agora você tem:
✅ Sistema de autenticação completo
✅ Integração com Mercado Pago
✅ Sistema de emails
✅ Banco de dados estruturado
✅ Interface moderna e responsiva

Comece a desenvolver e personalize conforme suas necessidades! 🚀
