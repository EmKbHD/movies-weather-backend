import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } from '../config/env.js';

export class EmailService {
  constructor() {
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY must be set in environment variables');
    }
    if (!SENDGRID_FROM_EMAIL) {
      throw new Error('SENDGRID_FROM_EMAIL must be set in environment variables');
    }
    sgMail.setApiKey(SENDGRID_API_KEY);
  }

  private async sendEmail(to: string, subject: string, html: string) {
    const msg = {
      to,
      from: SENDGRID_FROM_EMAIL,
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(user: { email: string; firstName: string }) {
    const subject = 'Welcome to Movies & Weather App!';
    const html = `
      <div>
        <h1>Welcome to Movies & Weather, ${user.firstName}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Search and save your favorite movies</li>
          <li>Get weather updates for your city</li>
          <li>Create custom movie collections</li>
        </ul>
        <p>Get started by exploring our movie catalog or checking the weather in your area.</p>
        <p>Enjoy!</p>
        <p>The Movies & Weather Team</p>
      </div>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const subject = 'Reset Your Password';
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <div>
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    await this.sendEmail(email, subject, html);
  }
}

export const emailService = new EmailService();
