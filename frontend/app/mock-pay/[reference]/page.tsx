"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { rupees } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function MockPayPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchCase() {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/recovery/by-reference/${reference}`);
        if (!res.ok) throw new Error("Could not find recovery reference");
        const data = await res.json();
        setCaseData(data);
        if (data.status === "recovered") {
          setPaidSuccess(true);
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load recovery link");
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [reference]);

  async function handleSimulatePayment() {
    setPaying(true);
    setErrorMsg("");
    try {
      const webhookPayload = {
        event: "payment_link.paid",
        created_at: Math.floor(Date.now() / 1000),
        id: `evt_mock_${Date.now()}`,
        payload: {
          payment_link: {
            entity: {
              id: caseData?.external_id || `plink_${reference}`,
              reference_id: reference,
              amount: caseData?.amount_paise || 100000,
              currency: "INR",
              status: "paid",
              payment_method: selectedMethod,
            },
          },
        },
      };

      const res = await fetch(`${API}/api/webhooks/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "mock_test_signature",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Payment simulation failed");
      }

      setPaidSuccess(true);
      if (caseData) {
        setCaseData({ ...caseData, status: "recovered", recovered_amount_paise: caseData.amount_paise });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Payment simulation failed");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="card shadow-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              RecoverAI Safe Recovery Checkout
            </div>
            <h1 className="text-2xl font-bold mt-1">Payment Recovery Link</h1>
          </div>
          <span className="badge text-xs px-2.5 py-1 bg-zinc-800 text-zinc-300">
            Mock Mode
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-400">Loading payment details...</div>
        ) : errorMsg && !caseData ? (
          <div className="py-8 text-center">
            <p className="text-red-400">{errorMsg}</p>
            <p className="text-xs text-zinc-500 mt-2">Reference: {reference}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Amount display */}
            <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 text-center">
              <div className="text-xs text-zinc-400 uppercase tracking-wide">Amount Due</div>
              <div className="text-4xl font-extrabold text-white mt-1">
                {caseData ? rupees(caseData.amount_paise) : "₹0"}
              </div>
              <div className="text-xs text-zinc-500 mt-2">
                Customer ID: <span className="text-zinc-300 font-mono">{caseData?.customer_id}</span> · Case #{caseData?.id}
              </div>
            </div>

            {paidSuccess ? (
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-5 rounded-xl text-center space-y-3">
                <div className="text-3xl">🎉</div>
                <div className="text-lg font-semibold text-emerald-300">
                  Payment Successfully Recovered!
                </div>
                <p className="text-xs text-emerald-400/80">
                  The webhook event <code className="bg-emerald-900/50 px-1 py-0.5 rounded">payment_link.paid</code> was ingested.
                  RecoverAI has confirmed the recovery and updated the dashboard intelligence in real-time.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
                  >
                    View in Dashboard →
                  </Link>
                  <Link
                    href="/recovery"
                    className="inline-block bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs px-4 py-2 rounded-lg transition"
                  >
                    View Recovery Cases
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Method selector */}
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-2">
                    Select Customer Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "upi", label: "⚡ UPI Instant", sub: "PhonePe / GPay" },
                      { id: "card", label: "💳 Debit/Credit", sub: "Visa / MC" },
                      { id: "netbanking", label: "🏦 Net Banking", sub: "All Major Banks" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-3 rounded-lg border text-left transition ${
                          selectedMethod === m.id
                            ? "border-emerald-500 bg-emerald-950/20 text-white"
                            : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="text-xs font-semibold">{m.label}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{m.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                    {errorMsg}
                  </div>
                )}

                {/* Pay Action Button */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={paying}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  {paying ? (
                    <span>Processing Simulated Payment...</span>
                  ) : (
                    <span>Complete Simulated Payment ({caseData ? rupees(caseData.amount_paise) : ""})</span>
                  )}
                </button>

                <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
                  Demo Mode: This simulates a customer clicking a Razorpay Payment Link and completing recovery.
                  Triggers the signed webhook handler to complete the recovery loop.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
