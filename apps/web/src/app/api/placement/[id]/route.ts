import { NextResponse } from "next/server";
import { getRequestLearner } from "@/modules/auth/request-actor";
import { getPlacement } from "@/modules/placement/service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { learner } = await getRequestLearner(false);
    return NextResponse.json(await getPlacement(learner, id));
  } catch {
    return NextResponse.json({ error: "Placement attempt not found" }, { status: 404 });
  }
}
