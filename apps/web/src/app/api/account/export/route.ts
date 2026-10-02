import { NextResponse } from "next/server";
import { createDatabase } from "@/db/client";
import { exportOwnerData } from "@/modules/account/data";
import { getRequestOwner } from "@/modules/account/owner";

/** "Download my data": everything stored about this learner or account, as a JSON file. */
export async function GET() {
  const db = createDatabase();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const owner = await getRequestOwner();
  if (!owner.learnerId && !owner.userId) return NextResponse.json({ error: "No learning data yet" }, { status: 404 });
  const data = await exportOwnerData(db, owner);
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(data, null, 2), { headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="english4free-data-${day}.json"`, "cache-control": "no-store" } });
}
