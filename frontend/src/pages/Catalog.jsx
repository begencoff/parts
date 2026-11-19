import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../store";
import { useInfiniteParts } from "../useParts";
import InfiniteGrid from "../components/InfiniteGrid";
import { Car, Close, Filter, Grid, List } from "../components/Icons";

const SORTS = [
  ["", "Täzeler öňde"],
  ["cheap", "Arzandan gymmada"],
  ["expensive", "Gymmatdan arzana"],
  ["discount", "Iň uly arzanladyş"],
];

const splitList = (v, sep) => (v ? v.split(sep).filter(Boolean) : []);

function Filters({ params, set, toggleIn, site, myCar }) {
  const cats = splitList(params.get("cat"), ",");
  const cars = splitList(params.get("car"), "|");
  const [min, setMin] = useState(params.get("min") || "");
  const [max, setMax] = useState(params.get("max") || "");
  const [carQ, setCarQ] = useState("");
  useEffect(() => { setMin(params.get("min") || ""); setMax(params.get("max") || ""); }, [params]);

  const carList = (site?.cars || []).filter((c) => c.name.toLowerCase().includes(carQ.toLowerCase()));

  return (
    <div className="filters">
      {myCar && (
        <label className="mycar-toggle">
          <input type="checkbox" checked={cars.length === 1 && cars[0] === myCar} onChange={(e) => set({ car: e.target.checked ? myCar : "" })} />
          <Car size={20} />
          <span>Diňe <b>{myCar}</b> üçin</span>
        </label>
      )}

      <fieldset className="fgroup">
        <legend>Kategoriýa</legend>
        {site?.categories?.map((c) => (
          <label key={c.id} className="fcheck">
            <input type="checkbox" checked={cats.includes(String(c.id))} onChange={() => toggleIn("cat", String(c.id), ",")} />
            <span>{c.name}</span><small>{c.n}</small>
          </label>
        ))}
      </fieldset>

      {site?.cars?.length > 0 && (
        <fieldset className="fgroup">
          <legend>Maşyn</legend>
          {site.cars.length > 8 && (
            <input className="input input--sm" placeholder="Maşyn gözle" value={carQ} onChange={(e) => setCarQ(e.target.value)} aria-label="Maşyn gözle" />
          )}
          <div className="fgroup__scroll">
            {carList.map((c) => (
              <label key={c.name} className="fcheck">
                <input type="checkbox" checked={cars.includes(c.name)} onChange={() => toggleIn("car", c.name, "|")} />
                <span>{c.name}</span><small>{c.n}</small>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="fgroup">
        <legend>Bahasy, TMT</legend>
        <form className="frange" onSubmit={(e) => { e.preventDefault(); set({ min, max }); }}>
          <input className="input input--sm" type="number" min="0" inputMode="numeric" placeholder={`${Math.floor(site?.price_range?.min || 0)}`} value={min} onChange={(e) => setMin(e.target.value)} aria-label="Iň az baha" />
          <span aria-hidden="true">–</span>
          <input className="input input--sm" type="number" min="0" inputMode="numeric" placeholder={`${Math.ceil(site?.price_range?.max || 0)}`} value={max} onChange={(e) => setMax(e.target.value)} aria-label="Iň köp baha" />
          <button type="submit" className="btn btn--sm">Ulan</button>
        </form>
      </fieldset>

      <fieldset className="fgroup">
        <legend>Başga</legend>
        <label className="fswitch"><input type="checkbox" checked={params.get("sale") === "1"} onChange={(e) => set({ sale: e.target.checked ? "1" : "" })} /><span>Diňe arzanladyşdakylar</span></label>
        <label className="fswitch"><input type="checkbox" checked={params.get("stock") === "1"} onChange={(e) => set({ stock: e.target.checked ? "1" : "" })} /><span>Diňe ammarda barlar</span></label>
        <label className="fswitch"><input type="checkbox" checked={params.get("new") === "1"} onChange={(e) => set({ new: e.target.checked ? "1" : "" })} /><span>Täze gelenler</span></label>
      </fieldset>
    </div>
  );
}

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const { site, myCar } = useStore();
  const [layout, setLayout] = useState(() => localStorage.getItem("as_layout") || "grid");
  const [drawer, setDrawer] = useState(false);

  useEffect(() => { try { localStorage.setItem("as_layout", layout); } catch { /* */ } }, [layout]);

  const set = (patch) => {
    const n = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    setParams(n);
  };
  const toggleIn = (key, val, sep) => {
    const list = splitList(params.get(key), sep);
    const next = list.includes(val) ? list.filter((x) => x !== val) : [...list, val];
    set({ [key]: next.join(sep) });
  };

  const query = useMemo(() => {
    const o = {};
    ["q", "cat", "car", "min", "max", "sale", "stock", "new", "sort"].forEach((k) => params.get(k) && (o[k] = params.get(k)));
    return o;
  }, [params]);
  const data = useInfiniteParts(query, 24);

  const catName = (id) => site?.categories?.find((c) => String(c.id) === id)?.name || "Kategoriýa";
  const cats = splitList(params.get("cat"), ",");
  const cars = splitList(params.get("car"), "|");

  const chips = [
    ...(params.get("q") ? [{ label: `“${params.get("q")}”`, off: () => set({ q: "" }) }] : []),
    ...cats.map((c) => ({ label: catName(c), off: () => toggleIn("cat", c, ",") })),
    ...cars.map((c) => ({ label: c, off: () => toggleIn("car", c, "|") })),
    ...(params.get("min") || params.get("max") ? [{ label: `${params.get("min") || 0} – ${params.get("max") || "∞"} TMT`, off: () => set({ min: "", max: "" }) }] : []),
    ...(params.get("sale") ? [{ label: "Arzanladyş", off: () => set({ sale: "" }) }] : []),
    ...(params.get("stock") ? [{ label: "Ammarda bar", off: () => set({ stock: "" }) }] : []),
    ...(params.get("new") ? [{ label: "Täze", off: () => set({ new: "" }) }] : []),
  ];

  let title = "Ähli harytlar";
  if (params.get("q")) title = `“${params.get("q")}” boýunça netijeler`;
  else if (cats.length === 1) title = catName(cats[0]);
  else if (cars.length === 1) title = `${cars[0]} üçin zapçastlar`;
  else if (params.get("sale")) title = "Arzanladyş";
  else if (params.get("new")) title = "Täze gelenler";

  const filterProps = { params, set, toggleIn, site, myCar };

  return (
    <div className="wrap catalog">
      <nav className="crumbs" aria-label="Ýol">
        <Link to="/">Esasy sahypa</Link><span aria-hidden="true">/</span><span>{title}</span>
      </nav>

      <div className="catalog__grid">
        <aside className="catalog__side" aria-label="Süzgüçler">
          <Filters {...filterProps} />
        </aside>

        <div className="catalog__main">
          <div className="cbar">
            <div>
              <h1 className="cbar__title">{title}</h1>
              <p className="muted">{data.count == null ? "Ýüklenýär…" : `${data.count} haryt tapyldy`}</p>
            </div>
            <div className="cbar__tools">
              <button type="button" className="btn btn--ghost btn--sm cbar__filter" onClick={() => setDrawer(true)}>
                <Filter size={18} /> Süzgüç{chips.length ? ` (${chips.length})` : ""}
              </button>
              <label className="select">
                <span className="sr">Tertip</span>
                <select value={params.get("sort") || ""} onChange={(e) => set({ sort: e.target.value })}>
                  {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </label>
              <div className="seg" role="group" aria-label="Görnüşi">
                <button type="button" className={layout === "grid" ? "is-on" : ""} onClick={() => setLayout("grid")} aria-label="Tor görnüşi" aria-pressed={layout === "grid"}><Grid size={20} /></button>
                <button type="button" className={layout === "list" ? "is-on" : ""} onClick={() => setLayout("list")} aria-label="Sanaw görnüşi" aria-pressed={layout === "list"}><List size={20} /></button>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="chips">
              {chips.map((c, i) => (
                <button type="button" key={i} className="chip" onClick={c.off}>{c.label}<Close size={14} /></button>
              ))}
              <button type="button" className="chip chip--clear" onClick={() => setParams({})}>Hemmesini arassala</button>
            </div>
          )}

          <InfiniteGrid
            data={data}
            layout={layout}
            empty={
              <div className="emptybox">
                <p className="emptybox__t">Bu süzgüçler boýunça haryt ýok</p>
                <p className="muted">Süzgüçleriň birnäçesini aýryň ýa-da başga söz bilen gözläň. Gerek zapçast ýok bolsa, jaň ediň — getirip bereris.</p>
                <div className="emptybox__row">
                  <button type="button" className="btn btn--ghost" onClick={() => setParams({})}>Süzgüçleri arassala</button>
                  {site?.phone && <a className="btn" href={`tel:${site.tel}`}>Jaň et: {site.phone}</a>}
                </div>
              </div>
            }
          />
        </div>
      </div>

      {drawer && (
        <div className="overlay overlay--side" onPointerDown={(e) => e.target === e.currentTarget && setDrawer(false)}>
          <div className="modal modal--side" role="dialog" aria-modal="true" aria-label="Süzgüçler">
            <div className="modal__head">
              <h2>Süzgüçler</h2>
              <button type="button" className="iconbtn" onClick={() => setDrawer(false)} aria-label="Ýap"><Close /></button>
            </div>
            <div className="modal__body"><Filters {...filterProps} /></div>
            <div className="modal__foot">
              <button type="button" className="btn btn--ghost" onClick={() => setParams({})}>Arassala</button>
              <button type="button" className="btn" onClick={() => setDrawer(false)}>{data.count ?? 0} harydy görkez</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
