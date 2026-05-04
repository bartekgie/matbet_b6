import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1B2D4F',
        borderRadius: '12px',
      }}>
        <span style={{ color: '#ffffff', fontSize: 40, fontWeight: 900, fontFamily: 'Arial', letterSpacing: '-1px' }}>M</span>
      </div>
    ),
    { ...size }
  )
}
