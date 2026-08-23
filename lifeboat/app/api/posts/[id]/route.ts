import { NextResponse } from 'next/server';
import { deletePost, getPost } from '@/lib/posts';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

function toId(raw: string): number {
  const n = Number.parseInt(raw, 10);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const postId = toId(id);
  if (!postId) return NextResponse.json({ error: '잘못된 글 번호입니다.' }, { status: 400 });

  try {
    const post = await getPost(postId);
    if (!post) return NextResponse.json({ error: '없는 글입니다.' }, { status: 404 });
    return NextResponse.json({ post });
  } catch (err) {
    console.error('[GET /api/posts/:id]', err);
    return NextResponse.json({ error: '글을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  const postId = toId(id);
  if (!postId) return NextResponse.json({ error: '잘못된 글 번호입니다.' }, { status: 400 });

  // 비밀번호 무차별 대입 방지
  const limit = rateLimit(`del:${clientKey(req)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `시도가 너무 잦습니다. ${limit.retryAfter}초 뒤에 다시 해주세요.` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let password = '';
  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ error: '삭제 비밀번호를 입력하세요.' }, { status: 400 });
  }

  try {
    const result = await deletePost(postId, password);

    switch (result) {
      case 'deleted':
        return NextResponse.json({ ok: true });
      case 'not-found':
        return NextResponse.json({ error: '이미 지워진 글입니다.' }, { status: 404 });
      case 'no-password-set':
        return NextResponse.json(
          { error: '이 글은 삭제 비밀번호 없이 올려서 지울 수 없어요.' },
          { status: 403 }
        );
      case 'wrong-password':
      default:
        return NextResponse.json({ error: '비밀번호가 맞지 않습니다.' }, { status: 403 });
    }
  } catch (err) {
    console.error('[DELETE /api/posts/:id]', err);
    return NextResponse.json({ error: '글을 지우지 못했습니다.' }, { status: 500 });
  }
}
