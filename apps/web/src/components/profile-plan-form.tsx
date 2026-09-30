"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Messages } from "@/lib/i18n";

type Goal = "communication" | "toeic" | "ielts";
const minuteOptions = [10, 15, 20, 30, 45, 60];

export function ProfilePlanForm({ goal: initialGoal, minutesPerDay, messages }: { goal: Goal; minutesPerDay: number; messages: Messages }) {
  const copy = messages.profilePage;
  const router = useRouter();
  const [goal, setGoal] = useState<Goal>(initialGoal);
  const [minutes, setMinutes] = useState(minutesPerDay);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const goals: Array<[Goal, string]> = [["communication", messages.onboarding.goalCommunication], ["toeic", messages.onboarding.goalToeic], ["ielts", messages.onboarding.goalIelts]];
  const options = minuteOptions.includes(minutesPerDay) ? minuteOptions : [...minuteOptions, minutesPerDay].sort((a, b) => a - b);

  async function save() {
    setState("saving");
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ goal, minutesPerDay: minutes }) });
      if (!response.ok) throw new Error("save failed");
      setState("saved");
      router.refresh();
    } catch {
      setState("failed");
    }
  }

  const pill = (active: boolean) => `rounded-ui border px-4 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${active ? "border-brand bg-brand-soft text-brand-deep" : "border-line hover:border-brand"}`;
  return <div>
    <fieldset><legend className="text-sm font-bold text-muted">{copy.goal}</legend><div className="mt-2 flex flex-wrap gap-2">{goals.map(([id, label]) => <button type="button" key={id} aria-pressed={goal === id} className={pill(goal === id)} onClick={() => { setGoal(id); setState("idle"); }}>{label}</button>)}</div></fieldset>
    <fieldset className="mt-5"><legend className="text-sm font-bold text-muted">{copy.minutes}</legend><div className="mt-2 flex flex-wrap gap-2">{options.map((value) => <button type="button" key={value} aria-pressed={minutes === value} className={pill(minutes === value)} onClick={() => { setMinutes(value); setState("idle"); }}>{value} {messages.onboarding.minutes}</button>)}</div></fieldset>
    <div className="mt-6 flex items-center gap-4"><Button disabled={state === "saving"} onClick={() => void save()}>{state === "saving" ? copy.saving : copy.save}</Button>{state === "saved" && <p className="text-sm font-bold text-brand" role="status">{copy.saved}</p>}{state === "failed" && <p className="text-sm font-bold text-accent-terra" role="alert">{copy.saveFailed}</p>}</div>
  </div>;
}
