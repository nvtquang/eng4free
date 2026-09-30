"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow, Section } from "@/components/ui/section";
import { LevelBadge } from "@/components/ui/level-badge";
import type { Locale, Messages } from "@/lib/i18n";

type Goal = "communication" | "toeic" | "ielts";
type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type Step = "goal" | "minutes" | "level" | "placement" | "self" | "done";
type Skill = "GRAMMAR" | "VOCABULARY" | "READING" | "LISTENING" | "SPEAKING" | "WRITING";
type Question = { itemId: string; skill: Skill; prompt: string; options: Array<{ id: string; text: string }>; passage?: string; audioUrl?: string; playbackText?: string };
type PlacementView = { attemptId: string; answered: number; total: number; question: Question | null; finished: boolean };
type CanDo = { skill: "SPEAKING" | "WRITING"; level: Cefr; canDo: { vi: string; en: string } };
type SavedProfile = { cefrLevel: string; levelSource: "SELF" | "PLACEMENT"; placementScore: number | null; placementTotal: number | null; skillLevels: Partial<Record<Skill, string>> | null };

const levels: Cefr[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const minuteOptions = [10, 15, 20, 30, 45];
const resultSkills: Skill[] = ["GRAMMAR", "VOCABULARY", "READING", "LISTENING", "SPEAKING", "WRITING"];
const choice = (selected: boolean) => `rounded-ui border text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${selected ? "border-brand bg-brand-soft text-brand-deep" : "border-line hover:border-brand"}`;

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return await response.json() as T;
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/^[A-Z][a-z]+:\s*/gmu, ""));
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

export function OnboardingWizard({ messages, locale, canDo }: { messages: Messages; locale: Locale; canDo: CanDo[] }) {
  const copy = messages.onboarding;
  const router = useRouter();
  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState<Goal | null>(null);
  const [minutes, setMinutes] = useState(15);
  const [selfLevel, setSelfLevel] = useState<Cefr | null>(null);
  const [placement, setPlacement] = useState<PlacementView | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [selfAssessed, setSelfAssessed] = useState<{ SPEAKING?: Cefr; WRITING?: Cefr }>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<SavedProfile | null>(null);

  const goals: Array<{ id: Goal; label: string }> = [
    { id: "communication", label: copy.goalCommunication },
    { id: "toeic", label: copy.goalToeic },
    { id: "ielts", label: copy.goalIelts }
  ];

  async function run(task: () => Promise<void>, message: string) {
    setPending(true);
    setError(null);
    try { await task(); } catch { setError(message); } finally { setPending(false); }
  }

  const saveProfile = (body: Record<string, unknown>) => run(async () => {
    const data = await postJson<{ profile: SavedProfile }>("/api/onboarding", { goal, minutesPerDay: minutes, ...body });
    setProfile(data.profile);
    setStep("done");
  }, copy.errorSave);

  const startPlacement = () => run(async () => {
    setStep("placement");
    setPlacement(await postJson<PlacementView>("/api/placement", selfLevel ? { startLevel: selfLevel } : {}));
    setSelected(null);
  }, copy.placementError);

  const submitAnswer = () => run(async () => {
    if (!placement?.question || !selected) return;
    const next = await postJson<PlacementView>(`/api/placement/${placement.attemptId}/answer`, { itemId: placement.question.itemId, optionId: selected });
    setPlacement(next);
    setSelected(null);
    if (next.finished) setStep("self");
  }, copy.placementError);

  const finishPlacement = () => run(async () => {
    if (!placement || !selfAssessed.SPEAKING || !selfAssessed.WRITING) return;
    await postJson(`/api/placement/${placement.attemptId}/complete`, { speaking: selfAssessed.SPEAKING, writing: selfAssessed.WRITING });
    const data = await postJson<{ profile: SavedProfile }>("/api/onboarding", { goal, minutesPerDay: minutes, placementAttemptId: placement.attemptId });
    setProfile(data.profile);
    setStep("done");
  }, copy.errorSave);

  const errorLine = error && <p className="mt-4 text-sm font-bold text-accent-terra" role="alert">{error}</p>;

  return <Section className="max-w-2xl">
    <Eyebrow>{copy.eyebrow}</Eyebrow>
    <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{step === "placement" || step === "self" ? copy.placementTitle : copy.title}</h1>
    {step !== "placement" && step !== "self" && <p className="mt-4 leading-7 text-muted">{copy.description}</p>}

    {step === "goal" && <Card className="mt-8">
      <h2 className="font-serif text-2xl font-bold">{copy.goalStep}</h2>
      <div className="mt-5 grid gap-3">{goals.map((item) => <button key={item.id} onClick={() => setGoal(item.id)} className={`${choice(goal === item.id)} p-4 font-bold`}>{item.label}</button>)}</div>
      <div className="mt-6 flex justify-end"><Button disabled={!goal} onClick={() => setStep("minutes")}>{copy.next}</Button></div>
    </Card>}

    {step === "minutes" && <Card className="mt-8">
      <h2 className="font-serif text-2xl font-bold">{copy.minutesStep}</h2>
      <div className="mt-5 flex flex-wrap gap-3">{minuteOptions.map((value) => <button key={value} onClick={() => setMinutes(value)} className={`${choice(minutes === value)} px-5 py-4 font-bold`}>{value} <span className="text-sm font-semibold text-muted">{copy.minutes}</span></button>)}</div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setStep("goal")}>{copy.back}</Button>
        <Button onClick={() => setStep("level")}>{copy.next}</Button>
      </div>
    </Card>}

    {step === "level" && <Card className="mt-8">
      <h2 className="font-serif text-2xl font-bold">{copy.levelStep}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{copy.levelSelfHint}</p>
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">{levels.map((level) => <button key={level} onClick={() => setSelfLevel(selfLevel === level ? null : level)} className={`${choice(selfLevel === level)} px-3 py-4 text-center font-bold`}>{level}</button>)}</div>
      {errorLine}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setStep("minutes")}>{copy.back}</Button>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" disabled={!selfLevel || pending} onClick={() => void saveProfile({ selfLevel })}>{pending ? copy.submitting : copy.useSelfLevel}</Button>
          <Button disabled={pending} onClick={() => void startPlacement()}>{copy.takePlacement}</Button>
        </div>
      </div>
    </Card>}

    {step === "placement" && <Card className="mt-8">
      {!placement?.question
        ? <>{error ? errorLine : <p className="text-muted">{copy.placementStarting}</p>}<div className="mt-6 flex gap-3"><Button variant="secondary" onClick={() => setStep("level")}>{copy.back}</Button>{error && <Button onClick={() => void startPlacement()}>{copy.next}</Button>}</div></>
        : (() => {
          const question = placement.question;
          const progress = Math.round((placement.answered / placement.total) * 100);
          return <>
            <div className="flex flex-wrap items-center justify-between gap-2"><LevelBadge>{copy.skills[question.skill]}</LevelBadge><p className="text-sm font-bold text-muted">{copy.placementProgress.replace("{current}", String(placement.answered + 1)).replace("{total}", String(placement.total))}</p></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-band" role="progressbar" aria-valuenow={placement.answered} aria-valuemin={0} aria-valuemax={placement.total}><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} /></div>
            {placement.answered === 0 && <p className="mt-4 text-sm leading-6 text-muted">{copy.placementIntro}</p>}
            {question.passage && <article className="mt-5 whitespace-pre-line rounded-ui bg-band/40 p-4 leading-7">{question.passage}</article>}
            {(question.audioUrl || question.playbackText) && <div className="mt-5 rounded-ui bg-band/40 p-4">
              <p className="text-sm font-bold text-muted">{copy.listenHint}</p>
              {question.audioUrl
                ? <audio key={question.itemId} className="mt-3 w-full" controls preload="auto" src={question.audioUrl} />
                : <Button variant="secondary" className="mt-3" onClick={() => speak(question.playbackText!)}>{copy.listen}</Button>}
            </div>}
            <fieldset className="mt-5">
              <legend className="text-lg font-bold">{question.prompt}</legend>
              <div className="mt-4 grid gap-3">{question.options.map((option) => <label key={option.id} className={`${choice(selected === option.id)} flex cursor-pointer items-center gap-3 p-3`}><input type="radio" name={question.itemId} value={option.id} checked={selected === option.id} onChange={() => setSelected(option.id)} className="accent-brand" />{option.text}</label>)}</div>
            </fieldset>
            {errorLine}
            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="quiet" onClick={() => { setPlacement(null); setStep("level"); }}>{copy.quit}</Button>
              <Button disabled={!selected || pending} onClick={() => void submitAnswer()}>{copy.next}</Button>
            </div>
          </>;
        })()}
    </Card>}

    {step === "self" && <Card className="mt-8">
      <h2 className="font-serif text-2xl font-bold">{copy.selfTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{copy.selfIntro}</p>
      {(["SPEAKING", "WRITING"] as const).map((skill) => <fieldset key={skill} className="mt-6">
        <legend className="font-bold">{copy.skills[skill]}</legend>
        <div className="mt-3 grid gap-2">{canDo.filter((statement) => statement.skill === skill).map((statement) => <label key={statement.level} className={`${choice(selfAssessed[skill] === statement.level)} flex cursor-pointer items-start gap-3 p-3 text-sm leading-6`}>
          <input type="radio" name={skill} value={statement.level} checked={selfAssessed[skill] === statement.level} onChange={() => setSelfAssessed((current) => ({ ...current, [skill]: statement.level }))} className="mt-1 accent-brand" />
          <span><span className="mr-2 font-bold">{statement.level}</span>{statement.canDo[locale]}</span>
        </label>)}</div>
      </fieldset>)}
      {errorLine}
      <div className="mt-6 flex justify-end"><Button disabled={!selfAssessed.SPEAKING || !selfAssessed.WRITING || pending} onClick={() => void finishPlacement()}>{pending ? copy.submitting : copy.seeResult}</Button></div>
    </Card>}

    {step === "done" && profile && <Card className="mt-8">
      <div className="text-center">
        <p className="text-sm font-bold text-muted">{copy.resultLevel}</p>
        <p className="mt-3 font-serif text-6xl font-bold text-brand">{profile.cefrLevel}</p>
        {profile.placementTotal !== null && <p className="mt-3 text-sm text-muted">{copy.resultScore.replace("{correct}", String(profile.placementScore ?? 0)).replace("{total}", String(profile.placementTotal))}</p>}
      </div>
      {profile.skillLevels && <>
        <h2 className="mt-8 font-serif text-xl font-bold">{copy.resultBySkill}</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{resultSkills.map((skill) => <div key={skill} className="rounded-ui border border-line p-3"><dt className="text-sm font-bold text-muted">{copy.skills[skill]}</dt><dd className="mt-1 font-serif text-2xl font-bold text-brand">{profile.skillLevels?.[skill] ?? "—"}</dd></div>)}</dl>
        <p className="mt-3 text-xs text-muted">{copy.resultSelfNote}</p>
      </>}
      <div className="mt-8 text-center"><Button onClick={() => router.push("/today")}>{copy.startLearning}</Button></div>
    </Card>}
  </Section>;
}
