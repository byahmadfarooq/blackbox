import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const domain = (sp.get('domain') || '').replace(/[^a-zA-Z0-9.\-]/g, '').slice(0, 60);
  const rawScore = parseInt(sp.get('score') || '', 10);
  const hasScore = domain !== '' && !Number.isNaN(rawScore);
  const score = Math.max(0, Math.min(100, rawScore || 0));
  const color = score >= 75 ? '#2f7d4f' : score >= 50 ? '#a86a0c' : '#b42318';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f7f6f2',
          color: '#17171a',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', width: 44, height: 44, borderRadius: 10, background: '#17171a', color: '#f7f6f2', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
            B
          </div>
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>Blackbox</div>
        </div>

        {hasScore ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 34, color: '#66666d' }}>{domain}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 8 }}>
              <div style={{ display: 'flex', fontSize: 200, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
              <div style={{ display: 'flex', fontSize: 56, color: '#66666d', marginLeft: 16 }}>/ 100</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', fontSize: 78, fontWeight: 700, lineHeight: 1.08, maxWidth: 940 }}>
            Find what is stopping visitors from contacting you.
          </div>
        )}

        <div style={{ display: 'flex', fontSize: 26, color: '#66666d' }}>
          A free, plain-English check of any B2B landing page. By Ahmad Farooq.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
