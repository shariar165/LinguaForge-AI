from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from ..auth import AuthedUser, get_current_user
from ..config import Settings, get_settings
from ..schemas import TutorChatRequest, TutorExplainRequest, TutorExplainResponse
from ..services.ai import TUTOR_SYSTEM_PROMPT, complete_text, ensure_ai_configured, stream_chat
from ..services.usage import check_and_increment_usage

router = APIRouter(prefix="/api/tutor", tags=["tutor"])


@router.post("/chat")
async def tutor_chat(
    body: TutorChatRequest,
    user: AuthedUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> StreamingResponse:
    # Fail with a proper 503 before the stream starts (and before spending quota).
    ensure_ai_configured(settings)
    await check_and_increment_usage(settings, user.id)

    system_prompt = TUTOR_SYSTEM_PROMPT
    if body.lesson_context:
        system_prompt += f"\n\nThe student is currently studying: {body.lesson_context}"

    messages = [m.model_dump() for m in body.messages]
    return StreamingResponse(
        stream_chat(settings, messages, system_prompt),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/explain", response_model=TutorExplainResponse)
async def tutor_explain(
    body: TutorExplainRequest,
    user: AuthedUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> TutorExplainResponse:
    ensure_ai_configured(settings)
    await check_and_increment_usage(settings, user.id)

    prompts = {
        "word": (
            "Explain this English word to a beginner: give a simple definition, "
            "one example sentence, and its part of speech. Keep it under 80 words."
        ),
        "grammar": (
            "Explain this English grammar point to a beginner with one clear rule "
            "and two short examples. Keep it under 120 words."
        ),
        "sentence": (
            "Explain what this English sentence means in simple words, and point out "
            "any useful grammar or vocabulary in it. Keep it under 100 words."
        ),
    }
    explanation = await complete_text(
        settings, TUTOR_SYSTEM_PROMPT, f"{prompts[body.kind]}\n\nText: {body.text}"
    )
    return TutorExplainResponse(explanation=explanation)
