const agreements = require('../lib/agreements');
const { docHash, makeToken, readToken, sameKey, stamp, buildPdf, readStrokes } = require('../lib/sign-utils');
const { sendMail } = require('../lib/sign-mail');

const EMAIL = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;
const str = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const ip = (req) => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
const site = () => (process.env.SITE_URL || 'https://www.social-gear.com').replace(/\/$/, '');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const src = req.method === 'GET' ? req.query || {} : req.body;
  if (!src || typeof src !== 'object') return res.status(400).json({ error: 'Missing details.' });
  const agreement = Object.prototype.hasOwnProperty.call(agreements, src.id) ? agreements[src.id] : null;
  if (!agreement) return res.status(404).json({ error: 'Agreement not found.' });
  const hash = docHash(agreement);
  try {
    if (req.method === 'GET') {
      const out = { title: agreement.title, subtitle: agreement.subtitle, company: agreement.provider.company, clientLabel: agreement.clientLabel, blocks: agreement.blocks, hash };
      if (src.t) {
        const t = readToken(src.t);
        if (!t || t.id !== agreement.id) return res.status(410).json({ error: 'This signing link is not valid or has expired. Ask Social Gear for a new link.' });
        if (t.h !== hash) return res.status(409).json({ error: 'The agreement changed after this link was made. Ask Social Gear for a new link.' });
        out.signing = { providerName: t.pn, providerTitle: t.pt, providerSigned: stamp(t.ps), clientName: t.cn, clientEmail: t.ce };
      }
      return res.status(200).json(out);
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (src.consent !== true) return res.status(400).json({ error: 'Tick the box to agree to sign electronically.' });
    if (src.hash !== hash) return res.status(409).json({ error: 'The agreement changed while this page was open. Reload the page and read it again.' });

    if (src.step === 'provider') {
      if (!sameKey(src.key)) return res.status(403).json({ error: 'The signing key is not correct.' });
      if (!str(src.name, 120) || !str(src.title, 120) || !str(src.clientName, 120) || !str(src.clientEmail, 254) || !EMAIL.test(src.clientEmail.trim()))
        return res.status(400).json({ error: 'Check your name, your title, and the client name and email.' });
      if (src.signature != null && !readStrokes(src.signature)) return res.status(400).json({ error: 'The drawn signature could not be read. Clear it and draw it again.' });
      const token = makeToken({ id: agreement.id, h: hash, pg: src.signature || undefined, pn: src.name.trim(), pt: src.title.trim(), ps: new Date().toISOString(), pip: ip(req), cn: src.clientName.trim(), ce: src.clientEmail.trim() });
      const link = `${site()}/proposals/${agreement.id}/agreement.html?t=${token}`;
      await sendMail({ to: [src.clientEmail.trim()], cc: [agreement.provider.email], replyTo: agreement.provider.email, subject: `Please sign: ${agreement.title} - ${agreement.subtitle}`,
        text: `Hi ${src.clientName.trim()},\n\n${src.name.trim()} of ${agreement.provider.company} signed the ${agreement.title} (${agreement.subtitle}).\n\nPlease read it and sign it here:\n${link}\n\nWhen you sign, both of us get the completed copy by email as a PDF. This link works for 30 days.\n\n${src.name.trim()}\n${agreement.provider.company}` });
      return res.status(200).json({ success: true, link });
    }

    if (src.step === 'client') {
      const t = readToken(src.t);
      if (!t || t.id !== agreement.id) return res.status(410).json({ error: 'This signing link is not valid or has expired. Ask Social Gear for a new link.' });
      if (t.h !== hash) return res.status(409).json({ error: 'The agreement changed after this link was made. Ask Social Gear for a new link.' });
      if (!str(src.name, 120)) return res.status(400).json({ error: 'Type your full name.' });
      let image = null;
      if (src.signature != null) {
        const m = typeof src.signature === 'string' && src.signature.length <= 400000 && /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(src.signature);
        if (!m) return res.status(400).json({ error: 'The drawn signature could not be read. Clear it and draw it again.' });
        image = Buffer.from(m[1], 'base64');
        if (image.length < 200 || image.readUInt32BE(0) !== 0x89504e47) return res.status(400).json({ error: 'The drawn signature could not be read. Clear it and draw it again.' });
      }
      const provider = { name: t.pn, title: t.pt, email: agreement.provider.email, at: t.ps, ip: t.pip, strokes: t.pg ? readStrokes(t.pg) : null };
      const client = { name: src.name.trim(), title: '', email: t.ce, at: new Date().toISOString(), ip: ip(req), image };
      const pdf = await buildPdf(agreement, provider, client, hash);
      await sendMail({ to: [t.ce, agreement.provider.email], replyTo: agreement.provider.email, subject: `Signed: ${agreement.title} - ${agreement.subtitle}`,
        text: `The ${agreement.title} (${agreement.subtitle}) is signed by both parties.\n\n${provider.name}, ${agreement.provider.company}: signed ${stamp(provider.at)}\n${client.name}: signed ${stamp(client.at)}\n\nThe completed copy is attached as a PDF. Keep it for your records.\n\nDocument ID: ${hash}`,
        attachment: { name: `${agreement.id}-signed-agreement.pdf`, bytes: pdf } });
      return res.status(200).json({ success: true, signedAt: stamp(client.at) });
    }
    return res.status(400).json({ error: 'Unknown step.' });
  } catch (err) {
    console.error('Signing request failed:', err.message === 'Signing not configured' || err.message === 'Mail not configured' ? err.message : (err.code || 'sign_failed'));
    return res.status(503).json({ error: 'We could not complete the signing. Nothing was sent. Please try again, or email riz@social-gear.com.' });
  }
};
