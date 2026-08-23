type LogoProps = {
  size?: number;
  className?: string;
  /** true면 장식용으로 취급하여 스크린리더에서 숨긴다 */
  decorative?: boolean;
};

/**
 * lifeboat 시그니처 마크 — 하얀 종이배 위에 얹힌 하트.
 * 배는 흰 면 + 잉크 외곽선, 하트만 유일한 채색 요소다.
 */
export default function Logo({ size = 28, className, decorative = false }: LogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'lifeboat 로고 — 하트를 실은 종이배'}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      {/* 돛 (접힌 종이) */}
      <path
        d="M24 4.5 39.5 25.5H8.5L24 4.5Z"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      {/* 종이 접힌 자국 */}
      <path d="M24 6.5v19" stroke="currentColor" strokeWidth="1.3" opacity="0.28" strokeLinecap="round" />

      {/* 선체 */}
      <path
        d="M6 27.5h36l-4.9 9.1a4 4 0 0 1-3.5 2.1H14.4a4 4 0 0 1-3.5-2.1L6 27.5Z"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path d="M24 29.5v9.2" stroke="currentColor" strokeWidth="1.3" opacity="0.28" strokeLinecap="round" />

      {/* 하트 — 돛 위에 실린 마음 */}
      <path
        d="M24 22.4c-.5 0-5.6-3.1-5.6-6.5a3 3 0 0 1 5.6-1.5 3 3 0 0 1 5.6 1.5c0 3.4-5.1 6.5-5.6 6.5Z"
        fill="var(--heart, #ff4d6d)"
      />
    </svg>
  );
}
