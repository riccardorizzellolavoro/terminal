import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OpenForecaster — Local-First Institutional Financial Terminal",
  description:
    "Unified real-time market data, deterministic valuation models, 30-year seasonality, smart-money tracking, and citation-locked AI analyst.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-[#0B0E14] text-slate-100 font-sans selection:bg-[#3B82F6]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
