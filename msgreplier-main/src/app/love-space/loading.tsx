export default function LoveSpaceLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col gap-6 w-full max-w-md z-20">
        {/* Create Room Card Skeleton */}
        <div className="shadow-2xl border-gray-800 bg-gray-900/70 backdrop-blur-md overflow-hidden rounded-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800" />
          <div className="text-center pb-3 pt-6 px-6">
            <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            <div className="bg-gray-800 rounded-lg w-48 h-7 mx-auto animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            <div className="bg-gray-800 rounded-lg w-64 h-4 mx-auto mt-1 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
          </div>
          <div className="space-y-5 px-6 pb-6">
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-gray-800 rounded-xl px-4 py-2.5 h-12 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              <div className="bg-gray-800 rounded-xl px-4 py-2.5 h-12 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              <div className="bg-gray-800 rounded-xl px-4 py-2.5 h-12 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            </div>
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-xl h-12 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              <div className="bg-gray-800 rounded-xl h-12 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            </div>
          </div>
        </div>

        {/* Join with Code Card Skeleton */}
        <div className="shadow-xl border-gray-800 bg-gray-900/70 backdrop-blur-md overflow-hidden rounded-2xl">
          <div className="text-center pb-2 px-6 pt-4">
            <div className="bg-gray-800 rounded-lg w-40 h-6 mx-auto animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
            <div className="bg-gray-800 rounded-lg w-56 h-4 mx-auto mt-1 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
          </div>
          <div className="space-y-4 px-6 pb-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gray-800 rounded-xl w-12 h-14 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
              ))}
            </div>
            <div className="bg-gray-800 rounded-xl h-12 animate-pulse motion-reduce:animate-none motion-reduce:opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
