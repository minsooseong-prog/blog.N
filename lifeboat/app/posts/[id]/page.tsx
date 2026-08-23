import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import TimeAgo from '@/components/TimeAgo';
import DeletePostButton from '@/components/DeletePostButton';
import ShareButton from '@/components/ShareButton';
import { getNeighborPosts, getPost } from '@/lib/posts';
import { displayTitle, excerpt } from '@/lib/format';
import type { Post } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

function toId(raw: string): number {
  const n = Number.parseInt(raw, 10);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(toId(id)).catch(() => null);
  if (!post) return { title: '없는 글' };

  return {
    title: displayTitle(post),
    description: excerpt(post.content, 120),
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { id } = await params;
  const postId = toId(id);
  if (!postId) notFound();

  const post = await getPost(postId);
  if (!post) notFound();

  const { prev, next } = await getNeighborPosts(postId).catch(() => ({ prev: null, next: null }));
  const title = displayTitle(post);
  const initial = post.author.trim().charAt(0).toUpperCase() || '?';

  return (
    <article className="shell article">
      <h1 className="article__title">{title}</h1>

      <div className="article__meta">
        <span className="article__author">
          <span className="avatar" aria-hidden="true">
            {initial}
          </span>
          {post.author}
        </span>
        <span className="dot" aria-hidden="true">
          ·
        </span>
        <TimeAgo iso={post.created_at} />
        <span className="dot" aria-hidden="true">
          ·
        </span>
        <span>{post.content.length.toLocaleString()}자</span>
      </div>

      <div className="article__body">{post.content}</div>

      <div className="article__foot">
        <Link href="/" className="btn btn--ghost">
          ← 목록으로
        </Link>
        <span className="article__tools">
          <ShareButton title={title} />
          <DeletePostButton postId={post.id} />
        </span>
      </div>

      {prev || next ? (
        <nav className="neighbors" aria-label="다른 글">
          {next ? <NeighborLink post={next} direction="다음" /> : null}
          {prev ? <NeighborLink post={prev} direction="이전" /> : null}
        </nav>
      ) : null}
    </article>
  );
}

function NeighborLink({ post, direction }: { post: Post; direction: string }) {
  return (
    <Link href={`/posts/${post.id}`} className="neighbor">
      <span className="neighbor__dir">{direction}</span>
      <span className="neighbor__title">{displayTitle(post)}</span>
    </Link>
  );
}
