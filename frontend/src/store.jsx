import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api";

const Ctx = createContext(null);

function usePersisted(key, initial) {
  const [v, setV] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* brauzer saklamaga rugsat bermese */
    }
  }, [key, v]);
  return [v, setV];
}

// Sebetde harydyň gysga nusgasy saklanýar (ady, bahasy, suraty)
const slim = (p) => ({ id: p.id, name: p.name, price: p.price, old_price: p.old_price, image: p.image, car: p.car, in_stock: p.in_stock });

export function StoreProvider({ children }) {
  const [site, setSite] = useState(null);
  const [cart, setCart] = usePersisted("as_cart", []); // [{...part, qty, selected}]
  const [favs, setFavs] = usePersisted("as_favs", []); // [part]
  const [recent, setRecent] = usePersisted("as_recent", []); // [part]
  const [searches, setSearches] = usePersisted("as_searches", []); // [string]
  const [myCar, setMyCar] = usePersisted("as_mycar", "");
  const [toasts, setToasts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quick, setQuick] = useState(null); // çalt görmek üçin haryt
  const tid = useRef(0);

  useEffect(() => {
    api.site().then(setSite).catch(() => setSite({ site_name: "AwtoŞaýlar", categories: [], cars: [], price_range: { min: 0, max: 0 }, error: true }));
  }, []);

  useEffect(() => {
    if (site?.site_name) document.title = `${site.site_name} — awtoulag zapçastlary`;
  }, [site]);

  const toast = useCallback((text, action) => {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, text, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const addToCart = useCallback(
    (p, qty = 1, { silent } = {}) => {
      setCart((c) => {
        const ex = c.find((x) => x.id === p.id);
        if (ex) return c.map((x) => (x.id === p.id ? { ...x, ...slim(p), qty: Math.min(999, x.qty + qty), selected: true } : x));
        return [...c, { ...slim(p), qty, selected: true }];
      });
      if (!silent) toast("Sebede goşuldy", { label: "Sebede geç", open: "cart" });
    },
    [setCart, toast]
  );
  const setQty = (id, qty) => setCart((c) => c.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.min(999, qty)) } : x)));
  const removeFromCart = (id) => setCart((c) => c.filter((x) => x.id !== id));
  const toggleSelect = (id) => setCart((c) => c.map((x) => (x.id === id ? { ...x, selected: !x.selected } : x)));
  const selectAll = (on) => setCart((c) => c.map((x) => ({ ...x, selected: on })));
  const clearOrdered = () => setCart((c) => c.filter((x) => !x.selected));

  const isFav = (id) => favs.some((f) => f.id === id);
  const toggleFav = (p) => {
    const on = isFav(p.id);
    setFavs((f) => (on ? f.filter((x) => x.id !== p.id) : [slim(p), ...f]));
    toast(on ? "Halanlarymdan aýryldy" : "Halanlaryma goşuldy");
  };

  const pushRecent = useCallback((p) => setRecent((r) => [slim(p), ...r.filter((x) => x.id !== p.id)].slice(0, 16)), [setRecent]);
  const pushSearch = (q) => q && setSearches((s) => [q, ...s.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8));

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const selected = cart.filter((x) => x.selected);
  const totals = useMemo(() => {
    const sum = selected.reduce((s, x) => s + x.price * x.qty, 0);
    const old = selected.reduce((s, x) => s + (x.old_price || x.price) * x.qty, 0);
    return { sum, saved: old - sum, count: selected.reduce((s, x) => s + x.qty, 0) };
  }, [selected]);

  const value = {
    site, cart, cartCount, selected, totals, addToCart, setQty, removeFromCart, toggleSelect, selectAll, clearOrdered,
    favs, isFav, toggleFav, recent, pushRecent, searches, pushSearch, clearSearches: () => setSearches([]),
    myCar, setMyCar, toasts, toast, cartOpen, setCartOpen, quick, setQuick,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
