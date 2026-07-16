export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type VocabularyItem = {
  word: string;
  ipa: string;
  syllables: string;
  definition: string;
  example: string;
};

export type LessonContent = {
  vocabulary: VocabularyItem[];
  grammar: {
    title: string;
    explanation: string;
    examples: { text: string; note?: string }[];
  };
  listening: {
    title: string;
    text: string;
    questions: QuizQuestion[];
  };
  quiz: QuizQuestion[];
  speaking: {
    sentences: string[];
  };
};

export type Lesson = {
  id: string;
  unit: number;
  unit_title: string;
  level: "A1" | "A2" | "B1";
  order: number;
  title: string;
  description: string;
  xp_reward: number;
  content: LessonContent;
};

export type LessonSummary = Omit<Lesson, "content">;

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  xp: number;
  daily_goal_minutes: number;
};

export type Streak = {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
};

export type UserProgress = {
  lesson_id: string;
  status: "in_progress" | "completed";
  quiz_score: number | null;
  completed_at: string | null;
};

export type SavedWord = {
  id: number;
  word: string;
  definition: string;
  example: string;
  created_at: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement_kind: "lessons_completed" | "streak_days" | "xp_total" | "words_saved";
  requirement_value: number;
};

export type WordResult = {
  word: string;
  heard: string | null;
  similarity: number;
  matched: boolean;
};

export type PronunciationScore = {
  score: number;
  words: WordResult[];
  tips: string[];
};

export type ApiErrorBody = {
  error: { code: string; message: string };
};

export type ExplainKind = "word" | "grammar" | "sentence";

export type ExplainResponse = {
  explanation: string;
};

/** Question shape returned by the backend quiz generator (snake_case). */
export type GeneratedQuizQuestion = {
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
};

export type GeneratedQuiz = {
  questions: GeneratedQuizQuestion[];
};
