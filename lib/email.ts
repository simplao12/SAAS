import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    throw new Error('Erro ao enviar email')
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo ao SaaS Clientes!</h1>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Obrigado por se cadastrar no nosso sistema de gestão de clientes.</p>
            <p>Você agora tem acesso a todas as funcionalidades para gerenciar seus clientes de forma eficiente.</p>
            <p>Para começar, acesse seu painel:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Acessar Painel</a>
            <p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
          </div>
          <div class="footer">
            <p>© 2025 SaaS Clientes. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: 'Bem-vindo ao SaaS Clientes!',
    html,
  })
}

export async function sendPaymentConfirmation(
  to: string,
  name: string,
  planName: string,
  amount: number
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .detail { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Pagamento Confirmado!</h1>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Seu pagamento foi processado com sucesso!</p>
            <div class="detail">
              <strong>Plano:</strong> ${planName}<br>
              <strong>Valor:</strong> R$ ${amount.toFixed(2).replace('.', ',')}
            </div>
            <p>Sua assinatura está ativa e você já pode aproveitar todos os recursos.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Acessar Painel</a>
          </div>
          <div class="footer">
            <p>© 2025 SaaS Clientes. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: 'Pagamento Confirmado - SaaS Clientes',
    html,
  })
}

export async function sendSubscriptionExpiring(
  to: string,
  name: string,
  expirationDate: Date
) {
  const formattedDate = expirationDate.toLocaleDateString('pt-BR')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Assinatura Expirando</h1>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Sua assinatura está próxima do vencimento: <strong>${formattedDate}</strong></p>
            <p>Para continuar aproveitando nossos serviços sem interrupção, renove sua assinatura.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription" class="button">Renovar Assinatura</a>
          </div>
          <div class="footer">
            <p>© 2025 SaaS Clientes. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: 'Sua assinatura está expirando - SaaS Clientes',
    html,
  })
}
