import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "eduBridge AI",
  description: "Business & IT Student Ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <Providers>
          {/* Dynamic Background - Light Mode */}
          <div className="fixed inset-0 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] -z-10 light-bg" />
          
          {/* Dynamic Background - Dark Mode */}
          <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] -z-10 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
          
          {/* Floating blurred circles - Light Mode */}
          <div className="fixed top-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse light-bg" />
          <div className="fixed bottom-20 right-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse light-bg" style={{ animationDelay: '1s' }} />
          <div className="fixed top-1/2 right-1/3 w-64 h-64 bg-blue-300/15 rounded-full blur-3xl animate-pulse light-bg" style={{ animationDelay: '2s' }} />
          
          {/* Floating blurred circles - Dark Mode */}
          <div className="fixed top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse dark:block hidden" />
          <div className="fixed bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse dark:block hidden" style={{ animationDelay: '1s' }} />
          <div className="fixed top-1/2 right-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse dark:block hidden" style={{ animationDelay: '2s' }} />
          
          {children}
        </Providers>
      </body>
    </html>
  );
}
