import { PronunciationAnalysisSchema, SpeechAnalysisRequestSchema, WordAlignmentSchema } from "@english4free/content-schemas";
import type { PronunciationAnalysis, SpeechAnalysisRequest, SpeechService, WordAlignment } from "./speech-service";
import { postProviderJson, ProviderUnavailableError } from "@/lib/provider-http";

export class SpeechServiceUnavailableError extends Error { constructor(message = "Speech service is not configured") { super(message); this.name = "SpeechServiceUnavailableError"; } }
export class HttpSpeechService implements SpeechService {
  constructor(private readonly baseUrl = process.env.SPEECH_SERVICE_URL) {}
  private url(path: string) { if (!this.baseUrl) throw new SpeechServiceUnavailableError(); return new URL(path, this.baseUrl).toString(); }
  private async post<T>(path: string, body: unknown, schema: { parse(value: unknown): T }): Promise<T> { try { return schema.parse(await postProviderJson(this.url(path), body, { apiKey: process.env.SPEECH_SERVICE_API_KEY, apiKeyHeader: "x-api-key", timeout: process.env.SPEECH_SERVICE_TIMEOUT_MS, unavailableMessage: "Speech service unavailable" })); } catch (error) { if (error instanceof ProviderUnavailableError) throw new SpeechServiceUnavailableError(error.message); throw error; } }
  async transcribe(input: { recordingMediaId: string; language: "en" }): Promise<{ transcript: string; words: WordAlignment[] }> { const result = await this.post("/v1/transcriptions", input, { parse: (value) => { const parsed = PronunciationAnalysisSchema.pick({ transcript: true, words: true }).parse(value); return parsed; } }); return result; }
  async align(input: SpeechAnalysisRequest): Promise<WordAlignment[]> { SpeechAnalysisRequestSchema.parse(input); const result = await this.post("/v1/alignments", input, { parse: (value) => WordAlignmentSchema.array().parse(value) }); return result; }
  async analyzePronunciation(input: SpeechAnalysisRequest): Promise<PronunciationAnalysis> { return this.post("/v1/pronunciation-analyses", SpeechAnalysisRequestSchema.parse(input), PronunciationAnalysisSchema); }
}
