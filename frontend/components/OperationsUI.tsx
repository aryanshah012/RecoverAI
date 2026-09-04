import { ReactNode } from "react";
import { LoaderCircle, SearchX } from "lucide-react";

export function OperationsHeader({ eyebrow,title,description,actions }: { eyebrow:string; title:string; description:string; actions?:ReactNode }) {
  return <><div className="mb-7 flex items-center gap-2 border-b border-white/[.06] pb-5 text-[11px] text-zinc-600"><span>Operations</span><span>/</span><span className="text-zinc-400">{eyebrow}</span></div><section className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"/> {eyebrow}</div><h1 className="text-3xl font-semibold tracking-[-.045em] text-zinc-100 sm:text-[34px]">{title}</h1><p className="mt-2 max-w-2xl text-[12px] leading-5 text-zinc-500">{description}</p></div>{actions&&<div className="flex flex-wrap items-center gap-2">{actions}</div>}</section></>;
}

export function StatTile({ label,value,detail,tone="neutral" }: { label:string; value:string|number; detail:string; tone?:"neutral"|"positive"|"warning"|"danger" }) {
  const tones={neutral:"bg-zinc-400",positive:"bg-emerald-400",warning:"bg-amber-400",danger:"bg-rose-400"};
  return <div className="card relative min-h-[124px] overflow-hidden"><span className={`absolute left-0 top-6 h-7 w-[2px] ${tones[tone]}`}/><div className="text-[10px] font-medium tracking-wide text-zinc-500">{label}</div><div className="mt-3 text-2xl font-semibold tracking-[-.04em] text-zinc-100">{value}</div><div className="mt-2 text-[9px] text-zinc-600">{detail}</div></div>;
}

export function SegmentedFilter({ items,value,onChange }: { items:{id:string;label:string;count?:number}[]; value:string; onChange:(id:any)=>void }) {
  return <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-white/[.06] bg-black/20 p-1">{items.map(item=><button key={item.id} onClick={()=>onChange(item.id)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] font-medium transition ${value===item.id?"bg-white/[.08] text-zinc-100 shadow-sm":"text-zinc-600 hover:text-zinc-300"}`}>{item.label}{item.count!==undefined&&<span className={`ml-1.5 ${value===item.id?"text-emerald-400":"text-zinc-700"}`}>{item.count}</span>}</button>)}</div>;
}

export function LoadingState({ label="Loading data" }: { label?:string }) { return <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-[11px] text-zinc-600"><LoaderCircle size={20} className="animate-spin text-emerald-400"/><span>{label}</span></div>; }
export function EmptyState({ title,detail,action }: { title:string; detail:string; action?:ReactNode }) { return <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center"><span className="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-white/[.07] bg-white/[.025] text-zinc-600"><SearchX size={17}/></span><h3 className="text-[12px] font-semibold text-zinc-300">{title}</h3><p className="mt-1 max-w-sm text-[10px] leading-5 text-zinc-600">{detail}</p>{action&&<div className="mt-4">{action}</div>}</div>; }
