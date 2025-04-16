import nodemailer from 'nodemailer';
import config from '../config/config.js';
import { verificationEmailTemplate, otpEmailTemplate } from '../templates/emailTemplates.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            auth: {
                user: config.email.user,
                pass: config.email.password
            }
        });
    }

    async sendVerificationEmail(to, name, token) {
        const verificationUrl = `${config.baseUrl}/verify-email/${token}`;
        
        await this.transporter.sendMail({
            to,
            subject: 'PrepMaster - Email Verification',
            html: verificationEmailTemplate(name, verificationUrl)
        });
    }

    async sendOTPEmail(to, name, otp) {
        await this.transporter.sendMail({
            to,
            subject: 'PrepMaster - Email Verification Code',
            html: otpEmailTemplate(name, otp)
        });
    }
}

export default new EmailService();
