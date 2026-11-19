import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useStore } from "../store";
import { money } from "../format";
import Rail from "../components/Rail";
import { Price } from "../components/ProductCard";
import { QtyStepper } from "../components/CartDrawer";
import { Car, Heart, Phone, Share, Shield, Truck } from "../components/Icons";
import NotFound from "./NotFound";

function Gallery({ images, name }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(null);
  useEffect(() => setI(0), [images]);
  const src = images[i];

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="gallery">
      {images.length > 1 && (
        <div className="gallery__thumbs" role="tablist" aria-label="Suratlar">
          {images.map((s, k) => (
            <button key={k} type="button" role="tab" aria-selected={k === i} className={k === i ? "is-on" : ""} onClick={() => setI(k)} onMouseEnter={() => setI(k)}>
              <img src={s} alt="" />
            </button>
          ))}
        </div>
      )}
      <div
        className={`gallery__main ${zoom ? "is-zoom" : ""}`}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
        style={zoom ? { backgroundImage: `url(${src})`, backgroundPosition: zoom } : undefined}
      >
        <img src={src} alt={name} />
        {images.length > 1 && <span className="gallery__count">{i + 1} / {images.length}</span>}
      </div>
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const nav = useNavigate();
  const { site, addToCart, isFav, toggleFav, pushRecent, recent, myCar, toast } = useStore();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("desc");

  useEffect(() => {
    let live = true;
    setData(null); setErr(null); setQty(1);
    api.part(id).then((d) => { if (!live) return; setData(d); pushRecent(d.part); })
      .catch((e) => live && setErr(e.message));
    return () => { live = false; };
  }, [id, pushRecent]);

  useEffect(() => {
    if (data && site) document.title = `${data.part.name} — ${site.site_name}`;
  }, [data, site]);

  if (err === "notfound") return <NotFound text="Bu haryt tapylmady ýa-da pozuldy." />;
  if (err) return <div className="wrap emptybox"><p className="emptybox__t">Haryt ýüklenmedi</p><p className="muted">{err}. Sahypany täzeläň.</p></div>;
  if (!data) return <div className="wrap pdp pdp--skel" aria-busy="true"><div className="skelbox" /><div><span className="skel" /><span className="skel skel--md" /><span className="skel skel--sm" /></div></div>;

  const p = data.part;
  const fav = isFav(p.id);
  const fits = myCar && p.car && p.car.toLowerCase() === myCar.toLowerCase();
  const others = recent.filter((r) => r.id !== p.id);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: p.name, url });
      else { await navigator.clipboard.writeText(url); toast("Salgy göçürildi"); }
    } catch { /* ulanyjy ýatyrdy */ }
  };
  const buyNow = () => { addToCart(p, qty, { silent: true }); nav("/sebet"); };

  return (
    <>
      <div className="wrap">
        <nav className="crumbs" aria-label="Ýol">
          <Link to="/">Esasy sahypa</Link>
          {p.category && (<><span aria-hidden="true">/</span><Link to={`/katalog?cat=${p.category.id}`}>{p.category.name}</Link></>)}
          <span aria-hidden="true">/</span><span className="crumbs__now">{p.name}</span>
        </nav>

        <div className="pdp">
          <Gallery images={p.images} name={p.name} />

          <div className="pdp__info">
            <div className="pdp__tags">
              {p.discount ? <span className="flag flag--sale">−{p.discount}%</span> : null}
              {p.is_new && <span className="flag flag--new">Täze</span>}
              {p.category && <Link to={`/katalog?cat=${p.category.id}`} className="pdp__cat">{p.category.name}</Link>}
            </div>
            <h1 className="pdp__name">{p.name}</h1>

            {p.car && (
              <p className={`fit ${fits ? "fit--yes" : ""}`}>
                <Car size={20} />
                {fits ? <span>Siziň <b>{myCar}</b> maşynyňyza laýyk</span> : <span>Laýyk maşyn: <b>{p.car}</b></span>}
              </p>
            )}

            <div className="pdp__pricebox">
              <Price p={p} size="xl" />
              {p.old_price ? <span className="savetag">{money(p.old_price - p.price)} TMT tygşytlaň</span> : null}
            </div>

            <p className={`stock ${p.in_stock ? "" : "stock--out"}`}>{p.in_stock ? "Ammarda bar" : "Häzirlikçe gutardy — jaň edip soraň"}</p>

            <div className="pdp__buy">
              <QtyStepper value={qty} onChange={(v) => setQty(Math.max(1, v))} />
              <button type="button" className="btn btn--hot btn--lg" disabled={!p.in_stock} onClick={() => addToCart(p, qty)}>Sebede goş</button>
              <button type="button" className="btn btn--lg" disabled={!p.in_stock} onClick={buyNow}>Häzir satyn al</button>
            </div>
            <div className="pdp__minor">
              <button type="button" className={`textbtn ${fav ? "is-on" : ""}`} onClick={() => toggleFav(p)} aria-pressed={fav}>
                <Heart size={20} filled={fav} /> {fav ? "Halanlarymda" : "Halanlaryma goş"}
              </button>
              <button type="button" className="textbtn" onClick={share}><Share size={20} /> Paýlaş</button>
            </div>

            <ul className="pdp__service">
              <li><Truck /><span><b>Eltip bermek ýa-da dükandan almak</b>Sargyt formunda saýlaň</span></li>
              <li><Shield /><span><b>Tölegi haryt alanyňyzda</b>Nagt ýa-da kart bilen</span></li>
              {site?.phone && (
                <li><Phone /><span><b>Laýyklygyny soraň</b><a href={`tel:${site.tel}`}>{site.phone}</a></span></li>
              )}
            </ul>
          </div>
        </div>

        <section className="ptabs">
          <div className="ptabs__bar" role="tablist">
            <button type="button" role="tab" aria-selected={tab === "desc"} className={tab === "desc" ? "is-on" : ""} onClick={() => setTab("desc")}>Düşündiriş</button>
            <button type="button" role="tab" aria-selected={tab === "spec"} className={tab === "spec" ? "is-on" : ""} onClick={() => setTab("spec")}>Maglumatlar</button>
          </div>
          <div className="ptabs__body" role="tabpanel">
            {tab === "desc" ? (
              p.description ? <p className="prose">{p.description}</p> : <p className="muted">Düşündiriş goşulmady. Soragyňyz bolsa jaň ediň.</p>
            ) : (
              <dl className="specs">
                {p.category && (<><dt>Kategoriýa</dt><dd>{p.category.name}</dd></>)}
                {p.car && (<><dt>Maşyn</dt><dd>{p.car}</dd></>)}
                <dt>Haryt belgisi</dt><dd>#{p.id}</dd>
                <dt>Ýagdaýy</dt><dd>{p.in_stock ? "Ammarda bar" : "Gutardy"}</dd>
                <dt>Goşulan senesi</dt><dd>{new Date(p.created_at).toLocaleDateString("ru-RU")}</dd>
              </dl>
            )}
          </div>
        </section>

        {data.related.length > 0 && (
          <section className="sec">
            <div className="sec__head"><h2>Meňzeş harytlar</h2></div>
            <Rail items={data.related} />
          </section>
        )}
        {others.length > 0 && (
          <section className="sec">
            <div className="sec__head"><h2>Soňky seredenleriňiz</h2></div>
            <Rail items={others} />
          </section>
        )}
      </div>

      <div className="buybar">
        <Price p={p} />
        <button type="button" className="btn btn--hot" disabled={!p.in_stock} onClick={() => addToCart(p, qty)}>Sebede goş</button>
      </div>
    </>
  );
}
