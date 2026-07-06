"use client";

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Copy, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import shortcutsData from "@/lib/shortcuts.json";
import Link from "next/link";

type Shortcut = {
  type: string;
  shortcut: string;
  meaning: string;
  tone: string;
};

const allShortcuts = shortcutsData as Shortcut[];

const TOP_SHORTCUTS = ["lol", "brb", "btw", "idk", "omg", "fyi", "tbh", "asap", "ikr", "hmm"];

export default function ShortcutpediaClient() {
  const [query, setQuery] = useState("");
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredShortcuts = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return allShortcuts.filter(
      (item) =>
        item.shortcut.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.tone.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const topShortcuts = useMemo(() => {
    return TOP_SHORTCUTS.map((s) => allShortcuts.find((item) => item.shortcut === s)).filter(Boolean) as Shortcut[];
  }, []);

  const handleCopy = useCallback((value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedShortcut(value);
      setTimeout(() => setCopiedShortcut(null), 2000);
      toast({ description: `Copied "${value}"` });
    });
  }, [toast]);

  return (
    <Card id="shortcutpedia-tool" className="w-full max-w-3xl shadow-sm hover:shadow-md transition-all duration-300 border-border/60 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1.5">
            <CardTitle>Shortcutpedia</CardTitle>
            <CardDescription>Discover common chat shortcuts and quickly look up their meanings.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/library">Full Library →</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Search */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <h3 className="text-base font-semibold">Search Shortcuts</h3>
          </div>
          <Input
            id="shortcutpedia-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. hmm, 143, 😂, rizz…"
            className="h-9"
            aria-label="Search internet slang shortcuts"
          />
          {query.trim().length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredShortcuts.length > 0 ? (
                filteredShortcuts.map((item) => (
                  <ShortcutCard key={`${item.type}-${item.shortcut}`} item={item} onCopy={handleCopy} isCopied={copiedShortcut === item.shortcut} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center rounded-lg border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                  <span className="font-medium">No results found</span>
                  <span className="mt-1 text-xs">Try the <Link href="/library" className="underline">Full Library</Link> for browsing all 500+ terms.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top Shortcuts */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Top 10 Chat Shortcuts</h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {topShortcuts.map((item) => (
              <div key={item.shortcut} className="min-w-[180px] max-w-xs shrink-0">
                <ShortcutCard item={item} onCopy={handleCopy} isCopied={copiedShortcut === item.shortcut} />
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

function ShortcutCard({ item, onCopy, isCopied }: { item: Shortcut; onCopy: (v: string) => void; isCopied: boolean }) {
  return (
    <div className="relative flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="text-lg font-semibold">{item.shortcut}</span>
        <button
          type="button"
          aria-label={`Copy ${item.shortcut}`}
          onClick={() => onCopy(item.shortcut)}
          className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50"
        >
          {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">{item.meaning}</p>
      <span className="inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
        {item.tone}
      </span>
    </div>
  );
}
