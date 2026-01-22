"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import shortcutsData from "@/lib/shortcuts.json";
import { Copy, Check, ArrowLeft, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Shortcut = {
  type: string;
  shortcut: string;
  meaning: string;
  tone: string;
};

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredShortcuts = useMemo(() => {
    // Filter out emojis and apply search
    return (shortcutsData as Shortcut[])
      .filter((item) => {
        if (item.type === "emoji") return false;
        
        const q = query.toLowerCase();
        return (
          item.shortcut.toLowerCase().includes(q) ||
          item.meaning.toLowerCase().includes(q) ||
          item.tone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const isANum = /^\d/.test(a.shortcut);
        const isBNum = /^\d/.test(b.shortcut);

        // If one is a number and the other isn't, put number last
        if (isANum && !isBNum) return 1;
        if (!isANum && isBNum) return -1;

        // Otherwise sort alphabetically
        return a.shortcut.toLowerCase().localeCompare(b.shortcut.toLowerCase());
      });
  }, [query]);

  const handleCopyShortcut = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedShortcut(value);
      setTimeout(() => setCopiedShortcut(null), 2000);
      toast({ description: "Shortcut copied!" });
    });
  };

  return (
    <div className="min-h-screen bg-background font-body p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href="/shortcutpedia">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Shortcutpedia Library</h1>
              <p className="text-muted-foreground">Browse all text abbreviations and slang.</p>
            </div>
          </div>
          
          <div className="w-full md:w-72 search-container relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input 
                placeholder="Search library..." 
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisibleCount(50);
                }}
                className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredShortcuts.slice(0, visibleCount).map((item, index) => (
            <Card key={index} className="group relative transition-all hover:shadow-md hover:border-primary/50">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-bold break-all">{item.shortcut}</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mt-1 -mr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopyShortcut(item.shortcut)}
                    >
                        {copiedShortcut === item.shortcut ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                    </Button>
                </div>
                <CardDescription className="font-medium text-foreground/90 line-clamp-2" title={item.meaning}>
                    {item.meaning}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground capitalize">
                  {item.tone}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredShortcuts.length > 50 && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="lg"
              className="load-more-btn"
              onClick={() => {
                if (visibleCount < filteredShortcuts.length) {
                  setVisibleCount((prev) => prev + 50);
                } else {
                  setVisibleCount(50);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              {visibleCount < filteredShortcuts.length ? "Load More" : "Load Less"}
            </Button>
          </div>
        )}
        
        {filteredShortcuts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card rounded-lg border border-dashed">
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm">Try searching for something else</p>
            </div>
        )}
      </div>
    </div>
  );
}
