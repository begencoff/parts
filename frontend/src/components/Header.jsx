import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useStore } from "../store";
import { money } from "../format";
import CarPicker from "./CarPicker";
import { Car, Cart, Clock, Close, Heart, Mail, Phone, Pin, Search } from "./Icons";

function SearchBox() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const loc = useLocation();
  const { searches, pushSearch, clearSearches } = useStore();
  const [q, setQ] = useState(params.get("q") || "");
  const [open, setOpen] = useState(false);
  const [sug, setSug] = useState({ parts: [], categories: [] });
  const [hi, setHi] = useState(-1);
  const box = useRef(null);

  useEffect(() => {
    if (loc.pathname === "/katalog") setQ(params.get("q") || "");
  }, [loc.pathname, params]);

  useEffect(() => {
    const t = q.trim();
    if (!t) return setSug({ parts: [], categories: [] });
    const h = setTimeout(() => api.suggest(t).then(setSug).catch(() => {}), 180);
    return () => clearTimeout(h);
  }, [q]);

  useEffect(() => {
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const submit = (text) => {
    const t = (text ?? q).trim();
    setOpen(false);
    pushSearch(t);
    nav(t ? `/katalog?q=${encodeURIComponent(t)}` : "/katalog");
  };

  const showRecent = !q.trim() && searches.length > 0;
  const options = showRecent ? searches.map((s) => ({ type: "q", s })) : [
    ...sug.categories.map((c) => ({ type: "cat", c })),
    ...sug.parts.map((p) => ({ type: "part", p })),
  ];
  const pick = (o) => {
    if (o.type === "q") return submit(o.s);
    setOpen(false);
    if (o.type === "cat") nav(`/katalog?cat=${o.c.id}`);
    if (o.type === "part") { pushSearch(q.trim()); nav(`/haryt/${o.p.id}`); }
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((h) => Math.min(options.length - 1, h + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(-1, h - 1)); }
    else if (e.key === "Escape") setOpen(false);
    else if (e.key === "Enter" && hi >= 0 && options[hi]) { e.preventDefault(); pick(options[hi]); }
  };

  return (
    <div className="search" ref={box}>
      <form className="search__form" role="search" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Search size={20} className="search__ic" />
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Zapçast, marka ýa-da maşyn ady"
          aria-label="Zapçasty gözle"
          aria-expanded={open && options.length > 0}
          aria-controls="search-pop"
          autoComplete="off"
        />
        {q && <button type="button" className="search__clear" onClick={() => setQ("")} aria-label="Arassala"><Close size={18} /></button>}
        <button type="submit" className="search__go">Gözle</button>
      </form>

      {open && options.length > 0 && (
        <div className="search__pop" id="search-pop" role="listbox">
          {showRecent && (
            <div className="search__head">
              <span>Soňky gözlegler</span>
              <button type="button" onClick={clearSearches}>Arassala</button>
            </div>
          )}
          {options.map((o, i) => (
            <button
              type="button"
              key={i}
              role="option"
              aria-selected={hi === i}
              className={`search__opt ${hi === i ? "is-hi" : ""}`}
              onMouseEnter={() => setHi(i)}
              onClick={() => pick(o)}
            >
              {o.type === "q" && (<><Clock size={18} /><span>{o.s}</span></>)}
              {o.type === "cat" && (<><Search size={18} /><span><b>{o.c.name}</b> kategoriýasy</span></>)}
              {o.type === "part" && (
                <>
                  <img src={o.p.image} alt="" />
                  <span className="search__pname">{o.p.name}{o.p.car && <small>{o.p.car}</small>}</span>
                  <b className="search__pprice">{money(o.p.price)} TMT</b>
                </>
              )}
            </button>
          ))}
          {!showRecent && (
            <button type="button" className="search__all" onClick={() => submit()}>
              “{q.trim()}” boýunça ähli netijeler
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { site, cartCount, favs, setCartOpen, myCar } = useStore();
  const [carOpen, setCarOpen] = useState(false);
  const [params] = useSearchParams();
  const loc = useLocation();
  const activeCat = loc.pathname === "/katalog" ? params.get("cat") : null;
  const name = site?.site_name || "AwtoŞaýlar";

  return (
    <>
      {site && (site.phone || site.address || site.email) && (
        <div className="topbar">
          <div className="wrap topbar__row">
            {site.address && <span className="topbar__item topbar__addr"><Pin size={16} />{site.address}</span>}
            <span className="topbar__right">
              {site.phone && <a className="topbar__item" href={`tel:${site.tel}`}><Phone size={16} />{site.phone}</a>}
              {site.email && <a className="topbar__item topbar__mail" href={`mailto:${site.email}`}><Mail size={16} />{site.email}</a>}
            </span>
          </div>
        </div>
      )}

      <header className="hdr">
        <div className="wrap hdr__row">
          <Link to="/" className="logo">{name}</Link>

          <button type="button" className={`carbtn ${myCar ? "is-set" : ""}`} onClick={() => setCarOpen(true)}>
            <Car size={24} />
            <span>
              <small>{myCar ? "Meniň maşynym" : "Maşynyňyzy saýlaň"}</small>
              <b>{myCar || "Laýyk zapçastlar"}</b>
            </span>
          </button>

          <SearchBox />

          <nav className="hdr__actions" aria-label="Hasap">
            <Link to="/halanlarym" className="hact">
              <span className="hact__ic"><Heart size={24} />{favs.length > 0 && <i className="count">{favs.length}</i>}</span>
              <span className="hact__lbl">Halanlarym</span>
            </Link>
            <button type="button" className="hact" onClick={() => setCartOpen(true)}>
              <span className="hact__ic"><Cart size={24} />{cartCount > 0 && <i className="count">{cartCount}</i>}</span>
              <span className="hact__lbl">Sebet</span>
            </button>
          </nav>
        </div>

        <nav className="catbar" aria-label="Kategoriýalar">
          <div className="wrap catbar__row">
            <NavLink to="/katalog" end className={() => (loc.pathname === "/katalog" && !activeCat && !params.get("sale") ? "is-active" : "")}>Ähli harytlar</NavLink>
            {site?.sale_count > 0 && (
              <NavLink to="/katalog?sale=1&sort=discount" className={() => `catbar__sale ${params.get("sale") ? "is-active" : ""}`}>Arzanladyş</NavLink>
            )}
            {site?.categories?.map((c) => (
              <NavLink key={c.id} to={`/katalog?cat=${c.id}`} className={() => (activeCat === String(c.id) ? "is-active" : "")}>{c.name}</NavLink>
            ))}
          </div>
        </nav>
      </header>

      {carOpen && <CarPicker onClose={() => setCarOpen(false)} />}
    </>
  );
}
