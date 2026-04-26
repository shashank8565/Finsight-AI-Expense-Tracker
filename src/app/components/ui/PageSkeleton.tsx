import { Skeleton } from "./skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40 rounded-2xl" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-32 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart Area */}
        <div className="col-span-1 lg:col-span-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Skeleton className="w-full sm:w-1/2 aspect-square max-w-[240px] rounded-full" />
            <div className="space-y-4 w-full sm:w-1/2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* List Area */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
            <div className="flex justify-between mb-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GenericPageSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      
      {/* 3 Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-10 w-32" />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-500">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex flex-col items-end">
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-20 mb-4" />
          <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-4">
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex flex-col items-end">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
