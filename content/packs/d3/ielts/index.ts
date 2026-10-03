import type { ExamDef, PromptDef } from "../types";
import { ieltsListening1 } from "./listening-1";
import { ieltsReading1 } from "./reading-1";
import { ieltsListening2 } from "./listening-2";
import { ieltsReading2 } from "./reading-2";
import { ieltsPromptDefs } from "./prompts";

/** Two full IELTS Listening tests (4 sections, 40 marks each), two full Academic Reading tests (3 passages, 40 marks each), six Writing tasks and five Speaking sets. */
export const ieltsExams: ExamDef[] = [ieltsListening1, ieltsReading1, ieltsListening2, ieltsReading2];
export const ieltsPrompts: PromptDef[] = ieltsPromptDefs;
