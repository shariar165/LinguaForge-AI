from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class TutorChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=40)
    lesson_context: str | None = Field(default=None, max_length=2000)


class TutorExplainRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    kind: Literal["word", "grammar", "sentence"] = "word"


class TutorExplainResponse(BaseModel):
    explanation: str


class PronunciationScoreRequest(BaseModel):
    target_text: str = Field(min_length=1, max_length=500)
    transcript: str = Field(max_length=1000)


class WordResult(BaseModel):
    word: str
    heard: str | None
    similarity: float
    matched: bool


class PronunciationScoreResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    words: list[WordResult]
    tips: list[str]


class QuizGenerateRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=200)
    level: Literal["A1", "A2", "B1"] = "A1"
    count: int = Field(default=5, ge=1, le=10)


class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(min_length=2, max_length=5)
    answer_index: int = Field(ge=0)
    explanation: str


class QuizGenerateResponse(BaseModel):
    questions: list[QuizQuestion]
