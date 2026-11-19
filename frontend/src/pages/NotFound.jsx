import { Link } from "react-router-dom";

export default function NotFound({ text = "Bu sahypa ýok. Salgy nädogry bolmagy ahmal." }) {
  return (
    <div className="wrap emptybox emptybox--page">
      <p className="emptybox__big">404</p>
      <p className="emptybox__t">{text}</p>
      <div className="emptybox__row">
        <Link to="/" className="btn">Esasy sahypa</Link>
        <Link to="/katalog" className="btn btn--ghost">Katalog</Link>
      </div>
    </div>
  );
}
