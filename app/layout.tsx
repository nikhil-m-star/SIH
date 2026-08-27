import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SevaConnect — Local Cooperative Services",
  description: "Worker-owned local service cooperative platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#10b981",
              colorBackground: "#121215",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}