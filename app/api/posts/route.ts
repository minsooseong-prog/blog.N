import { NextResponse } from 'next/server';
import { createPost, listPosts } from '@/lib/posts';
import { normalizeQuery, parsePage, validatePost } from '@/lib/validate';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/posts?q=검색어&page=1 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = normalizeQuery(searchParams.get('q'));
  const page = parsePage(searchParams.get('page'));

  try {
    const result = await listPosts(query, page);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /api/posts]', err);
    return NextResponse.json({ error: '글 목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

/** POST /api/posts */
export async function POST(req: Request) {
  const limit = rateLimit(`post:${clientKey(req)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `조금 빠릅니다. ${limit.retryAfter}초 뒤에 다시 올려주세요.` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const checked = validatePost(body);
  if (!checked.ok) {
    return NextResponse.json({ error: checked.message, field: checked.field }, { status: 400 });
  }

  try {
    const post = await createPost(checked.value);
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/posts]', err);
    return NextResponse.json({ error: '글을 저장하지 못했습니다. 데이터베이스 연결을 확인하세요.' }, { status: 500 });
  }
}
