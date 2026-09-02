import "./globals.css"; import Sidebar from "@/components/Sidebar";
export const metadata={title:"RecoverAI",description:"AI Revenue Recovery OS"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Sidebar/><main className="ml-60 p-8 max-w-7xl">{children}</main></body></html>}
