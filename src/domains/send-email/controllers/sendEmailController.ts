import { Request, Response } from "express";
import { SendEmailService } from "../services/sendEmailService";

/**
 * Sends an email using the transporter
 * @param email The email to send to
 * @param subject The subject of the email
 * @param text The text of the email
 * @returns The result of sending the email
 * @throws Error if there is an error sending the email
 */
export class SendEmailController {
    constructor(private sendEmailService: SendEmailService) {}

    async sendEmail(req: Request, res: Response): Promise<void> {
        const { email, subject, text } = req.body;
        try {
            const result = await this.sendEmailService.sendEmail(email, subject, text);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}