import { useStore } from "../store";
import { Check } from "./Icons";

export default function Toasts() {
  const { toasts, setCartOpen } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <Check size={18} />
          <span>{t.text}</span>
          {t.action?.open === "cart" && (
            <button type="button" onClick={() => setCartOpen(true)}>{t.action.label}</button>
          )}
        </div>
      ))}
    </div>
  );
}
