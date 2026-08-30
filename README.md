# lifeboat

하얀 종이배에 하트를 실어 띄우는, 아주 단순한 게시판.
Next.js(App Router) + Neon Postgres + Vercel 조합으로 동작합니다.

- 이름과 이야기를 적어 글을 올리면 데이터베이스에 저장되고
- 누구나 목록에서 읽고, 검색으로 다시 찾을 수 있습니다.

---

## 0. 시작 전에 — 자격증명 관리

`DATABASE_URL` 은 **절대 코드에 넣지 않습니다.** 이 저장소에는 `.env.example` 만 들어 있고,
`.gitignore` 가 `.env*` 를 모두 제외합니다.

연결 문자열이 한 번이라도 외부에 노출됐다면
Neon 콘솔 → **Roles → `neondb_owner` → Reset password** 로 즉시 재발급하세요.

## 1. 로컬에서 실행

```bash
npm install
cp .env.example .env.local     # DATABASE_URL 실제 값 입력
npm run db:init                # (선택) 테이블 미리 생성
npm run dev                    # http://localhost:3000
```

테이블은 첫 요청 때 자동으로 만들어지므로 `db:init` 을 건너뛰어도 됩니다.

## 2. GitHub에 올리기

```bash
git init
git add .
git commit -m "feat: lifeboat 게시판"
git branch -M main
git remote add origin https://github.com/<사용자명>/lifeboat.git
git push -u origin main
```

> `git status` 로 `.env.local` 이 목록에 없는지 꼭 확인하세요.

## 3. Vercel 배포

1. Vercel → **Add New → Project** → 방금 올린 저장소 선택
2. Framework Preset 은 자동으로 **Next.js** 로 잡힙니다. 그대로 두세요.
3. **Environment Variables** 에 아래 값을 추가합니다.

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon 의 **pooler** 주소 (`...-pooler...`) |
   | `POST_SECRET_PEPPER` | 아무 랜덤 문자열 |

   Vercel의 Neon 인테그레이션을 이미 붙였다면 `DATABASE_URL` 은 자동 주입되므로 생략 가능합니다.
4. **Deploy** → 배포가 끝나면 `https://<프로젝트>.vercel.app/api/health` 로 DB 연결을 확인하세요.
   `{"ok":true,"posts":0}` 이 나오면 정상입니다.

## 4. 구조

```
app/
  layout.tsx              공통 껍데기(헤더/푸터/스킵링크)
  page.tsx                목록 + 검색 (서버 컴포넌트)
  write/page.tsx          글 쓰기
  posts/[id]/page.tsx     글 상세
  api/posts/route.ts      GET 목록·검색 / POST 작성
  api/posts/[id]/route.ts GET 단건 / DELETE 삭제
  api/health/route.ts     DB 연결 점검
components/               Logo, SearchBar, WriteForm, Pagination …
lib/
  db.ts                   Neon 연결 + 스키마 자동 생성
  posts.ts                쿼리 모음
  validate.ts             입력 검증 규칙
  rate-limit.ts           과다 제출 방지
```

## 5. 데이터 모델

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `BIGSERIAL` | 글 번호 |
| `author` | `TEXT` | 작성자 (1–20자) |
| `title` | `TEXT` | 제목 (선택, 없으면 첫 문장을 대신 표시) |
| `content` | `TEXT` | 내용 (1–5,000자) |
| `pw_hash` | `TEXT` | 삭제 비밀번호의 SHA-256 해시 (선택) |
| `created_at` | `TIMESTAMPTZ` | 작성 시각 |

검색은 `title`, `content`, `author` 를 `ILIKE` 로 훑고, `pg_trgm` GIN 인덱스로 가속합니다.

## 6. API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/api/posts?q=&page=` | 목록·검색 (10편 단위) |
| `POST` | `/api/posts` | `{ author, title?, content, password? }` |
| `GET` | `/api/posts/:id` | 단건 조회 |
| `DELETE` | `/api/posts/:id` | `{ password }` |
| `GET` | `/api/health` | 연결 상태 |

## 7. 알아둘 점

- 로그인이 없는 공개 게시판입니다. 개인정보를 적지 않도록 안내 문구를 넣어두었습니다.
- 글 삭제는 작성 시 비밀번호를 정한 경우에만 가능합니다.
- 관리자용 일괄 삭제가 필요하면 Neon 콘솔의 SQL Editor 에서 직접 지우세요.
