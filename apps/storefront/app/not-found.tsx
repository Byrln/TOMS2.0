import Link from "next/link";
export default function NotFound() { return <main className="empty-state"><h1>Хуудас олдсонгүй</h1><p>Таны хайсан аялал эсвэл хуудас нийтлэгдээгүй байна.</p><Link className="primary-link" href="/tours">Аяллууд харах</Link></main>; }

