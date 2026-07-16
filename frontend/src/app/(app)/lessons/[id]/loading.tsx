import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6">
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-2 w-full" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}
