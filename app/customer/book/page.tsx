"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBooking } from "@/lib/actions";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Star, MapPin, Check, ArrowLeft } from "lucide-react";

interface Service {
  id: string;
  name: string;
  icon: string;
  basePrice: number;
}

interface MatchedWorker {
  id: string;
  userId: string;
  userName: string;
  bio: string | null;
  rating: number;
  completedJobs: number;
  distance: number;
  estimatedPrice: number;
  estimatedArrival: string;
}

function BookServiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("serviceId");
  const preselectedServiceName = searchParams.get("service");
  const preselectedUrgency = searchParams.get("urgency");
  const aiUsed = searchParams.get("aiUsed") === "true";

  const [step, setStep] = useState<"service" | "details" | "workers" | "confirm">(
    preselectedServiceId || preselectedServiceName ? "details" : "service"
  );
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState(preselectedServiceId || "");
  const [description, setDescription] = useState(searchParams.get("description") || "");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(12.9716);
  const [longitude, setLongitude] = useState(77.5946);
  const [preferredTime, setPreferredTime] = useState("");
  const [workers, setWorkers] = useState<MatchedWorker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<MatchedWorker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urgency] = useState(preselectedUrgency || "MEDIUM");

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data: Service[]) => {
        setServices(data);
        if (preselectedServiceName && !selectedService) {
          const match = data.find(
            (s) => s.name.toLowerCase() === preselectedServiceName.toLowerCase()
          );
          if (match) setSelectedService(match.id);
        }
      })
      .catch(console.error);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {}
      );
    }
  }, [preselectedServiceName, selectedService]);

  async function handleFindWorkers() {
    if (!selectedService || !preferredTime) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/workers/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService,
          latitude,
          longitude,
          preferredTime,
        }),
      });
      const data = await res.json();
      setWorkers(data);
      setStep("workers");
    } catch {
      setError("Worker matching failed. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking() {
    if (!selectedWorker) return;
    setLoading(true);
    setError("");

    try {
      const result = await createBooking({
        serviceId: selectedService,
        description: description || "Service requested",
        latitude,
        longitude,
        address,
        preferredTime,
        workerId: selectedWorker.userId,
        estimatedPrice: selectedWorker.estimatedPrice,
        urgency,
        aiUsed,
      });

      if (result.success) {
        router.push(`/customer/bookings/${result.bookingId}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking creation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Book a Service</h1>
        <p className="text-xs text-zinc-400 mt-1">Direct dispatch with transparent worker payout</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 bg-[#12131d] p-2 rounded-2xl w-fit">
        {["service", "details", "workers", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? "bg-emerald-500 text-zinc-950 shadow-md"
                  : ["service", "details", "workers", "confirm"].indexOf(step) > i
                    ? "bg-[#1f2232] text-emerald-400"
                    : "bg-[#181926] text-zinc-600"
              }`}
            >
              {["service", "details", "workers", "confirm"].indexOf(step) > i ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                i + 1
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-950/30 rounded-2xl text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Select Service */}
      {step === "service" && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            1. Select Service Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service.id);
                  setStep("details");
                }}
                className={`rounded-2xl p-5 text-left transition-all group ${
                  selectedService === service.id
                    ? "bg-[#1f2336]"
                    : "bg-[#12131d] hover:bg-[#191b28]"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#1c1e2b] flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 mb-4 transition-colors">
                  <ServiceIcon name={service.name} className="w-5 h-5" />
                </div>
                <p className="font-bold text-xs text-white">{service.name}</p>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                  From ₹{service.basePrice}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === "details" && (
        <div className="space-y-4 max-w-lg bg-[#12131d] p-6 rounded-2xl">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            2. Problem & Location Details
          </h2>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-300">
              Problem Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#1a1c29] rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:bg-[#202334]"
              placeholder="Brief description of work required..."
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-300">
              Service Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#1a1c29] rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:bg-[#202334]"
              placeholder="Building, street, landmark"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-300">
              Preferred Date & Time
            </label>
            <input
              type="datetime-local"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full bg-[#1a1c29] rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:bg-[#202334]"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="flex gap-2 pt-3">
            <button
              onClick={() => setStep("service")}
              className="px-4 py-2.5 bg-[#1a1c29] hover:bg-[#222537] rounded-full text-xs font-semibold text-zinc-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleFindWorkers}
              disabled={!preferredTime || loading}
              className="flex-1 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full text-xs font-bold disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? "Matching workers..." : "Find matching workers"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Match Worker */}
      {step === "workers" && (
        <div className="space-y-4 max-w-lg">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            3. Available Matches
          </h2>

          {workers.length === 0 ? (
            <div className="bg-[#12131d] rounded-2xl p-8 text-center text-xs text-zinc-500">
              <p>No active verified workers available in this radius right now.</p>
              <button
                onClick={() => setStep("details")}
                className="mt-3 text-emerald-400 font-semibold hover:underline"
              >
                Change time or location
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {workers.map((worker) => (
                <button
                  key={worker.id}
                  onClick={() => {
                    setSelectedWorker(worker);
                    setStep("confirm");
                  }}
                  className={`w-full rounded-2xl p-5 text-left transition-all ${
                    selectedWorker?.id === worker.id
                      ? "bg-[#1f2336]"
                      : "bg-[#12131d] hover:bg-[#181a27]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-white">
                        {worker.userName}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{worker.rating.toFixed(1)}</span>
                        </span>
                        <span>·</span>
                        <span>{worker.completedJobs} jobs</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{worker.distance} km</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-extrabold text-sm text-emerald-400">
                        ₹{worker.estimatedPrice}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        ETA: {worker.estimatedArrival}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setStep("details")}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 font-semibold mt-2"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to details</span>
          </button>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === "confirm" && selectedWorker && (
        <div className="space-y-4 max-w-lg bg-[#12131d] p-6 rounded-2xl">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            4. Confirm Dispatch
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Service</span>
              <span className="font-semibold text-white">
                {services.find((s) => s.id === selectedService)?.name}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Worker</span>
              <span className="font-semibold text-white">{selectedWorker.userName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Scheduled Time</span>
              <span className="text-zinc-200">
                {new Date(preferredTime).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Arrival Estimate</span>
              <span className="text-zinc-200">{selectedWorker.estimatedArrival}</span>
            </div>
            <div className="pt-3 border-t border-[#1e202d] flex justify-between items-center">
              <span className="font-bold text-zinc-200">Total Price</span>
              <span className="font-mono font-extrabold text-base text-emerald-400">
                ₹{selectedWorker.estimatedPrice}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              onClick={() => setStep("workers")}
              className="px-4 py-2.5 bg-[#1a1c29] hover:bg-[#222537] rounded-full text-xs font-semibold text-zinc-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleBooking}
              disabled={loading}
              className="flex-1 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full text-xs font-bold disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? "Confirming dispatch..." : "Confirm dispatch"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookServicePage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs text-zinc-500">Loading booking flow...</div>}>
      <BookServiceContent />
    </Suspense>
  );
}
