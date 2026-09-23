import hmac
import os
from fastapi import FastAPI, Header, HTTPException
from .models import AnalysisRequest, AnalysisResult, TranscriptionRequest, TranscriptionResult, WordAlignment

app = FastAPI(title="English 4 Free Speech Service", version="0.1.0")

@app.get("/health")
def health() -> dict[str, object]:
    return {"status": "ok", "providerConfigured": False}

def provider_not_configured() -> HTTPException:
    return HTTPException(status_code=503, detail={"code": "SPEECH_PROVIDER_UNAVAILABLE", "message": "Configure a speech provider adapter before analysis."})

def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    expected = os.getenv("SPEECH_SERVICE_API_KEY")
    if expected and (not x_api_key or not hmac.compare_digest(x_api_key, expected)):
        raise HTTPException(status_code=401, detail={"code": "SPEECH_UNAUTHORIZED", "message": "Invalid speech service API key."})

@app.post("/v1/transcriptions", response_model=TranscriptionResult)
def transcribe(_: TranscriptionRequest, x_api_key: str | None = Header(default=None)) -> TranscriptionResult:
    require_api_key(x_api_key)
    raise provider_not_configured()

@app.post("/v1/alignments", response_model=list[WordAlignment])
def align(_: AnalysisRequest, x_api_key: str | None = Header(default=None)) -> list[WordAlignment]:
    require_api_key(x_api_key)
    raise provider_not_configured()

@app.post("/v1/pronunciation-analyses", response_model=AnalysisResult)
def analyze(_: AnalysisRequest, x_api_key: str | None = Header(default=None)) -> AnalysisResult:
    require_api_key(x_api_key)
    raise provider_not_configured()
