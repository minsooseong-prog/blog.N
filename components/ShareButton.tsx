'use client';

import { useEffect, useState } from 'react';

/** 주소 복사. 모바일에서 기본 공유 시트를 쓸 수 있으면 그쪽을 먼저 시도한다. */
export default function ShareButton({ title }: { title: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(() => setState('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [state]);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // 사용자가 취소했거나 지원되지 않으면 복사로 넘어간다.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
    } catch {
      setState('failed');
    }
  };

  return (
    <button type="button" className="btn btn--ghost" onClick={() => void share()} aria-live="polite">
      {state === 'copied' ? '주소를 복사했어요' : state === 'failed' ? '복사하지 못했어요' : '주소 복사'}
    </button>
  );
}
