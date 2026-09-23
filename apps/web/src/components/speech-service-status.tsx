"use client";

import { useEffect, useState } from "react";

type Copy = { serviceChecking: string; serviceReady: string; serviceOffline: string; serviceNotConfigured: string };
type Status = "checking" | "ready" | "offline" | "not-configured";
export function SpeechServiceStatus({ copy }: { copy: Copy }) {
  const [status, setStatus] = useState<Status>("checking");
  useEffect(() => { let active = true; fetch("/api/pronunciation/speech/health", { cache: "no-store" }).then(async (response) => response.json() as Promise<{ configured: boolean; reachable: boolean }>).then((value) => { if (active) setStatus(!value.configured ? "not-configured" : value.reachable ? "ready" : "offline"); }).catch(() => { if (active) setStatus("offline"); }); return () => { active = false; }; }, []);
  const label = status === "checking" ? copy.serviceChecking : status === "ready" ? copy.serviceReady : status === "not-configured" ? copy.serviceNotConfigured : copy.serviceOffline;
  const color = status === "ready" ? "bg-green-700" : status === "checking" ? "bg-ochre" : "bg-muted";
  return <p className="mt-4 flex items-center gap-2 text-sm text-muted" role="status"><span className={`size-2 rounded-full ${color}`} />{label}</p>;
}
