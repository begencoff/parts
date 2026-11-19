import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useStore } from "../store";
import { money } from "../format";
import { Summary } from "./CartPage";
import { Check, Truck } from "../components/Icons";

const saved = () => { try { return JSON.parse(localStorage.getItem("as_buyer") || "{}"); } catch { return {}; } };

export default function Checkout() {
  const { selected, totals, clearOrdered, site } = useStore();
  const [f, setF] = useState(() => ({ name: "", phone: "+993 ", address: "", note: "", delivery: "delivery", ...saved() }));
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setErrors({ ...errors, [k]: undefined }); };

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await api.order({ ...f, items: selected.map((x) => ({ id: x.id, qty: x.qty })) });
      try { localStorage.setItem("as_buyer", JSON.stringify({ name: f.name, phone: f.phone, address: f.address })); } catch { /* */ }
      setDone({ ...res, phone: f.phone });
      clearOrdered();
      window.scrollTo(0, 0);
    } catch (err) {
      setErrors(err.errors && Object.keys(err.errors).length ? err.errors : { form: "Sargyt iberilmedi. Internet baglanyşygyňyzy barlap, gaýtadan synanyşyň." });
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="wrap page">
        <div className="done">
          <span className="done__ic"><Check size={40} /></span>
          <h1>Sargyt #{done.id} kabul edildi</h1>
          <p>Jemi <b>{money(done.total)} TMT</b>. Operator ýakyn wagtda <b>{done.phone}</b> belgä jaň edip, sargydy tassyklar.</p>
          {site?.phone && <p className="muted">Soragyňyz bolsa: <a className="link" href={`tel:${site.tel}`}>{site.phone}</a></p>}
          <Link to="/" className="btn">Söwdany dowam et</Link>
        </div>
      </div>
    );
  }

  if (!selected.length) {
    return (
      <div className="wrap page">
        <div className="emptybox">
          <p className="emptybox__t">Sargyt üçin haryt saýlanmady</p>
          <Link to="/sebet" className="btn">Sebede geç</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap page">
      <h1 className="page__title">Sargyt etmek</h1>
      <div className="cartpage">
        <form className="checkout" onSubmit={submit} noValidate id="checkout">
          <section className="cbox">
            <h2>Habarlaşmak üçin</h2>
            <div className="frow">
              <label className="field">
                <span>Adyňyz</span>
                <input className="input" value={f.name} onChange={set("name")} autoComplete="name" required aria-invalid={!!errors.name} />
                {errors.name && <em className="ferr">{errors.name}</em>}
              </label>
              <label className="field">
                <span>Telefon belgiňiz</span>
                <input className="input" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" required aria-invalid={!!errors.phone} />
                {errors.phone && <em className="ferr">{errors.phone}</em>}
              </label>
            </div>
          </section>

          <section className="cbox">
            <h2>Harydy nädip alarsyňyz?</h2>
            <div className="radios">
              <label className={`rcard ${f.delivery === "delivery" ? "is-on" : ""}`}>
                <input type="radio" name="delivery" value="delivery" checked={f.delivery === "delivery"} onChange={set("delivery")} />
                <Truck /><span><b>Eltip bermek</b>Salgyňyza getireris</span>
              </label>
              <label className={`rcard ${f.delivery === "pickup" ? "is-on" : ""}`}>
                <input type="radio" name="delivery" value="pickup" checked={f.delivery === "pickup"} onChange={set("delivery")} />
                <span className="rcard__pin" aria-hidden="true" /><span><b>Dükandan almak</b>{site?.address || "Dükanymyzdan özüňiz alyň"}</span>
              </label>
            </div>
            {f.delivery === "delivery" && (
              <label className="field">
                <span>Salgy</span>
                <input className="input" value={f.address} onChange={set("address")} autoComplete="street-address" placeholder="Şäher, köçe, jaý, öý" aria-invalid={!!errors.address} />
                {errors.address && <em className="ferr">{errors.address}</em>}
              </label>
            )}
            <label className="field">
              <span>Bellik (hökman däl)</span>
              <textarea className="input" rows="3" value={f.note} onChange={set("note")} placeholder="Mysal: maşynyň ýyly, VIN belgisi ýa-da jaň etmeli wagt" />
            </label>
          </section>

          <section className="cbox">
            <h2>Töleg</h2>
            <p className="muted">Tölegi haryt alanyňyzda nagt ýa-da kart bilen edýärsiňiz. Öňünden töleg gerek däl.</p>
          </section>

          {(errors.form || errors.items) && <p className="ferr ferr--box">{errors.form || errors.items}</p>}
        </form>

        <Summary>
          <ul className="minilist">
            {selected.map((x) => (
              <li key={x.id}><img src={x.image} alt="" /><span>{x.name}<small>{x.qty} × {money(x.price)} TMT</small></span></li>
            ))}
          </ul>
          <button type="submit" form="checkout" className="btn btn--hot btn--block btn--lg" disabled={sending}>
            {sending ? "Iberilýär…" : `Sargyt et — ${money(totals.sum)} TMT`}
          </button>
        </Summary>
      </div>
    </div>
  );
}
