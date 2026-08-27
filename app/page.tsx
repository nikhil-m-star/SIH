import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ArrowRight, Sparkles } from "lucide-react";

const SERVICES = [
  { name: "Plumbing", desc: "Pipes & water fixtures" },
  { name: "Electrical", desc: "Wiring & power circuits" },
  { name: "AC Repair", desc: "Cooling & air systems" },
  { name: "Cleaning", desc: "Deep sanitization" },
  { name: "Carpentry", desc: "Woodwork & repairs" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-28 md:pt-32 md:pb-40 bg-black">
        <div className="container-main">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-[1.04]">
              Fair local work.
              <br />
              <span className="text-emerald-400">Direct to workers.</span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-neutral-400 leading-relaxed max-w-xl">
              Book verified local tradespeople in seconds. 90% of every payment
              goes directly to the worker.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/customer/book"
                className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold rounded-full text-base transition-all"
              >
                <span>Book a service</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-base font-bold transition-colors"
              >
                Join as worker
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-24 bg-[#080808]">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Services
            </h2>
            <Link
              href="/customer/ai-help"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-sm font-bold text-emerald-400 hover:bg-neutral-800 transition-colors w-fit"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Diagnosis</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {SERVICES.map((s) => (
              <Link
                key={s.name}
                href={`/customer/book?service=${encodeURIComponent(s.name)}`}
                className="bg-[#0f0f0f] hover:bg-[#171717] rounded-3xl p-7 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-neutral-300 group-hover:text-emerald-400 mb-6 transition-colors">
                  <ServiceIcon name={s.name} className="w-6 h-6" />
                </div>
                <p className="font-extrabold text-xl text-white">{s.name}</p>
                <p className="text-sm text-neutral-400 mt-2">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-28 bg-black">
        <div className="container-main">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-16">How It Works</h2>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Customers */}
            <div className="bg-[#0a0a0a] rounded-3xl p-8 sm:p-12 space-y-8">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                Customers
              </span>
              <div className="space-y-6">
                {[
                  { title: "Select or ask AI", desc: "Pick category directly or type what needs fixing." },
                  { title: "Match nearby worker", desc: "Ranked by proximity, availability and verified rating." },
                  { title: "Track & rate", desc: "Upfront price and direct post-job rating." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <span className="text-lg font-bold text-neutral-500 font-mono">0{i + 1}</span>
                    <div>
                      <p className="text-lg font-bold text-white">{item.title}</p>
                      <p className="text-sm text-neutral-400 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workers */}
            <div className="bg-[#0a0a0a] rounded-3xl p-8 sm:p-12 space-y-8">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                Workers
              </span>
              <div className="space-y-6">
                {[
                  { title: "Register trade skills", desc: "Set skills, experience years, and active location." },
                  { title: "Receive direct jobs", desc: "Accept nearby dispatches without bidding fees." },
                  { title: "Keep 90% direct payout", desc: "Automated payment settlement on completion." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <span className="text-lg font-bold text-emerald-400/60 font-mono">0{i + 1}</span>
                    <div>
                      <p className="text-lg font-bold text-white">{item.title}</p>
                      <p className="text-sm text-neutral-400 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cooperative Breakdown */}
      <section id="cooperative" className="py-24 bg-[#080808]">
        <div className="container-main">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-3">
              Cooperative Economics
            </h2>
            <p className="text-base text-neutral-400 mb-10">
              Transparent distribution per ₹1,000 booking:
            </p>

            <div className="bg-[#0f0f0f] rounded-3xl p-8 space-y-5">
              {[
                { label: "Worker Payout", amount: "₹900", share: "90%", color: "bg-emerald-400" },
                { label: "Welfare Fund", amount: "₹50", share: "5%", color: "bg-blue-400" },
                { label: "Training Fund", amount: "₹20", share: "2%", color: "bg-purple-400" },
                { label: "Cooperative Reserve", amount: "₹30", share: "3%", color: "bg-neutral-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-neutral-200 font-semibold">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-5 font-mono">
                    <span className="text-neutral-500 text-sm">{item.share}</span>
                    <span className="font-extrabold text-lg text-white w-16 text-right">
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
      <footer className="py-16 bg-black">
        <div className="container-main flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-neutral-500">
          <span className="font-extrabold text-lg text-white">SevaConnect</span>
          <p>SIH 2026 · Problem Statement 26089 · Worker Cooperative</p>
        </div>
      </footer>
    </>
  );
}
