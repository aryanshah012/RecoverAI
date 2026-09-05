"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Activity, BarChart3, Bot, ChevronDown, ClipboardCheck, CreditCard, FlaskConical, LayoutDashboard, Menu, ReceiptText, RefreshCcw, ShieldCheck, ShoppingBag, Sparkles, Users, X, Zap } from "lucide-react";

const sections = [
  { label: "Overview", items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }, { name: "Opportunities", href: "/opportunities", icon: Sparkles }] },
  { label: "Operations", items: [{ name: "Payments", href: "/payments", icon: CreditCard }, { name: "Recovery cases", href: "/recovery", icon: RefreshCcw }, { name: "Checkout", href: "/checkout", icon: ShoppingBag }, { name: "Subscriptions", href: "/subscriptions", icon: ReceiptText }, { name: "Customers", href: "/customers", icon: Users }] },
  { label: "Intelligence", items: [{ name: "Analytics", href: "/analytics", icon: BarChart3 }, { name: "Simulation lab", href: "/simulation", icon: FlaskConical }, { name: "Merchant copilot", href: "/copilot", icon: Bot }] },
  { label: "Governance", items: [{ name: "Human review", href: "/human-review", icon: ClipboardCheck }, { name: "Audit trail", href: "/audit", icon: ShieldCheck }] },
];

function NavSections({ pathname, close }: { pathname: string; close?: () => void }) {
  return <>{sections.map((section) => (
    <div key={section.label} className="mb-5">
      <div className="mb-1.5 px-3 text-[11px] font-medium text-zinc-600">{section.label}</div>
      <div className="space-y-0.5">{section.items.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return <Link onClick={close} key={item.href} href={item.href} className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${active ? "bg-[#1e3a5f] text-[#eff6ff]" : "text-[#a8b5c7] hover:bg-[#1e293b] hover:text-white"}`}>
          <Icon size={15} strokeWidth={active ? 2.2 : 1.8}/><span>{item.name}</span>
          {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#60a5fa]"/>}
        </Link>;
      })}</div>
    </div>
  ))}</>;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <>
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#334155] bg-[#0f172a]/95 px-4 lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2.5"><BrandMark/><span className="text-sm font-semibold tracking-tight">RecoverAI</span></Link>
      <div className="flex items-center gap-2"><button onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open} className="rounded-lg border border-[#64748b] bg-[#1e293b] p-2 text-[#e2e8f0]">{open ? <X size={16}/> : <Menu size={16}/>}</button><span className="h-8 w-8 rounded-full bg-[#1e3a5f] text-center text-[10px] font-semibold leading-8 text-[#dbeafe]">RA</span></div>
    </header>
    {open && <div className="fixed inset-0 z-40 bg-black/65 pt-16 lg:hidden" onClick={() => setOpen(false)}><nav className="h-full w-[286px] overflow-y-auto border-r border-[#334155] bg-[#0f172a] p-4" onClick={(event) => event.stopPropagation()}><NavSections pathname={pathname} close={() => setOpen(false)}/></nav></div>}
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-[#334155] bg-[#0f172a] lg:flex">
      <div className="flex h-[76px] items-center px-5"><Link href="/dashboard" className="flex items-center gap-3"><BrandMark/><div><div className="text-[15px] font-semibold tracking-[-.02em] text-white">RecoverAI</div><div className="text-[11px] text-zinc-600">Revenue operations</div></div></Link></div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4"><NavSections pathname={pathname}/></nav>
      <div className="px-3 pb-4">
        <div className="mb-2 rounded-lg border border-[#334155] bg-[#111827] p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[12px] font-medium text-zinc-300"><Activity size={13} className="text-zinc-400"/> System health</div><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/></div><div className="mt-2 flex items-center justify-between text-[11px] text-zinc-600"><span>API & workers</span><span className="text-zinc-400">Operational</span></div></div>
        <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/[.035]"><span className="grid h-8 w-8 place-items-center rounded-md bg-[#272a2f] text-[10px] font-semibold text-zinc-300">RA</span><span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-medium text-zinc-300">RecoverAI Demo</span><span className="block text-[10px] text-zinc-600">Mock environment</span></span><ChevronDown size={13} className="text-zinc-600"/></button>
      </div>
    </aside>
  </>;
}

function BrandMark() {
  return <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#60a5fa] text-[#0f172a] shadow-[0_6px_18px_rgba(37,99,235,.32)]"><Zap size={17} fill="currentColor" strokeWidth={2.4}/></div>;
}
