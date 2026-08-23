import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let cachedSql: NeonQueryFunction<false, false> | null = null;

/**
 * Neon HTTP 드라이버를 지연 생성한다.
 * 빌드 타임에 환경변수가 없어도 모듈 로드만으로 터지지 않도록 함수 안에서 검사한다.
 */
export function getSql(): NeonQueryFunction<false, false> {
  if (cachedSql) return cachedSql;

  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url) {
    throw new Error(
      'DATABASE_URL이 설정되어 있지 않습니다. Vercel > Settings > Environment Variables 에서 값을 추가하세요.'
    );
  }

  cachedSql = neon(url);
  return cachedSql;
}

let schemaPromise: Promise<void> | null = null;

/**
 * posts 테이블과 인덱스를 준비한다. 프로세스당 1회만 실행된다.
 * (Neon HTTP 드라이버는 한 번에 한 문장만 실행하므로 순차 호출)
 */
export function ensureSchema(): Promise<void> {
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    const sql = getSql();

    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id          BIGSERIAL PRIMARY KEY,
        author      TEXT        NOT NULL,
        title       TEXT,
        content     TEXT        NOT NULL,
        pw_hash     TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS posts_created_at_idx
        ON posts (created_at DESC, id DESC)
    `;

    // 부분 일치(ILIKE) 검색 가속용. 권한이 없으면 조용히 건너뛴다 — 검색 자체는 계속 동작한다.
    try {
      await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
      await sql`
        CREATE INDEX IF NOT EXISTS posts_search_idx
          ON posts USING GIN (
            (coalesce(title, '') || ' ' || content || ' ' || author) gin_trgm_ops
          )
      `;
    } catch {
      // 인덱스는 선택 사항이다.
    }
  })().catch((err) => {
    // 실패 시 다음 요청에서 다시 시도할 수 있도록 캐시를 비운다.
    schemaPromise = null;
    throw err;
  });

  return schemaPromise;
}
