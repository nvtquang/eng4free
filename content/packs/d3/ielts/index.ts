import type { ExamDef, PromptDef } from "../types";
import { ieltsListening1 } from "./listening-1";
import { ieltsReading1 } from "./reading-1";
import { ieltsPromptDefs } from "./prompts";

/** A full IELTS Listening test (4 sections, 40 marks), a full Academic Reading test (3 passages, 40 marks), six Writing tasks and five Speaking sets. */
export const ieltsExams: ExamDef[] = [ieltsListening1, ieltsReading1];
export const ieltsPrompts: PromptDef[] = ieltsPromptDefs;
