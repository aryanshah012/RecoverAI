export const API =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== ""
        ? process.env.NEXT_PUBLIC_API_URL
        : "")
    : (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000");

export const KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY || "recoverai-demo-key";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API}${path}`;
  const r = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": KEY,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export function rupees(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100);
}
