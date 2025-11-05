# 🚀 GUIA DE DEPLOY NA VERCEL

## ✅ Correções Aplicadas

1. **Versões fixadas:**
   - Next.js: `15.0.3`
   - Next-Auth: `5.0.0-beta.25`
   - React: `18.3.1`

2. **Arquivo `.npmrc` criado:**
   - Resolve conflitos de peer dependencies automaticamente

3. **Arquivo `.gitignore` criado:**
   - Evita upload da pasta `.next` (como alertado pela Vercel)

---

## 📋 Passos para Deploy na Vercel

### 1️⃣ Prepare seu Repositório GitHub

```bash
# No seu terminal local
git add .
git commit -m "Fix: Corrige dependências para Vercel"
git push origin main
```

### 2️⃣ Configure Variáveis de Ambiente na Vercel

Acesse seu projeto na Vercel e adicione estas variáveis em **Settings > Environment Variables**:

```env
# Database (Use Vercel Postgres ou outro provedor)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth (IMPORTANTE: Gere novo secret)
NEXTAUTH_URL="https://seu-projeto.vercel.app"
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="seu-token"
MERCADOPAGO_PUBLIC_KEY="sua-public-key"
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="sua-public-key"

# Email
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="sua-api-key"
EMAIL_FROM="noreply@seudominio.com"

# App URL
NEXT_PUBLIC_APP_URL="https://seu-projeto.vercel.app"

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID="seu-client-id"
GOOGLE_CLIENT_SECRET="seu-client-secret"
```

### 3️⃣ Configure o Build Command (Opcional)

Se necessário, configure em **Settings > General**:

- **Build Command:** `prisma generate && next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install --legacy-peer-deps`

### 4️⃣ Configure Banco de Dados

#### Opção A - Vercel Postgres (Recomendado)

1. No projeto da Vercel, vá em **Storage**
2. Clique em **Create Database** > **Postgres**
3. A Vercel vai criar automaticamente a `DATABASE_URL`
4. Execute as migrations:

```bash
# Instale Vercel CLI
npm i -g vercel

# Login
vercel login

# Link ao projeto
vercel link

# Execute migrations
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

#### Opção B - Supabase (Grátis)

1. Crie conta em https://supabase.com
2. Crie um projeto
3. Copie a connection string em **Settings > Database**
4. Adicione na Vercel como `DATABASE_URL`

#### Opção C - Railway (Grátis)

1. Crie conta em https://railway.app
2. Crie projeto PostgreSQL
3. Copie a connection string
4. Adicione na Vercel como `DATABASE_URL`

### 5️⃣ Execute as Migrations

Após configurar o banco:

```bash
# Local
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed

# Ou via Vercel CLI
vercel --prod -- npx prisma migrate deploy
```

### 6️⃣ Faça o Deploy

```bash
git push origin main
```

Ou manualmente:

```bash
vercel --prod
```

---

## 🔧 Troubleshooting

### Erro: "Could not resolve dependency"

✅ **Solução:** O arquivo `.npmrc` já resolve isso. Se persistir:

```bash
# Delete node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstale
npm install --legacy-peer-deps
```

### Erro: "Prisma Client not found"

✅ **Solução:** Configure o Build Command:

```
prisma generate && next build
```

### Erro: "Database connection failed"

✅ **Verificações:**
1. DATABASE_URL está correta?
2. Banco está acessível publicamente?
3. IP da Vercel está na whitelist?

### Erro: "NEXTAUTH_SECRET is not set"

✅ **Solução:** Gere um secret:

```bash
openssl rand -base64 32
```

Adicione nas variáveis de ambiente da Vercel.

### Warning: "You should not upload the .next directory"

✅ **Solução:** O `.gitignore` já está configurado. Certifique-se de:

```bash
# Remove .next do git se já foi commitado
git rm -r --cached .next
git commit -m "Remove .next from git"
git push
```

---

## 🎯 Checklist Final

Antes do deploy, verifique:

- [ ] `.npmrc` está no repositório
- [ ] `.gitignore` está no repositório
- [ ] Todas variáveis de ambiente configuradas na Vercel
- [ ] Banco de dados configurado e acessível
- [ ] Migrations executadas no banco de produção
- [ ] Seeds executados (planos criados)
- [ ] NEXTAUTH_URL aponta para URL de produção
- [ ] NEXT_PUBLIC_APP_URL aponta para URL de produção
- [ ] Webhook do Mercado Pago configurado com URL de produção

---

## 🌐 Após Deploy

### Configure o Webhook do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers
2. Vá em **Webhooks**
3. Adicione: `https://seu-projeto.vercel.app/api/webhooks/mercadopago`
4. Selecione evento: **Pagamentos**

### Configure o Google OAuth (se usar)

1. Acesse: https://console.cloud.google.com
2. No seu projeto OAuth, adicione redirect URI:
   - `https://seu-projeto.vercel.app/api/auth/callback/google`

### Teste o Sistema

1. Acesse seu site
2. Crie uma conta
3. Verifique se recebeu email de boas-vindas
4. Teste login
5. Teste cadastro de cliente

---

## 📊 Monitoramento

Veja logs em tempo real:

```bash
vercel logs --follow
```

Ou no painel da Vercel em **Deployments > View Function Logs**

---

## 🎉 Pronto!

Seu SaaS está no ar! 🚀

Para atualizações futuras, basta fazer push no GitHub:

```bash
git add .
git commit -m "Nova feature"
git push origin main
```

A Vercel vai fazer deploy automático! ✨

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs da Vercel
2. Confira as variáveis de ambiente
3. Teste localmente primeiro
4. Revise este guia

**Importante:** Use sempre credenciais de **TESTE** do Mercado Pago até ter tudo funcionando perfeitamente!
