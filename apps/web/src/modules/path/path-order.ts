/**
 * Pure ordering rules for the learning path. The path is every published lesson, in CEFR
 * order, then unit order, then lesson order; it is open (any lesson can be taken), but it
 * always suggests one lesson to do next.
 */
export const PATH_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type PathLevel = (typeof PATH_LEVELS)[number];

export type PathLesson = { id: string; level: string; unitTitle: string; slug: string; title: string; skill: string | null; estimatedMinutes: number };
export type LessonStatus = "done" | "current" | "todo";
export type PathUnit = { title: string; lessons: Array<PathLesson & { status: LessonStatus }> };
export type LevelPath = { level: string; units: PathUnit[]; completed: number; total: number; next: PathLesson | null };

const levelIndex = (level: string) => PATH_LEVELS.indexOf(level.toUpperCase() as PathLevel);

/** The first lesson not done yet, starting at `fromLevel`; earlier levels are only used when everything above is done. */
export function nextInPath(lessons: PathLesson[], completed: ReadonlySet<string>, fromLevel: string): PathLesson | null {
  const start = Math.max(0, levelIndex(fromLevel));
  return lessons.find((lesson) => levelIndex(lesson.level) >= start && !completed.has(lesson.id))
    ?? lessons.find((lesson) => !completed.has(lesson.id))
    ?? null;
}

/** The lesson to offer after finishing `lessonId`: the next unfinished lesson after it in path order, or null at the end. */
export function lessonAfter(lessons: PathLesson[], completed: ReadonlySet<string>, lessonId: string): PathLesson | null {
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0) return null;
  const rest = lessons.slice(index + 1);
  return rest.find((lesson) => !completed.has(lesson.id)) ?? rest[0] ?? null;
}

/** One level of the path, grouped by unit, with a status per lesson. */
export function buildLevelPath(lessons: PathLesson[], completed: ReadonlySet<string>, level: string): LevelPath {
  const inLevel = lessons.filter((lesson) => lesson.level === level);
  const next = inLevel.find((lesson) => !completed.has(lesson.id)) ?? null;
  const units: PathUnit[] = [];
  for (const lesson of inLevel) {
    let unit = units.at(-1);
    if (!unit || unit.title !== lesson.unitTitle) { unit = { title: lesson.unitTitle, lessons: [] }; units.push(unit); }
    unit.lessons.push({ ...lesson, status: completed.has(lesson.id) ? "done" : lesson.id === next?.id ? "current" : "todo" });
  }
  return { level, units, completed: inLevel.filter((lesson) => completed.has(lesson.id)).length, total: inLevel.length, next };
}
