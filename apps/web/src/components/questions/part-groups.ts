/** Passage-free questions first, then each passage followed by the questions that belong to it. */
export function groupPartQuestions<P extends { id: string }, Q extends { passageId: string | null }>(passages: P[], questions: Q[]) {
  const passageIds = new Set(passages.map((passage) => passage.id));
  return {
    loose: questions.filter((question) => !question.passageId || !passageIds.has(question.passageId)),
    groups: passages.map((passage) => ({ passage, questions: questions.filter((question) => question.passageId === passage.id) }))
  };
}
