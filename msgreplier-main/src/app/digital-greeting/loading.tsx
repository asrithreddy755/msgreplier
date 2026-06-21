export default function WishesLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-body overflow-hidden">
      <main className="relative z-10 pb-16">
        {/* Hero Skeleton */}
        <section className="mx-auto w-full max-w-7xl px-4 pt-10 md:px-8">
          <div className="p-8 text-center md:p-14">
            <div className="bg-gray-800 rounded-lg w-64 h-24 mx-auto animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            <div className="bg-gray-800 rounded-lg w-96 h-10 mx-auto mt-6 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="bg-gray-800 rounded-full w-32 h-10 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              <div className="bg-gray-800 rounded-full w-32 h-10 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            </div>
          </div>
        </section>

        {/* Counter Stats Skeleton */}
        <section className="mx-auto mt-8 w-full max-w-7xl px-4 md:px-8">
          <div className="grid gap-3 p-2 md:grid-cols-3 md:p-3 bg-gray-900/30 border border-gray-800 backdrop-blur-md rounded-2xl">
            {[1, 2, 3].map((i) => (
              <article key={i} className="text-center p-4">
                <div className="bg-gray-800 rounded-lg w-24 h-10 mx-auto animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                <div className="bg-gray-800 rounded-lg w-32 h-4 mx-auto mt-1 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              </article>
            ))}
          </div>
        </section>

        {/* Template Selection Skeleton */}
        <section className="mx-auto mt-14 w-full max-w-7xl px-4 md:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="bg-gray-800 rounded-lg w-20 h-4 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              <div className="bg-gray-800 rounded-lg w-40 h-8 mt-2 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            </div>
            <div className="bg-gray-800 rounded-lg w-32 h-4 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
          </div>
          <div className="flex flex-wrap gap-2 mb-8 justify-start border-b border-gray-800 pb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-800 rounded-full w-24 h-10 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            ))}
          </div>
          <div className="overflow-hidden">
            <div className="flex gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[280px] bg-gray-900/70 backdrop-blur-md rounded-[1.6rem] p-3">
                  <div className="bg-gray-800 rounded-[1.25rem] h-56 w-full animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                  <div className="px-2 pb-2 pt-4 min-h-[9rem]">
                    <div className="bg-gray-800 rounded-lg w-48 h-7 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                    <div className="bg-gray-800 rounded-lg w-full h-16 mt-2 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
