// backend/utils/sendEmail.js
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT = "587",
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM = "no-reply@yourapp.com",
  NODE_ENV,
} = process.env;

function buildTransport() {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true for 465, false for 587/25
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  // Dev fallback: log the email instead of sending
  return {
    async sendMail(opts) {
      console.log("\n[sendEmail DEV fallback]");
      console.log("TO:", opts.to);
      console.log("SUBJECT:", opts.subject);
      console.log("HTML:\n", opts.html);
      return { messageId: "dev-fallback" };
    },
  };
}

const transporter = buildTransport();

/**
 * Send an email
 * @param {{to:string, subject:string, html?:string, text?:string, from?:string}} param0
 */
export default async function sendEmail({ to, subject, html = "", text = "", from = MAIL_FROM }) {
  const info = await transporter.sendMail({ from, to, subject, html, text });
  if (NODE_ENV !== "production") {
    console.log("[sendEmail] messageId:", info?.messageId);
  }
  return info;
}
