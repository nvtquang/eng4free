import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Image } from "../types";

type Credit = { credit: string };
const credits = JSON.parse(readFileSync(resolve(process.cwd(), "apps/web/public/demo-media/images/credits.json"), "utf8")) as Record<string, Credit>;

/** A CC0 photograph from public/demo-media/images/toeic, with its recorded credit line. */
export function photo(name: string, alt: string): Image {
  const credit = credits[`toeic/${name}.jpg`]?.credit;
  if (!credit) throw new Error(`No credit recorded for toeic/${name}.jpg`);
  return { src: `/demo-media/images/toeic/${name}.jpg`, alt, credit };
}

/**
 * A table-style graphic (timetable, price list, floor directory) drawn by
 * scripts/content/d3/make-graphics.ts from the same data, so the picture and the
 * questions can never disagree.
 */
export type GraphicDef = { name: string; title: string; columns: string[]; rows: string[][]; note?: string };
export const graphics: GraphicDef[] = [];
export function graphic(def: GraphicDef): Image {
  graphics.push(def);
  return { src: `/demo-media/images/toeic/graphics/${def.name}.svg`, alt: `${def.title}: ${def.columns.join(", ")} — ${def.rows.map((row) => row.join(" ")).join("; ")}`, credit: "Graphic: English 4 Free original, CC0 1.0" };
}
