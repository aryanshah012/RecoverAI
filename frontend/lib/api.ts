const API=process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const KEY=process.env.NEXT_PUBLIC_DEMO_API_KEY || "recoverai-demo-key";
export async function api<T>(path:string, init?:RequestInit):Promise<T>{
  const r=await fetch(`${API}${path}`,{...init,headers:{"Content-Type":"application/json","X-API-Key":KEY,...(init?.headers||{})},cache:"no-store"});
  if(!r.ok) throw new Error(await r.text()); return r.json();
}
export function rupees(paise:number){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format((paise||0)/100)}
