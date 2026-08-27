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
        <h1 className="text-xl font-bold text-white tracking-tight">Book Service</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Step-by-step verified worker dispatch</p>
      </div>

      {/* Progress tracker */}
      <div className="flex items-center gap-2">
        {["service", "details", "workers", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                step === s
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : ["service", "details", "workers", "confirm"].indexOf(step) > i
                    ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                    : "bg-zinc-900 text-zinc-600 border-zinc-800"
              }`}
            >
              {["service", "details", "workers", "confirm"].indexOf(step) > i ? (
                <Check className="w-3 h-3" />
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && <div className="w-6 h-[1px] bg-zinc-800" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Select Service */}
      {step === "service" && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
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
                className={`bg-zinc-900/60 border rounded-xl p-4 text-left transition-all group ${
                  selectedService === service.id
                    ? "border-emerald-500 bg-zinc-900"
                    : "border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 mb-3 transition-colors">
                  <ServiceIcon name={service.name} className="w-4 h-4" />
                </div>
                <p className="font-medium text-xs text-zinc-200">{service.name}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                  From ₹{service.basePrice}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === "details" && (
        <div className="space-y-4 max-w-lg">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            2. Problem & Location
          </h2>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              placeholder="Brief description of the work needed..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Service Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              placeholder="Flat / House number, street name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Preferred Date & Time
            </label>
            <input
              type="datetime-local"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setStep("service")}
              className="px-3.5 py-2 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
            >
              Back
            </button>
            <button
              onClick={handleFindWorkers}
              disabled={!preferredTime || loading}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Matching..." : "Find Workers"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Match Worker */}
      {step === "workers" && (
        <div className="space-y-4 max-w-lg">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            3. Available Matches
          </h2>

          {workers.length === 0 ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-8 text-center text-xs text-zinc-500">
              <p>No active workers available in this radius.</p>
              <button
                onClick={() => setStep("details")}
                className="mt-2 text-emerald-400 hover:underline"
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
                  className={`w-full bg-zinc-900/60 border rounded-xl p-4 text-left transition-all ${
                    selectedWorker?.id === worker.id
                      ? "border-emerald-500 bg-zinc-900"
                      : "border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-white">
                        {worker.userName}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                        <span className="flex items-center gap-1 text-amber-400">
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
                      <p className="font-mono font-bold text-xs text-white">
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
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === "confirm" && selectedWorker && (
        <div className="space-y-4 max-w-lg">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            4. Confirm Booking
          </h2>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Service</span>
              <span className="text-zinc-200">
                {services.find((s) => s.id === selectedService)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Assigned Worker</span>
              <span className="text-zinc-200">{selectedWorker.userName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Scheduled Time</span>
              <span className="text-zinc-200">
                {new Date(preferredTime).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Arrival Estimate</span>
              <span className="text-zinc-200">{selectedWorker.estimatedArrival}</span>
            </div>
            <div className="border-t border-zinc-800 pt-2 flex justify-between">
              <span className="font-medium text-zinc-300">Estimated Total</span>
              <span className="font-mono font-bold text-sm text-emerald-400">
                ₹{selectedWorker.estimatedPrice}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep("workers")}
              className="px-3.5 py-2 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
            >
              Back
            </button>
            <button
              onClick={handleBooking}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookServicePage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs text-zinc-500">Loading booking...</div>}>
      <BookServiceContent />
    </Suspense>
  );
}
