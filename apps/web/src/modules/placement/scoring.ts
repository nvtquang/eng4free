import { placementQuestions, placementLevelOrder, type CefrLevel, type PlacementQuestion } from "./questions";

export type PlacementAnswer = { questionId: string; selectedIndex: number };
export type PlacementResult = { score: number; total: number; cefrLevel: CefrLevel };

export function scorePlacement(answers: PlacementAnswer[]): PlacementResult {
  const byId = new Map<string, PlacementQuestion>(placementQuestions.map((q) => [q.id, q]));
  let correct = 0;
  const levelCorrect: Record<CefrLevel, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  for (const answer of answers) {
    const q = byId.get(answer.questionId);
    if (q && answer.selectedIndex === q.correctIndex) { correct++; levelCorrect[q.level]++; }
  }
  let cefrLevel: CefrLevel = "A1";
  for (const level of placementLevelOrder) {
    if (levelCorrect[level] >= 2) cefrLevel = level;
    else break;
  }
  return { score: correct, total: placementQuestions.length, cefrLevel };
}

export function publicPlacementQuestions() {
  return placementQuestions.map((q) => ({ id: q.id, level: q.level, prompt: q.prompt, options: q.options }));
}
