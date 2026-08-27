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
      <body className="min-h-full flex flex-col bg-black text-neutral-100 font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#10b981",
              colorBackground: "#0e0e0e",
              borderRadius: "1rem",
            },
            elements: {
              rootBox: "w-full max-w-md mx-auto",
              cardBox: "w-full shadow-2xl",
              card: "bg-[#0e0e0e] text-white shadow-2xl border border-neutral-800/80 rounded-3xl p-6 md:p-8",
              headerTitle: "text-white font-extrabold text-2xl tracking-tight",
              headerSubtitle: "text-neutral-300 text-sm font-medium",
              socialButtonsBlockButton: "bg-[#181818] hover:bg-[#222222] text-white border border-neutral-800 rounded-2xl text-sm font-bold py-3.5 transition-colors",
              socialButtonsBlockButtonText: "text-white font-bold text-sm",
              socialButtonsProviderIcon: "w-5 h-5",
              dividerRow: "my-5",
              dividerLine: "bg-neutral-800",
              dividerText: "text-neutral-400 font-bold text-xs uppercase tracking-wider",
              form: "space-y-4",
              formFieldRow: "space-y-2",
              formFieldLabel: "text-neutral-200 font-bold text-sm",
              formFieldInput: "bg-[#181818] text-white border border-neutral-800 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder:text-neutral-500",
              formButtonPrimary: "bg-emerald-400 hover:bg-emerald-300 text-black font-black text-sm py-4 rounded-full transition-all shadow-md mt-2",
              footer: "bg-transparent border-0 pt-4",
              footerAction: "text-neutral-300 font-medium text-sm",
              footerActionLink: "text-emerald-400 hover:text-emerald-300 font-bold ml-1",
              footerActionText: "text-neutral-300 font-medium text-sm",
              identityPreviewText: "text-white font-bold text-sm",
              identityPreviewEditButton: "text-emerald-400 hover:text-emerald-300 font-bold",
              formFieldSuccessText: "text-emerald-400 font-semibold text-xs",
              formFieldErrorText: "text-emerald-300 font-semibold text-xs",
              otpCodeFieldInput: "bg-[#181818] text-white text-lg font-bold border border-neutral-800 rounded-2xl focus:border-emerald-400",
              userButtonPopoverCard: "bg-[#0e0e0e] border border-neutral-800 text-white rounded-2xl shadow-2xl",
              userButtonPopoverActionButton: "hover:bg-[#181818] text-white",
              userButtonPopoverActionButtonText: "text-white font-semibold text-sm",
              userButtonPopoverFooter: "border-neutral-800",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}