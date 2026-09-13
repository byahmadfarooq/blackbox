import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || 'landing-page.com';
    const score = parseInt(searchParams.get('score') || '78', 10);
    const tier = searchParams.get('tier') || 'TIER A // MINOR TURBULENCE';

    const tierColor = score >= 90 ? '#00FF88' : score >= 75 ? '#FFB700' : '#FF5500';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#050505',
            padding: '60px 70px',
            fontFamily: 'sans-serif',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255, 85, 0, 0.15) 0%, transparent 60%)',
          }}
        >
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  border: '2px solid #FF5500',
                  transform: 'rotate(45deg)',
                  display: 'flex',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.1em' }}>
                  BLACKBOX
                </span>
                <span style={{ fontSize: '12px', color: '#71717A', letterSpacing: '0.15em' }}>
                  B2B FLIGHT RECORDER // KAIVEX SYSTEMS
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#0E0E14',
                border: '1px solid #27272A',
                padding: '8px 18px',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#A1A1AA',
                fontFamily: 'monospace',
              }}
            >
              FLIGHT TELEMETRY RECOVERED
            </div>
          </div>

          {/* Center Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0A0A0E',
              border: '1px solid #1C1C24',
              borderRadius: '12px',
              padding: '40px 50px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', color: '#52525B', fontFamily: 'monospace', marginBottom: '8px' }}>
                PROBED TARGET DOMAIN
              </span>
              <span style={{ fontSize: '44px', fontWeight: 900, color: '#FFFFFF' }}>
                {domain}
              </span>
              <span
                style={{
                  marginTop: '16px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: tierColor,
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                }}
              >
                [{tier}]
              </span>
            </div>

            {/* Score Circle Readout */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '170px',
                height: '170px',
                borderRadius: '50%',
                border: `6px solid ${tierColor}`,
                boxShadow: `0 0 35px ${tierColor}44`,
                backgroundColor: '#0D0D12',
              }}
            >
              <span style={{ fontSize: '56px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                {score}
              </span>
              <span style={{ fontSize: '12px', color: '#71717A', fontFamily: 'monospace', marginTop: '4px' }}>
                / 100 INDEX
              </span>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#52525B', fontFamily: 'monospace' }}>
              RECOVER YOUR CONVERSION FLIGHT DATA: blackbox.kaivex.vercel.app
            </span>
            <span style={{ fontSize: '14px', color: '#FF5500', fontFamily: 'monospace', fontWeight: 700 }}>
              CONVERSION ARCHITECTURE BY KAIVEX SYSTEMS
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error('OG error:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
