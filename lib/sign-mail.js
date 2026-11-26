// Sends mail from SIGN_SENDER through the mailbox's own SMTP server (IONOS by default).
// Needs SMTP_PASS, the password of that mailbox. SMTP_HOST, SMTP_PORT and SMTP_USER are optional.
function sender() { return process.env.SIGN_SENDER || 'riz@social-gear.com'; }
function clean(v) { return String(v).replace(/[\r\n]+/g, ' ').trim(); }

async function sendMail({ to, cc = [], subject, text, attachment }) {
  if (!process.env.SMTP_PASS) throw new Error('Mail not configured');
  const port = Number(process.env.SMTP_PORT) || 587;
  const transport = require('nodemailer').createTransport({
    host: process.env.SMTP_HOST || 'smtp.ionos.com', port,
    secure: port === 465, requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER || sender(), pass: process.env.SMTP_PASS },
    connectionTimeout: 10000, socketTimeout: 20000,
  });
  await transport.sendMail({
    from: { name: 'Social Gear', address: sender() }, to: to.map(clean), cc: cc.map(clean), subject: clean(subject), text,
    attachments: attachment ? [{ filename: attachment.name, content: Buffer.from(attachment.bytes), contentType: 'application/pdf' }] : [],
  });
}
module.exports = { sendMail, sender };
