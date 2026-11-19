const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" };
const I = ({ d, size = 22, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...P} {...rest}>
    {d ? <path d={d} /> : children}
  </svg>
);

export const Search = (p) => <I {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></I>;
export const Cart = (p) => <I {...p}><path d="M3 4h2.2l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="17.5" cy="20" r="1.3" /></I>;
export const Heart = ({ filled, ...p }) => (
  <I {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.6 12 20 12 20z" />
  </I>
);
export const Home = (p) => <I {...p} d="M4 11l8-6.5 8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />;
export const Grid = (p) => <I {...p}><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></I>;
export const List = (p) => <I {...p} d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />;
export const Car = (p) => <I {...p}><path d="M5 16.5V12l1.8-4.6A2 2 0 0 1 8.7 6h6.6a2 2 0 0 1 1.9 1.4L19 12v4.5" /><path d="M3.5 16.5h17v-3a1.5 1.5 0 0 0-1.5-1.5H5a1.5 1.5 0 0 0-1.5 1.5z" /><path d="M6 16.5V19M18 16.5V19" /><circle cx="7.5" cy="14.2" r=".6" /><circle cx="16.5" cy="14.2" r=".6" /></I>;
export const Phone = (p) => <I {...p} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />;
export const Mail = (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M4 7l8 6 8-6" /></I>;
export const Pin = (p) => <I {...p}><path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.6" /></I>;
export const Close = (p) => <I {...p} d="M6 6l12 12M18 6L6 18" />;
export const Plus = (p) => <I {...p} d="M12 5v14M5 12h14" />;
export const Minus = (p) => <I {...p} d="M5 12h14" />;
export const Trash = (p) => <I {...p} d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />;
export const Filter = (p) => <I {...p} d="M4 6h16M7 12h10M10 18h4" />;
export const Chevron = ({ dir = "right", ...p }) => {
  const r = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return <I {...p} style={{ transform: `rotate(${r}deg)` }} d="M9 5l7 7-7 7" />;
};
export const Truck = (p) => <I {...p}><path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17.5" cy="17.5" r="1.8" /></I>;
export const Shield = (p) => <I {...p} d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z" />;
export const Bolt = (p) => <I {...p} d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />;
export const Share = (p) => <I {...p}><circle cx="18" cy="5.5" r="2.3" /><circle cx="6" cy="12" r="2.3" /><circle cx="18" cy="18.5" r="2.3" /><path d="M8 11l8-4.3M8 13l8 4.3" /></I>;
export const Eye = (p) => <I {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></I>;
export const Clock = (p) => <I {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></I>;
export const Check = (p) => <I {...p} d="M5 12.5l4.5 4.5L19 7.5" />;
export const User = (p) => <I {...p}><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></I>;
