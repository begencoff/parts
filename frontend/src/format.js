export const money = (n) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(n ?? 0);

export function plural(n, word) {
  return `${n} ${word}`;
}

export function partLink(p) {
  return `/haryt/${p.id}`;
}
