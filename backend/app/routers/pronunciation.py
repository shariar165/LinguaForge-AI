from fastapi import APIRouter, Depends

from ..auth import AuthedUser, get_current_user
from ..schemas import PronunciationScoreRequest, PronunciationScoreResponse
from ..services.scoring import score_pronunciation

router = APIRouter(prefix="/api/pronunciation", tags=["pronunciation"])


@router.post("/score", response_model=PronunciationScoreResponse)
async def score(
    body: PronunciationScoreRequest,
    user: AuthedUser = Depends(get_current_user),
) -> PronunciationScoreResponse:
    return score_pronunciation(body.target_text, body.transcript)
