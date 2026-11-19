// Asyl sahypadaky tormoz diski (brendiň belgisi)
const holes = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  return [200 + 120 * Math.sin(a), 200 - 120 * Math.cos(a)];
});
const bolts = Array.from({ length: 5 }, (_, i) => {
  const a = (i / 5) * Math.PI * 2;
  return [200 + 40 * Math.sin(a), 200 - 40 * Math.cos(a)];
});

export default function Disc({ className = "" }) {
  return (
    <svg className={`disc ${className}`} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <g className="disc__rotor">
        <circle cx="200" cy="200" r="190" className="d-face" />
        <circle cx="200" cy="200" r="190" className="d-edge" />
        <circle cx="200" cy="200" r="150" className="d-ring" />
        <circle cx="200" cy="200" r="78" className="d-hub" />
        <g className="d-holes">{holes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" />)}</g>
        <g className="d-bolts">{bolts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" />)}</g>
        <circle cx="200" cy="200" r="20" className="d-center" />
      </g>
      <path className="caliper" d="M340.9 101.3 A172 172 0 0 1 340.9 298.7" />
    </svg>
  );
}
