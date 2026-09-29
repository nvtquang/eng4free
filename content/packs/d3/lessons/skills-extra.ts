import type { LessonDef } from "../types";
import { extraListening } from "./skills-extra-listening";
import { extraReading } from "./skills-extra-reading";

/**
 * Extra Listening and Reading lessons (batch "skills-extra"). Together with the core skill
 * lessons each skill has 6/5/4/3/2/2 lessons from A1 to C2: most at the lower levels.
 */
export const extraSkillLessons: LessonDef[] = [...extraListening, ...extraReading];
