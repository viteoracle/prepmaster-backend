const nodemailer = require('nodemailer');
const config = require('../config/config');

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
            subject: 'Email Verification',
            html: `
        <h1>Hello ${name}</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `
        });
    }
}

module.exports = new EmailService();
