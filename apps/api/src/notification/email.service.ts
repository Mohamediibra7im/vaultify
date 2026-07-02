import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST', 'smtp.resend.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      auth: {
        user: this.config.get('SMTP_USER', 'resend'),
        pass: this.config.get('SMTP_API_KEY'),
      },
    });
  }

  async sendInviteEmail(params: {
    to: string;
    workspaceName: string;
    inviterName: string;
    inviteUrl: string;
    role: string;
  }) {
    // Only send if SMTP_API_KEY is configured (opt-in)
    if (!this.config.get('SMTP_API_KEY')) return;

    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM', 'noreply@vaultify.dev'),
      to: params.to,
      subject: `You've been invited to ${params.workspaceName} on Vaultify`,
      text: `${params.inviterName} invited you to join ${params.workspaceName} on Vaultify as ${params.role}.\n\nClick here to accept: ${params.inviteUrl}`,
      html: `<h2>You're invited!</h2><p><strong>${params.inviterName}</strong> invited you to join <strong>${params.workspaceName}</strong> on Vaultify as <strong>${params.role}</strong>.</p><p><a href="${params.inviteUrl}" style="display:inline-block;padding:12px 24px;background:#059669;color:#fff;text-decoration:none;border-radius:6px">Accept Invitation</a></p><p>Or copy this link: <br/><code>${params.inviteUrl}</code></p>`,
    });
  }

  async sendSecretChangeEmail(params: {
    to: string;
    secretKey: string;
    environmentName: string;
    workspaceName: string;
    action: string;
  }) {
    // Only send if SMTP_API_KEY is configured (opt-in)
    if (!this.config.get('SMTP_API_KEY')) return;

    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM', 'noreply@vaultify.dev'),
      to: params.to,
      subject: `[Vaultify] ${params.action}: ${params.secretKey}`,
      text: `Secret ${params.secretKey} was ${params.action} in ${params.environmentName} (${params.workspaceName}).`,
      html: `<h2>Secret ${params.action}</h2><p>Secret <strong>${params.secretKey}</strong> was ${params.action} in <strong>${params.environmentName}</strong> (${params.workspaceName}).</p>`,
    });
  }
}
