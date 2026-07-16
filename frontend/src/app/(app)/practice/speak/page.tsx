import { createClient } from "@/lib/supabase/server";
import type { LessonContent } from "@/lib/types";
import { PronunciationStudio, type PracticeItem } from "@/components/speech/pronunciation-studio";

export const metadata = { title: "Pronunciation Studio" };

export default async function SpeakPage() {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, unit, title, content")
    .order("unit")
    .order("order");

  const items: PracticeItem[] = [];
  for (const lesson of lessons ?? []) {
    const content = lesson.content as LessonContent;
    for (const vocab of content.vocabulary) {
      items.push({
        kind: "word",
        text: vocab.word,
        ipa: vocab.ipa,
        syllables: vocab.syllables,
        source: lesson.title,
      });
    }
    for (const sentence of content.speaking.sentences) {
      items.push({ kind: "sentence", text: sentence, source: lesson.title });
    }
  }

  return <PronunciationStudio items={items} />;
}
