import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST', 'smtp.resend.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      auth: {
        user: this.config.get('SMTP_USER', 'resend'),
        pass: this.config.get('SMTP_API_KEY'),
      },
    });
  }

  private escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private escapeMultiline(value: string) {
    return this.escapeHtml(value).replaceAll('\n', '<br/>');
  }

  private buildEmailShell(params: {
    preheader: string;
    eyebrow: string;
    title: string;
    intro: string;
    ctaLabel?: string;
    ctaUrl?: string;
    secondaryLine?: string;
    details: Array<{ label: string; value: string; valueIsHtml?: boolean }>;
    footerNote: string;
  }) {
    const cta = params.ctaLabel && params.ctaUrl
      ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 24px;"><tr><td align="center" style="border-radius: 12px; background: #05f3a2;"><a href="${this.escapeHtml(params.ctaUrl)}" style="display: inline-block; padding: 14px 22px; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 700; color: #030f0a; text-decoration: none; border-radius: 12px;">${this.escapeHtml(params.ctaLabel)}</a></td></tr></table>`
      : '';

    const detailRows = params.details
      .map(
        (detail, index) => `
          <tr>
            <td style="padding: ${index === 0 ? '0 0 10px' : '10px 0'}; width: 110px; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; line-height: 1.4; color: #7f98a6; vertical-align: top;">${this.escapeHtml(detail.label)}</td>
            <td style="padding: ${index === 0 ? '0 0 10px' : '10px 0'}; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.6; color: #e1edf3; word-break: break-word;">${detail.valueIsHtml ? detail.value : this.escapeHtml(detail.value)}</td>
          </tr>`,
      )
      .join('');

    return `<!doctype html>
<html lang="en">
  <body style="margin: 0; padding: 0; background: #05080b; color: #e1edf3;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;">${this.escapeHtml(params.preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #05080b; width: 100%; margin: 0; padding: 0;">
      <tr>
        <td align="center" style="padding: 36px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 640px; margin: 0 auto;">
            <tr>
              <td style="padding: 0 0 18px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                  <tr>
                    <td style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #05f3a2;">Vaultify</td>
                    <td align="right" style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; color: #7f98a6;">${this.escapeHtml(params.eyebrow)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(180deg, #0b1216 0%, #0a1013 100%); border: 1px solid #13222a; border-radius: 20px; box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45); overflow: hidden;">
                  <tr>
                    <td style="padding: 0; background: #05f3a2; height: 4px; line-height: 4px; font-size: 0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 32px 12px; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                      <div style="display: inline-block; margin: 0 0 16px; padding: 6px 10px; border: 1px solid rgba(5, 243, 162, 0.18); border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #05f3a2; background: rgba(5, 243, 162, 0.06);">${this.escapeHtml(params.eyebrow)}</div>
                      <h1 style="margin: 0 0 12px; font-size: 28px; line-height: 1.15; font-weight: 800; letter-spacing: -0.03em; color: #f2fbff;">${this.escapeHtml(params.title)}</h1>
                      <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #9bb0bc;">${this.escapeHtml(params.intro)}</p>
                      ${cta}
                      ${params.secondaryLine ? `<p style="margin: 0 0 26px; font-size: 13px; line-height: 1.6; color: #7f98a6; text-align: center;">${this.escapeHtml(params.secondaryLine)}</p>` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 32px 28px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; background: #0f191f; border: 1px solid #13222a; border-radius: 16px;">
                        <tr>
                          <td style="padding: 18px 18px 8px; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #7f98a6;">Details</td>
                        </tr>
                        <tr>
                          <td style="padding: 0 18px 8px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse;">${detailRows}</table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 6px; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; line-height: 1.7; color: #7f98a6; text-align: center;">
                ${this.escapeHtml(params.footerNote)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
      text: `${params.inviterName} invited you to join ${params.workspaceName} on Vaultify as ${params.role}.\n\nAccept the invitation: ${params.inviteUrl}`,
      html: this.buildEmailShell({
        preheader: `${params.inviterName} invited you to join ${params.workspaceName} as ${params.role}.`,
        eyebrow: 'Workspace invitation',
        title: `You have an invitation to ${params.workspaceName}`,
        intro: `${params.inviterName} invited you to join Vaultify as ${params.role}. Open the invite to review the workspace and accept the role when you are ready.`,
        ctaLabel: 'Review invitation',
        ctaUrl: params.inviteUrl,
        secondaryLine: 'If the button does not work, copy and paste the link below into your browser.',
        details: [
          { label: 'Workspace', value: params.workspaceName },
          { label: 'Invited by', value: params.inviterName },
          { label: 'Role', value: params.role },
          { label: 'Invite link', value: params.inviteUrl },
        ],
        footerNote: 'This invitation was generated by Vaultify. If you were not expecting it, you can safely ignore this email.',
      }),
    });
  }

  async sendContactEmail(params: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    if (!this.config.get('SMTP_API_KEY')) return;

    const to = this.config.get('CONTACT_EMAIL', 'mohamed.iibrahim.omar@gmail.com');

    await this.transporter.sendMail({
      from: this.config.get('SMTP_FROM', 'noreply@vaultify.dev'),
      to,
      replyTo: params.email,
      subject: `[Vaultify Contact] ${params.subject}`,
      text: `Name: ${params.name}\nEmail: ${params.email}\nSubject: ${params.subject}\n\n${params.message}`,
      html: this.buildEmailShell({
        preheader: `New contact message from ${params.name}.`,
        eyebrow: 'Contact inbox',
        title: 'New contact form submission',
        intro: 'A visitor sent a message from the Vaultify contact form. The summary below preserves the original submission details.',
        details: [
          { label: 'Name', value: params.name },
          { label: 'Email', value: `<a href="mailto:${this.escapeHtml(params.email)}" style="color: #05f3a2; text-decoration: none;">${this.escapeHtml(params.email)}</a>`, valueIsHtml: true },
          { label: 'Subject', value: params.subject },
          { label: 'Message', value: this.escapeMultiline(params.message), valueIsHtml: true },
        ],
        footerNote: 'Reply directly to this email to continue the conversation with the sender.',
      }),
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
      html: this.buildEmailShell({
        preheader: `Secret ${params.secretKey} was ${params.action} in ${params.environmentName}.`,
        eyebrow: 'Security alert',
        title: `Secret ${params.action}`,
        intro: 'A secret changed inside your workspace. Review the context below to confirm the update was expected.',
        details: [
          { label: 'Workspace', value: params.workspaceName },
          { label: 'Environment', value: params.environmentName },
          { label: 'Secret key', value: params.secretKey },
          { label: 'Action', value: params.action },
        ],
        footerNote: 'Vaultify sends these alerts so teams can spot unexpected changes quickly.',
      }),
    });
  }
}
