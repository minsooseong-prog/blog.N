const KST = 'Asia/Seoul';

/** 서버·클라이언트가 항상 같은 문자열을 만들도록 타임존을 고정한다 (하이드레이션 불일치 방지) */
export function formatAbsolute(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

export function formatRelative(iso: string, now: number = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Math.max(0, now - t);
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;

  if (diff < min) return '방금 전';
  if (diff < hour) return `${Math.floor(diff / min)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`;
  return formatAbsolute(iso).slice(0, 10);
}

export function excerpt(text: string, max = 140): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

/** 제목이 없으면 본문 첫 줄을 제목처럼 쓴다 */
export function displayTitle(post: { title: string | null; content: string }): string {
  const t = (post.title ?? '').trim();
  if (t) return t;
  const firstLine = post.content.split('\n').find((l) => l.trim().length > 0) ?? '';
  return excerpt(firstLine, 40) || '무제';
}

/**
 * 검색어가 본문 뒤쪽에 있어도 보이도록, 첫 일치 지점을 중심으로 잘라낸다.
 * 일치가 없으면 앞부분을 그대로 보여준다.
 */
export function snippet(text: string, query: string, max = 160): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  const q = query.trim();
  if (!q || flat.length <= max) return excerpt(flat, max);

  const lower = flat.toLowerCase();
  let hit = -1;
  for (const term of q.split(/\s+/).filter(Boolean)) {
    const i = lower.indexOf(term.toLowerCase());
    if (i !== -1 && (hit === -1 || i < hit)) hit = i;
  }
  if (hit === -1) return excerpt(flat, max);

  const start = Math.max(0, hit - Math.floor(max / 3));
  const end = Math.min(flat.length, start + max);
  const body = flat.slice(start, end);
  return `${start > 0 ? '…' : ''}${body}${end < flat.length ? '…' : ''}`;
}
