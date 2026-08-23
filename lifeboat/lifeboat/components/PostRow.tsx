import Link from 'next/link';
import Highlight from './Highlight';
import TimeAgo from './TimeAgo';
import { displayTitle, snippet } from '@/lib/format';
import type { Post } from '@/lib/types';

export default function PostRow({ post, query }: { post: Post; query: string }) {
  const title = displayTitle(post);
  const body = snippet(post.content, query, 160);

  return (
    <li>
      <Link href={`/posts/${post.id}`} className="post-row">
        <h3 className="post-row__title">
          <Highlight text={title} query={query} />
        </h3>
        <p className="post-row__excerpt">
          <Highlight text={body} query={query} />
        </p>
        <div className="post-row__meta">
          <span className="post-row__author">
            <Highlight text={post.author} query={query} />
          </span>
          <span className="dot" aria-hidden="true">
            ·
          </span>
          <TimeAgo iso={post.created_at} />
        </div>
      </Link>
    </li>
  );
}
