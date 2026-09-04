import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function MetricCard({ title,value,sub,trend,tone="neutral" }: { title:string; value:string; sub?:string; trend?:string; tone?:"neutral"|"positive"|"warning"|"danger" }) {
  const tones={ neutral:"bg-zinc-400",positive:"bg-emerald-400",warning:"bg-amber-400",danger:"bg-rose-400" };
  const positive=trend&&!trend.startsWith("-");
  return <div className="card relative min-h-[142px] overflow-hidden"><div className={`absolute left-0 top-6 h-8 w-[2px] rounded-r ${tones[tone]}`}/><div className="text-[11px] font-medium tracking-wide text-zinc-500">{title}</div><div className="mt-3 text-[27px] font-semibold tracking-[-.04em] text-zinc-100">{value}</div><div className="mt-3 flex items-center gap-2 text-[10px]">{trend&&<span className={`inline-flex items-center gap-0.5 font-semibold ${positive?"text-emerald-400":"text-rose-400"}`}>{positive?<ArrowUpRight size={11}/>:<ArrowDownRight size={11}/>} {trend}</span>}<span className="text-zinc-600">{sub||"Across active portfolio"}</span></div></div>;
}
