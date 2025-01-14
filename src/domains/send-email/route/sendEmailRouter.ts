import { Router } from "express";
import { SendEmailController } from "../controllers/sendEmailController";
import { SendEmailService } from "../services/sendEmailService"; 

export const sendEmailRouter = Router();

const sendEmailService = new SendEmailService();
const sendEmailController = new SendEmailController(sendEmailService);

sendEmailRouter.post("/", sendEmailController.sendEmail);
