"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="error-state"><h1>Хуудас ачаалсангүй</h1><p>Сүлжээний холболтоо шалгаад дахин оролдоно уу.</p><button type="button" className="primary-link" onClick={reset}>Дахин оролдох</button></main>; }

