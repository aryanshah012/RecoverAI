"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API, KEY } from "@/lib/api";

export default function HumanReviewPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function fetchReviews() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/human-review`, {
        headers: { "X-API-Key": KEY },
      });
      if (!res.ok) throw new Error("Failed to fetch human review queue");
      const data = await res.json();
      setReviews(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function handleDecision(reviewId: number, decision: "approve" | "reject" | "stop") {
    try {
      setSubmittingId(reviewId);
      const res = await fetch(`${API}/api/human-review/${reviewId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": KEY,
        },
        body: JSON.stringify({
          decision,
          note: notes[reviewId] || `Decided ${decision} via Human Review Dashboard`,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setMessage(`Review #${reviewId} marked as ${decision.toUpperCase()}.`);
      // Refetch
      fetchReviews();
    } catch (err: any) {
      setMessage(`Decision error: ${err.message}`);
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Human Review & Safety Governance</h1>
          <p className="muted mt-1 text-sm">
            Deterministic safety boundary: High-value transactions, risky policy flags, and bounded exceptions require human approval.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs px-3 py-2 rounded-lg transition"
        >
          ↻ Refresh Queue
        </button>
      </div>

      {message && (
        <div className="mb-6 p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-xs flex justify-between items-center">
          <span className="text-zinc-200">{message}</span>
          <button onClick={() => setMessage(null)} className="text-zinc-500 hover:text-zinc-300 ml-4">✕</button>
        </div>
      )}

      {loading ? (
        <div className="card py-12 text-center text-zinc-400 text-sm">Loading review queue...</div>
      ) : reviews.length === 0 ? (
        <div className="card py-12 text-center text-zinc-400 space-y-3">
          <div className="text-3xl">🛡️</div>
          <div className="text-base font-medium text-white">Review Queue is Clear</div>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            All current recovery cases are safely governed by automated deterministic policies.
            Cases exceeding threshold amounts or retry limits will automatically be routed here for verification.
          </p>
          <div className="pt-2">
            <Link
              href="/recovery"
              className="inline-block bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-4 py-2 rounded-lg transition"
            >
              View Active Cases →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="card border border-amber-900/40 bg-zinc-950 p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-amber-950/60 text-amber-300 border-amber-800 text-[11px] font-semibold">
                      Review #{r.id}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      Recovery Case #{r.recovery_case_id}
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/90 mt-2 font-mono bg-amber-950/20 p-2 rounded border border-amber-900/30">
                    Policy Trigger: {r.reason}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Optional reviewer note..."
                  value={notes[r.id] || ""}
                  onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                  className="w-full sm:w-80 bg-zinc-900 border border-zinc-700 text-xs rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-500"
                />

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleDecision(r.id, "approve")}
                    disabled={submittingId === r.id}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1 shadow-sm"
                  >
                    {submittingId === r.id ? "Processing..." : "✓ Approve Recovery"}
                  </button>
                  <button
                    onClick={() => handleDecision(r.id, "reject")}
                    disabled={submittingId === r.id}
                    className="bg-red-900 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                  >
                    ✕ Reject
                  </button>
                  <button
                    onClick={() => handleDecision(r.id, "stop")}
                    disabled={submittingId === r.id}
                    className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-xs px-3 py-2 rounded-lg transition"
                  >
                    ⏹ Stop
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
