"""Pronunciation scoring: align the learner's transcript against the target text.

The browser transcribes the learner's speech (Web Speech API); we align the
transcript word-by-word against the target sentence and score similarity.
Deterministic and free — no model call involved.
"""

import re
import string
from difflib import SequenceMatcher

from ..schemas import PronunciationScoreResponse, WordResult

_PUNCT_TABLE = str.maketrans("", "", string.punctuation + "’‘“”")


def _normalize_words(text: str) -> list[str]:
    return [w.translate(_PUNCT_TABLE).lower() for w in re.split(r"\s+", text.strip()) if w.translate(_PUNCT_TABLE)]


def _word_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()


def score_pronunciation(target_text: str, transcript: str) -> PronunciationScoreResponse:
    target_words = _normalize_words(target_text)
    heard_words = _normalize_words(transcript)
    display_words = [w for w in re.split(r"\s+", target_text.strip()) if w]

    if not target_words:
        return PronunciationScoreResponse(score=0, words=[], tips=["Nothing to score."])

    if not heard_words:
        words = [
            WordResult(word=dw, heard=None, similarity=0.0, matched=False)
            for dw in display_words
        ]
        return PronunciationScoreResponse(
            score=0,
            words=words,
            tips=["We couldn't hear anything. Check your microphone and speak a little louder."],
        )

    # Align the two word sequences, then measure per-word character similarity.
    matcher = SequenceMatcher(None, target_words, heard_words)
    heard_for_target: list[str | None] = [None] * len(target_words)
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag in ("equal", "replace"):
            for offset in range(i2 - i1):
                j = j1 + offset
                heard_for_target[i1 + offset] = heard_words[j] if j < j2 else None

    words: list[WordResult] = []
    total = 0.0
    for idx, tw in enumerate(target_words):
        heard = heard_for_target[idx]
        sim = _word_similarity(tw, heard) if heard else 0.0
        matched = sim >= 0.8
        display = display_words[idx] if idx < len(display_words) else tw
        words.append(WordResult(word=display, heard=heard, similarity=round(sim, 2), matched=matched))
        total += sim

    score = round((total / len(target_words)) * 100)

    tips: list[str] = []
    missed = [w for w in words if not w.matched]
    if not missed:
        tips.append("Excellent! Every word was clear.")
    else:
        worst = sorted(missed, key=lambda w: w.similarity)[:3]
        for w in worst:
            if w.heard:
                tips.append(f'"{w.word}" sounded like "{w.heard}" — listen again and repeat it slowly.')
            else:
                tips.append(f'We didn\'t catch "{w.word}" — try emphasizing it clearly.')
        if len(heard_words) < len(target_words) * 0.6:
            tips.append("Try to say the whole sentence — some words were missing.")

    return PronunciationScoreResponse(score=min(score, 100), words=words, tips=tips)
