import Link from 'next/link';
import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import Waterline from '@/components/Waterline';
import SearchBar from '@/components/SearchBar';
import PostRow from '@/components/PostRow';
import Pagination from '@/components/Pagination';
import { listPosts } from '@/lib/posts';
import { normalizeQuery, parsePage } from '@/lib/validate';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ q?: string; page?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q } = await searchParams;
  const query = normalizeQuery(q);
  return query ? { title: `“${query}” 검색 결과` } : {};
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = normalizeQuery(params.q);
  const page = parsePage(params.page);

  const result = await listPosts(query, page);
  const searching = query.length > 0;

  return (
    <div className="shell">
      <section className="hero">
        <Logo size={64} className="hero__mark" decorative />
        <h1 className="hero__title">
          life<em>boat</em>
        </h1>
        <p className="hero__tagline">종이배에 한 문장을 실어 띄워 보내는 곳</p>
        <Waterline className="hero__waterline" />
      </section>

      <SearchBar initialQuery={query} />

      <div className="list-head">
        <h2 className="list-head__label">{searching ? `“${query}” 검색 결과` : '띄워진 글'}</h2>
        <span className="list-head__count" role="status">
          {searching ? `${result.total.toLocaleString()}편 찾음` : `${result.total.toLocaleString()}편`}
          {result.totalPages > 1 ? ` · ${result.page}/${result.totalPages}` : ''}
        </span>
      </div>

      {result.posts.length > 0 ? (
        <>
          <ul className="post-list">
            {result.posts.map((post) => (
              <PostRow key={post.id} post={post} query={query} />
            ))}
          </ul>
          <Pagination page={result.page} totalPages={result.totalPages} query={query} />
        </>
      ) : (
        <EmptyState searching={searching} query={query} />
      )}
    </div>
  );
}

function EmptyState({ searching, query }: { searching: boolean; query: string }) {
  return (
    <div className="notice">
      <Logo size={48} className="notice__mark" decorative />
      {searching ? (
        <>
          <p className="notice__title">“{query}” 과 닿는 글이 없어요</p>
          <p className="notice__body">
            단어를 줄이거나 작성자 이름으로 다시 찾아보세요. 아직 아무도 쓰지 않았다면 첫 글이 되어도 좋고요.
          </p>
          <div className="notice__actions">
            <Link href={`/write?title=${encodeURIComponent(query)}`} className="btn btn--primary">
              “{query}” 로 글 쓰기
            </Link>
            <Link href="/" className="btn btn--ghost">
              전체 글 보기
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="notice__title">아직 물 위가 조용해요</p>
          <p className="notice__body">첫 종이배를 띄워보세요. 이름과 이야기만 있으면 됩니다.</p>
          <div className="notice__actions">
            <Link href="/write" className="btn btn--primary">
              첫 글 쓰기
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
