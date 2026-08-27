"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateWorkerProfile } from "@/lib/actions";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Check } from "lucide-react";

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
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Worker Profile</h1>
        <p className="text-base text-neutral-400 mt-2">Configure trade skills, experience and location</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-sm bg-[#0e0e0e] p-8 md:p-10 rounded-3xl">
        <div className="space-y-2">
          <label className="block text-neutral-200 font-bold">
            Bio & Trade Summary
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full bg-[#181818] rounded-2xl px-5 py-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:bg-[#202020]"
            placeholder="Specializations, tools, trade background..."
          />
        </div>

        <div className="space-y-3">
          <label className="block text-neutral-200 font-bold">
            Services & Experience
          </label>
          <div className="space-y-3">
            {services.map((service) => {
              const skill = skills.find((s) => s.serviceId === service.id);
              return (
                <div
                  key={service.id}
                  className={`rounded-2xl p-5 transition-colors ${
                    skill ? "bg-[#1c1c1c]" : "bg-[#141414]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!skill}
                        onChange={() => toggleSkill(service.id)}
                        className="accent-emerald-400 w-5 h-5 rounded"
                      />
                      <ServiceIcon name={service.name} className="w-5 h-5 text-emerald-400" />
                      <span className="font-extrabold text-white text-base">
                        {service.name}
                      </span>
                    </label>
                    {skill && (
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-400 text-xs font-semibold">Years:</span>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={skill.experienceYears}
                          onChange={(e) =>
                            updateExperience(service.id, parseInt(e.target.value) || 0)
                          }
                          className="w-16 bg-black rounded-xl px-3 py-1.5 text-center text-white text-sm font-mono font-bold focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-neutral-200 font-bold">
              Latitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              className="w-full bg-[#181818] rounded-2xl px-5 py-3.5 text-sm text-white font-mono focus:outline-none focus:bg-[#202020]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-neutral-200 font-bold">
              Longitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              className="w-full bg-[#181818] rounded-2xl px-5 py-3.5 text-sm text-white font-mono focus:outline-none focus:bg-[#202020]"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}
        {saved && (
          <p className="text-emerald-400 text-sm font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Profile saved successfully</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-8 py-4 bg-emerald-400 hover:bg-emerald-300 text-black rounded-full text-base font-black disabled:opacity-50 transition-all"
        >
          {loading ? "Saving profile..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
