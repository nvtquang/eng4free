/** IELTS-style numbering: a question worth several marks takes a range ("3–4"). */
export function questionLabels(parts: Array<{ questions: Array<{ id: string; points: number }> }>, word: string): Map<string, string> {
  const labels = new Map<string, string>();
  let next = 1;
  for (const question of parts.flatMap((part) => part.questions)) {
    const last = next + Math.max(1, question.points) - 1;
    labels.set(question.id, last > next ? `${word} ${next}–${last}` : `${word} ${next}`);
    next = last + 1;
  }
  return labels;
}
