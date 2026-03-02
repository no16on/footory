import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://footory.com'),
  title: 'Footory — Your Career OS',
  description: '유소년 축구 선수의 커리어 프로필 OS. 하이라이트 영상, 기술 태그, 측정 기록.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Footory — Your Career OS',
    description: '유소년 축구 선수의 커리어 프로필 OS. 하이라이트 영상, 기술 태그, 측정 기록.',
    siteName: 'Footory',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Footory — Your Career OS',
    description: '유소년 축구 선수의 커리어 프로필 OS. 하이라이트 영상, 기술 태그, 측정 기록.',
    images: ['/opengraph-image'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Footory',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0B0E11',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
