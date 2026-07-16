import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .errors import register_error_handlers
from .routers import pronunciation, quiz, tutor

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

app = FastAPI(title="LinguaVerse AI API", version="0.1.0", docs_url="/api/docs", openapi_url="/api/openapi.json")

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

register_error_handlers(app)

app.include_router(tutor.router)
app.include_router(pronunciation.router)
app.include_router(quiz.router)


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}
