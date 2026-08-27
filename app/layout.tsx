import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SevaConnect — Local Service Cooperative",
  description: "Worker-owned local service cooperative platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} dark h-full`}>
      <body className="min-h-full flex flex-col bg-[#0b0c10] text-zinc-100 font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#10b981",
              colorBackground: "#13141a",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}