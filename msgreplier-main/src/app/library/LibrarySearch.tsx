"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";

type Shortcut = {
  type: string;
  shortcut: string;
  meaning: string;
  tone: string;
};

export default function LibrarySearch({ shortcuts }: { shortcuts: Shortcut[] }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(150);
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredShortcuts = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return shortcuts;
    return shortcuts.filter(
      (item) =>
        item.shortcut.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.tone.toLowerCase().includes(q)
    );
  }, [query, shortcuts]);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedShortcut(value);
      setTimeout(() => setCopiedShortcut(null), 2000);
      toast({ description: "Shortcut copied!" });
    });
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="library-search"
          placeholder="Search 500+ terms…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(150);
          }}
          className="pl-9 h-11 bg-background/50 focus:bg-background transition-colors"
          aria-label="Search internet slang terms"
        />
        {query && (
          <p className="mt-1 text-xs text-muted-foreground text-right">
            {filteredShortcuts.length} result{filteredShortcuts.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Card grid — progressively enhanced over the SSR list */}
      <div id="library-grid" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredShortcuts.slice(0, visibleCount).map((item, index) => (
          <div
            key={`${item.type}-${item.shortcut}-${index}`}
            className="group relative flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-lg font-semibold break-all">{item.shortcut}</span>
              <button
                type="button"
                aria-label={`Copy ${item.shortcut}`}
                onClick={() => handleCopy(item.shortcut)}
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                {copiedShortcut === item.shortcut ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{item.meaning}</p>
            <span className="inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
              {item.tone}
            </span>
          </div>
        ))}
      </div>

      {filteredShortcuts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card rounded-lg border border-dashed">
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm">Try searching for something else</p>
        </div>
      )}

      {filteredShortcuts.length > visibleCount && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setVisibleCount((prev) => prev + 100)}
          >
            Load More ({filteredShortcuts.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
