import { getSavedWords } from "@/lib/data";
import { WordBank } from "@/components/words/word-bank";

export const metadata = { title: "Word Bank" };

export default async function WordsPage() {
  const words = await getSavedWords();
  return <WordBank initialWords={words} />;
}
