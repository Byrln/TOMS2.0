"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="error-state"><h1>Мэдээлэл ачаалсангүй</h1><p>API холболт эсвэл сүлжээний төлөвийг шалгаад дахин оролдоно уу.</p><button className="button button--primary" type="button" onClick={reset}>Дахин оролдох</button></main>;
}

