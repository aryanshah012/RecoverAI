"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { rupees, API, KEY } from "@/lib/api";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/customers`, {
          headers: { "X-API-Key": KEY },
        });
        if (!res.ok) throw new Error("Failed to load customers");
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.customer_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Customer Recovery Memory</h1>
          <p className="muted mt-1 text-sm">
            Per-customer behavioral intelligence: historical channel affinity, recovery scores, and optimal timing.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search customer ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 w-full sm:w-64 text-zinc-200 placeholder-zinc-500"
        />
      </div>

      {/* Overview metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Tracked Customers</div>
          <div className="text-2xl font-bold mt-1 text-white">{customers.length}</div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Avg Recovery Score</div>
          <div className="text-2xl font-bold mt-1 text-emerald-400">
            {customers.length
              ? Math.round(
                  customers.reduce((acc, c) => acc + (c.recovery_score || 0), 0) / customers.length
                )
              : 0}
            /100
          </div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Avg Success Rate</div>
          <div className="text-2xl font-bold mt-1 text-indigo-300">
            {customers.length
              ? `${(
                  (customers.reduce((acc, c) => acc + (c.recovery_success_rate || 0), 0) /
                    customers.length) *
                  100
                ).toFixed(1)}%`
              : "0%"}
          </div>
        </div>
        <div className="card">
          <div className="muted text-xs uppercase font-medium">Avg Transaction Value</div>
          <div className="text-2xl font-bold mt-1 text-zinc-200">
            {customers.length
              ? rupees(
                  Math.round(
                    customers.reduce((acc, c) => acc + (c.average_transaction_value_paise || 0), 0) /
                      customers.length
                  )
                )
              : "₹0"}
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-zinc-400 text-sm">Loading customer intelligence...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-sm">No customers matched your search.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Recovery Score</th>
                <th>Success Rate</th>
                <th>Preferred Method</th>
                <th>Best Recovery Hour</th>
                <th>Best Historical Action</th>
                <th>Transactions</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td className="font-mono text-xs font-semibold text-zinc-200">{c.customer_id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge text-[11px] font-bold ${
                          c.recovery_score >= 85
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                            : c.recovery_score >= 70
                            ? "bg-blue-950/60 text-blue-300 border-blue-800"
                            : "bg-amber-950/60 text-amber-300 border-amber-800"
                        }`}
                      >
                        {c.recovery_score}/100
                      </span>
                    </div>
                  </td>
                  <td className="text-xs font-semibold text-zinc-300">
                    {((c.recovery_success_rate || 0) * 100).toFixed(0)}%
                  </td>
                  <td>
                    <span className="badge uppercase text-[10px] bg-zinc-900 border-zinc-700 text-zinc-300">
                      {c.preferred_payment_method || "—"}
                    </span>
                  </td>
                  <td className="text-xs text-zinc-300">
                    {c.best_recovery_hour !== null ? `${c.best_recovery_hour}:00` : "—"}
                  </td>
                  <td className="text-xs font-mono text-amber-300/80">
                    {c.best_recovery_action ? c.best_recovery_action.replace("payment:", "") : "—"}
                  </td>
                  <td className="text-xs text-zinc-400">
                    {c.successful_transactions || 0} / {c.total_transactions || 0}
                  </td>
                  <td>
                    <Link
                      href={`/customers/${c.customer_id}`}
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded transition"
                    >
                      View Profile ↗
                    </Link>
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
