"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBooking } from "@/lib/actions";

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
  const preselectedUrgency = searchParams.get("urgency");
  const aiUsed = searchParams.get("aiUsed") === "true";

  const [step, setStep] = useState<"service" | "details" | "workers" | "confirm">(
    preselectedServiceId ? "details" : "service"
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
      .then((data) => setServices(data))
      .catch(console.error);

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {} // Ignore errors, use default
      );
    }
  }, []);

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
      setError("Failed to find workers. Please try again.");
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
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Book a Service</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mt-4 mb-6">
        {["service", "details", "workers", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s
                  ? "bg-[var(--color-primary)] text-white"
                  : ["service", "details", "workers", "confirm"].indexOf(step) > i
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            {i < 3 && (
              <div className="w-8 h-0.5 bg-gray-200" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Service Selection */}
      {step === "service" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Select a service
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service.id);
                  setStep("details");
                }}
                className={`bg-white border rounded-xl p-4 text-left transition-all ${
                  selectedService === service.id
                    ? "border-[var(--color-primary)] shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{service.icon}</span>
                <p className="mt-2 font-medium text-sm">{service.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  From ₹{service.basePrice}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === "details" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Tell us more
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe the problem
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="E.g., Water is leaking from the kitchen sink..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              placeholder="Your address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred time
            </label>
            <input
              type="datetime-local"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("service")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleFindWorkers}
              disabled={!preferredTime || loading}
              className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] disabled:opacity-50 transition-colors"
            >
              {loading ? "Finding workers..." : "Find Workers"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Worker Selection */}
      {step === "workers" && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Available Workers
          </h2>
          {workers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-500">
                No workers available for this service right now.
              </p>
              <button
                onClick={() => setStep("details")}
                className="mt-3 text-sm text-[var(--color-primary)] hover:underline"
              >
                Try different time
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
                  className={`w-full bg-white border rounded-xl p-4 text-left transition-all hover:shadow-sm ${
                    selectedWorker?.id === worker.id
                      ? "border-[var(--color-primary)]"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {worker.userName}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          ⭐ {worker.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {worker.completedJobs} jobs
                        </span>
                        <span className="text-xs text-gray-500">
                          📍 {worker.distance} km
                        </span>
                      </div>
                      {worker.bio && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {worker.bio}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{worker.estimatedPrice}
                      </p>
                      <p className="text-xs text-gray-500">
                        ~{worker.estimatedArrival}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setStep("details")}
            className="mt-3 text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to details
          </button>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === "confirm" && selectedWorker && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Confirm Booking
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-medium">
                {services.find((s) => s.id === selectedService)?.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Worker</span>
              <span className="font-medium">{selectedWorker.userName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Preferred time</span>
              <span className="font-medium">
                {new Date(preferredTime).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Est. arrival</span>
              <span className="font-medium">{selectedWorker.estimatedArrival}</span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">Estimated Price</span>
              <span className="font-bold text-lg text-gray-900">
                ₹{selectedWorker.estimatedPrice}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setStep("workers")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleBooking}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] disabled:opacity-50 transition-colors"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookServicePage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500 text-sm">Loading booking...</div>}>
      <BookServiceContent />
    </Suspense>
  );
}
