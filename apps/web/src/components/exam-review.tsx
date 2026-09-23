import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ExamCopy } from "@/lib/exam-copy";
import type { ExamAttemptResult, PublicExam } from "@/modules/exams/exam-engine";

export function ExamReview({ exam, result, copy }: { exam: PublicExam; result: ExamAttemptResult; copy: ExamCopy }) {
  const review = new Map(result.results.map((item) => [item.questionId, item]));
  return <div className="mt-8">
    <Card className="bg-brand-soft">
      <p className="text-sm font-bold text-brand">{result.attempt.status === "EXPIRED" ? copy.timeExpired : copy.review}</p>
      <h2 className="mt-2 font-serif text-3xl font-bold">{copy.result}: {result.attempt.rawScore}/{result.attempt.totalQuestions}</h2>
      <div className="mt-6 flex flex-wrap gap-3"><Link href={"/exams/" + exam.slug}><Button>{copy.tryAgain}</Button></Link><Link href="/dashboard"><Button variant="secondary">{copy.history}</Button></Link></div>
    </Card>
    <div className="mt-8 space-y-8">{exam.parts.map((part) => <Card key={part.id}>
      <p className="text-sm font-bold text-brand">{copy.part} {part.partNumber} · {part.skill}</p>
      <h2 className="mt-2 font-serif text-3xl font-bold">{part.title}</h2>
      {part.passages.map((passage) => <article className="mt-6 rounded-ui bg-band/40 p-5" key={passage.id}><h3 className="font-bold">{passage.title}</h3><p className="mt-3 whitespace-pre-line leading-7">{passage.content}</p></article>)}
      <div className="mt-7 space-y-7">{part.questions.map((question) => {
        const item = review.get(question.id);
        if (!item) return null;
        return <article key={question.id}><h3 className="font-bold">{question.content.prompt}</h3><div className="mt-3 grid gap-2">{question.content.options.map((option) => <div className={"rounded-ui border p-3 text-sm " + (option.id === item.correctOptionId ? "border-emerald-500 bg-emerald-50" : option.id === item.selectedOptionId ? "border-amber-500 bg-amber-50" : "border-line")} key={option.id}>{option.text}{option.id === item.correctOptionId && <strong className="ml-2">✓</strong>}</div>)}</div><div className={"mt-3 rounded-ui p-3 text-sm " + (item.correct ? "bg-emerald-50" : "bg-amber-50")}><p className="font-bold">{item.correct ? copy.correct : copy.correctAnswer + ": " + item.correctOptionId.toUpperCase()}</p>{item.explanation && <p className="mt-1">{item.explanation}</p>}</div></article>;
      })}</div>
    </Card>)}</div>
  </div>;
}
