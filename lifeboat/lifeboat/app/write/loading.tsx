export default function Loading() {
  return (
    <div className="shell" aria-busy="true">
      <div className="page-head">
        <div className="bar" style={{ width: '4rem', height: '0.7rem' }} />
        <div className="bar" style={{ width: '12rem', height: '1.6rem', marginTop: '0.7rem' }} />
      </div>
      <div style={{ marginTop: '1.75rem' }}>
        <div className="bar" style={{ width: '100%', height: '2.8rem' }} />
        <div className="bar" style={{ width: '100%', height: '2.8rem' }} />
        <div className="bar" style={{ width: '100%', height: '12rem' }} />
      </div>
    </div>
  );
}
