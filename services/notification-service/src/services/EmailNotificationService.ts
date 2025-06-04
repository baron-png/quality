import nodemailer from 'nodemailer';

export class EmailNotificationService {
  send(payload: NotificationPayload) {
      throw new Error("Method not implemented.");
  }
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    const info = await this.transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return info;
  }
}
