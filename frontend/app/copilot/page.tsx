"use client";

import { useState } from "react";
import { rupees, API, KEY } from "@/lib/api";

const SUGGESTED_QUERIES = [
  "Which payment method leaks the most revenue?",
  "How much revenue has been recovered?",
  "Which strategy has the best recovery performance?",
  "Why did case 1 stop?",
];

export default function CopilotPage() {
  const [query, setQuery] = useState("Which payment method leaks the most revenue?");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ q: string; a: any }>>([]);

  async function handleAsk(qToAsk?: string) {
    const activeQuery = qToAsk || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/copilot/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": KEY,
        },
        body: JSON.stringify({ question: activeQuery }),
      });

      const data = await res.json();
      setResult(data);
      setHistory((prev) => [{ q: activeQuery, a: data }, ...prev]);
    } catch (err: any) {
      setResult({
        answer: `Query failed: ${err.message}`,
        intent: "error",
        data: null,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Merchant Recovery Copilot</h1>
          <p className="muted mt-1 text-sm">
            Deterministic analytics copilot grounded exclusively in verified revenue metrics and policy audit logs.
          </p>
        </div>
        <span className="badge text-[11px] font-semibold bg-emerald-950/40 text-emerald-300 border-emerald-800">
          Read-only analytics
        </span>
      </div>

      {/* Query box */}
      <div className="card p-6 border border-zinc-800 bg-zinc-950">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
          Ask RecoverAI Assistant
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            placeholder="Ask about revenue leakage, best channels, case decisions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-md shadow-indigo-950"
          >
            {loading ? "Analyzing..." : "Ask Copilot"}
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="mt-4">
          <div className="text-[11px] text-zinc-500 mb-2">Suggested questions</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((sq) => (
              <button
                key={sq}
                onClick={() => {
                  setQuery(sq);
                  handleAsk(sq);
                }}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Response */}
      {result && (
        <div className="card mt-6 border border-zinc-700 bg-zinc-900/70 p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Verified Copilot Response
            </div>
            <span className="badge text-[10px] font-mono bg-indigo-950/60 text-indigo-300 border-indigo-800">
              Intent: {result.intent}
            </span>
          </div>

          {result.retrieval && (
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className={`badge ${result.grounding?.grounded ? "bg-emerald-950/60 text-emerald-300 border-emerald-800" : "bg-amber-950/60 text-amber-300 border-amber-800"}`}>
                {result.grounding?.grounded ? "Grounded response" : "No grounded answer"}
              </span>
              <span className="badge bg-zinc-950 text-zinc-400 border-zinc-800">
                Retrieval: {result.retrieval.status} · {result.retrieval.item_count} evidence item{result.retrieval.item_count === 1 ? "" : "s"}
              </span>
            </div>
          )}

          <div className="text-lg font-medium text-white leading-relaxed">
            {result.answer}
          </div>

          {/* Render structured data if present */}
          {Array.isArray(result.data) && result.data.length > 0 && (
            <div className="pt-2">
              <div className="text-xs text-zinc-400 mb-2 font-medium">Underlying Analytical Data:</div>
              <div className="overflow-x-auto bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <table className="text-xs">
                  <thead>
                    <tr>
                      {Object.keys(result.data[0]).map((k) => (
                        <th key={k} className="capitalize font-medium text-zinc-400">
                          {k.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((row: any, i: number) => (
                      <tr key={i}>
                        {Object.entries(row).map(([k, v]: [string, any], j) => (
                          <td key={j} className="font-mono text-zinc-300">
                            {k.includes("paise") ? rupees(v) : String(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.data && !Array.isArray(result.data) && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div className="text-xs text-zinc-400 mb-2 font-medium">Verified Case Context:</div>
              <pre className="text-xs font-mono text-zinc-300 overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3">Previous Inquiries in this Session</h3>
          <div className="space-y-3">
            {history.slice(1, 5).map((h, idx) => (
              <div key={idx} className="card p-4 text-xs bg-zinc-950 border border-zinc-800/80">
                <div className="font-medium text-zinc-300">Q: {h.q}</div>
                <div className="text-zinc-400 mt-1">A: {h.a.answer}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
