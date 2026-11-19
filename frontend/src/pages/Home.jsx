import { Link } from "react-router-dom";
import { useStore } from "../store";
import { useInfiniteParts, useParts } from "../useParts";
import Disc from "../components/Disc";
import Rail from "../components/Rail";
import Countdown from "../components/Countdown";
import InfiniteGrid from "../components/InfiniteGrid";
import { Bolt, Car, Phone, Shield, Truck } from "../components/Icons";

function Section({ title, link, linkLabel = "Hemmesini gör", children, className = "" }) {
  return (
    <section className={`sec ${className}`}>
      <div className="sec__head">
        <h2>{title}</h2>
        {link && <Link to={link} className="sec__more">{linkLabel}</Link>}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const { site, myCar, recent } = useStore();
  const sale = useParts({ sale: 1, sort: "discount", size: 12 });
  const fresh = useParts({ new: 1, size: 12 });
  const mine = useParts(myCar ? { car: myCar, size: 12 } : { ids: "0" });
  const feed = useInfiniteParts({ sort: "" }, 20);
  const cars = site?.cars?.slice(0, 6) || [];

  return (
    <div className="wrap home">
      <section className="hero">
        <div className="hero__main">
          <div className="hero__text">
            <h1>Maşynyňyz üçin zapçast — bir sahypada, dogry bahadan</h1>
            <p>Maşynyňyzy saýlaň, laýyk zapçastlar özbaşdak saýlanar. Sargyt ediň, biz jaň edip tassyklarys.</p>
            {cars.length > 0 && (
              <div className="hero__cars" aria-label="Köp gözlenýän maşynlar">
                {cars.map((c) => (
                  <Link key={c.name} to={`/katalog?car=${encodeURIComponent(c.name)}`} className="hero__car">
                    <Car size={18} /> {c.name}
                  </Link>
                ))}
              </div>
            )}
            <Link to="/katalog" className="btn btn--light">Katalogy açmak</Link>
          </div>
          <div className="hero__art"><Disc /></div>
        </div>
        <div className="hero__side">
          <Link to="/katalog?sale=1&sort=discount" className="tile tile--sale">
            <Bolt size={28} />
            <b>Arzanladyş</b>
            <span>{site?.sale_count ? `${site.sale_count} haryt arzan bahadan` : "Arzanladyşdaky harytlar"}</span>
          </Link>
          <Link to="/katalog?new=1" className="tile tile--new">
            <b>Täze gelenler</b>
            <span>Soňky 14 günde goşulan zapçastlar</span>
          </Link>
        </div>
      </section>

      <ul className="perks">
        <li><Truck /><span><b>Eltip bermek ýa-da dükandan almak</b>Sargyt edeniňizde saýlaň</span></li>
        <li><Shield /><span><b>Tölegi haryt alanyňyzda</b>Öňünden töleg ýok</span></li>
        <li><Phone /><span><b>Jaň edip tassyklaýarys</b>Laýyklygyny bilelikde barlarys</span></li>
      </ul>

      {site?.categories?.length > 0 && (
        <section className="sec">
          <div className="sec__head"><h2>Kategoriýalar</h2></div>
          <div className="cats">
            {site.categories.map((c) => (
              <Link key={c.id} to={`/katalog?cat=${c.id}`} className="cat">
                <span className="cat__mark" aria-hidden="true">{c.name.slice(0, 1)}</span>
                <span className="cat__name">{c.name}</span>
                <small>{c.n} haryt</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(sale.loading || sale.items.length > 0) && (
        <section className="deals">
          <div className="deals__head">
            <h2><Bolt size={26} /> Günüň arzanladyşy</h2>
            <span className="deals__timer">Gutarmagyna <Countdown /></span>
            <Link to="/katalog?sale=1&sort=discount" className="deals__more">Hemmesi</Link>
          </div>
          <Rail items={sale.items} loading={sale.loading} />
        </section>
      )}

      {myCar && (mine.loading || mine.items.length > 0) && (
        <Section title={`${myCar} üçin`} link={`/katalog?car=${encodeURIComponent(myCar)}`}>
          <Rail items={mine.items} loading={mine.loading} />
        </Section>
      )}

      {(fresh.loading || fresh.items.length > 0) && (
        <Section title="Täze gelenler" link="/katalog?new=1">
          <Rail items={fresh.items} loading={fresh.loading} />
        </Section>
      )}

      {recent.length > 1 && (
        <Section title="Soňky seredenleriňiz">
          <Rail items={recent} />
        </Section>
      )}

      <Section title="Size teklip edýäris" link="/katalog" linkLabel="Kataloga geç">
        <InfiniteGrid
          data={feed}
          empty={<div className="emptybox"><p className="emptybox__t">Entek haryt goşulmady</p><p className="muted">Harytlar admin panelden goşulýar.</p></div>}
        />
      </Section>
    </div>
  );
}
