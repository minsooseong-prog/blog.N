/**
 * 테이블을 미리 만들어 두고 싶을 때 실행한다. (앱은 첫 요청에서도 알아서 만든다)
 *
 *   cp .env.example .env.local   # 실제 값 채우기
 *   npm run db:init
 */
import { neon } from '@neondatabase/serverless';

const url =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!url) {
  console.error('✗ DATABASE_URL이 없습니다. .env.local 을 확인하세요.');
  process.exit(1);
}

const sql = neon(url);

const steps = [
  [
    'posts 테이블',
    () => sql`
      CREATE TABLE IF NOT EXISTS posts (
        id          BIGSERIAL PRIMARY KEY,
        author      TEXT        NOT NULL,
        title       TEXT,
        content     TEXT        NOT NULL,
        pw_hash     TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `,
  ],
  [
    '최신순 인덱스',
    () => sql`CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC, id DESC)`,
  ],
  ['pg_trgm 확장', () => sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`],
  [
    '검색 인덱스',
    () => sql`
      CREATE INDEX IF NOT EXISTS posts_search_idx
        ON posts USING GIN ((coalesce(title, '') || ' ' || content || ' ' || author) gin_trgm_ops)
    `,
  ],
];

for (const [label, run] of steps) {
  try {
    await run();
    console.log(`✓ ${label}`);
  } catch (err) {
    console.warn(`△ ${label} 건너뜀 — ${err instanceof Error ? err.message : err}`);
  }
}

const [{ total }] = await sql`SELECT count(*)::int AS total FROM posts`;
console.log(`\n준비 완료. 현재 글 ${total}편.`);
