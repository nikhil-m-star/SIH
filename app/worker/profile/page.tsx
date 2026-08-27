"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateWorkerProfile } from "@/lib/actions";
import { ServiceIcon } from "@/components/ServiceIcon";
import { User, Check } from "lucide-react";

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
  const [longitude, setLongitude] = useState(77.5946);
  const [skills, setSkills] = useState<
    { serviceId: string; experienceYears: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => setServices(data))
      .catch(console.error);

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
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Worker Profile</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Manage trade skills and location</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block text-zinc-300 font-medium mb-1">
            Bio & Trade Summary
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            placeholder="Experience, specialties, tools available..."
          />
        </div>

        <div>
          <label className="block text-zinc-300 font-medium mb-2">
            Services & Experience
          </label>
          <div className="space-y-2">
            {services.map((service) => {
              const skill = skills.find((s) => s.serviceId === service.id);
              return (
                <div
                  key={service.id}
                  className={`border rounded-lg p-3 transition-colors ${
                    skill
                      ? "border-emerald-500/50 bg-zinc-900"
                      : "border-zinc-800/80 bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!skill}
                        onChange={() => toggleSkill(service.id)}
                        className="accent-emerald-500 rounded"
                      />
                      <ServiceIcon name={service.name} className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-medium text-zinc-200">
                        {service.name}
                      </span>
                    </label>
                    {skill && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500 text-[11px]">Years:</span>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={skill.experienceYears}
                          onChange={(e) =>
                            updateExperience(service.id, parseInt(e.target.value) || 0)
                          }
                          className="w-14 bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 text-center text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
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
            <label className="block text-zinc-300 font-medium mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
        {saved && (
          <p className="text-emerald-400 text-xs flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Profile updated successfully</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
