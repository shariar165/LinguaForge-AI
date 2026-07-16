/**
 * Seeds the Supabase database with lessons and achievements.
 *
 * Usage: npm run seed
 * Requires NEXT_PUBLIC_SUPABASE_URL (frontend/.env.local) and
 * SUPABASE_SERVICE_ROLE_KEY (frontend/.env.local or backend/.env).
 */
import { createClient } from "@supabase/supabase-js";
import { achievements, lessons } from "../src/data/lessons";

function loadEnvFile(path: string) {
  try {
    process.loadEnvFile(path);
  } catch {
    // File may not exist yet; that's fine — we validate below.
  }
}

loadEnvFile(new URL("../.env.local", import.meta.url).pathname.replace(/^\/(\w:)/, "$1"));
loadEnvFile(new URL("../../backend/.env", import.meta.url).pathname.replace(/^\/(\w:)/, "$1"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing configuration.\n" +
      "  NEXT_PUBLIC_SUPABASE_URL  -> frontend/.env.local\n" +
      "  SUPABASE_SERVICE_ROLE_KEY -> backend/.env (or frontend/.env.local)\n" +
      "Fill these in, then re-run: npm run seed"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  console.log(`Seeding ${lessons.length} lessons...`);
  const { error: lessonError } = await supabase.from("lessons").upsert(
    lessons.map((l) => ({
      id: l.id,
      unit: l.unit,
      unit_title: l.unit_title,
      level: l.level,
      order: l.order,
      title: l.title,
      description: l.description,
      xp_reward: l.xp_reward,
      content: l.content,
    })),
    { onConflict: "id" }
  );
  if (lessonError) throw new Error(`Lessons seed failed: ${lessonError.message}`);

  console.log(`Seeding ${achievements.length} achievements...`);
  const { error: achievementError } = await supabase
    .from("achievements")
    .upsert([...achievements], { onConflict: "id" });
  if (achievementError) throw new Error(`Achievements seed failed: ${achievementError.message}`);

  console.log("Done. Your course content is live.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
