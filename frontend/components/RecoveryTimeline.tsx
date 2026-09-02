"use client";

import { CheckCircle2, XCircle, Clock, AlertTriangle, Shield, Brain, Zap, Send, User } from "lucide-react";

const stepIcons: Record<string, any> = {
  load_case: Brain,
  check_eligibility: Shield,
  calculate_probability: Brain,
  diagnose: Brain,
  generate_actions: Zap,
  optimize: Zap,
  validate_policy: Shield,
  execute_action: Send,
  monitor: Clock,
  learn: Brain,
  stop: XCircle,
  escalate: User,
};

export function RecoveryTimeline({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) {
    return <div className="text-xs text-zinc-500 py-4">No timeline logs recorded yet.</div>;
  }

  return (
    <div className="space-y-0">
      {logs.map((log, i) => {
        const Icon = stepIcons[log.step] || Clock;
        const isLast = i === logs.length - 1;

        return (
          <div key={i} className="flex">
            <div className="flex flex-col items-center mr-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  isLast
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                    : "bg-zinc-900 border border-zinc-700 text-zinc-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              {!isLast && <div className="w-0.5 h-full bg-zinc-800 my-1" />}
            </div>

            <div className="pb-5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200 capitalize">
                  {log.step.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "00:00:00"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{log.message}</p>
              {log.data && Object.keys(log.data).length > 0 && (
                <pre className="mt-2 text-[10px] font-mono bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-zinc-300 overflow-x-auto max-h-32">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
