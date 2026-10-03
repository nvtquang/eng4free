import type { LessonDef } from "../types";
import { extraListening } from "./skills-extra-listening";
import { extraReading } from "./skills-extra-reading";
import { moreSkillsB } from "./skills-more-b";
import { moreSkillsC } from "./skills-more-c";
import { moreSpeakingWriting } from "./skills-more-sw";

/**
 * Extra skill lessons (batch "lessons"). Together with the core skill lessons, Listening and
 * Reading have 6/5/5/5/4/4 lessons from A1 to C2, and Speaking and Writing at least two per level.
 */
export const extraSkillLessons: LessonDef[] = [...extraListening, ...extraReading, ...moreSkillsB, ...moreSkillsC, ...moreSpeakingWriting];
