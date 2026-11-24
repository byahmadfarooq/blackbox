import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { CheckView, PillarKey, ReportData } from '@/lib/engine/types';

const W = 595;
const H = 842;
const M = 48;
const INK = rgb(0.09, 0.09, 0.1);
const MUTED = rgb(0.4, 0.4, 0.43);
const LINE = rgb(0.89, 0.886, 0.855);
const PAPER = rgb(0.969, 0.965, 0.949);
const ACCENT = rgb(0.76, 0.255, 0.047);
const GOOD = rgb(0.184, 0.49, 0.31);
const WARN = rgb(0.659, 0.416, 0.047);
const BAD = rgb(0.706, 0.137, 0.094);

const safe = (s: string) =>
  s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...').replace(/[–—]/g, '-').replace(/[^\x20-\x7E -ÿ]/g, '?');

const toneColor = (pct: number) => (pct >= 75 ? GOOD : pct >= 50 ? WARN : BAD);
const STATUS: Record<string, { label: string; color: ReturnType<typeof rgb> }> = {
  pass: { label: 'PASSED', color: GOOD },
  warn: { label: 'WORTH FIXING', color: WARN },
  fail: { label: 'FIX FIRST', color: BAD },
  unknown: { label: 'NOT CHECKED', color: MUTED },
};

export async function buildReportPdf(r: ReportData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const date = new Date(r.scannedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  pdf.setTitle(`Blackbox Report - ${r.domain} - ${new Date(r.scannedAt).toISOString().slice(0, 10)}`);
  pdf.setAuthor('Blackbox by Ahmad Farooq');
  pdf.setSubject(`Landing page check for ${r.domain}`);

  let page: PDFPage = pdf.addPage([W, H]);
  let y = H - M;
  const pages: PDFPage[] = [page];

  const wrap = (text: string, font: PDFFont, size: number, width: number): string[] => {
    const words = safe(text).split(/\s+/);
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(t, size) > width && cur) {
        lines.push(cur);
        cur = w;
      } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  };

  const text = (s: string, x: number, yy: number, size: number, font = reg, color = INK) =>
    page.drawText(safe(s), { x, y: yy, size, font, color });

  const newPage = () => {
    page = pdf.addPage([W, H]);
    pages.push(page);
    y = H - M;
  };
  const ensure = (need: number) => {
    if (y - need < M + 24) newPage();
  };
  const paragraph = (s: string, size: number, font = reg, color = MUTED, width = W - 2 * M, x = M, lead = 1.45) => {
    for (const line of wrap(s, font, size, width)) {
      ensure(size * lead);
      text(line, x, y - size, size, font, color);
      y -= size * lead;
    }
  };

  // ---- header ----
  page.drawRectangle({ x: M, y: y - 22, width: 22, height: 22, color: INK });
  text('B', M + 7, y - 16, 14, bold, rgb(0.969, 0.965, 0.949));
  text('Blackbox', M + 30, y - 16, 15, bold);
  const ds = safe(date);
  text(ds, W - M - reg.widthOfTextAtSize(ds, 10), y - 15, 10, reg, MUTED);
  y -= 56;

  text('Landing page check', M, y, 11, reg, MUTED);
  y -= 30;
  const dom = safe(r.domain);
  text(dom, M, y, dom.length > 28 ? 22 : 30, bold);
  y -= 22;
  paragraph(`${r.archetypeLabel}${r.manual ? ' (chosen by the person who ran it)' : ''}. Checked from the page code, rubric ${r.version}.`, 10);
  y -= 14;

  // ---- score card ----
  page.drawRectangle({ x: M, y: y - 150, width: W - 2 * M, height: 150, color: PAPER, borderColor: LINE, borderWidth: 1 });
  text(String(r.score), M + 24, y - 88, 72, bold, toneColor(r.score));
  const sw = bold.widthOfTextAtSize(String(r.score), 72);
  text('/ 100', M + 32 + sw, y - 88, 16, reg, MUTED);
  text(r.tierLabel, M + 24, y - 114, 15, bold);
  const descLines = wrap(r.tierDescription, reg, 10, 200);
  descLines.slice(0, 2).forEach((l, i) => text(l, M + 24, y - 130 - i * 13, 10, reg, MUTED));

  // pillar bars
  const bx = M + 260;
  const bw = W - M - 24 - bx;
  (Object.keys(r.pillars) as PillarKey[]).forEach((k, i) => {
    const p = r.pillars[k];
    const by = y - 28 - i * 25;
    text(p.name, bx, by, 9.5, reg);
    const sc = p.coverage === 0 ? 'n/a' : `${p.score} / ${p.max}`;
    text(sc, bx + bw - reg.widthOfTextAtSize(sc, 9.5), by, 9.5, reg, MUTED);
    page.drawRectangle({ x: bx, y: by - 9, width: bw, height: 4, color: LINE });
    if (p.coverage > 0) page.drawRectangle({ x: bx, y: by - 9, width: Math.max(2, (bw * p.percentage) / 100), height: 4, color: toneColor(p.percentage) });
  });
  y -= 150 + 14;
  paragraph(`We could run ${r.coverage}% of the checks on this page. Anything marked not checked is left out of the score.`, 9.5);
  r.limits.forEach((l) => paragraph(l, 9.5));
  y -= 10;

  // ---- start here ----
  ensure(60);
  text('Start here', M, y - 14, 15, bold);
  y -= 30;
  const topFixes = r.priorities.slice(0, 3);
  if (!topFixes.length) paragraph('No blocking issues were found.', 11);
  topFixes.forEach((c, i) => {
    const fixLines = wrap(c.fix, reg, 10, W - 2 * M - 34);
    const titleLines = wrap(c.title, bold, 11.5, W - 2 * M - 34);
    const h = titleLines.length * 15 + fixLines.length * 14 + 22;
    ensure(h + 8);
    page.drawRectangle({ x: M, y: y - h, width: W - 2 * M, height: h, borderColor: LINE, borderWidth: 1 });
    text(String(i + 1), M + 12, y - 20, 14, bold, ACCENT);
    let yy = y - 20;
    titleLines.forEach((l) => { text(l, M + 34, yy, 11.5, bold); yy -= 15; });
    if (c.gain) text(`up to +${c.gain} points`, W - M - 12 - reg.widthOfTextAtSize(`up to +${c.gain} points`, 9), y - 20, 9, reg, ACCENT);
    yy -= 2;
    fixLines.forEach((l) => { text(l, M + 34, yy, 10, reg, MUTED); yy -= 14; });
    y -= h + 10;
  });

  // ---- all checks ----
  newPage();
  text('All checks', M, y - 16, 17, bold);
  y -= 40;
  (Object.keys(r.pillars) as PillarKey[]).forEach((k) => {
    const items: CheckView[] = r.checks.filter((c) => c.pillar === k && c.status !== 'na');
    if (!items.length) return;
    ensure(60);
    text(r.pillars[k].name, M, y - 12, 12, bold);
    y -= 24;
    for (const c of items) {
      const st = STATUS[c.status] ?? STATUS.unknown;
      const body = [c.evidence, c.status === 'pass' ? '' : c.fix].filter(Boolean).join('  ');
      const lines = wrap(body, reg, 9.5, W - 2 * M - 14);
      ensure(30 + lines.length * 13);
      page.drawCircle({ x: M + 4, y: y - 6, size: 3.5, color: st.color });
      text(c.title, M + 14, y - 9, 10.5, bold);
      const lw = reg.widthOfTextAtSize(st.label, 7.5);
      text(st.label, W - M - lw, y - 9, 7.5, bold, st.color);
      y -= 15;
      lines.forEach((l) => { text(l, M + 14, y - 9, 9.5, reg, MUTED); y -= 13; });
      y -= 7;
    }
    y -= 8;
  });

  // ---- method ----
  ensure(110);
  page.drawLine({ start: { x: M, y: y - 4 }, end: { x: W - M, y: y - 4 }, thickness: 0.8, color: LINE });
  y -= 22;
  text('How this was checked', M, y, 11, bold);
  y -= 8;
  paragraph('Blackbox reads the page the way a search engine does, from its code. The same page always gets the same score, and no AI wrote this report. It cannot see things that only appear after scripts run, so those checks are marked not checked and are left out of the score. Treat the result as a strong first pass, not a verdict.', 9.5);

  pages.forEach((p, i) => {
    p.drawText(safe(`Blackbox by Ahmad Farooq  |  ${r.domain}  |  ${i + 1} of ${pages.length}`), { x: M, y: 24, size: 8, font: reg, color: MUTED });
  });

  return pdf.save();
}
