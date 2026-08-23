export default function Loading() {
  return (
    <div className="shell" aria-busy="true" aria-live="polite">
      <div className="list-head">
        <span className="list-head__label">불러오는 중</span>
      </div>
      <ul className="post-list">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="skeleton-row">
            <div className="bar" style={{ width: '58%', height: '1rem' }} />
            <div className="bar" style={{ width: '92%' }} />
            <div className="bar" style={{ width: '34%' }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
