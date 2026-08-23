import { NextResponse } from 'next/server';
import { ensureSchema, getSql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** 배포 직후 DB 연결이 살아있는지 확인하는 용도: /api/health */
export async function GET() {
  const started = Date.now();
  try {
    await ensureSchema();
    const sql = getSql();
    const rows = (await sql`SELECT count(*)::int AS total FROM posts`) as Record<string, unknown>[];
    return NextResponse.json({
      ok: true,
      posts: Number(rows[0]?.total ?? 0),
      latencyMs: Date.now() - started,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
