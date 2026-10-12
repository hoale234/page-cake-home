function Placeholder({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-brown/10 ${className}`} />;
}

export default function AdminLoading() {
  return (
    <section aria-busy="true" aria-labelledby="admin-loading-title">
      <p id="admin-loading-title" role="status" className="sr-only">
        Đang tải trang quản trị
      </p>
      <div aria-hidden="true" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Placeholder className="h-3 w-28" />
            <Placeholder className="h-9 w-52 max-w-[70vw]" />
          </div>
          <Placeholder className="h-10 w-32" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-brown/10 bg-white p-5">
              <Placeholder className="h-3 w-24" />
              <Placeholder className="mt-4 h-8 w-16" />
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-brown/10 bg-white">
          <div className="flex flex-wrap gap-3 border-b border-brown/10 p-4">
            <Placeholder className="h-10 w-44 max-w-full" />
            <Placeholder className="h-10 w-32" />
            <Placeholder className="h-10 w-28" />
          </div>
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Placeholder className="size-10 shrink-0 rounded-full" />
                <Placeholder className="h-4 flex-1" />
                <Placeholder className="hidden h-4 w-28 sm:block" />
                <Placeholder className="h-8 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
