export default function Loading() {
  return (
    <div className="shell article" aria-busy="true">
      <div className="bar" style={{ width: '70%', height: '1.9rem' }} />
      <div className="bar" style={{ width: '40%', marginTop: '1rem' }} />
      <div style={{ marginTop: '2.25rem' }}>
        {['96%', '92%', '88%', '60%'].map((w) => (
          <div className="bar" key={w} style={{ width: w, height: '0.9rem' }} />
        ))}
      </div>
    </div>
  );
}
