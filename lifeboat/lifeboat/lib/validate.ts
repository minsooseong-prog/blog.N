export const LIMITS = {
  author: { min: 1, max: 20 },
  title: { min: 0, max: 80 },
  content: { min: 1, max: 5000 },
  password: { min: 4, max: 20 },
  query: { max: 60 },
} as const;

export type PostInput = {
  author: string;
  title: string;
  content: string;
  password: string;
};

export type ValidationResult =
  | { ok: true; value: PostInput }
  | { ok: false; field: keyof PostInput; message: string };

/** 제어문자 제거 + 앞뒤 공백 정리 + 과도한 빈 줄 축약 */
function clean(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

export function validatePost(raw: Record<string, unknown>): ValidationResult {
  const author = clean(raw.author);
  const title = clean(raw.title);
  const content = clean(raw.content);
  const password = typeof raw.password === 'string' ? raw.password.trim() : '';

  if (author.length < LIMITS.author.min) {
    return { ok: false, field: 'author', message: '작성자 이름을 입력하세요.' };
  }
  if (author.length > LIMITS.author.max) {
    return { ok: false, field: 'author', message: `작성자 이름은 ${LIMITS.author.max}자까지 쓸 수 있어요.` };
  }
  if (title.length > LIMITS.title.max) {
    return { ok: false, field: 'title', message: `제목은 ${LIMITS.title.max}자까지 쓸 수 있어요.` };
  }
  if (content.length < LIMITS.content.min) {
    return { ok: false, field: 'content', message: '내용을 입력하세요.' };
  }
  if (content.length > LIMITS.content.max) {
    return { ok: false, field: 'content', message: `내용은 ${LIMITS.content.max}자까지 쓸 수 있어요.` };
  }
  if (password && (password.length < LIMITS.password.min || password.length > LIMITS.password.max)) {
    return {
      ok: false,
      field: 'password',
      message: `삭제 비밀번호는 ${LIMITS.password.min}~${LIMITS.password.max}자로 정해주세요.`,
    };
  }

  return { ok: true, value: { author, title, content, password } };
}

export function normalizeQuery(raw: string | undefined | null): string {
  if (!raw) return '';
  return clean(raw).replace(/\s+/g, ' ').slice(0, LIMITS.query.max);
}

export function parsePage(raw: string | undefined | null): number {
  const n = Number.parseInt(String(raw ?? '1'), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 10_000);
}
