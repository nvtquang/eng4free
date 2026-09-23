import type { PronunciationAnalysis, SpeechAnalysisRequest, WordAlignment } from "@english4free/content-schemas";
export type { PronunciationAnalysis, SpeechAnalysisRequest, WordAlignment };
export interface SpeechService { transcribe(input: { recordingMediaId: string; language: "en" }): Promise<{ transcript: string; words: WordAlignment[] }>; align(input: SpeechAnalysisRequest): Promise<WordAlignment[]>; analyzePronunciation(input: SpeechAnalysisRequest): Promise<PronunciationAnalysis>; }
