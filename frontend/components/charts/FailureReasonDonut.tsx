"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { rupees } from "@/lib/api";

const COLORS = ["#83a99b", "#b7a27a", "#b87c73", "#879696", "#6f8f86", "#9a91ad"];

interface ReasonItem {
  reason: string;
  count: number;
  revenue_at_risk_paise: number;
}

export default function FailureReasonDonut({ data }: { data: ReasonItem[] }) {
  if (!data || data.length === 0) {
    return <div className="py-12 text-center text-zinc-500 text-xs">No failure reason data.</div>;
  }

  const chartData = data.map((d) => ({
    name: d.reason,
    value: Math.round(d.revenue_at_risk_paise / 100),
    count: d.count,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0];
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-xl text-xs">
          <div className="font-semibold text-zinc-200">{d.name}</div>
          <div className="text-amber-400 font-mono mt-1">
            At Risk: {rupees(d.value * 100)}
          </div>
          <div className="text-zinc-500 text-[11px] mt-0.5">
            {d.payload.count} occurrences
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-[11px] text-zinc-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
