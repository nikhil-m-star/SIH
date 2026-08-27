import React from "react";
import {
  Wrench,
  Zap,
  Wind,
  Sparkles,
  Hammer,
  HelpCircle,
} from "lucide-react";

export function ServiceIcon({
  name,
  className = "w-5 h-5",
}: {
  name?: string;
  className?: string;
}) {
  const normalized = (name || "").toLowerCase();

  if (normalized.includes("plumb")) {
    return <Wrench className={className} />;
  }
  if (normalized.includes("electr")) {
    return <Zap className={className} />;
  }
  if (normalized.includes("ac") || normalized.includes("air") || normalized.includes("cool")) {
    return <Wind className={className} />;
  }
  if (normalized.includes("clean")) {
    return <Sparkles className={className} />;
  }
  if (normalized.includes("carpen") || normalized.includes("wood")) {
    return <Hammer className={className} />;
  }

  return <HelpCircle className={className} />;
}
