"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateWorkerProfile } from "@/lib/actions";

interface Service {
  id: string;
  name: string;
  icon: string;
}

interface WorkerProfileData {
  bio: string;
  latitude: number | null;
  longitude: number | null;
  skills: { serviceId: string; experienceYears: number }[];
}

export default function WorkerProfilePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<WorkerProfileData | null>(null);
  const [bio, setBio] = useState("");
  const [latitude, setLatitude] = useState<number>(12.9716);
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [skills, setSkills] = useState<
    { serviceId: string; experienceYears: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch services
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => setServices(data))
      .catch(console.error);

    // Fetch current profile
    fetch("/api/worker/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setProfile(data);
          setBio(data.bio || "");
          if (data.latitude) setLatitude(data.latitude);
          if (data.longitude) setLongitude(data.longitude);
          setSkills(
            data.skills?.map((s: { serviceId: string; experienceYears: number }) => ({
              serviceId: s.serviceId,
              experienceYears: s.experienceYears,
            })) || []
          );
        }
      })
      .catch(console.error);

    // Try geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      });
    }
  }, []);

  function toggleSkill(serviceId: string) {
    setSkills((prev) => {
      const existing = prev.find((s) => s.serviceId === serviceId);
      if (existing) {
        return prev.filter((s) => s.serviceId !== serviceId);
      }
      return [...prev, { serviceId, experienceYears: 1 }];
    });
  }

  function updateExperience(serviceId: string, years: number) {
    setSkills((prev) =>
      prev.map((s) =>
        s.serviceId === serviceId ? { ...s, experienceYears: years } : s
      )
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      await updateWorkerProfile({ bio, latitude, longitude, skills });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      <form onSubmit={handleSave} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="Tell customers about your experience and skills..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills & Services
          </label>
          <div className="space-y-2">
            {services.map((service) => {
              const skill = skills.find((s) => s.serviceId === service.id);
              return (
                <div
                  key={service.id}
                  className={`border rounded-lg p-3 transition-colors ${
                    skill
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!skill}
                        onChange={() => toggleSkill(service.id)}
                        className="accent-[var(--color-primary)]"
                      />
                      <span className="text-sm font-medium">
                        {service.icon} {service.name}
                      </span>
                    </label>
                    {skill && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Years:</label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={skill.experienceYears}
                          onChange={(e) =>
                            updateExperience(service.id, parseInt(e.target.value) || 0)
                          }
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {saved && (
          <p className="text-sm text-green-600">Profile saved successfully!</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
