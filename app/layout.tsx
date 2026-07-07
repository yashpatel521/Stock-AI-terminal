import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock AI Research Terminal | Real-Time Market Intelligence",
  description: "Lightweight, real-time AI-powered stock research assistant. Analyze trends, track news sentiment, and plan trades with live market insights powered by Gemini and Finnhub.",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
