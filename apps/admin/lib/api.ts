const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getAdminJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { cache: "no-store", headers: { "x-demo-role": "OWNER" } });
  if (!response.ok) throw new Error(`TOMS API ${response.status}`);
  return response.json() as Promise<T>;
}

