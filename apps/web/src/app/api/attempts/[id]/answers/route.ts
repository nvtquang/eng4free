import { NextResponse } from "next/server";
import { z } from "zod";
import { getAttemptRepository } from "@/modules/attempts/repository";
import { autosaveAttemptAnswers } from "@/modules/attempts/use-cases";
import { getRequestActor } from "@/modules/auth/request-actor";

const SaveAnswersSchema = z.object({ answers: z.array(z.object({ questionId: z.string().uuid(), selectedOptionId: z.string().min(1) })).min(1) });
type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  const parsed = SaveAnswersSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid answers", issues: parsed.error.flatten() }, { status: 400 });
  const { id } = await context.params;
  try {
    const { actor } = await getRequestActor();
    const attempt = await autosaveAttemptAnswers(getAttemptRepository(), id, actor, parsed.data.answers);
    return NextResponse.json({ attemptId: attempt.id, savedAnswers: attempt.answers.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save answers" }, { status: 400 });
  }
}
