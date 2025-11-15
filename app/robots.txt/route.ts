import { NextResponse } from 'next/server';

export async function GET() {
  const body = `User-agent: *
Allow: /
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://agentic-edd98b62.vercel.app'}/sitemap.xml`;
  return new NextResponse(body, { headers: { 'Content-Type': 'text/plain' } });
}
