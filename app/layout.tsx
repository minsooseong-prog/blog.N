import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'lifeboat — 마음을 띄우는 작은 게시판',
    template: '%s · lifeboat',
  },
  description:
    '누구나 이름과 이야기를 남기고, 검색으로 다른 사람이 띄운 글을 만날 수 있는 아주 단순한 게시판.',
  applicationName: 'lifeboat',
  openGraph: {
    title: 'lifeboat',
    description: '마음을 띄우는 작은 게시판',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Link href="#main" className="skip-link">
          본문으로 건너뛰기
        </Link>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
