import Link from 'next/link';

type Props = {
  page: number;
  totalPages: number;
  query: string;
};

function hrefFor(page: number, query: string): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

/** 현재 페이지 주변 ±2, 양 끝은 항상 노출 */
function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  const pages = new Set<number>([1, totalPages]);
  for (let p = page - 2; p <= page + 2; p += 1) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  let previous = 0;

  for (const p of sorted) {
    if (previous && p - previous > 1) out.push('gap');
    out.push(p);
    previous = p;
  }
  return out;
}

export default function Pagination({ page, totalPages, query }: Props) {
  if (totalPages <= 1) return null;

  const items = pageWindow(page, totalPages);

  return (
    <nav className="pager" aria-label="페이지 이동">
      {page > 1 ? (
        <Link href={hrefFor(page - 1, query)} rel="prev" aria-label="이전 페이지">
          ←
        </Link>
      ) : (
        <span className="is-disabled" aria-hidden="true">
          ←
        </span>
      )}

      {items.map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} aria-hidden="true">
            ⋯
          </span>
        ) : item === page ? (
          <span key={item} aria-current="page">
            {item}
          </span>
        ) : (
          <Link key={item} href={hrefFor(item, query)} aria-label={`${item}페이지`}>
            {item}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1, query)} rel="next" aria-label="다음 페이지">
          →
        </Link>
      ) : (
        <span className="is-disabled" aria-hidden="true">
          →
        </span>
      )}
    </nav>
  );
}
