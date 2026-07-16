from app.services.scoring import score_pronunciation


def test_perfect_match_scores_100():
    result = score_pronunciation("Hello world", "hello world")
    assert result.score == 100
    assert all(w.matched for w in result.words)


def test_empty_transcript_scores_0():
    result = score_pronunciation("Good morning", "")
    assert result.score == 0
    assert all(not w.matched for w in result.words)
    assert result.tips


def test_punctuation_and_case_ignored():
    result = score_pronunciation("How are you?", "how are you")
    assert result.score == 100


def test_partial_match_scores_between():
    result = score_pronunciation("I like green apples", "I like grin apples")
    assert 50 < result.score < 100
    mismatched = [w for w in result.words if not w.matched]
    assert any(w.word == "green" for w in mismatched)


def test_missing_words_lower_score():
    full = score_pronunciation("The quick brown fox jumps", "the quick brown fox jumps")
    partial = score_pronunciation("The quick brown fox jumps", "the quick")
    assert full.score > partial.score


def test_word_results_preserve_display_form():
    result = score_pronunciation("Hello, world!", "hello world")
    assert result.words[0].word == "Hello,"
    assert result.words[0].matched


def test_tips_reference_problem_words():
    result = score_pronunciation("I love strawberries", "I love strobenies")
    assert any("strawberries" in tip for tip in result.tips)
