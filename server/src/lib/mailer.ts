import nodemailer from 'nodemailer'

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  // Keep socket timeout low so a bad SMTP config doesn't hang server routes for long
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 5000),
})

// Verify transporter on startup (best-effort). Log but don't throw so server still runs.
mailer.verify().then(() => console.info('SMTP transporter verified')).catch((err: any) => console.warn('SMTP verify failed (mail may not send):', err && err.message ? err.message : err))

export async function sendOtpMail(to: string, code: string) {
  return mailer.sendMail({
    from: process.env.MAIL_FROM!,
    to,
    subject: 'Your NextSwap verification code',
    text: `Your code is ${code}. It expires in 5 minutes.`,
    html: `<p>Your code is <b>${code}</b>. It expires in 5 minutes.</p>`
  })
}
