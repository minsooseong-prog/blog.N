'use client';

import { useEffect, useState } from 'react';
import { formatAbsolute, formatRelative } from '@/lib/format';

/**
 * 서버에서는 절대 시각(KST 고정)을 그리고, 마운트 후 상대 시각으로 바꾼다.
 * 서버·클라이언트 첫 렌더가 같아야 하이드레이션 경고가 나지 않는다.
 */
export default function TimeAgo({ iso, className }: { iso: string; className?: string }) {
  const absolute = formatAbsolute(iso);
  const [label, setLabel] = useState(absolute);

  useEffect(() => {
    const update = () => setLabel(formatRelative(iso));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [iso]);

  return (
    <time dateTime={iso} title={absolute} className={className}>
      {label}
    </time>
  );
}
