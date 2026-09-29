"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { LevelBadge } from "@/components/ui/level-badge";
import type { Messages } from "@/lib/i18n";

type Goal = "communication" | "toeic" | "ielts";
type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type PlacementQuestion = { id: string; level: Cefr; prompt: string; options: readonly [string, string, string] };
type Step = "goal" | "level" | "placement" | "minutes" | "done";

const levels: Cefr[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const minuteOptions = [10, 15, 20, 30, 45];

export function OnboardingWizard({ messages, questions }: { messages: Messages; questions: PlacementQuestion[] }) {
  const copy = messages.onboarding;
  const router = useRouter();
  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [selfLevel, setSelfLevel] = useState<Cefr | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [minutes, setMinutes] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [resultLevel, setResultLevel] = useState<string | null>(null);

  const goals: Array<{ id: Goal; label: string }> = [
    { id: "communication", label: copy.goalCommunication },
    { id: "toeic", label: copy.goalToeic },
    { id: "ielts", label: copy.goalIelts }
  ];

  async function submit(usePlacement: boolean) {
    setSubmitting(true);
    setError(false);
    const body = usePlacement
      ? { goal, minutesPerDay: minutes, placementAnswers: questions.map((q) => ({ questionId: q.id, selectedIndex: answers[q.id] ?? 0 })) }
      : { goal, minutesPerDay: minutes, selfLevel };
    try {
      const response = await fetch("/api/onboarding", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
      if (!response.ok) throw new Error("save failed");
      const data = await response.json();
      setResultLevel(data.profile?.cefrLevel ?? selfLevel);
      setStep("done");
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const usedPlacement = Object.keys(answers).length > 0 && !selfLevel;

  return <Section className="max-w-2xl">
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{copy.title}</h1>
    <p className="mt-4 leading-7 text-muted">{copy.description}</p>

    {step === "goal" && <Card className="mt-8">
      <h2 className="font-serif text-2xl font-bold">{copy.goalStep}</h2>
      <div className="mt-5 grid gap-3">{goals.map((item) => <button key={item.id} onClick={() => setGoal(item.id)} className={`rounded-ui border p-4 text-left font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${goal === item.id ? "border-brand bg-brand-soft text-brand-deep" : "border-line hover:border-brand"}`}>{item.label}</button>)}</div>
      <div className="mt-6 flex justify-end"><Button disabled={!goal} onClick={() => setStep("level")}>{copy.next}</Button></div>
    </Card>}

    {step === "level" && <Card className="mt-8">
      <h2 className="font-serif text-2xl font-bold">{copy.levelStep}</h2>
      <p className="mt-2 text-sm text-muted">{copy.levelSelfHint}</p>
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">{levels.map((level) => <button key={level} onClick={() => setSelfLevel(level)} className={`rounded-ui border px-3 py-4 font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${selfLevel === level ? "border-brand bg-brand-soft text-brand-deep" : "border-line hover:border-brand"}`}>{level}</button>)}</div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setStep("goal")}>{copy.back}</Button>
        <div className="flex flex-wrap gap-3">
          <Button variant="quiet" onClick={() => { setSelfLevel(null); setAnswers({}); setQuestionIndex(0); setStep("placement"); }}>{copy.takePlacement}</Button>
          <Button disabled={!selfLevel} onClick={() => setStep("minutes")}>{copy.next}</Button>
        </div>
      </div>
    </Card>}

    {step === "placement" && (() => {
      const question = questions[questionIndex];
      const total = questions.length;
      const selected = answers[question.id];
      const isLast = questionIndex === total - 1;
      return <Card className="mt-8">
        <div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">{copy.placementTitle}</h2><LevelBadge>{question.level}</LevelBadge></div>
        <p className="mt-2 text-sm text-muted">{copy.placementIntro}</p>
        <p className="mt-4 text-sm font-bold text-muted">{copy.placementProgress.replace("{current}", String(questionIndex + 1)).replace("{total}", String(total))}</p>
        <p className="mt-4 text-lg font-bold">{question.prompt}</p>
        <div className="mt-4 grid gap-3">{question.options.map((option, index) => <button key={index} onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: index }))} className={`rounded-ui border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${selected === index ? "border-brand bg-brand-soft text-brand-deep" : "border-line hover:border-brand"}`}>{option}</button>)}</div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => questionIndex === 0 ? setStep("level") : setQuestionIndex((i) => i - 1)}>{copy.back}</Button>
          {isLast
            ? <Button disabled={selected === undefined} onClick={() => setStep("minutes")}>{copy.next}</Button>
            : <Button disabled={selected === undefined} onClick={() => setQuestionIndex((i) => i + 1)}>{copy.next}</Button>}
        </div>
      </Card>;
    })()}

    {step === "minutes" && <Card className="mt-8">
      <h2 className="font-serif text-2xl font-bold">{copy.minutesStep}</h2>
      <div className="mt-5 flex flex-wrap gap-3">{minuteOptions.map((value) => <button key={value} onClick={() => setMinutes(value)} className={`rounded-ui border px-5 py-4 font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${minutes === value ? "border-brand bg-brand-soft text-brand-deep" : "border-line hover:border-brand"}`}>{value} <span className="text-sm font-semibold text-muted">{copy.minutes}</span></button>)}</div>
      {error && <p className="mt-4 text-sm font-bold text-accent-terra" role="alert">{copy.errorSave}</p>}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setStep(usedPlacement ? "placement" : "level")}>{copy.back}</Button>
        <Button disabled={submitting} onClick={() => submit(usedPlacement)}>{submitting ? copy.submitting : copy.finish}</Button>
      </div>
    </Card>}

    {step === "done" && <Card className="mt-8 text-center">
      <p className="text-sm font-bold text-muted">{copy.resultLevel}</p>
      <p className="mt-3 font-serif text-6xl font-bold text-brand">{resultLevel}</p>
      <div className="mt-8"><Button onClick={() => router.push("/today")}>{copy.startLearning}</Button></div>
    </Card>}
  </Section>;
}
