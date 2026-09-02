"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Payments", href: "/payments", icon: "💳" },
  { name: "Recovery Cases", href: "/recovery", icon: "⚡" },
  { name: "Opportunities", href: "/opportunities", icon: "🎯" },
  { name: "Checkout", href: "/checkout", icon: "🛒" },
  { name: "Subscriptions", href: "/subscriptions", icon: "🔄" },
  { name: "Customers", href: "/customers", icon: "👥" },
  { name: "Analytics", href: "/analytics", icon: "📈" },
  { name: "Simulation Lab", href: "/simulation", icon: "🧪" },
  { name: "Merchant Copilot", href: "/copilot", icon: "🤖" },
  { name: "Human Review", href: "/human-review", icon: "🛡️" },
  { name: "Audit Trail", href: "/audit", icon: "📜" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen border-r border-zinc-800 p-5 fixed bg-zinc-950/80 backdrop-blur select-none">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-emerald-950">
          R
        </div>
        <div className="text-xl font-bold text-white tracking-tight">RecoverAI</div>
      </div>
      <div className="text-[11px] text-zinc-500 mb-6 pl-9">Revenue Recovery OS</div>

      <nav className="space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? "bg-emerald-600/15 text-emerald-400 border border-emerald-800/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-5 right-5 p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Environment</span>
          <span className="badge text-[10px] bg-zinc-800 text-zinc-300">Mock Mode</span>
        </div>
        <div className="mt-2 text-zinc-500 text-[10px]">
          Demo Key: <span className="font-mono text-zinc-400">recoverai-demo-key</span>
        </div>
      </div>
    </aside>
  );
}
