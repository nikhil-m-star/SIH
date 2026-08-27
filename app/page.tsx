import Link from "next/link";
import Navbar from "@/components/Navbar";

const SERVICES = [
  { name: "Plumbing", icon: "🔧", desc: "Pipes, leaks, fixtures" },
  { name: "Electrical", icon: "⚡", desc: "Wiring, switches, faults" },
  { name: "AC Repair", icon: "❄️", desc: "Cooling, maintenance" },
  { name: "Cleaning", icon: "🧹", desc: "Deep clean, sanitization" },
  { name: "Carpentry", icon: "🪚", desc: "Furniture, woodwork" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-white">
        <div className="container-main py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
              Local services.
              <br />
              Fair work.
              <br />
              <span className="text-[var(--color-primary)]">
                Stronger communities.
              </span>
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-lg">
              A cooperative-powered service platform connecting customers with
              trusted local workers. Transparent pay, verified professionals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/customer/book"
                className="inline-flex items-center px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-light)] transition-colors"
              >
                Find a Service
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Join as a Worker
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="container-main py-12">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Available Services
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {SERVICES.map((s) => (
              <div
                key={s.name}
                className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-[var(--color-primary)] hover:shadow-sm transition-all"
              >
                <span className="text-3xl">{s.icon}</span>
                <p className="mt-2 font-medium text-sm text-gray-900">
                  {s.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white">
        <div className="container-main py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Customer */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-4">
                For Customers
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Choose a service",
                    desc: "Select from plumbing, electrical, cleaning, and more.",
                  },
                  {
                    step: "2",
                    title: "Find a worker",
                    desc: "Our matching system finds verified workers near you.",
                  },
                  {
                    step: "3",
                    title: "Book and pay",
                    desc: "Confirm your booking, track progress, and pay fairly.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Worker */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-4">
                For Workers
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Set your skills",
                    desc: "Create your profile with the services you offer.",
                  },
                  {
                    step: "2",
                    title: "Receive jobs",
                    desc: "Get matched with nearby customers who need your help.",
                  },
                  {
                    step: "3",
                    title: "Earn fairly",
                    desc: "Keep 90% of every payment. No middlemen fees.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Help */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="container-main py-12">
          <div className="max-w-lg">
            <h2 className="text-xl font-bold text-gray-900">
              Not sure what service you need?
            </h2>
            <p className="mt-2 text-gray-600 text-sm leading-relaxed">
              Describe your problem in plain language — our optional AI helper
              can identify the right service for you. No obligation, no pressure.
            </p>
            <Link
              href="/customer/ai-help"
              className="inline-flex items-center mt-4 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Try AI Help →
            </Link>
          </div>
        </div>
      </section>

      {/* Cooperative Model */}
      <section id="cooperative" className="bg-white">
        <div className="container-main py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Cooperative Model
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg">
            Every payment is transparently distributed. Workers keep the
            majority. The rest supports community welfare and training.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-md">
            <p className="text-sm font-medium text-gray-500 mb-4">
              Example: ₹1,000 customer payment
            </p>
            <div className="space-y-3">
              {[
                { label: "Worker", amount: "₹900", pct: "90%", color: "bg-[var(--color-primary)]" },
                { label: "Welfare Fund", amount: "₹50", pct: "5%", color: "bg-blue-500" },
                { label: "Training Fund", amount: "₹20", pct: "2%", color: "bg-purple-500" },
                { label: "Cooperative", amount: "₹30", pct: "3%", color: "bg-orange-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{item.pct}</span>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
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
      <footer className="bg-gray-900 text-gray-400">
        <div className="container-main py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--color-primary)] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-sm text-gray-300">SevaConnect</span>
          </div>
          <p className="text-xs">
            Built for SIH 2026 · Problem Statement 26089 · Cooperative-powered
            local services
          </p>
        </div>
      </footer>
    </>
  );
}
