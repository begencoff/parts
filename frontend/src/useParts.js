import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

// Sahypalara bölünen harytlary yzygiderli ýükleýär ("ýene görkez" / aşak aýlananda)
export function useInfiniteParts(params, size = 20) {
  const key = JSON.stringify(params);
  const [state, setState] = useState({ items: [], page: 0, hasNext: true, count: null, loading: true, error: null });
  const req = useRef(0);

  const load = useCallback(
    (page, reset) => {
      const id = ++req.current;
      setState((s) => ({ ...s, loading: true, error: null, ...(reset ? { items: [], count: null } : {}) }));
      api
        .parts({ ...JSON.parse(key), page, size })
        .then((d) => {
          if (id !== req.current) return;
          setState((s) => ({
            items: reset ? d.results : [...s.items, ...d.results.filter((r) => !s.items.some((x) => x.id === r.id))],
            page: d.page, hasNext: d.has_next, count: d.count, loading: false, error: null,
          }));
        })
        .catch((e) => id === req.current && setState((s) => ({ ...s, loading: false, error: e.message })));
    },
    [key, size]
  );

  useEffect(() => load(1, true), [load]);

  const cur = useRef(state);
  cur.current = state;
  const more = useCallback(() => {
    const s = cur.current;
    if (!s.loading && s.hasNext && !s.error) load(s.page + 1, false);
  }, [load]);

  return { ...state, more, retry: () => load(state.page + 1 || 1, state.page === 0) };
}

export function useParts(params) {
  const key = JSON.stringify(params);
  const [d, setD] = useState({ items: [], loading: true });
  useEffect(() => {
    let live = true;
    setD((x) => ({ ...x, loading: true }));
    api.parts(JSON.parse(key)).then((r) => live && setD({ items: r.results, count: r.count, loading: false }))
      .catch(() => live && setD({ items: [], loading: false, error: true }));
    return () => { live = false; };
  }, [key]);
  return d;
}

// Element görünende funksiýany çagyrýar
export function useOnVisible(cb, enabled) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && cb(), { rootMargin: "600px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [cb, enabled]);
  return ref;
}
