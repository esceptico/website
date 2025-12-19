import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Timur Ganiev - Machine Learning Engineer';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#121212',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              color: '#fafafa',
              letterSpacing: '-0.02em',
            }}
          >
            Timur Ganiev
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#a0a0a0',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            Machine Learning Engineer | Post-training & Alignment
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '80px',
            fontSize: 24,
            color: '#666666',
            fontFamily: 'monospace',
          }}
        >
          timganiev.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

