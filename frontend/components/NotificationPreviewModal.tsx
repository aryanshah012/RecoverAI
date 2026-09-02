"use client";

import { useState } from "react";
import { rupees } from "@/lib/api";

interface NotificationPreviewProps {
  recoveryCase: any;
  onClose: () => void;
}

export default function NotificationPreviewModal({ recoveryCase, onClose }: NotificationPreviewProps) {
  const [tab, setTab] = useState<"whatsapp" | "email">("whatsapp");

  if (!recoveryCase) return null;

  const amountStr = rupees(recoveryCase.amount_paise);
  const payUrl = recoveryCase.external_url || `http://localhost:3000/mock-pay/${recoveryCase.recovery_reference}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <span className="badge text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border-emerald-800">
              Multi-Channel Outreach Simulator
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Customer Message Preview
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-lg w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("whatsapp")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
              tab === "whatsapp"
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <span>💬</span> WhatsApp Template
          </button>
          <button
            onClick={() => setTab("email")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
              tab === "email"
                ? "bg-indigo-950/60 text-indigo-300 border-indigo-800"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <span>✉️</span> Email Template
          </button>
        </div>

        {tab === "whatsapp" ? (
          /* WhatsApp Preview */
          <div className="bg-[#0b141a] rounded-2xl p-4 border border-zinc-800 text-xs text-[#e9edef] space-y-3 font-sans">
            <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/80">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                R
              </div>
              <div>
                <div className="font-semibold text-white flex items-center gap-1">
                  RecoverAI Official <span className="text-[10px] text-emerald-400">✓ Verified</span>
                </div>
                <div className="text-[10px] text-zinc-400">Automated Smart Assistant</div>
              </div>
            </div>

            <div className="bg-[#202c33] p-3 rounded-xl max-w-sm rounded-tl-none shadow space-y-2">
              <p>
                Hi <span className="font-semibold text-white">{recoveryCase.customer_id}</span>,
              </p>
              <p className="text-zinc-300 leading-relaxed">
                We noticed your recent payment of <span className="font-bold text-white">{amountStr}</span> was interrupted due to a temporary network issue.
              </p>
              <p className="text-zinc-300 leading-relaxed">
                We have securely saved your order so you do not lose your items. Tap below to complete your checkout instantly via UPI, Cards, or Net Banking:
              </p>
              <div className="pt-2">
                <a
                  href={payUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block bg-[#00a884] hover:bg-[#02906f] text-white text-center font-semibold py-2 px-3 rounded-lg transition shadow-sm"
                >
                  💳 Complete Payment ({amountStr})
                </a>
              </div>
              <div className="text-[9px] text-zinc-400 text-right pt-1">Just now · Sent via RecoverAI</div>
            </div>
          </div>
        ) : (
          /* Email Preview */
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 text-xs text-zinc-200 space-y-3">
            <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="font-semibold text-sm text-white">RecoverAI Merchant Notifications</div>
              <span className="text-[10px] text-zinc-400 font-mono">noreply@recoverai.local</span>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-white text-base">Complete your checkout: {amountStr}</div>
              <p className="text-zinc-400 leading-relaxed">
                Hello {recoveryCase.customer_id}, your recent purchase encountered an authentication interruption. Your session has been reserved for the next 24 hours.
              </p>
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between my-3">
                <div>
                  <div className="text-zinc-400 text-[11px]">Recovery Case Reference</div>
                  <div className="font-mono text-zinc-200 font-semibold">{recoveryCase.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-400 text-[11px]">Amount Outstanding</div>
                  <div className="font-bold text-sm text-emerald-400">{amountStr}</div>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href={payUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block bg-indigo-600 hover:bg-indigo-500 text-white text-center font-semibold py-2.5 px-4 rounded-xl transition"
                >
                  Pay Now with One-Click Link →
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-between items-center text-xs text-zinc-500">
          <span>Target Customer: {recoveryCase.customer_id}</span>
          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-1.5 rounded-lg transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
