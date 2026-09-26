import { describe, expect, it } from "vitest";
import { concatMp3, mp3DurationMs, parseMp3Frames } from "./mp3-frames";

// MPEG-2 Layer III, 48 kbps, 24 kHz, mono: 144-byte frames of 576 samples (24 ms).
function frame(fill: number, text = "") {
  const bytes = new Uint8Array(144).fill(fill);
  bytes.set([0xff, 0xf3, 0x64, 0xc4]);
  bytes.set(Buffer.from(text, "latin1"), 13);
  return bytes;
}
const join = (...parts: Uint8Array[]) => Uint8Array.from(parts.flatMap((part) => [...part]));

describe("mp3 frames", () => {
  it("skips ID3 tags, the Info header frame and a truncated tail", () => {
    const id3 = Uint8Array.from([0x49, 0x44, 0x33, 3, 0, 0, 0, 0, 0, 2, 0xaa, 0xbb]);
    const clip = join(id3, frame(1, "Info"), frame(2), frame(3), frame(4).subarray(0, 50));
    const frames = parseMp3Frames(clip);
    expect(frames.map((item) => clip[item.offset + 10])).toEqual([2, 3]);
    expect(mp3DurationMs(clip)).toBe(48);
  });

  it("joins clips with silent frames between them", () => {
    const joined = concatMp3([join(frame(1), frame(2)), join(frame(5))], { gapMs: 48, leadMs: 24 });
    const frames = parseMp3Frames(joined);
    expect(frames).toHaveLength(1 + 2 + 2 + 1);
    const silent = joined.subarray(frames[0]!.offset + 4, frames[0]!.offset + 144);
    expect(silent.every((byte) => byte === 0)).toBe(true);
    expect(mp3DurationMs(joined)).toBe(144);
  });

  it("refuses clips with different encodings", () => {
    const stereo = frame(1); stereo[3] = 0x04;
    expect(() => concatMp3([frame(1), stereo], { gapMs: 0 })).toThrow(/different encodings/);
  });
});
