import { Link } from "react-router-dom";
import { useStore } from "../store";
import { useParts } from "../useParts";
import ProductCard from "../components/ProductCard";
import { Heart } from "../components/Icons";

export default function Favorites() {
  const { favs } = useStore();
  // Täze bahalary we ýagdaýy serwerden alýarys
  const live = useParts(favs.length ? { ids: favs.map((f) => f.id).join(","), size: 60 } : { ids: "0" });
  const byId = Object.fromEntries(live.items.map((p) => [p.id, p]));
  const items = favs.map((f) => byId[f.id] || f);

  return (
    <div className="wrap page">
      <h1 className="page__title">Halanlarym <small>{favs.length}</small></h1>
      {favs.length === 0 ? (
        <div className="emptybox">
          <Heart size={44} />
          <p className="emptybox__t">Halan harydyňyz ýok</p>
          <p className="muted">Kartoçkadaky ýürek nyşanyna basyp, harytlary şu ýerde saklaň.</p>
          <Link to="/katalog" className="btn">Katalogy aç</Link>
        </div>
      ) : (
        <div className="pgrid">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}
