'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LIMITS } from '@/lib/validate';

type Fields = { author: string; title: string; content: string; password: string };

const DRAFT_KEY = 'lifeboat:draft';

export default function WriteForm({ initialTitle = '' }: { initialTitle?: string }) {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>({ author: '', title: initialTitle, content: '', password: '' });
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const restored = useRef(false);

  // 작성 중 내용을 브라우저에 임시 보관했다가 되돌려 준다.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<Fields>;
        setFields((prev) => ({
          ...prev,
          ...draft,
          title: initialTitle || draft.title || '',
          password: '',
        }));
      }
    } catch {
      /* 저장소를 못 쓰는 환경이면 그냥 무시한다 */
    }
    restored.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    try {
      const { author, title, content } = fields;
      if (author || title || content) {
        window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ author, title, content }));
      } else {
        window.sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      /* noop */
    }
  }, [fields]);

  const set = (key: keyof Fields) => (value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const submit = async () => {
    if (submitting) return;
    if (honeypot.current?.value) return; // 봇 차단

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });

      const data = (await res.json()) as { post?: { id: number }; error?: string; field?: string };

      if (!res.ok || !data.post) {
        setError({ field: data.field, message: data.error ?? '글을 올리지 못했습니다. 잠시 후 다시 시도하세요.' });
        setSubmitting(false);
        return;
      }

      try {
        window.sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* noop */
      }

      router.push(`/posts/${data.post.id}`);
      router.refresh();
    } catch {
      setError({ message: '네트워크가 불안정합니다. 연결을 확인한 뒤 다시 시도하세요.' });
      setSubmitting(false);
    }
  };

  const overLimit =
    fields.author.length > LIMITS.author.max ||
    fields.title.length > LIMITS.title.max ||
    fields.content.length > LIMITS.content.max;

  const canSubmit = fields.author.trim().length > 0 && fields.content.trim().length > 0 && !overLimit;

  return (
    <div className="form">
      {error ? (
        <div className="alert" role="alert">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ marginTop: 3 }}>
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10 6v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="10" cy="13.8" r="1" fill="currentColor" />
          </svg>
          <span>{error.message}</span>
        </div>
      ) : null}

      <div className="form__row">
        <Field
          id="author"
          label="작성자"
          value={fields.author}
          onChange={set('author')}
          max={LIMITS.author.max}
          invalid={error?.field === 'author'}
          placeholder="이름 또는 별명"
          autoComplete="nickname"
        />
        <Field
          id="password"
          label="삭제 비밀번호"
          optional
          type="password"
          value={fields.password}
          onChange={set('password')}
          max={LIMITS.password.max}
          invalid={error?.field === 'password'}
          placeholder="4자 이상"
          help="정해두면 나중에 이 글을 지울 수 있어요."
          autoComplete="new-password"
          hideCounter
        />
      </div>

      <Field
        id="title"
        label="제목"
        optional
        value={fields.title}
        onChange={set('title')}
        max={LIMITS.title.max}
        invalid={error?.field === 'title'}
        placeholder="비워두면 첫 문장이 제목이 됩니다"
      />

      <div className="field" data-invalid={error?.field === 'content'}>
        <div className="field__top">
          <label className="field__label" htmlFor="content">
            내용
          </label>
          <span className="field__counter" data-over={fields.content.length > LIMITS.content.max}>
            {fields.content.length.toLocaleString()} / {LIMITS.content.max.toLocaleString()}
          </span>
        </div>
        <textarea
          id="content"
          className="textarea"
          value={fields.content}
          placeholder="오늘 띄워 보내고 싶은 이야기를 적어보세요."
          onChange={(e) => set('content')(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
              e.preventDefault();
              void submit();
            }
          }}
        />
      </div>

      {/* 봇 트랩 — 사람 눈에는 보이지 않는다 */}
      <input ref={honeypot} className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="form__actions">
        <span className="spacer field__counter">⌘/Ctrl + Enter 로 올리기</span>
        <Link href="/" className="btn btn--ghost">
          취소
        </Link>
        <button type="button" className="btn btn--primary" onClick={() => void submit()} disabled={!canSubmit || submitting}>
          {submitting ? '올리는 중…' : '글 올리기'}
        </button>
      </div>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  optional?: boolean;
  type?: string;
  placeholder?: string;
  help?: string;
  invalid?: boolean;
  autoComplete?: string;
  hideCounter?: boolean;
};

function Field({
  id,
  label,
  value,
  onChange,
  max,
  optional,
  type = 'text',
  placeholder,
  help,
  invalid,
  autoComplete,
  hideCounter,
}: FieldProps) {
  return (
    <div className="field" data-invalid={invalid}>
      <div className="field__top">
        <label className="field__label" htmlFor={id}>
          {label}
          {optional ? <span className="field__optional">선택</span> : null}
        </label>
        {hideCounter ? null : (
          <span className="field__counter" data-over={value.length > max}>
            {value.length} / {max}
          </span>
        )}
      </div>
      <input
        id={id}
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
      {help ? <p className="field__help">{help}</p> : null}
    </div>
  );
}
