// c:\Devs\orderLink\backend\src\utils\email.js
const nodemailer = require('nodemailer');

// Configure o transporter (adapte com suas credenciais)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Função para enviar o email de reset
async function sendPasswordResetEmail(toEmail, code) {
  const mailOptions = {
    from: `No-Reply Mann Systems <contato@mannsystems.com.br>`,
    to: toEmail,
    subject: 'Redefinição de Senha',
    text: `Olá,\n\nSeu código para redefinir a senha é: ${code}\n\nEle é válido por 5 minutos.\n\nSe você não solicitou essa redefinição, ignore este email.`,
    html: `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F4F6; font-family:Arial,sans-serif; padding:20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF; border-radius:8px; overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background-color:#2563EB; padding:20px; text-align:center;">
            <img src="https://img.icons8.com/ios-filled/32/FFFFFF/new-post.png" width="32" height="32" alt="Envelope branco" style="display:block; margin:0 auto;" />
            <h1 style="color:#FFFFFF; font-size:20px; margin:10px 0 0;">Redefinição de Senha</h1>
          </td>
        </tr>
        <!-- Corpo -->
        <tr>
          <td style="padding:30px; color:#1F2937; font-size:16px; line-height:1.5;">
            <p style="margin:0 0 16px;">Olá,</p>
            <p style="margin:0 0 8px;">Seu código para redefinir a senha é:</p>
            <div style="background-color:#F3F4F6; padding:16px; text-align:center; border-radius:4px; margin:16px 0;">
              <span style="font-size:24px; font-weight:bold; color:#000000;">${code}</span>
            </div>
            <p style="margin:0 0 4px;">Ele é válido por <strong>5 minutos</strong>.</p>
            <p style="margin:0;">Se você não solicitou essa redefinição, ignore este email.</p>
            <hr style="border:none; border-top:1px solid #E5E7EB; margin:24px 0;" />
            <p style="color:#6B7280; font-size:14px; margin:0;">
              Por questões de segurança, nunca compartilhe este código com terceiros.
            </p>
          </td>
        </tr>
        <!-- Agradecimento -->
        <tr>
          <td style="padding:20px; text-align:center; color:#1F2937;">
            <img src="https://img.icons8.com/ios-filled/40/2563EB/shield.png" width="40" height="40" alt="Escudo azul" style="display:block; margin:0 auto;" />
            <p style="margin:12px 0 4px;">Atenciosamente,</p>
            <p style="margin:0; font-weight:bold;">Equipe de Segurança</p>
            <p style="margin:4px 0 0;">
              <a href="https://www.mannsystems.com.br" style="color:#2563EB; text-decoration:none;">Mann Systems</a>
            </p>
          </td>
        </tr>
        <!-- Rodapé interno -->
        <tr>
          <td style="background-color:#F3F4F6; padding:16px; text-align:center; border-bottom-left-radius:8px; border-bottom-right-radius:8px;">
            <p style="margin:0; font-size:14px; color:#4B5563; line-height:1;">
              <span style="display:inline-block; vertical-align:middle;">
                <img src="https://img.icons8.com/ios-filled/16/4B5563/globe.png" width="16" height="16" alt="Globo" style="vertical-align:middle;"/>
                <a href="https://www.mannsystems.com.br" style="color:#4B5563; text-decoration:none; margin-left:4px;">Website</a>
              </span>
              <span style="display:inline-block; color:#4B5563; margin:0 8px; vertical-align:middle;">|</span>
              <span style="display:inline-block; vertical-align:middle;">
                <img src="https://img.icons8.com/ios-filled/16/4B5563/question-mark.png" width="16" height="16" alt="Ajuda" style="vertical-align:middle;"/>
                <a href="https://www.mannsystems.com.br/contato.html" style="color:#4B5563; text-decoration:none; margin-left:4px;">Ajuda</a>
              </span>
              <span style="display:inline-block; color:#4B5563; margin:0 8px; vertical-align:middle;">|</span>
              <span style="display:inline-block; vertical-align:middle;">
                <img src="https://img.icons8.com/ios-filled/16/4B5563/shield.png" width="16" height="16" alt="Privacidade" style="vertical-align:middle;"/>
                <a href="https://www.mannsystems.com.br/politica-de-privacidade.html" style="color:#4B5563; text-decoration:none; margin-left:4px;">Privacidade</a>
              </span>
            </p>
            <p style="margin:8px 0 0; font-size:12px; color:#6B7280;">
              Este é um email automático. Por favor, não responda.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
    `.trim()
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de redefinição enviado para: ${toEmail}`);
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Falha ao enviar email de redefinição.');
  }
}

module.exports = { sendPasswordResetEmail };
