from pydantic import BaseModel, Field, model_validator

class TranscriptionRequest(BaseModel):
    recordingMediaId: str = Field(min_length=1)
    language: str = "en"

class AnalysisRequest(TranscriptionRequest):
    expectedText: str | None = Field(default=None, min_length=1)

class WordAlignment(BaseModel):
    word: str = Field(min_length=1)
    startMs: int = Field(ge=0)
    endMs: int = Field(ge=0)
    confidence: float = Field(ge=0, le=1)
    @model_validator(mode="after")
    def valid_range(self):
        if self.endMs < self.startMs: raise ValueError("endMs cannot be before startMs")
        return self

class TranscriptionResult(BaseModel):
    transcript: str
    words: list[WordAlignment]

class PhonemeFeedback(BaseModel):
    phoneme: str = Field(min_length=1)
    status: str
    feedback: str = Field(min_length=1)

class AnalysisResult(TranscriptionResult):
    phonemeFeedback: list[PhonemeFeedback]
    overallScore: float | None = Field(default=None, ge=0, le=100)
