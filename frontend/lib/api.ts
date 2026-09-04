import { ApiError } from "./types";

export const API =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== ""
        ? process.env.NEXT_PUBLIC_API_URL
        : "")
    : (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000");

export const KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY || "recoverai-demo-key";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API}${path}`;
  const timeout = AbortSignal.timeout(15_000);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeout])
    : timeout;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      signal,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": KEY,
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError(408, "The server took too long to respond. Please try again.");
    }
    throw error;
  }

  if (!response.ok) {
    const body = await response.text();
    let message = body || `Request failed with status ${response.status}`;
    try {
      const parsed = JSON.parse(body) as { detail?: unknown };
      if (typeof parsed.detail === "string") message = parsed.detail;
    } catch {
      // The API may intentionally return a plain-text error.
    }
    throw new ApiError(
      response.status,
      message,
      response.headers.get("X-Correlation-ID") || undefined,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function rupees(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100);
}
