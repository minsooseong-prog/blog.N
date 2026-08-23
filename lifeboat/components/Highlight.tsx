import { Fragment } from 'react';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 검색어와 일치하는 부분만 <mark>로 감싼다.
 * React가 텍스트를 이스케이프하므로 dangerouslySetInnerHTML 없이 안전하다.
 */
export default function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const terms = Array.from(new Set(q.split(/\s+/).filter(Boolean)));
  if (terms.length === 0) return <>{text}</>;

  // 긴 단어부터 매칭해야 부분 겹침에서 더 넓은 쪽이 잡힌다.
  terms.sort((a, b) => b.length - a.length);

  const matchSet = new Set(terms.map((t) => t.toLowerCase()));
  // 캡처 그룹이 있으므로 split 결과에 일치 문자열도 포함된다.
  const parts = text.split(new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part && matchSet.has(part.toLowerCase()) ? (
          <mark className="hit" key={i}>
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}
