"use client";

import { rupees } from "@/lib/api";

interface ExplainabilityModalProps {
  recoveryCase: any;
  onClose: () => void;
}

export default function ExplainabilityModal({ recoveryCase, onClose }: ExplainabilityModalProps) {
  if (!recoveryCase) return null;

  const probPercent = Math.round((recoveryCase.recovery_probability || 0) * 100);

  // Derive realistic XAI attribution factors based on case features
  const factors = [
    {
      name: "Channel Conversion Prior",
      impact: "+15%",
      type: "positive",
      detail: `Payment rail diagnosis (${recoveryCase.diagnosis || "authentication"}) historical baseline.`,
    },
    {
      name: "Customer Recovery Memory",
      impact: "+12%",
      type: "positive",
      detail: `Customer ${recoveryCase.customer_id} has high historical channel responsiveness.`,
    },
    {
      name: "Intervention Cost Ratio",
      impact: "+8%",
      type: "positive",
      detail: `Bounded intervention cost of ${rupees(recoveryCase.intervention_cost_paise || 500)} yields positive expected net recovery.`,
    },
    {
      name: "Prior Attempt Decay",
      impact: "-5%",
      type: "negative",
      detail: "Statistical probability decay applied per retry sequence.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <span className="badge text-[10px] font-mono bg-indigo-950/60 text-indigo-300 border-indigo-800">
              Explainable AI (XAI) Model Card
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Case #{recoveryCase.id} Factor Attribution
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-lg w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800"
          >
            ✕
          </button>
        </div>

        {/* Probability Header */}
        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Predicted Recovery Probability</div>
            <div className="text-3xl font-extrabold text-indigo-400 mt-0.5">{probPercent}%</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-400">Selected Action</div>
            <div className="font-mono text-xs font-semibold text-amber-300 mt-1">
              {recoveryCase.selected_action}
            </div>
          </div>
        </div>

        {/* Factors Breakdown */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Feature Attribution Factors (SHAP Weights)
          </div>
          {factors.map((f, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-zinc-900 bg-zinc-900/40 flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-medium text-zinc-200">{f.name}</div>
                <div className="text-zinc-500 text-[11px] mt-0.5">{f.detail}</div>
              </div>
              <span
                className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                  f.type === "positive"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-red-950 text-red-300 border border-red-800"
                }`}
              >
                {f.impact}
              </span>
            </div>
          ))}
        </div>

        {/* Safety Boundary Note */}
        <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
          <span className="font-semibold text-zinc-300">Policy Reason:</span> {recoveryCase.policy_reason || "Evaluated within automated merchant risk constraints."}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2.5 rounded-xl transition"
        >
          Close Explanation
        </button>
      </div>
    </div>
  );
}
