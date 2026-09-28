"""Piper TTS worker for scripts/content/generate-audio.ts.

Reads one JSON request from stdin and writes MP3 files:

  {"voicesDir": "...", "jobs": [{"output": "x.mp3", "pauseMs": 700, "leadMs": 300, "tailMs": 500,
    "segments": [{"model": "en_GB-vctk-medium", "speaker": "p226", "text": "...", "lengthScale": 1.0}]}]}

`--probe` mode instead synthesises a test sentence for each requested speaker and
prints its median pitch, which is how voice genders in the casting table are checked.
Voice models are loaded once per run. Output is 22.05 kHz mono MP3 (48 kbps CBR, plenty for speech).
"""
import json
import sys
from pathlib import Path

import lameenc
import numpy as np
from piper import PiperVoice, SynthesisConfig

_voices: dict[str, PiperVoice] = {}


def load_voice(voices_dir: str, model: str) -> PiperVoice:
    if model not in _voices:
        _voices[model] = PiperVoice.load(str(Path(voices_dir) / f"{model}.onnx"))
    return _voices[model]


def synthesize(voices_dir: str, segment: dict) -> tuple[np.ndarray, int]:
    voice = load_voice(voices_dir, segment["model"])
    speaker = segment.get("speaker")
    speaker_id = voice.config.speaker_id_map.get(speaker) if speaker is not None and voice.config.speaker_id_map else None
    if speaker is not None and speaker_id is None:
        speaker_id = int(speaker) if str(speaker).isdigit() else None
        if speaker_id is None:
            raise ValueError(f"Unknown speaker {speaker} for {segment['model']}")
    config = SynthesisConfig(speaker_id=speaker_id, length_scale=segment.get("lengthScale", 1.0), noise_scale=0.6, noise_w_scale=0.7)
    chunks = [chunk.audio_int16_array for chunk in voice.synthesize(segment["text"], syn_config=config)]
    return np.concatenate(chunks), voice.config.sample_rate


def silence(ms: int, rate: int) -> np.ndarray:
    return np.zeros(int(rate * ms / 1000), dtype=np.int16)


def encode_mp3(samples: np.ndarray, rate: int) -> bytes:
    encoder = lameenc.Encoder()
    encoder.set_bit_rate(48)
    encoder.set_in_sample_rate(rate)
    encoder.set_channels(1)
    encoder.set_quality(2)
    return bytes(encoder.encode(samples.astype(np.int16).tobytes()) + encoder.flush())


def median_pitch(samples: np.ndarray, rate: int) -> float:
    """Rough autocorrelation F0 over voiced 40 ms frames; enough to tell voice genders apart."""
    signal = samples.astype(np.float32) / 32768.0
    frame, hop = int(rate * 0.04), int(rate * 0.02)
    low, high = int(rate / 400), int(rate / 70)
    pitches = []
    for start in range(0, len(signal) - frame, hop):
        window = signal[start:start + frame]
        if np.sqrt(np.mean(window ** 2)) < 0.02:
            continue
        window = window - window.mean()
        corr = np.correlate(window, window, mode="full")[frame - 1:]
        lag = low + int(np.argmax(corr[low:high]))
        if corr[lag] > 0.3 * corr[0]:
            pitches.append(rate / lag)
    return float(np.median(pitches)) if pitches else 0.0


def main() -> None:
    request = json.load(sys.stdin)
    voices_dir = request["voicesDir"]
    if "--probe" in sys.argv:
        for item in request["probe"]:
            samples, rate = synthesize(voices_dir, item)
            print(json.dumps({"model": item["model"], "speaker": item.get("speaker"), "pitch": round(median_pitch(samples, rate), 1), "seconds": round(len(samples) / rate, 2)}), flush=True)
        return
    for job in request["jobs"]:
        parts: list[np.ndarray] = []
        rate = 22050
        for index, segment in enumerate(job["segments"]):
            samples, rate = synthesize(voices_dir, segment)
            if index == 0:
                parts.append(silence(job.get("leadMs", 300), rate))
            else:
                pause = segment.get("pauseBeforeMs")
                parts.append(silence(pause if pause is not None else job.get("pauseMs", 700), rate))
            parts.append(samples)
        parts.append(silence(job.get("tailMs", 500), rate))
        audio = np.concatenate(parts)
        Path(job["output"]).write_bytes(encode_mp3(audio, rate))
        print(json.dumps({"output": job["output"], "durationMs": int(len(audio) * 1000 / rate)}), flush=True)


if __name__ == "__main__":
    main()
