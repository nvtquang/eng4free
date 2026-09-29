/**
 * Builds the reviewer's spot-check sheet (`pnpm content:d3:review-sample`).
 *
 * For every D3 batch it draws a fixed random sample of about 15% of the items (seeded, so
 * the sheet is stable between runs) and adds every question the blind cross-check disagreed
 * with. The result is docs/content/d3-review-sample.md: each item shows exactly what the
 * learner sees, the answer key and the explanation, with a checkbox for the reviewer.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildQuestionFromAuthoring } from "@english4free/content-schemas";
import { d3Batches, d3Exams, d3Lessons, d3Prompts, d3Vocabulary } from "../../../content/packs/d3";
import { arrangeLessonOptions, type BatchKey } from "../../../content/packs/d3/types";

const RATE = Number(process.env.REVIEW_RATE ?? 0.15);
const LETTERS = "ABCDEFGHIJKL";
const crosscheckPath = resolve(process.cwd(), "content/packs/d3/qa/crosscheck.json");
const crosscheck = existsSync(crosscheckPath) ? JSON.parse(readFileSync(crosscheckPath, "utf8")) as { checked: Record<string, string>; mismatches: Array<{ id: string; key: string; modelAnswer: string; modelNote?: string }> } : { checked: {}, mismatches: [] };
const flagged = new Map(crosscheck.mismatches.map((item) => [item.id, item]));

function seeded(seed: string) {
  let state = [...seed].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261);
  return () => { state = (state + 0x6d2b79f5) >>> 0; let value = state; value = Math.imul(value ^ (value >>> 15), value | 1); value ^= value + Math.imul(value ^ (value >>> 7), value | 61); return ((value ^ (value >>> 14)) >>> 0) / 4294967296; };
}
function sample<T extends { id: string }>(items: T[], seed: string): T[] {
  const random = seeded(seed);
  const count = Math.max(1, Math.ceil(items.length * RATE));
  const shuffled = items.map((item) => ({ item, order: random() })).sort((a, b) => a.order - b.order).map(({ item }) => item);
  const chosen = new Set(shuffled.slice(0, count).map((item) => item.id));
  return items.filter((item) => chosen.has(item.id) || flagged.has(item.id));
}

type Entry = { id: string; markdown: string };
const sections: Record<BatchKey, Entry[]> = { lessons: [], grammar: [], vocabulary: [], toeic: [], ielts: [], "skills-extra": [] };

for (const lesson of d3Lessons) {
  lesson.blocks.forEach((block, blockIndex) => {
    if (block.kind !== "practice") return;
    block.questions.forEach((question, n) => {
      const arranged = arrangeLessonOptions(`${lesson.key}:${blockIndex}`, question, n);
      const id = `${lesson.level}/${lesson.slug}/q${n + 1}`;
      sections[lesson.batch].push({ id, markdown: `**${lesson.level} · ${lesson.title} · câu ${n + 1}** \`${id}\`\n\n${question.q}\n\n${arranged.options.map((option, index) => `- ${LETTERS[index]}. ${option}${index === arranged.answer ? " ✅" : ""}`).join("\n")}\n\n*Giải thích:* ${question.why}` });
    });
  });
}

for (const exam of d3Exams) {
  for (const part of exam.parts) part.groups.forEach((group, groupIndex) => group.questions.forEach((question, n) => {
    const built = buildQuestionFromAuthoring(question.authoring);
    if (!built.success) return;
    const id = `${exam.slug}/p${part.partNumber}/g${groupIndex + 1}/q${n + 1}`;
    const q = built.data;
    const answer = q.answer as Record<string, unknown>;
    let body = "";
    if (q.type === "MCQ" || q.type === "MULTI_SELECT") {
      const keys = q.type === "MCQ" ? [answer.correctOptionId] : answer.correctOptionIds as string[];
      body = q.content.options.map((option) => `- ${option.id.toUpperCase()}. ${option.text}${keys.includes(option.id) ? " ✅" : ""}`).join("\n");
    } else if (q.type === "TRUE_FALSE") body = `Đáp án: **${answer.correct}**`;
    else if (q.type === "FILL_BLANK") body = `Đáp án chấp nhận: ${Object.entries(answer.blanks as Record<string, string[]>).map(([token, forms]) => `(${token}) ${forms.join(" / ")}`).join("; ")}`;
    else if (q.type === "MATCHING") body = q.content.items.map((item) => `- ${item.text} → **${String((answer.matches as Record<string, string>)[item.id]).toUpperCase()}**`).join("\n") + `\n\nLựa chọn: ${q.content.options.map((option) => `${option.id.toUpperCase()}. ${option.text}`).join(" · ")}`;
    const material = question.audio ? `> 🔊 ${question.audio.replace(/\n/gu, "\n> ")}\n\n` : n === 0 && group.listening ? `> 🔊 ${group.listening.script.replace(/\n/gu, "\n> ")}\n\n` : "";
    const picture = question.image ? `![${question.image.alt}](../../apps/web/public${question.image.src})\n\n` : "";
    const flag = flagged.get(id);
    sections[exam.batch].push({ id, markdown: `**${exam.title} · Part ${part.partNumber} · ${group.title ?? ""} · câu ${n + 1}** \`${id}\`${flag ? `\n\n⚠️ **AI giải chéo trả lời khác:** ${flag.modelAnswer}${flag.modelNote ? ` — ${flag.modelNote}` : ""}` : ""}\n\n${picture}${material}${q.content.prompt}\n\n${body}\n\n*Giải thích:* ${question.explanation}` });
  }));
}

for (const prompt of d3Prompts) sections.ielts.push({ id: `prompt/${prompt.slug}`, markdown: `**${prompt.title}** \`prompt/${prompt.slug}\`\n\n${prompt.content.prompt}${prompt.content.cueCard ? `\n\nCue card: ${prompt.content.cueCard.topic} — ${prompt.content.cueCard.points.join("; ")}; ${prompt.content.cueCard.closing}` : ""}` });

for (const entry of d3Vocabulary()) {
  const id = `vocab/${entry.headword}/${entry.pos}/${entry.level}`;
  sections.vocabulary.push({ id, markdown: `**${entry.headword}** (${entry.pos}, ${entry.level}) ${entry.ipa} — *${entry.meaningVi}* — nghĩa Wiktionary: "${entry.sense}"\n\nVí dụ: ${entry.example ?? "(chưa có)"} · [nguồn](${entry.sources.meaning.url})` });
}

const lines = [
  "# D3 — Bảng duyệt ngẫu nhiên",
  "",
  `Tạo lúc ${new Date().toISOString().slice(0, 10)}. Mỗi batch lấy ngẫu nhiên khoảng ${Math.round(RATE * 100)}% mục (seed cố định), cộng thêm mọi câu AI giải chéo trả lời khác đáp án (⚠️).`,
  `AI giải chéo đã kiểm tra ${Object.keys(crosscheck.checked).length} câu, ${crosscheck.mismatches.length} câu lệch.`,
  "",
  "**Cách duyệt:** đọc từng mục, đánh dấu [x] nếu đúng; ghi lỗi ngay dưới mục nếu sai. Khi một batch ổn, vào CMS `/admin` → Content batches → chuyển batch sang **APPROVED**, rồi chạy `pnpm content:d3:publish -- --batch=<tên>`.",
  ""
];
for (const [key, entries] of Object.entries(sections) as Array<[BatchKey, Entry[]]>) {
  const picked = sample(entries, `d3-review:${key}`);
  lines.push(`## ${d3Batches[key].title} (\`${key}\`) — ${picked.length}/${entries.length} mục`, "");
  for (const entry of picked) lines.push(`- [ ] ${entry.markdown.replace(/\n/gu, "\n  ")}`, "");
}
mkdirSync(resolve(process.cwd(), "docs/content"), { recursive: true });
writeFileSync(resolve(process.cwd(), "docs/content/d3-review-sample.md"), lines.join("\n"));
console.log(`Wrote docs/content/d3-review-sample.md (${Object.values(sections).reduce((sum, entries) => sum + entries.length, 0)} items in the pack).`);
