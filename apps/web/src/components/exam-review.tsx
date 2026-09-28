import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { examSkillLabel, type ExamCopy } from "@/lib/exam-copy";
import { estimateAttempt, tallyBySkill } from "@/modules/scoring/attempt-estimate";
import type { ExamAttemptResult, PublicExam } from "@/modules/exams/exam-engine";
import { questionLabels } from "@/components/questions/numbering";
import { QuestionReview } from "@/components/questions/question-review";
import { ContentImage, isContentImage } from "@/components/questions/question-image";
import { groupPartQuestions } from "@/components/questions/part-groups";

/** After submitting, learners can replay the recording freely and read the script. */
function ListeningRecap({ copy, metadata }: { copy: ExamCopy; metadata: Record<string, unknown> }) {
  const audioUrl = typeof metadata.audioUrl === "string" ? metadata.audioUrl : undefined;
  const transcript = typeof metadata.transcript === "string" ? metadata.transcript : undefined;
  if (!audioUrl && !transcript) return null;
  return <div className="mt-5 rounded-ui bg-band/40 p-4">
    {audioUrl && <><p className="text-sm font-bold text-muted">{copy.listenAgain}</p><audio className="mt-2 w-full" controls preload="none" src={audioUrl} /></>}
    {transcript && <details className={audioUrl ? "mt-4" : ""}><summary className="cursor-pointer font-bold text-brand">{copy.transcript}</summary><p className="mt-3 whitespace-pre-line leading-7">{transcript}</p></details>}
  </div>;
}

export function ExamReview({ exam, result, copy }: { exam: PublicExam; result: ExamAttemptResult; copy: ExamCopy }) {
  const review = new Map(result.results.map((item) => [item.questionId, item]));
  const questionSkills = new Map(exam.parts.flatMap((part) => part.questions.map((question) => [question.id, part.skill] as const)));
  const estimate = estimateAttempt(exam.type, tallyBySkill(questionSkills, result.results));
  const labels = questionLabels(exam.parts, copy.questions.question);
  const format = (value: number | null) => value === null ? copy.notCovered : exam.type === "IELTS" ? value.toFixed(1) : String(value);
  return <div className="mt-8">
    <Card className="bg-brand-soft">
      <p className="text-sm font-bold text-brand">{result.attempt.status === "EXPIRED" ? copy.timeExpired : copy.review}</p>
      <h2 className="mt-2 font-serif text-3xl font-bold">{copy.result}: {result.attempt.rawScore}/{result.attempt.totalQuestions}</h2>
      <div className="mt-6 flex flex-wrap gap-3"><Link href={"/exams/" + exam.slug}><Button>{copy.tryAgain}</Button></Link><Link href="/dashboard"><Button variant="secondary">{copy.history}</Button></Link></div>
    </Card>
    {(estimate.listening !== null || estimate.reading !== null) && <Card className="mt-6">
      <h2 className="font-serif text-2xl font-bold">{copy.estimateTitle}</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div><dt className="text-sm font-bold text-muted">{copy.skills.LISTENING}{exam.type === "IELTS" ? " · " + copy.estimateBand : ""}</dt><dd className="mt-1 font-serif text-3xl font-bold text-brand">{format(estimate.listening)}</dd></div>
        <div><dt className="text-sm font-bold text-muted">{copy.skills.READING}{exam.type === "IELTS" ? " · " + copy.estimateBand : ""}</dt><dd className="mt-1 font-serif text-3xl font-bold text-brand">{format(estimate.reading)}</dd></div>
        {estimate.exam === "TOEIC" && estimate.total !== null && <div><dt className="text-sm font-bold text-muted">{copy.estimateTotal}</dt><dd className="mt-1 font-serif text-3xl font-bold text-ink">{estimate.total}</dd></div>}
      </dl>
      <p className="mt-4 text-sm leading-6 text-muted">{copy.estimateNote}</p>
    </Card>}
    <div className="mt-8 space-y-8">{exam.parts.map((part) => <Card key={part.id}>
      <p className="text-sm font-bold text-brand">{copy.part} {part.partNumber} · {examSkillLabel(copy, part.skill)}</p>
      <h2 className="mt-2 font-serif text-3xl font-bold">{part.title}</h2>
      <ListeningRecap copy={copy} metadata={part.metadata} />
      {(() => {
        const { loose, groups } = groupPartQuestions(part.passages, part.questions);
        const reviews = (items: typeof part.questions) => <div className="mt-7 space-y-7">{items.map((question) => {
          const item = review.get(question.id);
          if (!item) return null;
          return <QuestionReview key={question.id} question={question} result={item} copy={copy.questions} label={labels.get(question.id) ?? ""} correctLabel={copy.correct} />;
        })}</div>;
        return <>{loose.length > 0 && reviews(loose)}{groups.map(({ passage, questions }) => { const image = isContentImage(passage.metadata.image) ? passage.metadata.image : null; return <div className="mt-8" key={passage.id}>
          {passage.metadata.kind === "LISTENING"
            ? <section className="rounded-ui border border-line p-5">{passage.title && <h3 className="font-bold">{passage.title}</h3>}{image && <div className="mt-3"><ContentImage image={image} /></div>}<ListeningRecap copy={copy} metadata={passage.metadata} /></section>
            : <article className="rounded-ui bg-band/40 p-5">{passage.title && <h3 className="font-bold">{passage.title}</h3>}{image && <div className="mt-3"><ContentImage image={image} /></div>}<p className="mt-3 whitespace-pre-line leading-7">{passage.content}</p></article>}
          {questions.length > 0 && reviews(questions)}
        </div>; })}</>;
      })()}
    </Card>)}</div>
  </div>;
}
