import Link from "next/link";
import { MailCheck, MapPinned, ShieldCheck } from "lucide-react";

export default function AccountPage() {
  return <main><header className="page-hero"><div><h1>Миний TOMS</h1><p>Аяллын мэдээлэл, төлбөр, баримт бичиг нэг аюулгүй орчинд.</p></div></header><section className="section"><div className="page-container account-grid"><article className="portal-panel"><MailCheck /><h2>Аяллаа claim хийх</h2><p>Захиалгын баталгаатай имэйлээр magic link авч аяллаа холбоно.</p><Link className="primary-link" href="/login">Magic link авах</Link></article><article className="portal-panel"><MapPinned /><h2>Миний аяллууд</h2><p>Өдөр тутмын хөтөлбөр, уулзах цэг, өөрчлөлтийг бодит эх сурвалжаас харна.</p><Link className="primary-link" href="/account/trips">Аяллуудаа нээх</Link></article><article className="portal-panel"><ShieldCheck /><h2>Хандалтын хамгаалалт</h2><p>Зөвхөн баталгаажсан identity-тэй холбогдсон booking-ууд харагдана.</p></article></div></section></main>;
}
