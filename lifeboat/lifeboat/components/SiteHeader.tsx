import Link from 'next/link';
import Logo from './Logo';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link href="/" className="brand" aria-label="lifeboat 홈으로">
          <Logo size={26} />
          <span className="brand__word">
            life<em>boat</em>
          </span>
        </Link>

        <nav className="header-actions" aria-label="주요 메뉴">
          <Link href="/write" className="btn btn--primary">
            글 쓰기
          </Link>
        </nav>
      </div>
    </header>
  );
}
