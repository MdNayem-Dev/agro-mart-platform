export default function AdminLoading() {
  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-4 w-72 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>

      {/* Metrics / Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Container Skeleton */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Controls Skeleton */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="h-10 w-full max-w-md bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 shrink-0"></div>
                <div className="space-y-1.5 flex-1 max-w-xs">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-md hidden md:block"></div>
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
