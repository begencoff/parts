import { useOnVisible } from "../useParts";
import ProductCard, { CardSkeleton } from "./ProductCard";

export default function InfiniteGrid({ data, layout = "grid", empty }) {
  const { items, loading, hasNext, more, error, retry, count } = data;
  const sentinel = useOnVisible(more, hasNext && !loading && !error);

  if (!loading && count === 0) return empty || null;

  return (
    <>
      <div className={layout === "list" ? "plist" : "pgrid"}>
        {items.map((p) => <ProductCard key={p.id} p={p} layout={layout} />)}
        {loading && Array.from({ length: items.length ? 5 : 10 }, (_, i) => <CardSkeleton key={`s${i}`} />)}
      </div>
      {error && (
        <div className="loaderr">
          <p>Harytlar ýüklenmedi: {error}.</p>
          <button type="button" className="btn btn--ghost" onClick={retry}>Gaýtadan synanyş</button>
        </div>
      )}
      {hasNext && !loading && !error && (
        <div className="more" ref={sentinel}>
          <button type="button" className="btn btn--ghost" onClick={more}>Ýene görkez</button>
        </div>
      )}
      {!hasNext && items.length > 10 && <p className="endnote">Ähli {count} haryt görkezildi</p>}
    </>
  );
}
