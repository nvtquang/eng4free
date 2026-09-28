import { examplesA1 } from "./examples-a1";
import { examplesA2 } from "./examples-a2";
import { examplesB1 } from "./examples-b1";
import { examplesB2 } from "./examples-b2";
import { examplesC } from "./examples-c";

/** Original English 4 Free example sentences, keyed by "headword|pos" (see selection.json). */
export const vocabularyExamples: Record<string, string> = { ...examplesA1, ...examplesA2, ...examplesB1, ...examplesB2, ...examplesC };
