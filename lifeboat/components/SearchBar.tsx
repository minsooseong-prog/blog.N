'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LIMITS } from '@/lib/validate';

/**
 * 입력을 멈추면 400ms 뒤 자동으로 검색한다(주소는 replace 하여 히스토리를 더럽히지 않음).
 * Enter 로 즉시 검색, Esc 로 초기화, "/" 로 어디서든 포커스.
 */
export default function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSubmitted = useRef(initialQuery);

  // 뒤로가기 등으로 URL이 바뀌면 입력창도 맞춰준다.
  useEffect(() => {
    setValue(initialQuery);
    lastSubmitted.current = initialQuery;
  }, [initialQuery]);

  const run = (next: string) => {
    const trimmed = next.trim().slice(0, LIMITS.query.max);
    if (trimmed === lastSubmitted.current) return;
    lastSubmitted.current = trimmed;
    startTransition(() => {
      router.replace(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : '/', { scroll: false });
    });
  };

  // 디바운스
  useEffect(() => {
    const timer = window.setTimeout(() => run(value), 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // "/" 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const tag = el?.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (el as HTMLElement | null)?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="search" data-pending={isPending}>
      <div className="search__field">
        <svg
          className="search__icon"
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="8.75" cy="8.75" r="5.75" stroke="currentColor" strokeWidth="1.8" />
          <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>

        <input
          ref={inputRef}
          className="search__input"
          type="search"
          inputMode="search"
          autoComplete="off"
          maxLength={LIMITS.query.max}
          placeholder="글, 작성자 이름으로 찾기"
          aria-label="글 검색"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              run(value);
            }
            if (e.key === 'Escape') {
              setValue('');
              run('');
            }
          }}
        />

        {value ? (
          <button
            type="button"
            className="search__clear"
            aria-label="검색어 지우기"
            onClick={() => {
              setValue('');
              run('');
              inputRef.current?.focus();
            }}
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5.5 5.5l9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}

        <button type="button" className="search__go" onClick={() => run(value)}>
          검색
        </button>
      </div>

      <p className="search__hint" aria-live="polite">
        {isPending ? '찾는 중…' : value ? `“${value.trim()}” 으로 검색` : '/ 키를 누르면 바로 검색창으로'}
      </p>
    </div>
  );
}
