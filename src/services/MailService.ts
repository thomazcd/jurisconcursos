import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class MailService {
    /**
     * Envia o link de recuperação de senha por e-mail.
     */
    static async sendResetPasswordEmail(email: string, token: string) {
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

        try {
            const { data, error } = await resend.emails.send({
                from: 'Juris Concursos <nao-responder@jurisconcursos.com.br>',
                to: [email],
                subject: 'Recuperação de Senha - Juris Concursos',
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h1 style="color: #333; font-size: 24px; text-align: center;">Recuperação de Senha</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Olá! Recebemos uma solicitação para redefinir a senha da sua conta no Juris Concursos.
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Para prosseguir e escolher uma nova senha, clique no botão abaixo:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: #fff; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Redefinir Minha Senha
              </a>
            </div>
            <p style="color: #999; font-size: 13px; line-height: 1.6; border-top: 1px solid #eee; padding-top: 20px;">
              Se você não solicitou a troca de senha, por favor ignore este e-mail. O link expira em 1 hora.
            </p>
            <p style="color: #999; font-size: 12px; text-align: center;">
              Equipe Juris Concursos
            </p>
          </div>
        `,
            });

            if (error) {
                console.error('Erro ao enviar e-mail via Resend:', error);
                throw new Error('Falha no envio do e-mail');
            }

            return data;
        } catch (err) {
            console.error('Falha crítica no MailService:', err);
            throw err;
        }
    }
}
