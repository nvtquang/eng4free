import Link from "next/link";
import { AddToWordbookButton } from "@/components/add-to-wordbook-button";
import { Card } from "@/components/ui/card";
import type { LessonWord } from "@/modules/vocabulary/lesson-vocabulary";

type Copy = { add: string; added: string; adding: string; already: string; lessonTitle: string; lessonDescription: string; review: string };

/** Vocabulary from the lesson that the learner can save to their review deck without leaving it. */
export function LessonWords({ words, copy }: { words: LessonWord[]; copy: Copy }) {
  if (!words.length) return null;
  return <Card className="mt-10" role="region" aria-labelledby="lesson-words-title">
    <div className="flex flex-wrap items-baseline justify-between gap-3">
      <h2 className="font-serif text-2xl font-bold" id="lesson-words-title">{copy.lessonTitle}</h2>
      <Link className="text-sm font-bold text-brand hover:underline" href="/vocabulary?deck=due">{copy.review} →</Link>
    </div>
    <p className="mt-2 text-sm leading-6 text-muted">{copy.lessonDescription}</p>
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
      {words.map((word) => <li className="rounded-ui border border-line p-4" key={word.id}>
        <p className="font-serif text-lg font-bold">{word.headword}</p>
        <p className="text-sm text-muted">{[word.partOfSpeech && word.partOfSpeech !== "mixed" ? word.partOfSpeech : null, word.ipa].filter(Boolean).join(" · ")}</p>
        {word.meaning && <p className="mt-1 text-sm font-medium text-brand">{word.meaning}</p>}
        <AddToWordbookButton vocabularyId={word.id} copy={copy} saved={word.saved} />
      </li>)}
    </ul>
  </Card>;
}
