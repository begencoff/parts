import { Link } from "react-router-dom";
import { useStore } from "../store";
import { money, partLink } from "../format";
import { Cart, Eye, Heart } from "./Icons";

export function Price({ p, size }) {
  return (
    <span className={`price ${size ? `price--${size}` : ""}`}>
      <span className="price__now">{money(p.price)} <small>TMT</small></span>
      {p.old_price ? <s className="price__old">{money(p.old_price)}</s> : null}
    </span>
  );
}

export default function ProductCard({ p, layout = "grid" }) {
  const { addToCart, isFav, toggleFav, setQuick, myCar } = useStore();
  const fav = isFav(p.id);
  const fits = myCar && p.car && p.car.toLowerCase() === myCar.toLowerCase();

  return (
    <article className={`pcard pcard--${layout} ${p.in_stock ? "" : "is-out"}`}>
      <Link to={partLink(p)} className="pcard__media" aria-label={p.name}>
        <img src={p.image} alt="" loading="lazy" />
        <span className="pcard__flags">
          {p.discount ? <span className="flag flag--sale">−{p.discount}%</span> : null}
          {p.is_new ? <span className="flag flag--new">Täze</span> : null}
        </span>
        {!p.in_stock && <span className="pcard__out">Gutardy</span>}
      </Link>
      <button
        type="button"
        className={`pcard__fav ${fav ? "is-on" : ""}`}
        onClick={() => toggleFav(p)}
        aria-pressed={fav}
        aria-label={fav ? "Halanlarymdan aýyr" : "Halanlaryma goş"}
      >
        <Heart size={20} filled={fav} />
      </button>
      <button type="button" className="pcard__quick" onClick={() => setQuick(p)}>
        <Eye size={18} /> Çalt gör
      </button>

      <div className="pcard__body">
        {p.car ? <span className={`pcard__car ${fits ? "is-fit" : ""}`}>{fits ? "Siziň maşynyňyza laýyk" : p.car}</span> : null}
        <Link to={partLink(p)} className="pcard__name">{p.name}</Link>
        <div className="pcard__foot">
          <Price p={p} />
          <button
            type="button"
            className="pcard__add"
            disabled={!p.in_stock}
            onClick={() => addToCart(p)}
            aria-label={`${p.name} — sebede goş`}
            title={p.in_stock ? "Sebede goş" : "Gutardy"}
          >
            <Cart size={20} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function CardSkeleton() {
  return (
    <div className="pcard pcard--skel" aria-hidden="true">
      <div className="pcard__media" />
      <div className="pcard__body">
        <span className="skel skel--sm" />
        <span className="skel" />
        <span className="skel skel--md" />
      </div>
    </div>
  );
}
