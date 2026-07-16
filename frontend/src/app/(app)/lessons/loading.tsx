import { Skeleton } from "@/components/ui/skeleton";

export default function LessonsLoading() {
  return (
    <div className="grid gap-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-40" />
      </div>
      {Array.from({ length: 2 }).map((_, unit) => (
        <div key={unit} className="grid gap-3">
          <Skeleton className="h-6 w-64" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
