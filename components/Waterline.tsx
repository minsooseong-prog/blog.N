/** 히어로 아래 한 줄짜리 물결 — 페이지에 단 한 번만 등장하는 장식 */
export default function Waterline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 420 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 8c14 0 14-4 28-4s14 4 28 4 14-4 28-4 14 4 28 4 14-4 28-4 14 4 28 4 14-4 28-4 14 4 28 4 14-4 28-4 14 4 28 4 14-4 28-4 14 4 28 4 14-4 28-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
