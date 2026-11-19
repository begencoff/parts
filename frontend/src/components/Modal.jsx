import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Close } from "./Icons";

export default function Modal({ title, onClose, children, narrow, side }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div className={`overlay ${side ? "overlay--side" : ""}`} onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${narrow ? "modal--narrow" : ""} ${side ? "modal--side" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__head">
          <h2>{title}</h2>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Ýap"><Close /></button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
