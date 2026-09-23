"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ExamCopy } from "@/lib/exam-copy";

type Question = { id: string; content: { prompt: string; options: Array<{ id: string; text: string }> }; passageId: string | null };
type Part = { id: string; partNumber: number; title: string; instructions: string | null; skill: string | null; metadata: Record<string, unknown>; passages: Array<{ id: string; title: string | null; content: string }>; questions: Question[] };
type Started = { resumed: boolean; attempt: { id: string; expiresAt: string; answers: Array<{ questionId: string; selectedOptionId: string }> }; exam: { title: string; mode: string; parts: Part[]; totalQuestions: number } };
type SaveAnswer = { questionId: string; selectedOptionId: string };
type SubmitResponse = { attempt: { id: string }; error?: string };

function ExamAudio({ copy, text, limit }: { copy: ExamCopy; text: string; limit: number }) {
  const [plays, setPlays] = useState(0);
  const [playing, setPlaying] = useState(false);
  function play() {
    if (!("speechSynthesis" in window) || plays >= limit) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    setPlaying(true);
    setPlays((value) => value + 1);
    window.speechSynthesis.speak(utterance);
  }
  return <div className="mt-4 rounded-ui bg-band p-4"><Button disabled={playing || plays >= limit} onClick={play}>{playing ? copy.playing : copy.playAudio + " (" + plays + "/" + limit + ")"}</Button></div>;
}

export function ExamRunner({ slug, copy }: { slug: string; copy: ExamCopy }) {
  const router = useRouter();
  const [started, setStarted] = useState<Started>();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answersRef = useRef<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [now, setNow] = useState(Date.now());
  const [pending, setPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const autosaveTimer = useRef<number | undefined>(undefined);
  const saveQueue = useRef(Promise.resolve());

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/exam-engine/" + slug + "/attempts", { method: "POST" });
      const body = await response.json() as Started & { error?: string };
      if (!response.ok) { setError(body.error ?? copy.couldNotStart); return; }
      const restored = Object.fromEntries(body.attempt.answers.map((answer) => [answer.questionId, answer.selectedOptionId]));
      answersRef.current = restored;
      setAnswers(restored);
      setStarted(body);
    })();
  }, [copy.couldNotStart, slug]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearInterval(timer); if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current); };
  }, []);

  const remaining = useMemo(() => started ? Math.max(0, Math.ceil((new Date(started.attempt.expiresAt).getTime() - now) / 1000)) : 0, [started, now]);
  const asPayload = useCallback((): SaveAnswer[] => Object.entries(answersRef.current).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })), []);

  const persistAnswers = useCallback((attemptId: string) => {
    saveQueue.current = saveQueue.current.then(async () => {
      const snapshot = asPayload();
      if (!snapshot.length) return;
      setSaving(true);
      try {
        const response = await fetch("/api/exam-engine/attempts/" + attemptId + "/answers", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: snapshot }) });
        if (!response.ok) throw new Error("autosave");
      } catch {
        setError(copy.autosaveFailed);
      } finally {
        setSaving(false);
      }
    });
    return saveQueue.current;
  }, [asPayload, copy.autosaveFailed]);

  function choose(questionId: string, selectedOptionId: string) {
    if (!started || pending) return;
    const next = { ...answersRef.current, [questionId]: selectedOptionId };
    answersRef.current = next;
    setAnswers(next);
    setError(undefined);
    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(() => { void persistAnswers(started.attempt.id); }, 450);
  }

  const submit = useCallback(async () => {
    if (!started || pending) return;
    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    setPending(true);
    setError(undefined);
    try {
      await saveQueue.current;
      const response = await fetch("/api/exam-engine/attempts/" + started.attempt.id + "/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers: asPayload() }) });
      const body = await response.json() as SubmitResponse;
      if (!response.ok || !body.attempt?.id) throw new Error(body.error ?? "submit");
      router.replace("/exams/" + slug + "/results/" + body.attempt.id);
    } catch {
      setError(copy.submitFailed);
      setPending(false);
    }
  }, [asPayload, copy.submitFailed, pending, router, slug, started]);

  useEffect(() => {
    if (started && remaining === 0 && !pending) void submit();
  }, [remaining, started, pending, submit]);

  if (error && !started) return <Card><p className="text-red-700" role="alert">{error}</p></Card>;
  if (!started) return <Card><p>{copy.loading}</p></Card>;
  return <div>
    <div className="sticky top-[72px] z-20 mt-8 flex items-center justify-between rounded-ui border border-line bg-surface p-4 shadow-card">
      <div><p className="text-sm font-bold text-brand">{started.exam.mode}{started.resumed ? " · " + copy.resumed : ""}</p><p className="font-bold">{Object.keys(answers).length}/{started.exam.totalQuestions} {copy.answered}{saving ? " · " + copy.saving : ""}</p></div>
      <p className="timer font-mono text-xl font-bold">{String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}</p>
    </div>
    <nav className="mt-5 flex flex-wrap gap-2">{started.exam.parts.map((part) => <a className="rounded-full bg-band px-3 py-2 text-xs font-bold" href={"#part-" + part.partNumber} key={part.id}>{copy.part} {part.partNumber}</a>)}</nav>
    <div className="mt-8 space-y-8">{started.exam.parts.map((part) => <Card id={"part-" + part.partNumber} key={part.id}>
      <p className="text-sm font-bold text-brand">{copy.part} {part.partNumber} · {part.skill}</p><h2 className="mt-2 font-serif text-3xl font-bold">{part.title}</h2><p className="mt-3 text-muted">{part.instructions}</p>
      {typeof part.metadata.playbackText === "string" && <ExamAudio copy={copy} text={part.metadata.playbackText} limit={typeof part.metadata.playbackLimit === "number" ? part.metadata.playbackLimit : 1} />}
      {part.passages.map((passage) => <article className="mt-6 rounded-ui bg-band/40 p-5" key={passage.id}><h3 className="font-bold">{passage.title}</h3><p className="mt-3 whitespace-pre-line leading-7">{passage.content}</p></article>)}
      <div className="mt-7 space-y-7">{part.questions.map((question) => <fieldset key={question.id}><legend className="font-bold">{question.content.prompt}</legend><div className="mt-3 grid gap-2">{question.content.options.map((option) => <label className="flex gap-3 rounded-ui border border-line p-3 has-[:checked]:border-brand" key={option.id}><input type="radio" name={question.id} checked={answers[question.id] === option.id} disabled={pending} onChange={() => choose(question.id, option.id)} />{option.text}</label>)}</div></fieldset>)}</div>
    </Card>)}</div>
    {error && <p className="mt-5 text-red-700" role="alert">{error}</p>}
    <Button className="mt-8" disabled={pending} onClick={submit}>{pending ? copy.submitting : copy.submit}</Button>
  </div>;
}
