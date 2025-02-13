const nodemailer = require('nodemailer');
const process = require('process');

class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(targetEmail, content) {
    const message = {
      from: 'OpenMusic <no-reply@openmusic.com>',
      to: targetEmail,
      subject: 'Ekspor Playlist',
      text: `Berikut hasil ekspor playlist Anda:\n\n${content}`,
    };

    return this._transporter.sendMail(message);
  }
}

module.exports = MailSender;
