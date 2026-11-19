import { useEffect, useState } from "react";

// Günüň soňuna (Aşgabat wagty, UTC+5) çenli galan wagt
function msToMidnightAshgabat() {
  const now = Date.now();
  const ash = new Date(now + 5 * 3600 * 1000);
  const end = Date.UTC(ash.getUTCFullYear(), ash.getUTCMonth(), ash.getUTCDate() + 1) - 5 * 3600 * 1000;
  return end - now;
}

export default function Countdown() {
  const [ms, setMs] = useState(msToMidnightAshgabat);
  useEffect(() => {
    const t = setInterval(() => setMs(msToMidnightAshgabat()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.max(0, Math.floor(ms / 1000));
  const parts = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0"));
  return (
    <span className="countdown" role="timer" aria-label={`Gutarmagyna ${parts[0]} sagat ${parts[1]} minut galdy`}>
      {parts.map((p, i) => (
        <span key={i} className="countdown__cell">{p}</span>
      ))}
    </span>
  );
}
