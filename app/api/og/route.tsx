import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { decodeReport } from '@/lib/share';

export const runtime = 'nodejs';

const INK = '#17171a';
const MUTED = '#66666d';
const PAPER = '#f7f6f2';
const LINE = '#e4e2da';

const tone = (n: number) => (n >= 75 ? '#2f7d4f' : n >= 50 ? '#a86a0c' : '#b42318');

const PILLARS = [
  ['architecture', 'Getting visitors to act'],
  ['messaging', 'Clear message'],
  ['proof', 'Proof and trust'],
  ['velocity', 'Speed and weight'],
] as const;

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const report = decodeReport(sp.get('t') || '');
  const square = sp.get('size') === 'square';
  const width = 1200;
  const height = square ? 1200 : 630;
  const pad = square ? 80 : 64;

  const headers: Record<string, string> = { 'Cache-Control': 'public, max-age=86400, immutable' };
  if (sp.get('download') && report) {
    headers['Content-Disposition'] = `attachment; filename="blackbox-${report.domain}${square ? '-square' : ''}.png"`;
  }

  const brand = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', width: 44, height: 44, borderRadius: 10, background: INK, color: PAPER, alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>B</div>
      <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, marginLeft: 14 }}>Blackbox</div>
    </div>
  );

  if (!report) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: PAPER, color: INK, padding: pad, fontFamily: 'sans-serif' }}>
          {brand}
          <div style={{ display: 'flex', fontSize: 78, fontWeight: 700, lineHeight: 1.08, maxWidth: 960 }}>Find what is stopping visitors from contacting you.</div>
          <div style={{ display: 'flex', fontSize: 26, color: MUTED }}>A free, plain-English check of any B2B landing page. By Ahmad Farooq.</div>
        </div>
      ),
      { width, height, headers }
    );
  }

  const score = report.overallScore;
  const top = report.incidents.find((i) => i.severity === 'FATAL_STALL') || report.incidents.find((i) => i.severity === 'FRICTION_WARN');

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: PAPER, color: INK, padding: pad, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {brand}
          <div style={{ display: 'flex', fontSize: 28, color: MUTED }}>{report.domain.slice(0, 40)}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: square ? 'column' : 'row', alignItems: square ? 'flex-start' : 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', fontSize: square ? 280 : 210, fontWeight: 700, color: tone(score), lineHeight: 1 }}>{score}</div>
              <div style={{ display: 'flex', fontSize: 54, color: MUTED, marginLeft: 14 }}>/ 100</div>
            </div>
            <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, marginTop: 6 }}>{report.tierLabel}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', width: square ? '100%' : 470, marginTop: square ? 48 : 0 }}>
            {PILLARS.map(([k, label]) => {
              const p = report.pillars[k];
              return (
                <div key={k} style={{ display: 'flex', flexDirection: 'column', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26 }}>
                    <div style={{ display: 'flex' }}>{label}</div>
                    <div style={{ display: 'flex', color: MUTED }}>{p.score} / {p.maxScore}</div>
                  </div>
                  <div style={{ display: 'flex', width: '100%', height: 12, background: LINE, borderRadius: 6, marginTop: 8 }}>
                    <div style={{ display: 'flex', width: `${p.percentage}%`, height: 12, background: tone(p.percentage), borderRadius: 6 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {top && (
            <div style={{ display: 'flex', fontSize: 28, marginBottom: 14 }}>
              Top fix: {top.headline.slice(0, 70)}
            </div>
          )}
          <div style={{ display: 'flex', fontSize: 22, color: MUTED }}>Free check at blackboxcheck.vercel.app. By Ahmad Farooq.</div>
        </div>
      </div>
    ),
    { width, height, headers }
  );
}
