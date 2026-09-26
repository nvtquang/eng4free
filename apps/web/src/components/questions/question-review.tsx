import { blankTokens, type PublicQuestion, type QuestionAnswer, type QuestionResponse } from "@english4free/content-schemas";
import type { ExamCopy } from "@/lib/exam-copy";

type Copy = ExamCopy["questions"];
type Result = { response: QuestionResponse | null; answer: QuestionAnswer; correct: boolean; earnedPoints: number; availablePoints: number; explanation: string | null };

const good = "border-emerald-500 bg-emerald-50";
const chosenWrong = "border-amber-500 bg-amber-50";

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return <div className={`rounded-ui border p-3 text-sm ${tone ?? "border-line"}`}><span className="font-bold">{label}: </span>{value}</div>;
}

/** Shows a submitted answer next to the key, for any gradable type. */
export function QuestionReview({ question, result, copy, label, correctLabel }: { question: PublicQuestion; result: Result; copy: Copy; label: string; correctLabel: string }) {
  const response = result.response as Record<string, unknown> | null;
  const header = <p className="flex flex-wrap items-baseline justify-between gap-2 font-bold"><span><span className="text-brand">{label}</span> {"prompt" in question.content && question.type !== "FILL_BLANK" ? question.content.prompt : ""}</span>{result.availablePoints > 1 && <span className="text-sm text-muted">{result.earnedPoints}/{result.availablePoints} {copy.points}</span>}</p>;
  let body: React.ReactNode = null;
  switch (question.type) {
    case "MCQ":
    case "MULTI_SELECT": {
      const correct = new Set(question.type === "MCQ" ? [(result.answer as QuestionAnswer<"MCQ">).correctOptionId] : (result.answer as QuestionAnswer<"MULTI_SELECT">).correctOptionIds);
      const chosen = new Set(question.type === "MCQ" ? [response?.optionId as string | undefined] : (response?.optionIds as string[] | undefined) ?? []);
      body = <div className="mt-3 grid gap-2">{question.content.options.map((option) => <div className={"rounded-ui border p-3 text-sm " + (correct.has(option.id) ? good : chosen.has(option.id) ? chosenWrong : "border-line")} key={option.id}>{question.type === "MULTI_SELECT" && <strong className="mr-2">{option.id.toUpperCase()}</strong>}{option.text}{correct.has(option.id) && <strong className="ml-2">✓</strong>}{chosen.has(option.id) && !correct.has(option.id) && <strong className="ml-2">✗</strong>}</div>)}</div>;
      break;
    }
    case "TRUE_FALSE": {
      const labels = question.content.variant === "YES_NO_NOT_GIVEN" ? copy.yesNo : copy.trueFalse;
      const chosen = response?.value as keyof typeof labels | undefined;
      body = <div className="mt-3 grid gap-2"><Row label={copy.yourAnswer} value={chosen ? labels[chosen] : copy.noAnswer} tone={result.correct ? good : chosenWrong} /><Row label={copy.correctAnswer} value={labels[(result.answer as QuestionAnswer<"TRUE_FALSE">).correct]} /></div>;
      break;
    }
    case "FILL_BLANK": {
      const blanks = (response?.blanks ?? {}) as Record<string, string>;
      const accepted = (result.answer as QuestionAnswer<"FILL_BLANK">).blanks;
      body = <><p className="mt-2 whitespace-pre-line leading-8">{question.content.prompt.replace(/\{\{\s*([A-Za-z0-9_-]{1,16})\s*\}\}/gu, (_, token: string) => `(${blankTokens(question.content.prompt).indexOf(token) + 1}) ____`)}</p><div className="mt-3 grid gap-2">{blankTokens(question.content.prompt).map((token, index) => <Row key={token} label={`(${index + 1})`} value={`${copy.yourAnswer}: ${blanks[token]?.trim() || copy.noAnswer} · ${copy.acceptedAnswers}: ${accepted[token]?.join(" / ")}`} />)}</div></>;
      break;
    }
    case "MATCHING": {
      const matches = (response?.matches ?? {}) as Record<string, string>;
      const key = (result.answer as QuestionAnswer<"MATCHING">).matches;
      const text = new Map(question.content.options.map((option) => [option.id, `${option.id.toUpperCase()} — ${option.text}`]));
      body = <div className="mt-3 grid gap-2">{question.content.items.map((item) => <Row key={item.id} label={item.text} tone={matches[item.id] === key[item.id] ? good : chosenWrong} value={`${copy.yourAnswer}: ${text.get(matches[item.id] ?? "") ?? copy.noAnswer} · ${copy.correctAnswer}: ${text.get(key[item.id]!)}`} />)}</div>;
      break;
    }
    case "ORDERING": {
      const byId = new Map(question.content.items.map((item) => [item.id, item.text]));
      const chosen = (response?.order as string[] | undefined) ?? [];
      body = <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><p className="text-sm font-bold">{copy.yourAnswer}</p><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{chosen.length ? chosen.map((id) => <li key={id}>{byId.get(id)}</li>) : <li className="list-none text-muted">{copy.noAnswer}</li>}</ol></div><div><p className="text-sm font-bold">{copy.correctAnswer}</p><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{(result.answer as QuestionAnswer<"ORDERING">).order.map((id) => <li key={id}>{byId.get(id)}</li>)}</ol></div></div>;
      break;
    }
    case "DICTATION":
      body = <div className="mt-3 grid gap-2"><Row label={copy.yourAnswer} value={(response?.text as string | undefined)?.trim() || copy.noAnswer} tone={result.correct ? good : chosenWrong} /><Row label={copy.correctAnswer} value={(result.answer as QuestionAnswer<"DICTATION">).accepted[0]!} /></div>;
      break;
  }
  return <article>
    {header}
    {body}
    <div className={"mt-3 rounded-ui p-3 text-sm " + (result.correct ? "bg-emerald-50" : "bg-amber-50")}><p className="font-bold">{result.correct ? correctLabel : `${result.earnedPoints}/${result.availablePoints} ${copy.points}`}</p>{result.explanation && <p className="mt-1">{result.explanation}</p>}</div>
  </article>;
}
