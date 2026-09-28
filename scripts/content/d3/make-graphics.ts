/**
 * Draws the D3 figures as static SVG (`pnpm content:d3:graphics`):
 *  - TOEIC "look at the graphic" tables → public/demo-media/images/toeic/graphics/
 *  - IELTS Writing Task 1 line/bar charts and tables → public/demo-media/images/ielts/
 *
 * They are exam figures printed on a white card, so they use the light surface only and
 * carry their numbers as text (direct labels, value labels, gridlines). Series colours are
 * the validated categorical slots 1–3 (blue, orange, aqua); identity is never colour alone:
 * every series also has its own marker shape and a direct label.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import "../../../content/packs/d3";
import { graphics, type GraphicDef } from "../../../content/packs/d3/toeic/media";
import { ieltsCharts, type BarChart, type LineChart, type TableChart } from "../../../content/packs/d3/ielts/charts";

const INK = "#0b0b0b", MUTED = "#52514e", GRID = "#e4e3df", RULE = "#c9c8c3", HEADER = "#f0efec", SURFACE = "#fcfcfb";
const SERIES = ["#2a78d6", "#eb6834", "#1baf7a"];
const FONT = "font-family=\"Arial, Helvetica, sans-serif\"";
const esc = (value: string) => value.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;");
const svg = (width: number, height: number, title: string, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(title)}">\n<rect width="${width}" height="${height}" fill="${SURFACE}"/>\n${body}\n</svg>\n`;

function marker(shape: number, x: number, y: number, color: string) {
  if (shape === 0) return `<circle cx="${x}" cy="${y}" r="4.5" fill="${color}" stroke="${SURFACE}" stroke-width="2"/>`;
  if (shape === 1) return `<rect x="${x - 4.5}" y="${y - 4.5}" width="9" height="9" fill="${color}" stroke="${SURFACE}" stroke-width="2"/>`;
  return `<path d="M${x} ${y - 5.5} L${x + 5.5} ${y + 4.5} L${x - 5.5} ${y + 4.5} Z" fill="${color}" stroke="${SURFACE}" stroke-width="2"/>`;
}

function table(title: string, columns: string[], rows: string[][], note?: string) {
  const widths = columns.map((column, index) => Math.max(column.length, ...rows.map((row) => row[index]!.length)) * 9 + 36);
  const width = Math.max(420, widths.reduce((sum, value) => sum + value, 0) + 40, title.length * 10 + 48);
  const scale = (width - 40) / widths.reduce((sum, value) => sum + value, 0);
  const cols = widths.map((value) => value * scale);
  const rowHeight = 38, top = 64;
  const height = top + rowHeight * (rows.length + 1) + (note ? 44 : 24);
  const xAt = (index: number) => 20 + cols.slice(0, index).reduce((sum, value) => sum + value, 0);
  const parts = [`<text x="20" y="38" ${FONT} font-size="18" font-weight="bold" fill="${INK}">${esc(title)}</text>`, `<rect x="20" y="${top}" width="${width - 40}" height="${rowHeight}" fill="${HEADER}"/>`];
  columns.forEach((column, index) => parts.push(`<text x="${xAt(index) + 12}" y="${top + 24}" ${FONT} font-size="15" font-weight="bold" fill="${INK}">${esc(column)}</text>`));
  rows.forEach((row, rowIndex) => {
    const y = top + rowHeight * (rowIndex + 1);
    parts.push(`<line x1="20" x2="${width - 20}" y1="${y}" y2="${y}" stroke="${RULE}" stroke-width="1"/>`);
    row.forEach((cell, index) => parts.push(`<text x="${xAt(index) + 12}" y="${y + 24}" ${FONT} font-size="15" fill="${INK}">${esc(cell)}</text>`));
  });
  parts.push(`<line x1="20" x2="${width - 20}" y1="${top + rowHeight * (rows.length + 1)}" y2="${top + rowHeight * (rows.length + 1)}" stroke="${RULE}" stroke-width="1"/>`);
  if (note) parts.push(`<text x="20" y="${height - 16}" ${FONT} font-size="12" fill="${MUTED}">${esc(note)}</text>`);
  return svg(Math.round(width), height, title, parts.join("\n"));
}

function lineChart(chart: LineChart) {
  const width = 720, height = 440, left = 60, right = 130, top = 86, bottom = 56;
  const plotW = width - left - right, plotH = height - top - bottom;
  const x = (index: number) => left + (plotW * index) / (chart.xLabels.length - 1);
  const y = (value: number) => top + plotH - (plotH * value) / chart.yMax;
  const parts = [`<text x="${left - 40}" y="34" ${FONT} font-size="18" font-weight="bold" fill="${INK}">${esc(chart.title)}</text>`];
  chart.series.forEach((series, index) => parts.push(`${marker(index, left - 32 + index * 130, 60, SERIES[index]!)}<text x="${left - 22 + index * 130}" y="65" ${FONT} font-size="14" fill="${INK}">${esc(series.label)}</text>`));
  for (let value = 0; value <= chart.yMax; value += 20) parts.push(`<line x1="${left}" x2="${left + plotW}" y1="${y(value)}" y2="${y(value)}" stroke="${GRID}" stroke-width="1"/><text x="${left - 10}" y="${y(value) + 5}" ${FONT} font-size="13" fill="${MUTED}" text-anchor="end">${value}${chart.unit}</text>`);
  chart.xLabels.forEach((label, index) => parts.push(`<text x="${x(index)}" y="${top + plotH + 26}" ${FONT} font-size="13" fill="${MUTED}" text-anchor="middle">${esc(label)}</text>`));
  chart.series.forEach((series, index) => {
    const color = SERIES[index]!;
    parts.push(`<polyline points="${series.values.map((value, point) => `${x(point)},${y(value)}`).join(" ")}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`);
    series.values.forEach((value, point) => parts.push(marker(index, x(point), y(value), color)));
    const last = series.values.length - 1;
    parts.push(`<text x="${x(last) + 12}" y="${y(series.values[last]!) + 5}" ${FONT} font-size="13" fill="${INK}">${esc(series.label)} · ${series.values[last]}${chart.unit}</text>`);
  });
  parts.push(`<line x1="${left}" x2="${left + plotW}" y1="${top + plotH}" y2="${top + plotH}" stroke="${RULE}" stroke-width="1"/>`);
  return svg(width, height, chart.title, parts.join("\n"));
}

function barChart(chart: BarChart) {
  const width = 760, height = 460, left = 60, right = 24, top = 92, bottom = 64;
  const plotW = width - left - right, plotH = height - top - bottom;
  const y = (value: number) => top + plotH - (plotH * value) / chart.yMax;
  const groupW = plotW / chart.categories.length, barW = Math.min(34, (groupW - 40) / chart.series.length);
  const parts = [`<text x="20" y="34" ${FONT} font-size="18" font-weight="bold" fill="${INK}">${esc(chart.title)}</text>`];
  chart.series.forEach((series, index) => parts.push(`<rect x="${20 + index * 150}" y="52" width="14" height="14" rx="3" fill="${SERIES[index]}"/><text x="${40 + index * 150}" y="64" ${FONT} font-size="14" fill="${INK}">${esc(series.label)}</text>`));
  for (let value = 0; value <= chart.yMax; value += 3) parts.push(`<line x1="${left}" x2="${left + plotW}" y1="${y(value)}" y2="${y(value)}" stroke="${GRID}" stroke-width="1"/><text x="${left - 10}" y="${y(value) + 5}" ${FONT} font-size="13" fill="${MUTED}" text-anchor="end">${value}</text>`);
  parts.push(`<text x="16" y="${top - 10}" ${FONT} font-size="12" fill="${MUTED}">${esc(chart.unit)}</text>`);
  chart.categories.forEach((category, group) => {
    const start = left + group * groupW + (groupW - (barW * chart.series.length + 2 * (chart.series.length - 1))) / 2;
    chart.series.forEach((series, index) => {
      const value = series.values[group]!, bx = start + index * (barW + 2), by = y(value), h = top + plotH - by;
      // Bar with 4px rounded data end, square at the baseline.
      parts.push(`<path d="M${bx} ${top + plotH} V${by + 4} Q${bx} ${by} ${bx + 4} ${by} H${bx + barW - 4} Q${bx + barW} ${by} ${bx + barW} ${by + 4} V${top + plotH} Z" fill="${SERIES[index]}"/>`);
      parts.push(`<text x="${bx + barW / 2}" y="${by - 6}" ${FONT} font-size="12" fill="${INK}" text-anchor="middle">${value}</text>`);
      if (h < 0) throw new Error("negative bar");
    });
    parts.push(`<text x="${left + group * groupW + groupW / 2}" y="${top + plotH + 26}" ${FONT} font-size="13" fill="${MUTED}" text-anchor="middle">${esc(category)}</text>`);
  });
  parts.push(`<line x1="${left}" x2="${left + plotW}" y1="${top + plotH}" y2="${top + plotH}" stroke="${RULE}" stroke-width="1"/>`);
  return svg(width, height, chart.title, parts.join("\n"));
}

const publicDir = resolve(process.cwd(), "apps/web/public/demo-media/images");
mkdirSync(resolve(publicDir, "toeic/graphics"), { recursive: true });
mkdirSync(resolve(publicDir, "ielts"), { recursive: true });
const seen = new Set<string>();
for (const def of graphics as GraphicDef[]) {
  if (seen.has(def.name)) continue;
  seen.add(def.name);
  writeFileSync(resolve(publicDir, `toeic/graphics/${def.name}.svg`), table(def.title, def.columns, def.rows, def.note));
}
for (const chart of ieltsCharts) {
  const file = resolve(publicDir, `ielts/${chart.name}.svg`);
  if (chart.kind === "line") writeFileSync(file, lineChart(chart));
  else if (chart.kind === "bar") writeFileSync(file, barChart(chart));
  else writeFileSync(file, table(chart.title, (chart as TableChart).columns, (chart as TableChart).rows, (chart as TableChart).note));
}
console.log(`Wrote ${seen.size} TOEIC graphics and ${ieltsCharts.length} IELTS figures.`);
