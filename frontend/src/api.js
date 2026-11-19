async function get(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status === 404 ? "notfound" : "Serwer jogap bermedi");
  return r.json();
}

export const api = {
  site: () => get("/api/site/"),
  parts: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null && v !== false));
    return get(`/api/parts/?${qs}`);
  },
  part: (id) => get(`/api/parts/${id}/`),
  suggest: (q) => get(`/api/suggest/?q=${encodeURIComponent(q)}`),
  order: async (data) => {
    const r = await fetch("/api/orders/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error("Sargyt iberilmedi"), { errors: body.errors || {} });
    return body;
  },
};
