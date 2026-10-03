import type { LessonDef } from "../types";
import { grammarA } from "./grammar-a";
import { grammarB } from "./grammar-b";
import { grammarC } from "./grammar-c";
import { grammarMoreAB1 } from "./grammar-more-a-b1";
import { grammarMoreB2C } from "./grammar-more-b2-c";

/** 36 grammar topics, six per CEFR level, each with explanation, examples, common mistakes and eight practice questions. */
export const grammarLessons: LessonDef[] = [...grammarA, ...grammarB, ...grammarC, ...grammarMoreAB1, ...grammarMoreB2C];
