"use client";

import { useEffect, useMemo, useState } from "react";

const examId = "d049d8e2-0a0d-4303-95fb-d4f97126dc53";

type Question = { id: string; content: { prompt: string; options: { id: string; text: string }[] } };
type StartedAttempt = { attempt: { id: string }; exam: { title: string; durationSeconds: number; questions: Question[] } };
type Result = { attempt: { id: string; rawScore: number; totalQuestions: number }; results: { questionId: string; selectedOptionId: string | null; correct: boolean; explanation?: string }[] };
type Copy = { loading: string; startFailed: string; saveFailed: string; submitFailed: string; label: string; answered: string; saving: string; saved: string; question: string; correct: string; incorrect: string; result: string; review: string; submit: string };

function formatSeconds(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function ToeicPart5Runner({ copy }: { copy: Copy }) {
  const [started, setStarted] = useState<StartedAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/exams/${examId}/attempts`, { method: "POST" });
        if (!response.ok) { setError(copy.startFailed); return; }
        const payload = await response.json() as StartedAttempt;
        setStarted(payload);
        setRemaining(payload.exam.durationSeconds);
      } catch { setError(copy.startFailed); }
    })();
  }, [copy.startFailed]);

  useEffect(() => {
    if (remaining === null || remaining <= 0 || result) return;
    const timer = window.setInterval(() => setRemaining((value) => value === null ? null : Math.max(0, value - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, [remaining, result]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  async function selectAnswer(questionId: string, selectedOptionId: string) {
    if (!started || result) return;
    setAnswers((current) => ({ ...current, [questionId]: selectedOptionId }));
    setSaving(true);
    try {
      const response = await fetch(`/api/attempts/${started.attempt.id}/answers`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: [{ questionId, selectedOptionId }] }) });
      if (!response.ok) setError(copy.saveFailed);
    } catch { setError(copy.saveFailed); } finally { setSaving(false); }
  }

  async function submit() {
    if (!started || result) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/exams/${examId}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attemptId: started.attempt.id, answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })) }) });
      if (!response.ok) { setError(copy.submitFailed); return; }
      setResult(await response.json() as Result);
    } catch { setError(copy.submitFailed); } finally { setSaving(false); }
  }

  if (error && !started) return <main className="exam-shell"><p role="alert">{error}</p></main>;
  if (!started) return <main className="exam-shell" aria-busy="true"><p role="status">{copy.loading}</p></main>;

  return <main className="exam-shell">
    <header className="exam-header"><div><p className="eyebrow">{copy.label}</p><h1>{started.exam.title}</h1></div><p className="timer" aria-live="polite">{formatSeconds(remaining ?? 0)}</p></header>
    <p className="exam-progress">{copy.answered} {answeredCount}/{started.exam.questions.length}{saving ? ` · ${copy.saving}` : ` · ${copy.saved}`}</p>
    {error && <p role="alert" className="error">{error}</p>}
    {started.exam.questions.map((question, index) => {
      const itemResult = result?.results.find((item) => item.questionId === question.id);
      return <section className="question-card" key={question.id}><h2>{copy.question} {index + 1}</h2><p>{question.content.prompt}</p><div className="options">{question.content.options.map((option) => <label key={option.id}><input type="radio" name={question.id} checked={answers[question.id] === option.id} disabled={Boolean(result)} onChange={() => void selectAnswer(question.id, option.id)} /> {option.text}</label>)}</div>{itemResult && <p className={itemResult.correct ? "correct" : "incorrect"}>{itemResult.correct ? copy.correct : copy.incorrect} {itemResult.explanation}</p>}</section>;
    })}
    {result ? <section className="result-card"><h2>{copy.result}: {result.attempt.rawScore}/{result.attempt.totalQuestions}</h2><p>{copy.review}</p></section> : <button type="button" onClick={() => void submit()} disabled={saving}>{copy.submit}</button>}
  </main>;
}
