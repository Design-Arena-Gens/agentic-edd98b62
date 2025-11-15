import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';

const siteName = 'AI Storyboard Generator';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentic-edd98b62.vercel.app';
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} ? Generate Storyboards, Previews, and Voiceovers` ,
    template: `%s ? ${siteName}`
  },
  description:
    'Create AI-powered storyboards: split stories into scenes, preview with voiceover, and export video. SEO-optimized with ad slots for monetization.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: siteName,
    siteName,
    description:
      'Create AI-powered storyboards: split stories into scenes, preview with voiceover, and export video.',
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: `${siteName} preview`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description:
      'Create AI-powered storyboards: split stories into scenes, preview with voiceover, and export video.'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {adsenseClient ? (
          <Script
            id="adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        ) : null}
        <Script id="ld-json" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: siteName,
            url: siteUrl,
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
          })}
        </Script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
