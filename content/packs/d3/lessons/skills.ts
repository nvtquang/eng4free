import type { LessonDef } from "../types";
import { skillsA } from "./skills-a";
import { skillsB } from "./skills-b";
import { skillsC } from "./skills-c";

/** 24 skill lessons, one each for Reading, Listening, Speaking and Writing at every CEFR level. */
export const skillLessons: LessonDef[] = [...skillsA, ...skillsB, ...skillsC];
