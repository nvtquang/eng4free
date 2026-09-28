import type { LessonDef } from "../types";
import { grammarA } from "./grammar-a";
import { grammarB } from "./grammar-b";
import { grammarC } from "./grammar-c";

/** 24 grammar topics, four per CEFR level, each with explanation, examples, common mistakes and eight practice questions. */
export const grammarLessons: LessonDef[] = [...grammarA, ...grammarB, ...grammarC];
