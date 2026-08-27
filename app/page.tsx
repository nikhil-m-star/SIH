import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ArrowRight, Sparkles, CheckCircle2, Shield } from "lucide-react";

const SERVICES = [
  { name: "Plumbing", desc: "Pipes, leaks & fixtures" },
  { name: "Electrical", desc: "Wiring, circuits & fixtures" },
  { name: "AC Repair", desc: "Cooling & servicing" },
  { name: "Cleaning", desc: "Deep cleaning & hygiene" },
  { name: "Carpentry", desc: "Furniture & woodwork" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="border-b border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-zinc-900/30 to-zinc-950">
        <div className="container-main py-20 md:py-28">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
              <Shield className="w-3.5 h-3.5" />
              <span>Cooperative-Owned Platform</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Local services.
              <br />
              Fair compensation.
              <br />
              <span className="text-emerald-400">Direct to workers.</span>
            </h1>
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-md">
              Connecting households with verified tradespeople. Transparent 90%
              worker payout with zero corporate extraction.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/customer/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
              >
                <span>Book a Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center px-5 py-2.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
              >
                Join as Worker
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="border-b border-zinc-800/60 bg-zinc-950/60 py-12">
        <div className="container-main">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Available Services
            </h2>
            <Link
              href="/customer/ai-help"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Service Diagnosis</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SERVICES.map((s) => (
              <Link
                key={s.name}
                href={`/customer/book?service=${encodeURIComponent(s.name)}`}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 hover:border-emerald-500/40 hover:bg-zinc-900/80 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 transition-colors mb-3">
                  <ServiceIcon name={s.name} className="w-4 h-4" />
                </div>
                <p className="font-medium text-xs text-zinc-200">{s.name}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-zinc-800/60 py-16 bg-zinc-950">
        <div className="container-main">
          <h2 className="text-lg font-bold text-white mb-8">How it works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Customer */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-5">
                Customers
              </h3>
              <div className="space-y-4 text-xs">
                {[
                  { title: "Select service", desc: "Choose directly or use AI for problem diagnosis." },
                  { title: "Match verified worker", desc: "Ranked by proximity, availability and ratings." },
                  { title: "Complete & rate", desc: "Track progress and rate upon verified completion." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-zinc-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-zinc-200">{item.title}</p>
                      <p className="text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Worker */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-5">
                Workers
              </h3>
              <div className="space-y-4 text-xs">
                {[
                  { title: "Set skills & location", desc: "Configure service categories and availability." },
                  { title: "Accept bookings", desc: "Receive direct job alerts in your area." },
                  { title: "Keep 90% earnings", desc: "Transparent payouts with community funds." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-emerald-500/20">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-zinc-200">{item.title}</p>
                      <p className="text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cooperative Breakdown */}
      <section id="cooperative" className="py-16 bg-zinc-950">
        <div className="container-main">
          <div className="max-w-md">
            <h2 className="text-lg font-bold text-white mb-2">
              Transparent Economics
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Example breakdown per ₹1,000 service payment:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2.5 text-xs">
              {[
                { label: "Worker Payout", amount: "₹900", share: "90%", color: "bg-emerald-500" },
                { label: "Worker Welfare Fund", amount: "₹50", share: "5%", color: "bg-blue-500" },
                { label: "Skills Training Fund", amount: "₹20", share: "2%", color: "bg-purple-500" },
                { label: "Cooperative Operations", amount: "₹30", share: "3%", color: "bg-zinc-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-zinc-300">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-zinc-500 text-[11px]">{item.share}</span>
                    <span className="font-semibold text-zinc-100 w-12 text-right">
                      {item.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950 py-8">
        <div className="container-main flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2 text-zinc-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">SevaConnect</span>
          </div>
          <p>SIH 2026 · Problem Statement 26089</p>
        </div>
      </footer>
    </>
  );
}
