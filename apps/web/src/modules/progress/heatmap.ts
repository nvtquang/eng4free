import type { ProgressEvent } from "./progress";

export type HeatmapCell = { key: string; count: number; level: number; future: boolean };
export type StreakHeatmap = { weeks: HeatmapCell[][]; monthLabels: string[]; activeDays: number };

const weeksToShow = 20;
const dayLabelsVi = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const dayLabelsEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function toUtcDate(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function mondayOf(date: Date) {
  const monday = new Date(date);
  const offset = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - offset);
  return monday;
}

function levelFor(count: number) {
  if (count >= 6) return 4;
  if (count >= 4) return 3;
  if (count >= 2) return 2;
  if (count >= 1) return 1;
  return 0;
}

export function buildStreakHeatmap(events: readonly ProgressEvent[], now = new Date(), timeZone = "Asia/Ho_Chi_Minh", locale = "vi"): StreakHeatmap {
  const counts = new Map<string, number>();
  for (const event of events) {
    const key = dateKey(event.occurredAt, timeZone);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const todayKey = dateKey(now, timeZone);
  const start = mondayOf(toUtcDate(todayKey));
  start.setUTCDate(start.getUTCDate() - (weeksToShow - 1) * 7);

  const formatter = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { timeZone: "UTC", month: locale === "vi" ? "numeric" : "short" });
  const weeks: HeatmapCell[][] = [];
  const monthLabels: string[] = [];
  let previousMonth = -1;
  let activeDays = 0;

  for (let week = 0; week < weeksToShow; week += 1) {
    const days: HeatmapCell[] = [];
    let label = "";
    for (let day = 0; day < 7; day += 1) {
      const cursor = new Date(start);
      cursor.setUTCDate(start.getUTCDate() + week * 7 + day);
      const key = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).format(cursor);
      const count = counts.get(key) ?? 0;
      if (count > 0) activeDays += 1;
      days.push({ key, count, level: levelFor(count), future: key > todayKey });
    }
    const weekMonth = toUtcDate(days[0].key).getUTCMonth();
    if (week > 0 && weekMonth !== previousMonth) label = formatter.format(toUtcDate(days[0].key));
    previousMonth = weekMonth;
    weeks.push(days);
    monthLabels.push(label);
  }

  return { weeks, monthLabels, activeDays };
}

export function heatmapDayLabels(locale: string) {
  return locale === "vi" ? dayLabelsVi : dayLabelsEn;
}
