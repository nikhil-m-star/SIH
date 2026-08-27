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
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Book Service
        </h1>
        <p className="text-base text-neutral-400 mt-2">
          Direct dispatch with transparent 90% worker payout
        </p>
      </div>

      {/* Minimal Stepper */}
      <div className="flex items-center gap-3 bg-[#0e0e0e] p-3 rounded-full w-fit">
        {["service", "details", "workers", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                step === s
                  ? "bg-emerald-400 text-black shadow-md"
                  : ["service", "details", "workers", "confirm"].indexOf(step) > i
                    ? "bg-[#1c1c1c] text-emerald-400"
                    : "bg-[#141414] text-neutral-600"
              }`}
            >
              {["service", "details", "workers", "confirm"].indexOf(step) > i ? (
                <Check className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-5 bg-red-950/40 rounded-3xl text-sm font-semibold text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Select Service */}
      {step === "service" && (
        <div className="space-y-6">
          <h2 className="text-sm font-extrabold text-neutral-400 uppercase tracking-wider">
            1. Select Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service.id);
                  setStep("details");
                }}
                className={`rounded-3xl p-8 text-left transition-all group ${
                  selectedService === service.id
                    ? "bg-[#1a1a1a]"
                    : "bg-[#0e0e0e] hover:bg-[#161616]"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1c1c1c] flex items-center justify-center text-neutral-200 group-hover:text-emerald-400 mb-6 transition-colors">
                  <ServiceIcon name={service.name} className="w-7 h-7" />
                </div>
                <p className="font-extrabold text-xl text-white">{service.name}</p>
                <p className="text-sm text-neutral-400 mt-1 font-mono font-semibold">
                  From ₹{service.basePrice}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === "details" && (
        <div className="space-y-6 max-w-xl bg-[#0e0e0e] p-8 md:p-10 rounded-3xl">
          <h2 className="text-sm font-extrabold text-neutral-400 uppercase tracking-wider">
            2. Problem & Location
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-neutral-200">
              Problem Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-[#181818] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:bg-[#202020]"
              placeholder="Brief description of work required..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-neutral-200">
              Service Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#181818] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:bg-[#202020]"
              placeholder="House/flat number, street name, area"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-neutral-200">
              Preferred Date & Time
            </label>
            <input
              type="datetime-local"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full bg-[#181818] rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:bg-[#202020]"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setStep("service")}
              className="px-6 py-3.5 bg-[#181818] hover:bg-[#242424] rounded-full text-sm font-bold text-neutral-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleFindWorkers}
              disabled={!preferredTime || loading}
              className="flex-1 px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-sm font-black disabled:opacity-50 transition-all"
            >
              {loading ? "Matching workers..." : "Find matching workers"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Match Worker */}
      {step === "workers" && (
        <div className="space-y-6 max-w-xl">
          <h2 className="text-sm font-extrabold text-neutral-400 uppercase tracking-wider">
            3. Available Matches
          </h2>

          {workers.length === 0 ? (
            <div className="bg-[#0e0e0e] rounded-3xl p-10 text-center text-sm text-neutral-400">
              <p className="font-semibold">No active verified workers available in this radius right now.</p>
              <button
                onClick={() => setStep("details")}
                className="mt-4 text-emerald-400 font-bold hover:underline"
              >
                Change time or location
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {workers.map((worker) => (
                <button
                  key={worker.id}
                  onClick={() => {
                    setSelectedWorker(worker);
                    setStep("confirm");
                  }}
                  className={`w-full rounded-3xl p-7 text-left transition-all ${
                    selectedWorker?.id === worker.id
                      ? "bg-[#1c1c1c]"
                      : "bg-[#0e0e0e] hover:bg-[#161616]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-lg text-white">
                        {worker.userName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-neutral-400 mt-2">
                        <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <span>{worker.rating.toFixed(1)}</span>
                        </span>
                        <span>·</span>
                        <span className="font-semibold">{worker.completedJobs} jobs</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-neutral-400" />
                          <span>{worker.distance} km</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-black text-2xl text-emerald-400">
                        ₹{worker.estimatedPrice}
                      </p>
                      <p className="text-xs text-neutral-400 mt-1 font-medium">
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
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white font-bold mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to details</span>
          </button>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === "confirm" && selectedWorker && (
        <div className="space-y-6 max-w-xl bg-[#0e0e0e] p-8 md:p-10 rounded-3xl">
          <h2 className="text-sm font-extrabold text-neutral-400 uppercase tracking-wider">
            4. Confirm Dispatch
          </h2>

          <div className="space-y-4 text-base">
            <div className="flex justify-between py-1">
              <span className="text-neutral-400">Service</span>
              <span className="font-extrabold text-white text-lg">
                {services.find((s) => s.id === selectedService)?.name}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-400">Worker</span>
              <span className="font-extrabold text-white text-lg">{selectedWorker.userName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-400">Scheduled Time</span>
              <span className="text-neutral-200 font-medium">
                {new Date(preferredTime).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-400">Arrival Estimate</span>
              <span className="text-neutral-200 font-medium">{selectedWorker.estimatedArrival}</span>
            </div>
            <div className="pt-4 border-t border-[#1c1c1c] flex justify-between items-center">
              <span className="font-extrabold text-white text-lg">Total Estimated Price</span>
              <span className="font-mono font-black text-3xl text-emerald-400">
                ₹{selectedWorker.estimatedPrice}
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setStep("workers")}
              className="px-6 py-3.5 bg-[#181818] hover:bg-[#242424] rounded-full text-sm font-bold text-neutral-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleBooking}
              disabled={loading}
              className="flex-1 px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-sm font-black disabled:opacity-50 transition-all"
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
    <Suspense fallback={<div className="p-8 text-base text-neutral-400 font-medium">Loading booking flow...</div>}>
      <BookServiceContent />
    </Suspense>
  );
}
