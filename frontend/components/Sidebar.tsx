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
        return <Link onClick={close} key={item.href} href={item.href} className={`group flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors ${active ? "bg-[#2b2f1e] text-[#f0e8d7]" : "text-[#8f8a79] hover:bg-[#222519] hover:text-[#ddd5c4]"}`}>
          <Icon size={15} strokeWidth={active ? 2.2 : 1.8}/><span>{item.name}</span>
          {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#a3ad72]"/>}
        </Link>;
      })}</div>
    </div>
  ))}</>;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <>
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#383b2b] bg-[#181a12]/95 px-4 lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2.5"><BrandMark/><span className="text-sm font-semibold tracking-tight">RecoverAI</span></Link>
      <div className="flex items-center gap-2"><button onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open} className="rounded-md border border-[#3f4230] p-2 text-[#aaa28f]">{open ? <X size={16}/> : <Menu size={16}/>}</button><span className="h-8 w-8 rounded-full bg-[#303421] text-center text-[10px] font-semibold leading-8 text-[#ded6c3]">RA</span></div>
    </header>
    {open && <div className="fixed inset-0 z-40 bg-black/70 pt-16 lg:hidden" onClick={() => setOpen(false)}><nav className="h-full w-[286px] overflow-y-auto border-r border-[#383b2b] bg-[#181a12] p-4" onClick={(event) => event.stopPropagation()}><NavSections pathname={pathname} close={() => setOpen(false)}/></nav></div>}
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-[#383b2b] bg-[#181a12] lg:flex">
      <div className="flex h-[76px] items-center px-5"><Link href="/dashboard" className="flex items-center gap-3"><BrandMark/><div><div className="text-[15px] font-semibold tracking-[-.02em] text-white">RecoverAI</div><div className="text-[11px] text-zinc-600">Revenue operations</div></div></Link></div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4"><NavSections pathname={pathname}/></nav>
      <div className="px-3 pb-4">
        <div className="mb-2 rounded-lg border border-[#272a2f] bg-[#15171a] p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[12px] font-medium text-zinc-300"><Activity size={13} className="text-zinc-400"/> System health</div><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/></div><div className="mt-2 flex items-center justify-between text-[11px] text-zinc-600"><span>API & workers</span><span className="text-zinc-400">Operational</span></div></div>
        <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/[.035]"><span className="grid h-8 w-8 place-items-center rounded-md bg-[#272a2f] text-[10px] font-semibold text-zinc-300">RA</span><span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-medium text-zinc-300">RecoverAI Demo</span><span className="block text-[10px] text-zinc-600">Mock environment</span></span><ChevronDown size={13} className="text-zinc-600"/></button>
      </div>
    </aside>
  </>;
}

function BrandMark() {
  return <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#929e62] text-[#17190f]"><Zap size={17} fill="currentColor" strokeWidth={2.4}/></div>;
}
