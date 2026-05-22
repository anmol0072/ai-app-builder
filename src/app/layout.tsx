import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "AI App Generator | Dynamic Runtime",
  description: "Convert JSON configurations into fully working applications instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-[#0B0C10] text-gray-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200`}>
        {/* Ambient Glow Background Effect */}
        <div className="fixed inset-0 z-[-1] bg-[#0B0C10] overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[150px] animate-pulse mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/20 blur-[150px] animate-pulse mix-blend-screen" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-screen" />
        </div>
        {children}
      </body>
    </html>
  );
}
