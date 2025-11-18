import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { validateEnv } from '../config/config.loader';

@Injectable()
export class MailService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    const env = validateEnv();

    this.transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: Number(env.MAIL_PORT),
      secure: false,
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
      },
    });
  }

  async onModuleInit() {
    try {
      await this.transporter.verify();
      console.log('Mail transporter verified — ready to send emails.');
    } catch (err) {
      console.error('Mail transporter verification failed:', err);
    }
  }

  async sendMail(options: nodemailer.SendMailOptions): Promise<SMTPTransport.SentMessageInfo> {
    return await this.transporter.sendMail(options);
  }
}
