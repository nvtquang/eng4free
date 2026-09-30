import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { CEFR_ORDER } from "@/modules/placement/adaptive";
import { PlacementConflictError, completePlacement } from "@/modules/placement/service";

const CompleteSchema = z.object({ speaking: z.enum(CEFR_ORDER), writing: z.enum(CEFR_ORDER) });

/** Scores the finished run and records the Speaking/Writing self-assessment. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = CompleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a level for Speaking and Writing" }, { status: 400 });
  try {
    const { id } = await params;
    const { learner } = await getRequestLearner(false);
    return NextResponse.json(await completePlacement(learner, id, { SPEAKING: parsed.data.speaking, WRITING: parsed.data.writing }));
  } catch (error) {
    if (error instanceof PlacementConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: "Placement attempt not found" }, { status: 404 });
  }
}
