import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = {
  width: 1200,
  height: 630,
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px',
          background: 'linear-gradient(135deg, #0B0E11 0%, #12160F 55%, #1A1E16 100%)',
          color: '#F4F2EA',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #B8922E, #D4A843, #E8C35A)',
              boxShadow: '0 4px 20px rgba(212,168,67,0.25)',
            }}
          />
          <div style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            FOOTORY
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              fontSize: '20px',
              letterSpacing: '2px',
              color: '#706B56',
              textTransform: 'uppercase',
            }}
          >
            Career OS for Youth Football
          </div>
          <div style={{ fontSize: '62px', fontWeight: 900, lineHeight: 1.06, maxWidth: '900px' }}>
            Highlights. Tags. Measured Evidence.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', color: '#A8A28A' }}>footory.com</div>
          <div
            style={{
              fontSize: '20px',
              color: '#F0D078',
              border: '1px solid rgba(212,168,67,0.4)',
              padding: '6px 14px',
              borderRadius: '999px',
            }}
          >
            PUBLIC PROFILE
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
