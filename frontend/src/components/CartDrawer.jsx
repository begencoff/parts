import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { money } from "../format";
import Modal from "./Modal";
import { Cart, Minus, Plus, Trash } from "./Icons";

export function QtyStepper({ value, onChange, small }) {
  return (
    <span className={`qty ${small ? "qty--sm" : ""}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Azalt"><Minus size={16} /></button>
      <input
        type="number"
        min="1"
        max="999"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 1)}
        aria-label="Sany"
      />
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Köpelt"><Plus size={16} /></button>
    </span>
  );
}

export default function CartDrawer() {
  const { cart, setQty, removeFromCart, totals, setCartOpen } = useStore();
  const nav = useNavigate();
  const close = () => setCartOpen(false);

  return (
    <Modal title={`Sebet (${cart.length})`} onClose={close} side>
      {cart.length === 0 ? (
        <div className="emptybox">
          <Cart size={44} />
          <p className="emptybox__t">Sebetiňiz boş</p>
          <p className="muted">Gerek zapçastlary tapyp, sebet düwmesine basyň.</p>
          <Link to="/katalog" className="btn" onClick={close}>Katalogy aç</Link>
        </div>
      ) : (
        <div className="drawer">
          <ul className="drawer__list">
            {cart.map((x) => (
              <li key={x.id} className="citem">
                <Link to={`/haryt/${x.id}`} onClick={close} className="citem__img"><img src={x.image} alt="" /></Link>
                <div className="citem__main">
                  <Link to={`/haryt/${x.id}`} onClick={close} className="citem__name">{x.name}</Link>
                  <b className="citem__price">{money(x.price * x.qty)} TMT</b>
                  <div className="citem__row">
                    <QtyStepper small value={x.qty} onChange={(v) => setQty(x.id, v)} />
                    <button type="button" className="iconbtn" onClick={() => removeFromCart(x.id)} aria-label="Sebetden aýyr"><Trash size={19} /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="drawer__foot">
            <div className="sumline"><span>Saýlanan harytlar ({totals.count})</span><b>{money(totals.sum)} TMT</b></div>
            {totals.saved > 0 && <div className="sumline sumline--save"><span>Tygşytlaýarsyňyz</span><b>{money(totals.saved)} TMT</b></div>}
            <button type="button" className="btn btn--block btn--hot" disabled={!totals.count} onClick={() => { close(); nav("/sargyt"); }}>
              Sargyt etmek
            </button>
            <Link to="/sebet" className="btn btn--ghost btn--block" onClick={close}>Sebede geç</Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
