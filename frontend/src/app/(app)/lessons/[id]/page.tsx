import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/lesson-player";
import { getLesson, getLessonSummaries } from "@/lib/data";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lesson, allLessons] = await Promise.all([getLesson(id), getLessonSummaries()]);
  if (!lesson) notFound();

  const index = allLessons.findIndex((l) => l.id === lesson.id);
  const nextLessonId = index >= 0 && index + 1 < allLessons.length ? allLessons[index + 1].id : null;

  return <LessonPlayer lesson={lesson} nextLessonId={nextLessonId} />;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLesson(id);
  return { title: lesson?.title ?? "Lesson" };
}
