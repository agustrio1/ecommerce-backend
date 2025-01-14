import { transporter } from "../../../config/email";

/**
 * Sends an email using the transporter
 * @param email The email to send to
 * @param subject The subject of the email
 * @param text The text of the email
 * @returns The result of sending the email
 * @throws Error if there is an error sending the email
 */
export class SendEmailService {
    async sendEmail(email: string, subject: string, text: string) {
        try {
            const info = await transporter.sendMail({
                from: `"Support Team" <${process.env.EMAIL_USER}>`,
                to: email,
                subject,
                text,
            });
            return info;
        } catch (error: any) {
            throw new Error(`Error sending email: ${error.message}`);
        }
    }
}
