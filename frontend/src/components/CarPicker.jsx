import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import Modal from "./Modal";

export default function CarPicker({ onClose }) {
  const { site, myCar, setMyCar, toast } = useStore();
  const [text, setText] = useState(myCar);
  const nav = useNavigate();
  const cars = site?.cars || [];
  const filtered = cars.filter((c) => c.name.toLowerCase().includes(text.trim().toLowerCase()));

  const choose = (name) => {
    setMyCar(name);
    onClose();
    if (name) {
      toast(`${name} saýlandy`);
      nav(`/katalog?car=${encodeURIComponent(name)}`);
    }
  };

  return (
    <Modal title="Maşynyňyzy saýlaň" onClose={onClose} narrow>
      <p className="muted">Saýlan maşynyňyza laýyk zapçastlar kartoçkalarda bellener we katalogda bir basyşda süzüler.</p>
      <input
        className="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Mysal: Toyota Camry"
        autoFocus
        aria-label="Maşynyň ady"
      />
      <ul className="carlist">
        {filtered.map((c) => (
          <li key={c.name}>
            <button type="button" className={c.name === myCar ? "is-on" : ""} onClick={() => choose(c.name)}>
              <span>{c.name}</span><small>{c.n} zapçast</small>
            </button>
          </li>
        ))}
        {filtered.length === 0 && <li className="muted carlist__none">Bu maşyn üçin entek zapçast ýok. Telefon arkaly soraň.</li>}
      </ul>
      {myCar && (
        <button type="button" className="btn btn--ghost btn--block" onClick={() => choose("")}>Saýlawy aýyr</button>
      )}
    </Modal>
  );
}
