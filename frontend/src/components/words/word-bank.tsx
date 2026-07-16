"use client";

import { Bookmark, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AudioButton } from "@/components/speech/audio-button";
import { ExplainDialog } from "@/components/tutor/explain-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { removeWord, saveWord, updateWordDefinition } from "@/lib/actions";
import type { SavedWord } from "@/lib/types";

export function WordBank({ initialWords }: { initialWords: SavedWord[] }) {
  const [words, setWords] = useState(initialWords);
  const [newWord, setNewWord] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  async function addWord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const word = newWord.trim();
    if (!word || adding) return;
    if (word.length > 100) {
      toast.error("That word is too long.");
      return;
    }
    setAdding(true);
    try {
      const added = await saveWord(word, "", "");
      if (!added) {
        toast.info(`"${word}" is already in your Word Bank.`);
        return;
      }
      setWords((prev) => [added, ...prev]);
      setNewWord("");
      toast.success(`"${word}" saved. Ask the AI tutor what it means!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the word.");
    } finally {
      setAdding(false);
    }
  }

  async function onRemove(word: SavedWord) {
    setRemovingId(word.id);
    try {
      await removeWord(word.id);
      setWords((prev) => prev.filter((w) => w.id !== word.id));
      toast.success(`Removed "${word.word}".`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove the word.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Word Bank</h1>
        <p className="text-sm text-muted-foreground">
          Your saved words — review them anytime, or practice them in the Pronunciation Studio.
        </p>
      </div>

      <form onSubmit={addWord} className="flex gap-2">
        <Input
          value={newWord}
          onChange={(event) => setNewWord(event.target.value)}
          placeholder="Add a word you want to remember..."
          maxLength={100}
          aria-label="New word"
        />
        <Button type="submit" disabled={!newWord.trim() || adding}>
          {adding ? <Loader2 className="animate-spin" aria-hidden /> : <Plus aria-hidden />}
          Add
        </Button>
      </form>

      {words.length === 0 ? (
        <Card>
          <CardContent className="grid justify-items-center gap-3 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bookmark className="size-7" aria-hidden />
            </span>
            <div>
              <p className="font-medium">No words yet</p>
              <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                Bookmark words inside lessons, or add one above to start building your vocabulary.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {words.map((word) => (
            <Card key={word.id} className="py-3">
              <CardContent className="flex items-center gap-2 px-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{word.word}</p>
                  {word.definition && (
                    <p className="truncate text-sm text-muted-foreground">{word.definition}</p>
                  )}
                  {word.example && (
                    <p className="truncate text-xs italic text-muted-foreground">
                      &ldquo;{word.example}&rdquo;
                    </p>
                  )}
                </div>
                <AudioButton text={word.word} />
                <ExplainDialog
                  text={word.word}
                  kind="word"
                  onUseAsDefinition={
                    word.definition
                      ? undefined
                      : async (explanation) => {
                          await updateWordDefinition(word.id, explanation);
                          setWords((prev) =>
                            prev.map((w) => (w.id === word.id ? { ...w, definition: explanation } : w))
                          );
                        }
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove "${word.word}"`}
                  onClick={() => onRemove(word)}
                  disabled={removingId === word.id}
                  className="text-muted-foreground hover:text-destructive"
                >
                  {removingId === word.id ? (
                    <Loader2 className="animate-spin" aria-hidden />
                  ) : (
                    <Trash2 aria-hidden />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
