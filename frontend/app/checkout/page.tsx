"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rupees, API, KEY } from "@/lib/api";

export default function CheckoutPage() {
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recoveringId, setRecoveringId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  async function loadCheckouts() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/checkout`, {
        headers: { "X-API-Key": KEY },
      });
      if (!res.ok) throw new Error("Failed to fetch checkouts");
      const data = await res.json();
      setCheckouts(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCheckouts();
  }, []);

  async function handleRecoverCheckout(item: any) {
    try {
      setRecoveringId(item.checkout_id);
      const res = await fetch(`${API}/api/checkout/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": KEY,
        },
        body: JSON.stringify({
          checkout_id: item.checkout_id,
          customer_id: item.customer_id,
          amount_paise: item.amount_paise,
          payment_method: item.payment_method,
          device: item.device,
          checkout_duration_seconds: item.checkout_duration_seconds,
          status: "recovered",
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setNotification(`Checkout #${item.checkout_id} marked as RECOVERED via automated safe link!`);
      loadCheckouts();
    } catch (err: any) {
      setNotification(`Error: ${err.message}`);
    } finally {
      setRecoveringId(null);
    }
  }

  const abandonedCheckouts = checkouts.filter((c) => c.status === "abandoned");
  const totalCartRisk = abandonedCheckouts.reduce((acc, c) => acc + (c.amount_paise || 0), 0);
  const avgDuration = checkouts.length
    ? Math.round(
        checkouts.reduce((acc, c) => acc + (c.checkout_duration_seconds || 0), 0) / checkouts.length
      )
    : 0;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Checkout Abandonment Recovery</h1>
          <p className="muted mt-1 text-sm">
            Detect abandoned carts, diagnose exit friction, and trigger targeted safe recovery incentives.
          </p>
        </div>
        <button
          onClick={loadCheckouts}
          className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs px-3 py-2 rounded-lg transition"
        >
          ↻ Refresh Checkouts
        </button>
      </div>

      {notification && (
        <div className="mb-6 p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs flex justify-between items-center">
          <span className="text-zinc-200">{notification}</span>
          <button onClick={() => setNotification(null)} className="text-zinc-500 hover:text-zinc-300 ml-4">✕</button>
        </div>
      )}

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Total Tracked Carts</div>
          <div className="text-2xl font-bold mt-1 text-white">{checkouts.length}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Abandoned Carts</div>
          <div className="text-2xl font-bold mt-1 text-amber-400">{abandonedCheckouts.length}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Cart Value at Risk</div>
          <div className="text-2xl font-bold mt-1 text-red-400">{rupees(totalCartRisk)}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Avg Checkout Time</div>
          <div className="text-2xl font-bold mt-1 text-zinc-200">{avgDuration}s</div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-zinc-400 text-sm">Loading checkout data...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Checkout ID</th>
                <th>Customer</th>
                <th>Cart Amount</th>
                <th>Payment Method</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs font-semibold text-zinc-200">{r.checkout_id}</td>
                  <td className="text-xs">
                    <Link href={`/customers/${r.customer_id}`} className="text-emerald-400 hover:underline">
                      {r.customer_id}
                    </Link>
                  </td>
                  <td className="font-medium text-xs">{rupees(r.amount_paise)}</td>
                  <td>
                    <span className="badge uppercase text-[10px] bg-zinc-900 border-zinc-700 text-zinc-300">
                      {r.payment_method || "UPI"}
                    </span>
                  </td>
                  <td className="text-xs text-zinc-400">{r.checkout_duration_seconds}s</td>
                  <td>
                    <span
                      className={`badge text-[11px] capitalize font-medium ${
                        r.status === "recovered"
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                          : "bg-amber-950/60 text-amber-300 border-amber-800/60"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === "abandoned" ? (
                      <button
                        onClick={() => handleRecoverCheckout(r)}
                        disabled={recoveringId === r.checkout_id}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1 rounded transition flex items-center gap-1 shadow-sm"
                      >
                        {recoveringId === r.checkout_id ? "Recovering..." : "⚡ Recover Cart"}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium">✓ Recovered</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
