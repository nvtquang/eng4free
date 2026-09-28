import type { ExamDef } from "../types";
import { mock1Part1, mock1Part2, mock1Part3, mock1Part4 } from "./mock1-listening";
import { mock1Part5, mock1Part6 } from "./mock1-reading-5-6";
import { mock1Part7 } from "./mock1-reading-7";
import { toeicPractice } from "./practice";
import { toeicMini } from "./mini";

/** A 200-question full mock in the official seven-part format, plus one practice set per part. */
export const toeicFullMock: ExamDef = {
  key: "toeic:mock-1", batch: "toeic", slug: "toeic-full-mock-1", title: "TOEIC Full Mock Test 1", type: "TOEIC", mode: "FULL_MOCK", durationSeconds: 120 * 60,
  parts: [mock1Part1, mock1Part2, mock1Part3, mock1Part4, mock1Part5, mock1Part6, mock1Part7]
};

export const toeicExams: ExamDef[] = [toeicFullMock, toeicMini, ...toeicPractice];
