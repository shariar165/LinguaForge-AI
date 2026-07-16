from fastapi import APIRouter, Depends
from pydantic import ValidationError

from ..auth import AuthedUser, get_current_user
from ..config import Settings, get_settings
from ..errors import ApiError
from ..schemas import QuizGenerateRequest, QuizGenerateResponse
from ..services.ai import complete_json, ensure_ai_configured
from ..services.usage import check_and_increment_usage

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

QUIZ_SYSTEM_PROMPT = """You create English practice quizzes for language learners.
Respond ONLY with a JSON object of this exact shape:
{"questions": [{"question": "...", "options": ["...", "...", "...", "..."], "answer_index": 0, "explanation": "..."}]}
Rules: options must contain exactly one correct answer at answer_index; explanations are one short
sentence; question difficulty must match the requested CEFR level."""


@router.post("/generate", response_model=QuizGenerateResponse)
async def generate_quiz(
    body: QuizGenerateRequest,
    user: AuthedUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> QuizGenerateResponse:
    ensure_ai_configured(settings)
    await check_and_increment_usage(settings, user.id)

    raw = await complete_json(
        settings,
        QUIZ_SYSTEM_PROMPT,
        f"Create {body.count} multiple-choice questions about '{body.topic}' at CEFR level {body.level}.",
    )
    try:
        quiz = QuizGenerateResponse.model_validate(raw)
    except ValidationError as exc:
        raise ApiError(502, "ai_bad_output", "The AI returned an invalid quiz. Please try again.") from exc

    for q in quiz.questions:
        if q.answer_index >= len(q.options):
            raise ApiError(502, "ai_bad_output", "The AI returned an invalid quiz. Please try again.")
    return quiz
