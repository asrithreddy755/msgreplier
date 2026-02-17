"use client";

export const runtime = "edge";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PLATFORMS, type Platform } from "@/lib/constants";
import shortcutsData from "@/lib/shortcuts.json";
import PlatformIcon from "@/components/platform-icon";
import { Copy, Check, MessageSquare, Menu, X, Camera, BookText, ShieldCheck, Mail, Flame, ChevronDown } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription as DialogDescriptionPrimitive,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";


type RepetitionType = "row" | "column";
type ReplyLength = "short" | "medium" | "long";
type Shortcut = {
  type: string;
  shortcut: string;
  meaning: string;
  tone: string;
};

function AppContent() {
  const router = useRouter();
  const params = useParams();
  const platformSlug = params.platform as string;
  const { open: sidebarOpen, openMobile, isMobile, toggleSidebar } = useSidebar();
  const isOpen = isMobile ? openMobile : sidebarOpen;

  const initialPlatform = useMemo(() => {
    const platformFromSlug = PLATFORMS.find((p) => p.slug === platformSlug);
    // If slug is for AI generator, Shortcutpedia or not found, handle defaults
    if (!platformFromSlug || platformFromSlug.id === 'ai-reply' || platformFromSlug.id === 'shortcutpedia') {
      // If it's shortcutpedia, we still want to return it as the initial platform ID if we treat it as one,
      // but the text repeater needs a valid repeater platform.
      // Actually, if we are on shortcutpedia page, the repeater might default to instagram or stay hidden/irrelevant?
      // Let's default to instagram for the repeater state.
      return PLATFORMS.find(p => p.id === 'instagram')!;
    }
    return platformFromSlug;
  }, [platformSlug]);

  const [platformId, setPlatformId] = useState<Platform["id"]>(initialPlatform.id);

  const [inputText, setInputText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [repetitionType, setRepetitionType] =
    useState<RepetitionType>("row");
  const [addSpace, setAddSpace] = useState(true);
  const [customCharLimit, setCustomCharLimit] = useState(initialPlatform.charLimit);
  const [useRepetitionCount, setUseRepetitionCount] = useState(false);
  const [repetitionCount, setRepetitionCount] = useState(10);
  const { toast } = useToast();

  const [shortcutQuery, setShortcutQuery] = useState("");
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null);

  const allShortcuts = shortcutsData as Shortcut[];

  const filteredShortcuts = useMemo(() => {
    const query = shortcutQuery.trim().toLowerCase();
    if (!query) return allShortcuts;
    return allShortcuts.filter((item) => {
      const shortcutText = item.shortcut.toLowerCase();
      const meaningText = item.meaning.toLowerCase();
      const toneText = item.tone.toLowerCase();
      return (
        shortcutText.includes(query) ||
        meaningText.includes(query) ||
        toneText.includes(query)
      );
    });
  }, [shortcutQuery, allShortcuts]);

  const topShortcuts = useMemo(() => {
    const order = [
      "lol",
      "brb",
      "btw",
      "idk",
      "omg",
      "fyi",
      "tbh",
      "asap",
      "ikr",
      "hmm",
    ];
    return order
      .map((shortcut) =>
        allShortcuts.find((item) => item.shortcut === shortcut)
      )
      .filter((item): item is Shortcut => Boolean(item));
  }, [allShortcuts]);
  
  const replyLengthMap: { [key: number]: ReplyLength } = {
    0: "short",
    1: "medium",
    2: "long",
  };
  const replyLengthLabels: { [key: number]: string } = {
    0: "Short (~5-15 words)",
    1: "Medium (~15-30 words)",
    2: "Long (~30-50 words)",
  };

  useEffect(() => {
    const currentPlatform = PLATFORMS.find(p => p.slug === platformSlug);
    if (!currentPlatform) {
      router.replace(`/shortcutpedia`);
    } 
  }, [platformSlug, router]);

  const isAiPage = useMemo(() => {
    const currentPlatform = PLATFORMS.find((p) => p.slug === platformSlug);
    return currentPlatform?.id === 'ai-reply';
  }, [platformSlug]);

  const isShortcutpediaPage = useMemo(() => {
    const currentPlatform = PLATFORMS.find((p) => p.slug === platformSlug);
    return currentPlatform?.id === 'shortcutpedia';
  }, [platformSlug]);
  
  const handlePlatformChange = (newPlatformId: Platform["id"]) => {
    const platform = PLATFORMS.find((p) => p.id === newPlatformId);
    if (platform) {
      setPlatformId(newPlatformId);
      if (platform.slug !== platformSlug) {
         router.push(`/${platform.slug}`);
      }
    }
  };

  const handleCopyShortcut = (value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopiedShortcut(value);
      setTimeout(() => setCopiedShortcut(null), 2000);
    });
  };

  const selectedPlatform = useMemo(
    () => PLATFORMS.find((p) => p.id === platformId)!,
    [platformId]
  );
  
  const charLimit = useMemo(() => {
    return platformId === 'custom' ? customCharLimit : selectedPlatform.charLimit;
  }, [platformId, customCharLimit, selectedPlatform]);

  const handleGenerate = useCallback(() => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Input is empty",
        description: "Please enter some text to generate.",
      });
      setGeneratedText("");
      return;
    }

    let separator = "";
    if (repetitionType === "column") {
      separator = "\n";
    } else if (addSpace) {
      separator = " ";
    }
    
    const textWithSeparator = inputText + separator;
    let repeatedText = "";

    if (useRepetitionCount) {
      if (repetitionCount > 0 && inputText) {
        const result = Array(repetitionCount).fill(inputText).join(separator);
        if (result.length > charLimit) {
          toast({
            variant: "destructive",
            title: "Character limit exceeded",
            description: `The generated text is longer than the platform's limit of ${charLimit} characters and has been truncated.`,
          });
        }
        repeatedText = result.slice(0, charLimit);
      }
    } else {
      if (textWithSeparator.length > 0) {
        let tempText = "";
         // To avoid infinite loops with just a separator
        if (inputText.length > 0) {
          while ((tempText + textWithSeparator).length <= charLimit) {
            tempText += textWithSeparator;
          }
        }
        
        if (tempText.endsWith(separator) && separator) {
            repeatedText = tempText.slice(0, -separator.length);
        } else {
          repeatedText = tempText;
        }
      
        if (repeatedText.length === 0 && inputText.length <= charLimit) {
            repeatedText = inputText;
        }
      }
    }
    setGeneratedText(repeatedText);
  }, [inputText, charLimit, repetitionType, addSpace, useRepetitionCount, repetitionCount, toast]);

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const charCount = generatedText.length;
  const isOverLimit = charCount > charLimit;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "MsgReplier",
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": "Text Repeater, Slang Dictionary, AI Reply Generator"
  };

  const ShortcutCardItem = ({ item }: { item: Shortcut }) => {
    const isItemCopied = copiedShortcut === item.shortcut;

    return (
      <div className="relative flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="text-lg font-semibold">{item.shortcut}</div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-accent/50"
            onClick={() => handleCopyShortcut(item.shortcut)}
            aria-label="Copy shortcut"
          >
            {isItemCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">{item.meaning}</div>
        <div className="inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
          {item.tone}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main-content" className="flex flex-1 w-full flex-col items-center justify-start p-6 md:p-12 max-w-5xl mx-auto space-y-8">
        <div className="text-center mb-4 md:mb-8 space-y-4">
          
          {/* New FLAMES Promo CTA */}
          <Link href="/flames" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 animate-pulse">
            <span>🔥</span>
            <span>Valentine&apos;s Special: Check your FLAMES Destiny!</span>
            <span>❤️</span>
          </Link>

          <h1 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-foreground/90 pt-4">
            The Ultimate Message Replier & Text Tools Hub
          </h1>
          <p className="text-sm font-medium text-primary/80 uppercase tracking-wide bg-primary/5 px-3 py-1 rounded-full inline-block">
            No login required
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Decode slang with Shortcutpedia, craft replies with AI, or use the text repeater to meet character limits.
          </p>
        </div>

        {isShortcutpediaPage && (
        <>
        <Card id="shortcutpedia" className="w-full max-w-3xl shadow-sm hover:shadow-md transition-all duration-300 border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle>Shortcutpedia</CardTitle>
                <CardDescription>
                  Discover common chat shortcuts and quickly look up their meanings.
                </CardDescription>
              </div>
              <Button asChild variant="outline" className="library-btn">
                <Link href="/library">Library</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Search Shortcuts</h3>
                </div>
                <div className="w-full sm:w-64">
                  <Input
                    value={shortcutQuery}
                    onChange={(e) => setShortcutQuery(e.target.value)}
                    placeholder="Search e.g. hmm, 143, 😂"
                    className="h-9"
                  />
                </div>
              </div>
              {shortcutQuery.trim().length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredShortcuts.length > 0 ? (
                    filteredShortcuts.slice(0, 4).map((item) => (
                      <ShortcutCardItem
                        key={`${item.type}-${item.shortcut}`}
                        item={item}
                      />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                        <span className="font-medium">No results found</span>
                        <span className="mt-1 text-xs">
                          Try a different shortcut, number, or emoji.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Top 10 Chat Shortcuts</h3>
              <div className="flex gap-4 overflow-x-auto pb-1">
                {topShortcuts.map((item) => (
                  <div key={item.shortcut} className="min-w-[200px] max-w-xs">
                    <ShortcutCardItem item={item} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <section id="shortcutpedia-info" className="seo-content w-full max-w-3xl mt-8 text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm">
            <h3 className="text-2xl font-bold mb-4">Decode Gen Z Slang with Shortcutpedia</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Stop asking &quot;what does that mean?&quot; and start understanding. Shortcutpedia is your 2026 <strong>Internet Slang Dictionary</strong>.
              We decode the most popular chat abbreviations used on TikTok, Snapchat, and Discord.
            </p>
            <p className="font-bold mb-2">Trending Searches:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>What does &apos;Rizz&apos; mean?</strong> Short for charisma; your ability to flirt.</li>
              <li><strong>Meaning of &apos;No Cap&apos;:</strong> Being serious, not lying.</li>
              <li><strong>IYKYK:</strong> &quot;If You Know You Know&quot; - inside jokes.</li>
              <li><strong>TFW vs. MFW:</strong> &quot;That Feel When&quot; vs &quot;My Face When.&quot;</li>
            </ul>
        </section>
        </>
        )}

        <Card id="text-repeater" className="w-full max-w-3xl shadow-sm hover:shadow-md transition-all duration-300 border-border/60 bg-card/50 backdrop-blur-sm mt-8">
          <CardHeader>
              <CardTitle>Text Repeater</CardTitle>
              <CardDescription>
                Repeat text to meet character limits or create emphasis in your messages.
              </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid w-full items-center gap-6">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <div className="flex flex-col md:flex-row gap-4">
                  <Select
                    value={platformId}
                    onValueChange={(value) => handlePlatformChange(value as Platform["id"])}
                  >
                    <SelectTrigger id="platform" className="flex-1">
                      <SelectValue placeholder="Select a platform">
                        <div className="flex items-center gap-2">
                          <PlatformIcon platformId={platformId} className="h-5 w-5" />
                          <span>{selectedPlatform.name}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.filter(p => p.id !== 'ai-reply' && p.id !== 'shortcutpedia').map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          <div className="flex items-center gap-2">
                            <PlatformIcon
                              platformId={platform.id}
                              className="h-5 w-5"
                            />
                            <span>{platform.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {platformId === 'custom' && (
                    <div className="flex flex-col space-y-2 w-full md:w-40">
                       <Input
                          id="custom-limit"
                          type="number"
                          value={customCharLimit}
                          onChange={(e) => setCustomCharLimit(Number(e.target.value))}
                          placeholder="Char limit"
                        />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="input-text">Your Text</Label>
                <Textarea
                  id="input-text"
                  placeholder="Enter text to repeat..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex flex-col space-y-4">
                <Label>Formatting Options</Label>
                <div className="flex items-center flex-wrap gap-4 md:gap-6 gap-y-2">
                  <RadioGroup
                    value={repetitionType}
                    onValueChange={(value) =>
                      setRepetitionType(value as RepetitionType)
                    }
                    className="flex items-center"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="row" id="r1" />
                      <Label htmlFor="r1">Row</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="column" id="r2" />
                      <Label htmlFor="r2">Column</Label>
                    </div>
                  </RadioGroup>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="add-space"
                      checked={addSpace}
                      onCheckedChange={(checked) => setAddSpace(!!checked)}
                      disabled={repetitionType !== "row"}
                    />
                    <Label
                      htmlFor="add-space"
                      className={repetitionType !== 'row' ? 'text-muted-foreground' : ''}
                    >
                      Add space
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Repetition Count</Label>
                <div className="flex items-center gap-3 p-4 border rounded-md">
                    <Checkbox
                      id="use-repetition-count"
                      checked={useRepetitionCount}
                      onCheckedChange={(checked) => setUseRepetitionCount(!!checked)}
                    />
                    <Label htmlFor="use-repetition-count" className="flex-1 text-sm font-normal cursor-pointer">
                      Specify how many times to repeat the text
                    </Label>
                    <Input
                      id="repetition-count"
                      type="number"
                      value={repetitionCount}
                      onChange={(e) => setRepetitionCount(Number(e.target.value))}
                      className="w-24"
                      disabled={!useRepetitionCount}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                  If unchecked, it will repeat as many times as possible within the platform&apos;s character limit.
                </p>
              </div>

              <Button onClick={handleGenerate}>
                Generate
              </Button>

              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="generated-text">Generated Text</Label>
                  <div
                    className={`text-sm ${
                      isOverLimit ? "text-destructive font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {charCount} / {charLimit}
                  </div>
                </div>
                <div className="relative">
                    <Textarea
                      id="generated-text"
                      readOnly
                      value={generatedText}
                      placeholder="Generated text will appear here..."
                      className="pr-12 min-h-[120px] bg-muted/50"
                    />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:bg-accent/50"
                    onClick={handleCopy}
                    disabled={!generatedText || isCopied}
                    aria-label="Copy to clipboard"
                  >
                    {isCopied ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section id="text-repeater-info" className="seo-content w-full max-w-3xl mt-8 text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm">
            <h3 className="text-2xl font-bold mb-4">Why Use the MsgReplier Text Repeater?</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Need to send a message 10,000 times? Our <strong>Free Text Repeater</strong> is the perfect tool for
              creating emphasis or playing harmless pranks on friends. Whether you need a <strong>WhatsApp text bomber</strong>
              (use responsibly!) or want to spam comments on Instagram to get noticed, this tool handles it instantly.
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Instagram & TikTok:</strong> generate long blocks of text to space out your bio or captions.</li>
              <li><strong>Blank Message Generator:</strong> Send empty messages on WhatsApp to confuse your friends.</li>
              <li><strong>Testing & Dev:</strong> Developers can use this to generate dummy text strings for stress testing apps.</li>
            </ul>
        </section>

        {(isAiPage || isShortcutpediaPage) && (
          <>
            <Card
              id="msg-prompt"
              className="w-full max-w-3xl shadow-sm hover:shadow-md transition-all duration-300 border-border/60 bg-card/50 backdrop-blur-sm mt-8"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-6 w-6 text-primary" />
                  Msg Prompt
                </CardTitle>
                <CardDescription>
                  A scrollable prompt library with one-tap copy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Scroll a prompt library, copy, and paste into any AI tool to generate better couple pictures and photoshoot ideas.
                </p>
                <Button asChild className="w-full">
                  <Link href="/prompt">Open Msg Prompt</Link>
                </Button>
              </CardContent>
            </Card>

            <section id="msg-prompt-info" className="seo-content w-full max-w-3xl mt-8 text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold mb-4">Msg Prompt: Copy-Paste Prompts for Better Replies</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Msg Prompt is a curated list of ready-to-copy prompts. Use placeholders like <strong>{"{{message}}"}</strong> to quickly plug in your chat and generate a response.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Fast:</strong> Scroll, copy, paste—done.</li>
                <li><strong>Flexible:</strong> Works with ChatGPT, Gemini, and any AI tool.</li>
                <li><strong>Private:</strong> Nothing is stored on our servers.</li>
              </ul>
            </section>
          </>
        )}

        <div className="w-full max-w-3xl mt-12 text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-2xl font-bold tracking-tight mb-6 text-foreground/90">Why MsgReplier?</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-primary">
                <span className="bg-primary/10 p-1.5 rounded-md">🚀</span> Instant & Free
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">No sign-ups, no paywalls, no hassle. Get straight to the point with our free tools designed for speed.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-primary">
                <span className="bg-primary/10 p-1.5 rounded-md">🔒</span> 100% Private
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Your conversations stay yours. We process everything locally in your browser—no data is ever stored or sent to a server.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-primary">
                <span className="bg-primary/10 p-1.5 rounded-md">📚</span> Ever-Growing Library
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Stay current with the latest internet slang. Our Shortcutpedia is constantly updated with trending terms and abbreviations.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-primary">
                <span className="bg-primary/10 p-1.5 rounded-md">✨</span> All-in-One Toolkit
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">From decoding slang to repeating text for emphasis, we have everything you need to master digital communication.</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-3xl mt-8 text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-2xl font-bold tracking-tight mb-6 text-foreground/90">How to Use This Tool</h3>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <ol className="list-decimal list-inside space-y-3 marker:text-primary marker:font-semibold">
              <li className="pl-2"><span className="font-semibold text-foreground">Shortcutpedia:</span> The ultimate slang dictionary. Use the search bar to find meanings for &quot;rizz&quot;, &quot;no cap&quot;, &quot;POV&quot;, and more. Click &quot;Library&quot; to browse our full collection alphabetically.</li>
              <li className="pl-2"><span className="font-semibold text-foreground">Msg Prompt:</span> Open the prompt list, copy a template, paste your message, and get a better reply in seconds.</li>
              <li className="pl-2"><span className="font-semibold text-foreground">Text Repeater:</span> Need to spam (playfully!) or hit a word count? Enter your text, choose a repetition count, and generate instant copies. Perfect for emphasizing a point.</li>
            </ol>
          </div>
        </div>

        <div className="w-full max-w-3xl mt-8 text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-2xl font-bold tracking-tight mb-6 text-foreground/90">How Does MsgReplier Work?</h3>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>Our tool has three main features: Msg Prompt, a Text Repeater, and Shortcutpedia.</p>
            <p><span className="font-semibold text-foreground">Msg Prompt</span> gives you copyable prompt templates. Paste your message into a prompt and use any AI tool to generate a response in the tone you want.</p>
            <p>The <span className="font-semibold text-foreground">Text Repeater</span> is straightforward. You enter text, choose formatting, and it generates the repeated text.</p>
            <p><span className="font-semibold text-foreground">Shortcutpedia</span> helps you quickly look up chat shortcuts and emojis so you always understand the message and can reply in the right way.</p>
            <p className="font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
              Your privacy is our priority. We do not require any login, and we do not save, store, or collect any of your data. All text processing is done in your browser.
            </p>
          </div>
        </div>

        <div className="w-full max-w-3xl mt-8 text-left bg-card/50 backdrop-blur-sm border border-border/60 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-2xl font-bold tracking-tight mb-6 text-foreground/90">Common Uses</h3>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="bg-primary/10 text-primary p-1 h-fit rounded mt-0.5">💬</span>
                  <div><span className="font-semibold text-foreground">Breaking the Ice:</span> Not sure how to reply to &quot;hey&quot; or &quot;what&apos;s up&quot;? Copy a Msg Prompt template and generate a creative opener.</div>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary/10 text-primary p-1 h-fit rounded mt-0.5">🎭</span>
                  <div><span className="font-semibold text-foreground">Finding the Right Tone:</span> Effortlessly switch between a formal, playful, or supportive tone depending on the situation.</div>
                </li>
                <li className="flex gap-3">
                  <span className="bg-primary/10 text-primary p-1 h-fit rounded mt-0.5">🔍</span>
                  <div><span className="font-semibold text-foreground">Understanding Shortcuts:</span> Use Shortcutpedia to decode chat slang, abbreviations, and emojis so you never get confused by a shortcut again.</div>
                </li>
                <li className="flex gap-3">
                   <span className="bg-primary/10 text-primary p-1 h-fit rounded mt-0.5">📝</span>
                  <div><span className="font-semibold text-foreground">Meeting Character Minimums:</span> Use the Text Repeater to quickly pad your message to meet minimum length requirements on forums or forms.</div>
                </li>
                <li className="flex gap-3">
                   <span className="bg-primary/10 text-primary p-1 h-fit rounded mt-0.5">📢</span>
                  <div><span className="font-semibold text-foreground">Creating Emphasis:</span> Repeating a word or phrase can be a powerful way to draw attention to your message.</div>
                </li>
            </ul>
          </div>
        </div>

        <footer className="mt-12 py-6 border-t w-full">
          <div className="container max-w-2xl flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-5 w-5" />
              <span>© {new Date().getFullYear()} MsgReplier. All rights reserved.</span>
            </div>
            <div className="flex items-center flex-wrap justify-center gap-x-6 gap-y-2">
               <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:underline underline-offset-4">Privacy Policy</Link>
               <Link href="/terms-conditions" className="text-sm text-muted-foreground hover:underline underline-offset-4">Terms & Conditions</Link>
               <Link href="/about" className="text-sm text-muted-foreground hover:underline underline-offset-4">About Us</Link>
               <a href="mailto:care.msgreplier@gmail.com" className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground hover:underline underline-offset-4">
                <Mail className="h-4 w-4" /> Contact Us
               </a>
               <Link href="/sitemap.xml" className="text-sm text-muted-foreground hover:underline underline-offset-4">Sitemap</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function MobileSidebarMenu() {
    const { setOpenMobile } = useSidebar();
    
    return (
        <>
            <SheetHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <SheetTitle className="text-xl font-bold">MsgReplier</SheetTitle>
                </div>
                <SheetClose className="rounded-md border bg-background p-2 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </SheetClose>
            </SheetHeader>
            <SidebarContent>
              <div className="px-4 py-6">
                <SidebarMenu className="gap-2">
                  <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Features
                  </div>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                      <Link href={`/shortcutpedia`} onClick={() => setOpenMobile(false)}>
                        <BookText className="h-5 w-5 mr-2 text-blue-500" />
                        Shortcutpedia
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                       <a href="#text-repeater" onClick={() => setOpenMobile(false)}>
                          <Copy className="h-5 w-5 mr-2 text-orange-500" />
                          Text Repeater
                       </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                      <Link href="/flames" onClick={() => setOpenMobile(false)}>
                        <Flame className="h-5 w-5 mr-2 text-rose-500" />
                        FLAMES
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                       <Link href="/prompt" onClick={() => setOpenMobile(false)}>
                          <Camera className="h-5 w-5 mr-2 text-purple-500" />
                          Msg Prompt
                       </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <div className="my-4 border-t border-border" />
                  
                  <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Support & Legal
                  </div>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                        <a href="mailto:care.msgreplier@gmail.com">
                            <Mail className="h-5 w-5 mr-2 text-red-500" />
                            Suggestions & Feedback
                        </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                        <Link href="/terms-conditions" onClick={() => setOpenMobile(false)}>
                            <BookText className="h-5 w-5 mr-2 text-slate-500" />
                            Terms & Conditions
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                        <Link href="/privacy-policy" onClick={() => setOpenMobile(false)}>
                            <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                            Privacy Policy
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </SidebarContent>
        </>
    )
}


function DesktopSidebarMenu() {
    const { toggleSidebar } = useSidebar();
    return (
      <>
        <SidebarHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2 transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">MsgReplier</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
        </SidebarHeader>
        <SidebarContent>
          <div className="px-4 py-6">
            <SidebarMenu className="gap-2">
              <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">
              Features
              </div>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                  <Link href={`/shortcutpedia`}>
                    <BookText className="h-5 w-5 mr-2 text-blue-500" />
                    <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Shortcutpedia</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                   <a href="#text-repeater">
                      <Copy className="h-5 w-5 mr-2 text-orange-500" />
                      <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Text Repeater</span>
                   </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                  <Link href="/flames">
                    <Flame className="h-5 w-5 mr-2 text-rose-500" />
                    <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">FLAMES</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                  <Link href="/prompt">
                      <Camera className="h-5 w-5 mr-2 text-purple-500" />
                      <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Msg Prompt</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <div className="my-4 border-t border-border transition-opacity duration-200 group-data-[state=collapsed]:opacity-0" />
              
              <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">
                  Support & Legal
              </div>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                    <a href="mailto:care.msgreplier@gmail.com">
                        <Mail className="h-5 w-5 mr-2 text-red-500" />
                        <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Suggestions & Feedback</span>
                    </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                    <Link href="/terms-conditions">
                        <BookText className="h-5 w-5 mr-2 text-slate-500" />
                        <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Terms & Conditions</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <SidebarMenuButton asChild size="lg" className="w-full justify-start font-medium text-base">
                    <Link href="/privacy-policy">
                        <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                        <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Privacy Policy</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>
      </>
    )
}

export default function MsgReplierPage() {
  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarInset>
        <AppContent />
      </SidebarInset>
      <Sidebar side="right" className="border-l bg-card">
        <MobileSidebarMenu />
        <DesktopSidebarMenu />
      </Sidebar>
    </SidebarProvider>
  )
}
