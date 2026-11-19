import { useRef } from "react";
import { Chevron } from "./Icons";
import ProductCard, { CardSkeleton } from "./ProductCard";

// Keseligine aýlanýan harytlar zolagy
export default function Rail({ items, loading }) {
  const ref = useRef(null);
  const go = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <div className="rail">
      <button type="button" className="rail__btn rail__btn--l" onClick={() => go(-1)} aria-label="Çepe"><Chevron dir="left" /></button>
      <div className="rail__track" ref={ref}>
        {loading
          ? Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)
          : items.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      <button type="button" className="rail__btn rail__btn--r" onClick={() => go(1)} aria-label="Saga"><Chevron /></button>
    </div>
  );
}
