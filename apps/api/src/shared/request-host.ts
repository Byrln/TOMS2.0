export function requestHost(headers: Headers): string {
  const storefrontHost = headers.get("x-toms-storefront-host")?.trim();
  const forwarded = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = storefrontHost || forwarded || headers.get("host") || "localhost";
  return host.toLowerCase().replace(/:\d+$/, "");
}
