import {createTransport} from "nodemailer";
import * as Mail from "nodemailer/lib/mailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import type {MailMessage} from "../types/mail.js";

export const sendMail = async ({
  mailTo,
  mailContent: {html, text},
}: {
  mailTo: string;
  mailContent: MailMessage;
}) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: mailTo,
    subject: process.env.MAIL_SUBJECT,
    html,
    text,
  };

  const transporter: Mail = createTransport({
    host: process.env.MAIL_HOST as string,
    port: 587,
    secure: false, // STARTTLS
    auth: {
      type: "LOGIN",
      user: process.env.MAIL_FROM as string,
      pass: process.env.MAIL_PWD as string,
    },
  } as unknown as SMTPTransport);

  await transporter.sendMail(mailOptions);
};
