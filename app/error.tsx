'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbConfig = /DATABASE_URL/i.test(error.message);

  return (
    <div className="shell">
      <div className="notice">
        <Logo size={52} className="notice__mark" decorative />
        <h1 className="notice__title">
          {isDbConfig ? '데이터베이스 주소가 아직 연결되지 않았어요' : '글을 불러오지 못했어요'}
        </h1>
        <p className="notice__body">
          {isDbConfig ? (
            <>
              Vercel 프로젝트의 Settings → Environment Variables 에 <code>DATABASE_URL</code> 을 추가한 뒤 다시
              배포하세요.
            </>
          ) : (
            '잠시 뒤 다시 시도해 주세요. 문제가 이어지면 데이터베이스 연결 상태를 확인하세요.'
          )}
        </p>
        <div className="notice__actions">
          <button type="button" className="btn btn--primary" onClick={reset}>
            다시 시도
          </button>
          <Link href="/" className="btn btn--ghost">
            처음으로
          </Link>
        </div>
      </div>
    </div>
  );
}
