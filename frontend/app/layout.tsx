import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = { title:"RecoverAI — Revenue Recovery", description:"Intelligent revenue recovery for modern payment teams" };

export default function RootLayout({ children }: { children:React.ReactNode }) {
  return <html lang="en"><body><Sidebar/><main className="min-h-screen px-4 pb-10 pt-24 sm:px-6 lg:ml-[248px] lg:px-9 lg:py-8 xl:px-12"><div className="mx-auto w-full max-w-[1440px]">{children}</div></main></body></html>;
}
