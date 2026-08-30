import { createHash, timingSafeEqual } from 'node:crypto';
import { ensureSchema, getSql } from './db';
import type { Post, PostListResult } from './types';
import { normalizeQuery } from './validate';

export const PAGE_SIZE = 10;

function hashPassword(password: string): string {
  const pepper = process.env.POST_SECRET_PEPPER ?? 'lifeboat';
  return createHash('sha256').update(`${pepper}:${password}`).digest('hex');
}

function verifyPassword(password: string, hash: string | null): boolean {
  if (!hash) return false;
  const a = Buffer.from(hashPassword(password));
  const b = Buffer.from(hash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** ILIKE 패턴에서 와일드카드로 오작동하는 문자를 escape 한다 */
function likePattern(q: string): string {
  const escaped = q.replace(/[\\%_]/g, (m) => `\\${m}`);
  return `%${escaped}%`;
}

export async function listPosts(rawQuery: string, page: number): Promise<PostListResult> {
  await ensureSchema();
  const sql = getSql();

  const query = normalizeQuery(rawQuery);
  const pageSize = PAGE_SIZE;

  // 먼저 전체 개수를 구해 페이지 범위를 확정한다.
  // (범위를 벗어난 page 로 들어와도 빈 화면 대신 마지막 페이지를 보여주기 위함)
  let total: number;
  const pattern = query ? likePattern(query) : '';

  if (query) {
    const rows = (await sql`
      SELECT count(*)::int AS total
        FROM posts
       WHERE (coalesce(title, '') || ' ' || content || ' ' || author) ILIKE ${pattern}
    `) as Record<string, unknown>[];
    total = Number(rows[0]?.total ?? 0);
  } else {
    const rows = (await sql`SELECT count(*)::int AS total FROM posts`) as Record<string, unknown>[];
    total = Number(rows[0]?.total ?? 0);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * pageSize;

  // 검색 조건을 하나의 식으로 묶어야 posts_search_idx (GIN trgm) 를 탈 수 있다.
  const rows = query
    ? ((await sql`
        SELECT id, author, title, content, created_at
          FROM posts
         WHERE (coalesce(title, '') || ' ' || content || ' ' || author) ILIKE ${pattern}
         ORDER BY created_at DESC, id DESC
         LIMIT ${pageSize} OFFSET ${offset}
      `) as Record<string, unknown>[])
    : ((await sql`
        SELECT id, author, title, content, created_at
          FROM posts
         ORDER BY created_at DESC, id DESC
         LIMIT ${pageSize} OFFSET ${offset}
      `) as Record<string, unknown>[]);

  return {
    posts: rows.map(toPost),
    total,
    page: safePage,
    pageSize,
    totalPages,
    query,
  };
}

export async function getPost(id: number): Promise<Post | null> {
  if (!Number.isInteger(id) || id < 1) return null;
  await ensureSchema();
  const sql = getSql();

  const rows = (await sql`
    SELECT id, author, title, content, created_at
      FROM posts
     WHERE id = ${id}
     LIMIT 1
  `) as Record<string, unknown>[];

  return rows.length ? toPost(rows[0]) : null;
}

/** 상세 페이지 하단의 "다른 글" 목록 */
export async function getNeighborPosts(id: number): Promise<{ prev: Post | null; next: Post | null }> {
  await ensureSchema();
  const sql = getSql();

  const [olderRows, newerRows] = await Promise.all([
    sql`SELECT id, author, title, content, created_at FROM posts WHERE id < ${id} ORDER BY id DESC LIMIT 1`,
    sql`SELECT id, author, title, content, created_at FROM posts WHERE id > ${id} ORDER BY id ASC LIMIT 1`,
  ]);

  const older = olderRows as Record<string, unknown>[];
  const newer = newerRows as Record<string, unknown>[];

  return {
    prev: older.length ? toPost(older[0]) : null,
    next: newer.length ? toPost(newer[0]) : null,
  };
}

export async function createPost(input: {
  author: string;
  title: string;
  content: string;
  password: string;
}): Promise<Post> {
  await ensureSchema();
  const sql = getSql();

  const title = input.title.length ? input.title : null;
  const pwHash = input.password ? hashPassword(input.password) : null;

  const rows = (await sql`
    INSERT INTO posts (author, title, content, pw_hash)
    VALUES (${input.author}, ${title}, ${input.content}, ${pwHash})
    RETURNING id, author, title, content, created_at
  `) as Record<string, unknown>[];

  return toPost(rows[0]);
}

export type DeleteResult = 'deleted' | 'not-found' | 'no-password-set' | 'wrong-password';

export async function deletePost(id: number, password: string): Promise<DeleteResult> {
  await ensureSchema();
  const sql = getSql();

  const rows = (await sql`SELECT pw_hash FROM posts WHERE id = ${id} LIMIT 1`) as Record<string, unknown>[];
  if (!rows.length) return 'not-found';

  const hash = (rows[0].pw_hash as string | null) ?? null;
  if (!hash) return 'no-password-set';
  if (!verifyPassword(password, hash)) return 'wrong-password';

  await sql`DELETE FROM posts WHERE id = ${id}`;
  return 'deleted';
}

function toPost(row: Record<string, unknown>): Post {
  const createdAt = row.created_at;
  return {
    id: Number(row.id),
    author: String(row.author ?? ''),
    title: row.title == null ? null : String(row.title),
    content: String(row.content ?? ''),
    created_at:
      createdAt instanceof Date
        ? createdAt.toISOString()
        : new Date(String(createdAt)).toISOString(),
  };
}
