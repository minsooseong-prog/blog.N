import type { Metadata } from 'next';
import WriteForm from '@/components/WriteForm';
import { normalizeQuery } from '@/lib/validate';

export const metadata: Metadata = {
  title: '글 쓰기',
  description: '이름과 이야기를 남겨 lifeboat에 종이배를 띄웁니다.',
};

type SearchParams = Promise<{ title?: string }>;

export default async function WritePage({ searchParams }: { searchParams: SearchParams }) {
  const { title } = await searchParams;
  const prefill = normalizeQuery(title).slice(0, 80);

  return (
    <div className="shell">
      <div className="page-head">
        <p className="page-head__eyebrow">new post</p>
        <h1 className="page-head__title">종이배 띄우기</h1>
        <p className="page-head__sub">여기 올린 글은 누구나 읽을 수 있어요. 개인정보는 적지 않는 편이 좋아요.</p>
      </div>
      <WriteForm initialTitle={prefill} />
    </div>
  );
}
