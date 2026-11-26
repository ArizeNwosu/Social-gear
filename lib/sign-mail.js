// Sends mail as SIGN_SENDER through the Gmail API. Uses the same service account as the
// calendar, which needs domain-wide delegation for the gmail.send scope in Google Workspace.
function sender() { return process.env.SIGN_SENDER || 'riz@social-gear.com'; }
function b64url(buf) { return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function clean(v) { return String(v).replace(/[\r\n]+/g, ' ').trim(); }

async function sendMail({ to, cc = [], subject, text, attachment }) {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) throw new Error('Mail not configured');
  const { google } = require('googleapis');
  const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.JWT({ email: key.client_email, key: key.private_key, scopes: ['https://www.googleapis.com/auth/gmail.send'], subject: sender() });
  const boundary = 'sg' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  const head = [`From: Social Gear <${sender()}>`, `To: ${to.map(clean).join(', ')}`];
  if (cc.length) head.push(`Cc: ${cc.map(clean).join(', ')}`);
  head.push(`Subject: ${clean(subject)}`, 'MIME-Version: 1.0');
  const body = Buffer.from(text, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n');
  let mime;
  if (attachment) {
    mime = head.concat([`Content-Type: multipart/mixed; boundary="${boundary}"`, '',
      `--${boundary}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', body,
      `--${boundary}`, `Content-Type: application/pdf; name="${attachment.name}"`, 'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${attachment.name}"`, '',
      Buffer.from(attachment.bytes).toString('base64').replace(/(.{76})/g, '$1\r\n'), `--${boundary}--`, '']).join('\r\n');
  } else {
    mime = head.concat(['Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', body, '']).join('\r\n');
  }
  await google.gmail({ version: 'v1', auth }).users.messages.send({ userId: 'me', requestBody: { raw: b64url(mime) } });
}
module.exports = { sendMail, sender };
