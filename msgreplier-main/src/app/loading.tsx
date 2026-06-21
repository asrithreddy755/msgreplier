export default function LandingLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] antialiased">
      {/* Hero Skeleton */}
      <section className="pt-16 pb-20 px-3 md:px-4 md:pt-28 md:pb-32 border-b border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Details Column */}
            <div className="flex flex-col space-y-6 md:space-y-8">
              <div className="bg-gray-800 rounded-full w-40 h-6 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              <div className="bg-gray-800 rounded-lg w-full h-16 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              <div className="bg-gray-800 rounded-lg w-full h-8 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <div className="bg-gray-800 rounded-full w-40 h-14 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                <div className="bg-gray-800 rounded-full w-40 h-14 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              </div>
            </div>
            {/* Right Image Column */}
            <div className="hidden lg:flex justify-center lg:justify-end">
              <div className="relative border border-gray-800 rounded-[32px] p-4 bg-gray-900/50 max-w-md md:max-w-xl w-full">
                <div className="overflow-hidden rounded-[24px] border border-gray-800">
                  <div className="bg-gray-800 w-full h-72 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Skeleton */}
      <section className="py-20 px-3 md:px-4 border-b border-gray-800 bg-gray-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="bg-gray-800 rounded-full w-24 h-6 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            <div className="bg-gray-800 rounded-lg w-64 h-10 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            <div className="bg-gray-800 rounded-lg w-96 h-6 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-[24px] p-6">
                <div className="bg-gray-800 rounded-2xl w-12 h-12 mb-6 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                <div className="bg-gray-800 rounded-lg w-32 h-6 mb-3 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                <div className="bg-gray-800 rounded-lg w-full h-20 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                <div className="pt-6">
                  <div className="bg-gray-800 rounded-lg w-28 h-5 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Skeleton */}
      <section className="py-20 px-3 md:px-4 border-b border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16 items-start">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-800 rounded-full w-28 h-6 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              <div className="bg-gray-800 rounded-lg w-full h-10 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              <div className="bg-gray-800 rounded-lg w-full h-12 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            </div>
            <div className="lg:col-span-2 space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-800 bg-gray-900/50 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="space-y-4 max-w-md flex-1">
                    <div className="bg-gray-800 rounded-lg w-40 h-7 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                    <div className="bg-gray-800 rounded-lg w-full h-16 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                    <div className="bg-gray-800 rounded-full w-28 h-10 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                  </div>
                  <div className="bg-gray-800 rounded-3xl w-24 h-24 flex items-center justify-center shrink-0 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
