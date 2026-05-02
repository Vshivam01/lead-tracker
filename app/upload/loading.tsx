import { Skeleton } from "@/components/ui/skeleton";

export default function UploadLoading() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-6 h-4 w-24" />
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-3/4" />

      <div className="mt-6 space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}
