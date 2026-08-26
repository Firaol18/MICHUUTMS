import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;

    if (smtpHost && smtpUser) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: process.env.SMTP_PASS || '',
        },
      });
      this.logger.log(`📧 SMTP configured: ${smtpHost}`);
    } else {
      // Dev mode: print emails to console
      this.logger.warn('📧 SMTP not configured — emails will be logged to console only.');
      this.transporter = null as any;
    }
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📨 [DEV EMAIL] To: ${to}\n📌 Subject: ${subject}\n─────────────────────────────────────────\n${html.replace(/<[^>]*>/g, '')}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: `"MICHUU Travel" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err}`);
    }
  }

  async sendEmailVerification(to: string, name: string, token: string): Promise<void> {
    const link = `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    await this.send(
      to,
      '✉️ Verify Your Email — MICHUU Travel',
      `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#1e3a5f">Welcome to MICHUU Travel, ${name}! 🌍</h2>
        <p>Please verify your email address to activate your account and start booking unforgettable Ethiopian adventures.</p>
        <a href="${link}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#f59e0b;color:#000;font-weight:700;border-radius:8px;text-decoration:none">
          ✅ Verify My Email
        </a>
        <p style="color:#6b7280;font-size:13px">This link expires in <strong>24 hours</strong>. If you didn't register, please ignore this email.</p>
        <p style="color:#6b7280;font-size:11px">Or copy this URL: ${link}</p>
      </div>`,
    );
  }

  async sendPasswordReset(to: string, name: string, token: string): Promise<void> {
    const link = `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await this.send(
      to,
      '🔑 Reset Your Password — MICHUU Travel',
      `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#1e3a5f">Password Reset Request</h2>
        <p>Hi ${name}, we received a request to reset your MICHUU Travel password.</p>
        <a href="${link}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#dc2626;color:#fff;font-weight:700;border-radius:8px;text-decoration:none">
          🔑 Reset My Password
        </a>
        <p style="color:#6b7280;font-size:13px">This link expires in <strong>1 hour</strong> and can only be used once. If you did not request a reset, your account is safe — you can ignore this email.</p>
        <p style="color:#6b7280;font-size:11px">Or copy this URL: ${link}</p>
      </div>`,
    );
  }
}
