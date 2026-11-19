import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store";
import Modal from "./Modal";
import { Price } from "./ProductCard";
import { QtyStepper } from "./CartDrawer";
import { Heart } from "./Icons";

export default function QuickView() {
  const { quick: p, setQuick, addToCart, isFav, toggleFav } = useStore();
  const [qty, setQty] = useState(1);
  if (!p) return null;
  const close = () => { setQuick(null); setQty(1); };
  return (
    <Modal title="Çalt görmek" onClose={close}>
      <div className="qv">
        <div className="qv__img"><img src={p.image} alt={p.name} /></div>
        <div className="qv__info">
          {p.car && <span className="pcard__car">{p.car}</span>}
          <h3 className="qv__name">{p.name}</h3>
          <Price p={p} size="lg" />
          {p.discount ? <span className="savetag">{p.discount}% arzan</span> : null}
          <p className={`stock ${p.in_stock ? "" : "stock--out"}`}>{p.in_stock ? "Ammarda bar" : "Häzirlikçe gutardy"}</p>
          <div className="qv__buy">
            <QtyStepper value={qty} onChange={(v) => setQty(Math.max(1, v))} />
            <button type="button" className="btn btn--hot" disabled={!p.in_stock} onClick={() => { addToCart(p, qty); close(); }}>Sebede goş</button>
            <button type="button" className={`iconbtn iconbtn--ring ${isFav(p.id) ? "is-on" : ""}`} onClick={() => toggleFav(p)} aria-label="Halanlaryma goş" aria-pressed={isFav(p.id)}>
              <Heart filled={isFav(p.id)} />
            </button>
          </div>
          <Link to={`/haryt/${p.id}`} className="link" onClick={close}>Doly maglumaty gör</Link>
        </div>
      </div>
    </Modal>
  );
}
