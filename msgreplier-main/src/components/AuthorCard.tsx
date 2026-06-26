import { authors, type AuthorId } from "@/lib/authors";

interface AuthorCardProps {
  authorId: AuthorId;
}

export default function AuthorCard({ authorId }: AuthorCardProps) {
  const author = authors[authorId];
  if (!author) return null;

  return (
    <div className="mt-10 pt-8 border-t border-[#d4c3ab]">
      <p className="text-xs font-bold uppercase tracking-wider text-[#948678] mb-4">
        About the Author
      </p>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-full bg-[#110f0f] text-white flex items-center justify-center text-sm font-bold shrink-0"
          aria-label={`${author.name} avatar`}
        >
          {author.avatar}
        </div>
        {/* Info */}
        <div className="space-y-1">
          <p className="font-bold text-[#110f0f] text-base">{author.name}</p>
          <p className="text-xs text-[#948678] font-semibold uppercase tracking-wide">
            {author.role}
          </p>
          <p className="text-sm text-[#5d6c7b] leading-relaxed mt-2">
            {author.bio}
          </p>
        </div>
      </div>
    </div>
  );
}
