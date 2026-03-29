import Link from 'next/link'

export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
      <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
      <p className="text-slate-400 mb-8">Could not find the requested resource</p>
      <Link href="/" className="px-6 py-3 bg-rose-500 rounded-full font-bold hover:bg-rose-600 transition-colors">
        Return Home
      </Link>
    </div>
  )
}
