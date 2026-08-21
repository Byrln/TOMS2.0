import { notFound } from "next/navigation";

const content: Record<string,{title:string;description:string;body:string}>={
  destinations:{title:"Очих газрууд",description:"Монгол, Ази, Европын сонгомол чиглэлүүд.",body:"TOMS-ийн аяллууд огноо, багтаамж, үйлчилгээ, аяллын бодит хөтөлбөртэй уялдан нийтлэгдэнэ."},
  about:{title:"Бидний тухай",description:"Аяллын эхний асуултаас эцсийн өдөр хүртэл.",body:"Munkh Discovery нь TOMS Travel Operations OS-оор борлуулалт, үйл ажиллагаа, санхүү, аялагчийн туршлагыг нэг эх сурвалжаас удирдана."},
  contact:{title:"Холбоо барих",description:"Аяллын зөвлөхтэй холбогдоорой.",body:"Утас: +976 7600 9999 · Имэйл: travel@toms.mn · Дэмжлэг: 24/7"},
  account:{title:"Аяллаа claim хийх",description:"Баталгаажсан имэйлээр өөрийн аяллыг холбоно.",body:"Захиалгын баталгаажуулалт дээрх “Аяллаа нээх” холбоосыг ашиглах эсвэл magic link хүснэ үү."}
};
export default async function ContentPage({params}:{params:Promise<{page:string}>}){const {page}=await params;const selected=content[page];if(!selected)notFound();return <main><header className="page-hero"><div><h1>{selected.title}</h1><p>{selected.description}</p></div></header><section className="section"><div className="page-container"><article className="portal-panel"><p>{selected.body}</p></article></div></section></main>}

