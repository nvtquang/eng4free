import type { Level, PlacementItemDef, PlacementSkill } from "../types";

/** Builds a placement item with a stable key such as `placement:grammar:b1-2`. */
export function item(skill: PlacementSkill, level: Level, number: number, q: string, options: string[], answer: number, why: string, extra: { passage?: string; script?: string } = {}): PlacementItemDef {
  return { key: `placement:${skill.toLowerCase()}:${level.toLowerCase()}-${number}`, skill, level, q, options, answer, why, ...extra };
}

/** A listening script with one line per speaker turn ("Woman: …"). */
export function talk(...lines: string[]): string {
  return lines.join("\n");
}
