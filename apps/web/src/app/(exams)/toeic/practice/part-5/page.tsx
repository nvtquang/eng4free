import { redirect } from "next/navigation";

/** The old standalone Part 5 runner now lives on the shared exam engine. */
export default function ToeicPart5Page() {
  redirect("/exams/toeic-part-5-practice");
}
