"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { rupees } from "@/lib/api";

interface TrendData {
  name: string;
  failed_paise: number;
  recovered_paise: number;
}

export default function RecoveryTrendChart({ data }: { data: TrendData[] }) {
  if (!data || data.length === 0) {
    return <div className="py-12 text-center text-zinc-500 text-xs">No timeline data available.</div>;
  }

  const formattedData = data.map((d) => ({
    ...d,
    Failed: Math.round(d.failed_paise / 100),
    Recovered: Math.round(d.recovered_paise / 100),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-xl text-xs">
          <div className="font-semibold text-zinc-300 mb-1">{label}</div>
          <div className="text-red-400 font-mono">
            Failed: {rupees(payload[0].value * 100)}
          </div>
          <div className="text-emerald-400 font-mono mt-0.5">
            Recovered: {rupees(payload[1]?.value * 100)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#83a99b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#83a99b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#272a2f" vertical={false} />
          <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Failed"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorFailed)"
          />
          <Area
            type="monotone"
            dataKey="Recovered"
            stroke="#83a99b"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorRecovered)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
