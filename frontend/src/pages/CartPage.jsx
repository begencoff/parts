import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { money } from "../format";
import { useParts } from "../useParts";
import Rail from "../components/Rail";
import { QtyStepper } from "../components/CartDrawer";
import { Cart, Heart, Trash } from "../components/Icons";

export function Summary({ children }) {
  const { totals } = useStore();
  return (
    <aside className="summary">
      <h2>Sargydyňyz</h2>
      <div className="sumline"><span>Harytlar ({totals.count})</span><span>{money(totals.sum + totals.saved)} TMT</span></div>
      {totals.saved > 0 && <div className="sumline sumline--save"><span>Arzanladyş</span><span>−{money(totals.saved)} TMT</span></div>}
      <div className="sumline sumline--total"><span>Jemi</span><b>{money(totals.sum)} TMT</b></div>
      <p className="muted summary__note">Eltip bermegiň bahasyny operator jaň edende aýdar.</p>
      {children}
    </aside>
  );
}

export default function CartPage() {
  const { cart, setQty, removeFromCart, toggleSelect, selectAll, totals, toggleFav, isFav } = useStore();
  const nav = useNavigate();
  const all = cart.length > 0 && cart.every((x) => x.selected);
  const recs = useParts({ sort: "discount", size: 12 });
  const recItems = recs.items.filter((p) => !cart.some((c) => c.id === p.id));

  return (
    <div className="wrap page">
      <h1 className="page__title">Sebet <small>{cart.length}</small></h1>

      {cart.length === 0 ? (
        <div className="emptybox">
          <Cart size={44} />
          <p className="emptybox__t">Sebetiňiz boş</p>
          <p className="muted">Gerek zapçastlary tapyp, sebet düwmesine basyň.</p>
          <Link to="/katalog" className="btn">Katalogy aç</Link>
        </div>
      ) : (
        <div className="cartpage">
          <div className="cartpage__main">
            <div className="cartpage__bar">
              <label className="fcheck">
                <input type="checkbox" checked={all} onChange={(e) => selectAll(e.target.checked)} />
                <span>Hemmesini saýla</span>
              </label>
              {cart.some((x) => x.selected) && (
                <button type="button" className="textbtn" onClick={() => cart.filter((x) => x.selected).forEach((x) => removeFromCart(x.id))}>
                  <Trash size={18} /> Saýlananlary aýyr
                </button>
              )}
            </div>
            <ul className="clist">
              {cart.map((x) => (
                <li key={x.id} className={`crow ${x.selected ? "" : "is-off"}`}>
                  <input type="checkbox" checked={x.selected} onChange={() => toggleSelect(x.id)} aria-label={`${x.name} saýla`} />
                  <Link to={`/haryt/${x.id}`} className="crow__img"><img src={x.image} alt="" /></Link>
                  <div className="crow__info">
                    <Link to={`/haryt/${x.id}`} className="crow__name">{x.name}</Link>
                    {x.car && <span className="muted">{x.car}</span>}
                    {!x.in_stock && <span className="stock stock--out">Gutardy — operator bilen anyklaň</span>}
                    <div className="crow__acts">
                      <button type="button" className="textbtn" onClick={() => !isFav(x.id) && toggleFav(x)}><Heart size={18} filled={isFav(x.id)} /> Halanlaryma</button>
                      <button type="button" className="textbtn" onClick={() => removeFromCart(x.id)}><Trash size={18} /> Aýyr</button>
                    </div>
                  </div>
                  <QtyStepper value={x.qty} onChange={(v) => setQty(x.id, v)} />
                  <div className="crow__sum">
                    <b>{money(x.price * x.qty)} TMT</b>
                    {x.qty > 1 && <small className="muted">{money(x.price)} × {x.qty}</small>}
                    {x.old_price ? <s className="price__old">{money(x.old_price * x.qty)}</s> : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Summary>
            <button type="button" className="btn btn--hot btn--block btn--lg" disabled={!totals.count} onClick={() => nav("/sargyt")}>
              Sargydy tassykla
            </button>
            {!totals.count && <p className="muted">Sargyt üçin iň bolmanda bir harydy saýlaň.</p>}
          </Summary>
        </div>
      )}

      {recItems.length > 0 && (
        <section className="sec">
          <div className="sec__head"><h2>Muny hem goşup bilersiňiz</h2></div>
          <Rail items={recItems} />
        </section>
      )}
    </div>
  );
}
