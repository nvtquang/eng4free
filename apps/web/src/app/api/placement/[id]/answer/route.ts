import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { PlacementConflictError, answerPlacement } from "@/modules/placement/service";

const AnswerSchema = z.object({ itemId: z.string().uuid(), optionId: z.string().min(1).max(8) });

/** Grades one answer on the server; the response never says whether it was correct. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = AnswerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  try {
    const { id } = await params;
    const { learner } = await getRequestLearner(false);
    return NextResponse.json(await answerPlacement(learner, id, parsed.data.itemId, parsed.data.optionId));
  } catch (error) {
    if (error instanceof PlacementConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: "Placement attempt not found" }, { status: 404 });
  }
}
