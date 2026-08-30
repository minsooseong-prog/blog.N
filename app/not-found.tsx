import Link from 'next/link';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="shell">
      <div className="notice">
        <Logo size={52} className="notice__mark" decorative />
        <h1 className="notice__title">여긴 아무것도 떠 있지 않아요</h1>
        <p className="notice__body">주소가 바뀌었거나, 글이 이미 지워졌을 수 있어요.</p>
        <div className="notice__actions">
          <Link href="/" className="btn btn--primary">
            처음으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
