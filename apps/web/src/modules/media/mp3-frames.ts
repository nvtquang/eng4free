/**
 * Minimal MPEG audio Layer III frame handling, enough to join TTS clips into one
 * dialogue recording without ffmpeg. Clips must share one encoding (the TTS engine
 * always returns the same format); pauses are inserted as silent frames.
 */
type Frame = { offset: number; length: number; version: number; sampleRate: number; channelMode: number; samples: number };

const BITRATES_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const BITRATES_V2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
// Version bits: 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5 (1 is reserved).
const SAMPLE_RATES: Record<number, number[]> = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

function readFrameHeader(buffer: Uint8Array, offset: number, padded = true): Omit<Frame, "offset"> | null {
  if (offset + 4 > buffer.length || buffer[offset] !== 0xff || (buffer[offset + 1]! & 0xe0) !== 0xe0) return null;
  const b1 = buffer[offset + 1]!, b2 = buffer[offset + 2]!, b3 = buffer[offset + 3]!;
  const version = (b1 >> 3) & 3, layer = (b1 >> 1) & 3, bitrateIndex = b2 >> 4, rateIndex = (b2 >> 2) & 3;
  if (version === 1 || layer !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) return null;
  const mpeg1 = version === 3;
  const bitrate = (mpeg1 ? BITRATES_V1 : BITRATES_V2)[bitrateIndex]! * 1000;
  const sampleRate = SAMPLE_RATES[version]![rateIndex]!;
  const padding = padded ? (b2 >> 1) & 1 : 0;
  return { length: Math.floor(((mpeg1 ? 144 : 72) * bitrate) / sampleRate) + padding, version, sampleRate, channelMode: b3 >> 6, samples: mpeg1 ? 1152 : 576 };
}

function id3Size(buffer: Uint8Array) {
  if (buffer.length < 10 || buffer[0] !== 0x49 || buffer[1] !== 0x44 || buffer[2] !== 0x33) return 0;
  const size = ((buffer[6]! & 0x7f) << 21) | ((buffer[7]! & 0x7f) << 14) | ((buffer[8]! & 0x7f) << 7) | (buffer[9]! & 0x7f);
  return 10 + size + (buffer[5]! & 0x10 ? 10 : 0);
}

function isInfoFrame(buffer: Uint8Array, frame: Frame) {
  const head = Buffer.from(buffer.subarray(frame.offset, frame.offset + Math.min(frame.length, 64))).toString("latin1");
  return head.includes("Xing") || head.includes("Info") || head.includes("VBRI");
}

/** Audio frames in order, skipping ID3 tags, Xing/Info header frames and a truncated tail. */
export function parseMp3Frames(buffer: Uint8Array): Frame[] {
  const frames: Frame[] = [];
  let offset = id3Size(buffer);
  while (offset + 4 <= buffer.length) {
    const header = readFrameHeader(buffer, offset);
    if (!header) { offset += 1; continue; }
    if (offset + header.length > buffer.length) break;
    const frame = { offset, ...header };
    if (!(frames.length === 0 && isInfoFrame(buffer, frame))) frames.push(frame);
    offset += header.length;
  }
  return frames;
}

export function mp3DurationMs(buffer: Uint8Array) {
  return Math.round(parseMp3Frames(buffer).reduce((sum, frame) => sum + (frame.samples / frame.sampleRate) * 1000, 0));
}

/** A frame with no main data decodes as silence; it copies the reference header without padding. */
function silentFrame(buffer: Uint8Array, reference: Frame) {
  const header = Uint8Array.from(buffer.subarray(reference.offset, reference.offset + 4));
  header[2] = header[2]! & ~0x02;
  const length = readFrameHeader(header, 0)!.length;
  const frame = new Uint8Array(length);
  frame.set(header);
  return frame;
}

/** Joins clips with `gapMs` of silence between them (and optional lead/tail silence). */
export function concatMp3(clips: Uint8Array[], options: { gapMs: number; leadMs?: number; tailMs?: number }): Uint8Array {
  const parsed = clips.map((clip) => ({ clip, frames: parseMp3Frames(clip) }));
  const first = parsed.find((item) => item.frames.length);
  if (!first) throw new Error("No MP3 audio frames found in the clips");
  const reference = first.frames[0]!;
  for (const { frames } of parsed) for (const frame of frames) {
    if (frame.version !== reference.version || frame.sampleRate !== reference.sampleRate || frame.channelMode !== reference.channelMode) throw new Error("MP3 clips use different encodings and cannot be joined frame by frame");
  }
  const silence = silentFrame(first.clip, reference);
  const frameMs = (reference.samples / reference.sampleRate) * 1000;
  const pause = (ms = 0) => Array.from({ length: Math.round(ms / frameMs) }, () => silence);
  const parts: Uint8Array[] = [...pause(options.leadMs)];
  parsed.forEach(({ clip, frames }, index) => {
    if (index > 0) parts.push(...pause(options.gapMs));
    for (const frame of frames) parts.push(clip.subarray(frame.offset, frame.offset + frame.length));
  });
  parts.push(...pause(options.tailMs));
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
}
