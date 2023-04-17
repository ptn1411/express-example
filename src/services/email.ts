import nodeMailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail from "nodemailer/lib/mailer";
import ejs from "ejs";
import path from "path";
const config: SMTPTransport.Options = {
  host: process.env.SENDER_EMAIL_HOST,
  port: Number(process.env.SENDER_EMAIL_PORT),
  secure: true, // use TLS
  auth: {
    user: process.env.SENDER_EMAIL_USERNAME,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
};
const transporter = nodeMailer.createTransport(config);

async function sendToMail(options: Mail.Options) {
  try {
    return await transporter.sendMail({
      from: `Pham Thanh Nam ${process.env.SENDER_EMAIL_USERNAME}`,
      ...options,
    });
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

async function sendHtmlEmail(
  options: Mail.Options,
  subject: string,
  view: string,
  data: ejs.Data
) {
  try {
    const viewFile = path.join(__dirname, "../../", "templates", view);

    const html = (await ejs.renderFile(viewFile, data)) as string;

    const email = await transporter.sendMail({
      from: `Pham Thanh Nam ${process.env.SENDER_EMAIL_USERNAME}`,
      subject: subject,
      html: html,
      ...options,
    });

    return email;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
export { transporter, sendToMail, sendHtmlEmail };
