const crypto = require('node:crypto');

const TOKEN_TTL_MS = 30 * 86400000;
function b64url(buf) { return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function docHash(agreement) { return crypto.createHash('sha256').update(JSON.stringify(agreement.blocks)).digest('hex'); }
function secret() { if (!process.env.SIGN_SECRET || process.env.SIGN_SECRET.length < 24) throw new Error('Signing not configured'); return process.env.SIGN_SECRET; }
function mac(payload) { return b64url(crypto.createHmac('sha256', secret()).update(payload).digest()); }
function makeToken(data) { const payload = b64url(JSON.stringify(data)); return payload + '.' + mac(payload); }
function readToken(token, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 4000) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const want = Buffer.from(mac(payload)), got = Buffer.from(sig);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return now - Date.parse(data.ps) > TOKEN_TTL_MS ? null : data;
  } catch { return null; }
}
function sameKey(given) {
  const want = process.env.SIGN_ADMIN_KEY;
  if (!want || want.length < 12 || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest(), b = crypto.createHash('sha256').update(want).digest();
  return crypto.timingSafeEqual(a, b);
}
function stamp(iso) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso)) + ' PT';
}
// pdf-lib's standard fonts use WinAnsi. Replace anything outside it so a name cannot break the PDF.
function winAnsi(s) { return String(s).replace(/[^\x20-\x7E -ÿ–—‘’“”•]/g, '?'); }

async function buildPdf(agreement, provider, client, hash) {
  const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${agreement.title} - ${agreement.subtitle}`);
  const reg = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const script = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const W = 612, H = 792, M = 60, ink = rgb(0.1, 0.1, 0.1), soft = rgb(0.4, 0.4, 0.4);
  let page, y;
  const footer = () => page.drawText(winAnsi(`${agreement.title} · Document ID ${hash.slice(0, 16)} · Page ${pdf.getPageCount()}`), { x: M, y: 32, size: 8, font: reg, color: soft });
  const add = () => { page = pdf.addPage([W, H]); y = H - M; footer(); };
  const need = (h) => { if (y - h < M + 10) add(); };
  // Draws text with **bold** runs, wrapped to the page width.
  const para = (text, { size = 10.5, indent = 0, gap = 8, bullet = false } = {}) => {
    const runs = winAnsi(text).split('**').flatMap((part, i) => part.split(/(\s+)/).filter(Boolean).map((w) => ({ w, f: i % 2 ? bold : reg })));
    const lh = size * 1.45, max = W - 2 * M - indent;
    let line = [], width = 0, first = true;
    const flush = () => {
      need(lh);
      if (first && bullet) page.drawText('•', { x: M + indent - 12, y: y - size, size, font: reg, color: ink });
      let x = M + indent;
      for (const r of line) { page.drawText(r.w, { x, y: y - size, size, font: r.f, color: ink }); x += r.f.widthOfTextAtSize(r.w, size); }
      y -= lh; line = []; width = 0; first = false;
    };
    for (const r of runs) {
      const w = r.f.widthOfTextAtSize(r.w, size);
      if (width + w > max && line.length) { flush(); if (!r.w.trim()) continue; }
      if (!line.length && !r.w.trim()) continue;
      line.push(r); width += w;
    }
    if (line.length) flush();
    y -= gap;
  };
  add();
  const logo = await pdf.embedPng(Buffer.from(require('./sign-logo'), 'base64'));
  page.drawImage(logo, { x: M - 4, y: y - 50, width: 150, height: 57 }); y -= 70;
  page.drawText(winAnsi(agreement.title), { x: M, y: y - 22, size: 22, font: bold, color: ink }); y -= 34;
  page.drawText(winAnsi(agreement.subtitle), { x: M, y: y - 11, size: 11, font: reg, color: soft }); y -= 30;
  for (const b of agreement.blocks) {
    if (b.t === 'h') { need(50); y -= 6; page.drawText(winAnsi(b.x), { x: M, y: y - 14, size: 14, font: bold, color: ink }); y -= 26; }
    else if (b.t === 'ul') { for (const item of b.items) para(item, { indent: 16, gap: 3, bullet: true }); y -= 6; }
    else para(b.x);
  }
  need(250); y -= 6;
  page.drawText('Signatures', { x: M, y: y - 14, size: 14, font: bold, color: ink }); y -= 30;
  const col = (W - 2 * M - 30) / 2, top = y;
  const block = async (x, party, s) => {
    let yy = top;
    page.drawText(winAnsi(party), { x, y: yy - 10, size: 10, font: bold, color: ink }); yy -= 22;
    if (s.image) {
      const img = await pdf.embedPng(s.image), k = Math.min(col / img.width, 54 / img.height);
      page.drawImage(img, { x, y: yy - 54, width: img.width * k, height: img.height * k });
    } else {
      let size = 26; while (size > 12 && script.widthOfTextAtSize(winAnsi(s.name), size) > col) size -= 1;
      page.drawText(winAnsi(s.name), { x, y: yy - 40, size, font: script, color: rgb(0.05, 0.1, 0.35) });
    }
    yy -= 60; page.drawLine({ start: { x, y: yy }, end: { x: x + col, y: yy }, thickness: 0.7, color: soft }); yy -= 14;
    for (const line of [s.name + (s.title ? ', ' + s.title : ''), s.email, 'Signed ' + stamp(s.at)]) { page.drawText(winAnsi(line), { x, y: yy - 9, size: 9, font: reg, color: ink }); yy -= 13; }
    return yy;
  };
  const y1 = await block(M, agreement.provider.company, provider), y2 = await block(M + col + 30, agreement.clientLabel, client);
  y = Math.min(y1, y2) - 18;
  need(110);
  page.drawText('Signing record', { x: M, y: y - 10, size: 10, font: bold, color: ink }); y -= 20;
  for (const line of [
    `Document SHA-256: ${hash}`,
    `${provider.name} <${provider.email}> signed ${provider.at} from IP ${provider.ip}`,
    `${client.name} <${client.email}> signed ${client.at} from IP ${client.ip}`,
    `Both signers agreed to sign electronically. ${client.image ? 'The Client drew the signature shown.' : 'The Client adopted a typed signature.'} ${agreement.provider.company} adopted a typed signature.`,
  ]) para(line, { size: 8, gap: 1 });
  return Buffer.from(await pdf.save());
}
module.exports = { docHash, makeToken, readToken, sameKey, stamp, buildPdf };
