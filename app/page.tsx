import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ArrowRight, Sparkles, Shield, Check } from "lucide-react";

const SERVICES = [
  { name: "Plumbing", desc: "Pipes & water systems" },
  { name: "Electrical", desc: "Wiring & power fixtures" },
  { name: "AC Repair", desc: "Cooling & servicing" },
  { name: "Cleaning", desc: "Deep sanitization" },
  { name: "Carpentry", desc: "Woodwork & repairs" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="container-main">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161824] text-emerald-400 text-xs font-medium mb-6">
              <Shield className="w-3.5 h-3.5" />
              <span>Worker-Owned Cooperative Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Fair local work.
              <br />
              <span className="text-emerald-400">Direct to workers.</span>
            </h1>

            <p className="mt-5 text-sm md:text-base text-zinc-400 leading-relaxed max-w-lg">
              Book verified local tradespeople in seconds. 90% of every payment
              goes directly to the worker who does the job.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/customer/book"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-full text-xs transition-all shadow-lg shadow-emerald-500/20"
              >
                <span>Book a service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center px-6 py-3 bg-[#161824] hover:bg-[#1f2232] text-zinc-300 hover:text-white rounded-full text-xs font-semibold transition-colors"
              >
                Join as worker
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 bg-[#0e0f15]">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Services Available
              </h2>
            </div>
            <Link
              href="/customer/ai-help"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181a26] text-xs font-semibold text-emerald-400 hover:bg-[#202334] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Help</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SERVICES.map((s) => (
              <Link
                key={s.name}
                href={`/customer/book?service=${encodeURIComponent(s.name)}`}
                className="bg-[#14151f] hover:bg-[#1a1c2a] rounded-2xl p-5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1c1e2b] flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 group-hover:bg-[#242738] mb-4 transition-colors">
                  <ServiceIcon name={s.name} className="w-5 h-5" />
                </div>
                <p className="font-bold text-xs text-white">{s.name}</p>
                <p className="text-[11px] text-zinc-500 mt-1">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="container-main">
          <div className="mb-10">
            <h2 className="text-2xl font-extrabold text-white">How it works</h2>
            <p className="text-xs text-zinc-400 mt-1">Simple dispatches with fair economics</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Customers */}
            <div className="bg-[#12131c] rounded-2xl p-6 md:p-8 space-y-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                For Customers
              </span>
              <div className="space-y-4">
                {[
                  { title: "Select or ask AI", desc: "Pick category directly or type your problem for AI guidance." },
                  { title: "Match nearby worker", desc: "Ranked by proximity, availability and verified rating." },
                  { title: "Track & confirm", desc: "Transparent price upfront. Rate worker on completion." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#1d1f2d] text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{item.title}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workers */}
            <div className="bg-[#12131c] rounded-2xl p-6 md:p-8 space-y-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                For Workers
              </span>
              <div className="space-y-4">
                {[
                  { title: "Register trade skills", desc: "Set skills, years of experience, and service radius." },
                  { title: "Receive direct jobs", desc: "Get matched with local customers without bidding wars." },
                  { title: "Earn 90% direct", desc: "Transparent automatic payout upon task completion." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{item.title}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cooperative Breakdown */}
      <section id="cooperative" className="py-16 bg-[#0e0f15]">
        <div className="container-main">
          <div className="max-w-md">
            <h2 className="text-xl font-extrabold text-white mb-1">
              Transparent Economics
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Payment allocation per ₹1,000 service booking:
            </p>

            <div className="bg-[#141520] rounded-2xl p-5 space-y-3">
              {[
                { label: "Worker Payout", amount: "₹900", share: "90%", color: "bg-emerald-500" },
                { label: "Welfare Fund", amount: "₹50", share: "5%", color: "bg-blue-500" },
                { label: "Training Fund", amount: "₹20", share: "2%", color: "bg-purple-500" },
                { label: "Cooperative Reserve", amount: "₹30", share: "3%", color: "bg-zinc-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-zinc-300 font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-zinc-500 text-[11px]">{item.share}</span>
                    <span className="font-bold text-white w-12 text-right">
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
      <footer className="py-10 bg-[#0b0c10]">
        <div className="container-main flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2 text-zinc-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">SevaConnect</span>
          </div>
          <p>SIH 2026 · Problem Statement 26089</p>
        </div>
      </footer>
    </>
  );
}
