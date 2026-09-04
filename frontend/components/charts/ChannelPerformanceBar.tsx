"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { rupees } from "@/lib/api";

interface MethodData {
  payment_method: string;
  failed_count: number;
  revenue_at_risk_paise: number;
}

export default function ChannelPerformanceBar({ data }: { data: MethodData[] }) {
  if (!data || data.length === 0) {
    return <div className="py-12 text-center text-zinc-500 text-xs">No channel data available.</div>;
  }

  const chartData = data.map((d) => ({
    name: d.payment_method.toUpperCase(),
    volume: Math.round(d.revenue_at_risk_paise / 100),
    failures: d.failed_count,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-xl text-xs">
          <div className="font-semibold text-zinc-200">{label} Rail</div>
          <div className="text-amber-400 font-mono mt-1">
            Revenue at Risk: {rupees(payload[0].value * 100)}
          </div>
          <div className="text-zinc-500 text-[11px] mt-0.5">
            {payload[0].payload.failures} failed transactions
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#272a2f" vertical={false} />
          <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="volume" fill="#929e62" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
