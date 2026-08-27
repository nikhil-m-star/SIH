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
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Worker Profile</h1>
        <p className="text-xs text-zinc-400 mt-1">Configure trade skills, experience and coordinates</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs bg-[#12131d] p-6 rounded-2xl">
        <div className="space-y-1">
          <label className="block text-zinc-300 font-semibold">
            Bio & Trade Summary
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-[#1a1c29] rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:bg-[#202334]"
            placeholder="Specializations, equipment, trade certifications..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-zinc-300 font-semibold">
            Services & Experience
          </label>
          <div className="space-y-2">
            {services.map((service) => {
              const skill = skills.find((s) => s.serviceId === service.id);
              return (
                <div
                  key={service.id}
                  className={`rounded-xl p-3.5 transition-colors ${
                    skill ? "bg-[#1f2234]" : "bg-[#181a26]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!skill}
                        onChange={() => toggleSkill(service.id)}
                        className="accent-emerald-500 rounded"
                      />
                      <ServiceIcon name={service.name} className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white text-xs">
                        {service.name}
                      </span>
                    </label>
                    {skill && (
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-[11px]">Years:</span>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={skill.experienceYears}
                          onChange={(e) =>
                            updateExperience(service.id, parseInt(e.target.value) || 0)
                          }
                          className="w-14 bg-[#101118] rounded-lg px-2 py-1 text-center text-white text-xs font-mono font-bold focus:outline-none"
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
          <div className="space-y-1">
            <label className="block text-zinc-300 font-semibold">
              Latitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              className="w-full bg-[#1a1c29] rounded-xl px-4 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:bg-[#202334]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-zinc-300 font-semibold">
              Longitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              className="w-full bg-[#1a1c29] rounded-xl px-4 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:bg-[#202334]"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}
        {saved && (
          <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Profile saved successfully</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full text-xs font-bold disabled:opacity-50 transition-all shadow-md"
        >
          {loading ? "Saving profile..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}
