import { Link, NavLink } from "react-router-dom";
import { useStore } from "../store";
import { Cart, Grid, Heart, Home, Mail, Phone, Pin } from "./Icons";

export default function Footer() {
  const { site } = useStore();
  const name = site?.site_name || "AwtoŞaýlar";
  return (
    <footer className="foot">
      <div className="wrap foot__grid">
        <div className="foot__brand">
          <span className="logo logo--light">{name}</span>
          <p>Awtoulag zapçastlarynyň onlaýn dükany. Saýlaň, sebede goşuň, sargyt ediň — biz jaň edip tassyklarys.</p>
        </div>
        <div className="foot__col">
          <h3>Katalog</h3>
          <ul>
            <li><Link to="/katalog">Ähli harytlar</Link></li>
            <li><Link to="/katalog?sale=1&sort=discount">Arzanladyş</Link></li>
            <li><Link to="/katalog?new=1">Täze gelenler</Link></li>
            {site?.categories?.slice(0, 5).map((c) => <li key={c.id}><Link to={`/katalog?cat=${c.id}`}>{c.name}</Link></li>)}
          </ul>
        </div>
        <div className="foot__col">
          <h3>Müşderi üçin</h3>
          <ul>
            <li><Link to="/sebet">Sebet</Link></li>
            <li><Link to="/halanlarym">Halanlarym</Link></li>
            <li><span>Töleg: haryt gelende nagt ýa-da kart bilen</span></li>
          </ul>
        </div>
        {site && (site.phone || site.email || site.address) && (
          <div className="foot__col">
            <h3>Habarlaşmak</h3>
            <ul className="foot__contacts">
              {site.address && <li><Pin size={18} /><span>{site.address}</span></li>}
              {site.phone && <li><Phone size={18} /><a href={`tel:${site.tel}`}>{site.phone}</a></li>}
              {site.email && <li><Mail size={18} /><a href={`mailto:${site.email}`}>{site.email}</a></li>}
            </ul>
          </div>
        )}
      </div>
      <div className="foot__bar"><div className="wrap">© {new Date().getFullYear()} {name}</div></div>
    </footer>
  );
}

export function MobileNav() {
  const { cartCount, favs } = useStore();
  return (
    <nav className="mnav" aria-label="Esasy menýu">
      <NavLink to="/" end><Home /><span>Esasy</span></NavLink>
      <NavLink to="/katalog"><Grid /><span>Katalog</span></NavLink>
      <NavLink to="/halanlarym"><span className="hact__ic"><Heart />{favs.length > 0 && <i className="count">{favs.length}</i>}</span><span>Halanlarym</span></NavLink>
      <NavLink to="/sebet"><span className="hact__ic"><Cart />{cartCount > 0 && <i className="count">{cartCount}</i>}</span><span>Sebet</span></NavLink>
    </nav>
  );
}
