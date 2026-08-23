'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIMITS } from '@/lib/validate';

export default function DeletePostButton({ postId }: { postId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    inputRef.current?.focus();

    // 열려 있는 동안 배경 스크롤을 잠근다.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !panel) return;

      // 포커스가 대화상자 밖으로 새어 나가지 않도록 가둔다.
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setPassword('');
    setError(null);
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? '글을 지우지 못했습니다.');
    } catch {
      setError('네트워크가 불안정합니다. 다시 시도하세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="btn btn--danger" onClick={() => setOpen(true)}>
        글 지우기
      </button>

      {open ? (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="modal__panel" ref={panelRef}>
            <h2 className="modal__title" id="delete-title">
              이 글을 지울까요?
            </h2>
            <p className="modal__desc">지운 글은 되돌릴 수 없어요. 작성할 때 정한 비밀번호를 입력하세요.</p>

            <input
              ref={inputRef}
              className="input"
              type="password"
              value={password}
              maxLength={LIMITS.password.max}
              placeholder="삭제 비밀번호"
              aria-label="삭제 비밀번호"
              autoComplete="current-password"
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && password) void remove();
              }}
            />

            {error ? (
              <p className="field__help" role="alert" style={{ color: 'var(--heart-ink)', marginTop: '0.5rem' }}>
                {error}
              </p>
            ) : null}

            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={close}>
                그대로 두기
              </button>
              <button type="button" className="btn btn--danger" onClick={() => void remove()} disabled={!password || busy}>
                {busy ? '지우는 중…' : '지우기'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
