"use client";

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
import { Copy, Check, MessageSquare, Menu, X, Bot, BookText, ShieldCheck, Mail } from "lucide-react";
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
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
      <header className="flex flex-wrap items-center justify-between p-4 border-b bg-card shadow-sm gap-2 md:gap-4">
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-xl md:text-2xl font-bold tracking-tight">
                MsgReplier
            </h1>
            </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </header>
      <main id="main-content" className="flex flex-1 w-full flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h2 className="font-headline text-2xl md:text-4xl font-bold tracking-tight">
            Your Complete Messaging Toolkit
          </h2>
          <p className="text-muted-foreground mt-2 font-semibold">(no login required)</p>
          <p className="text-muted-foreground mt-4 max-w-full md:max-w-xl mx-auto">
            Decode slang with Shortcutpedia, craft replies with AI, or use the text repeater to meet character limits.
          </p>
        </div>

        {isShortcutpediaPage && (
        <Card id="shortcutpedia" className="w-full max-w-2xl shadow-lg">
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
        )}

        <Card id="text-repeater" className="w-full max-w-2xl shadow-lg mt-8">
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

        {(isAiPage || isShortcutpediaPage) && (
        <Card id="cham-ai" className="w-full max-w-2xl shadow-lg mt-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-4">
             <div className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-full shadow-lg text-lg animate-in fade-in zoom-in duration-500">
              Coming Soon
            </div>
            <p className="text-base font-semibold text-foreground/90 text-center bg-background/60 px-4 py-1 rounded-full">
              We are actively working on cham AI
            </p>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              cham AI
            </CardTitle>
            <CardDescription>
              Your personal AI assistant for crafting the perfect reply.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 opacity-40 pointer-events-none select-none">
            <div className="space-y-2">
              <Label>Message received</Label>
              <Textarea placeholder="Paste the message you received..." rows={3} />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tone</Label>
                    <Select disabled>
                        <SelectTrigger><SelectValue placeholder="Casual" /></SelectTrigger>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Length</Label>
                    <Select disabled>
                        <SelectTrigger><SelectValue placeholder="Short" /></SelectTrigger>
                    </Select>
                </div>
             </div>
            <Button className="w-full">Generate Reply</Button>
          </CardContent>
        </Card>
        )}

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">Why MsgReplier?</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">🚀 Instant & Free</h4>
              <p className="text-sm text-muted-foreground">No sign-ups, no paywalls, no hassle. Get straight to the point with our free tools designed for speed.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">🔒 100% Private</h4>
              <p className="text-sm text-muted-foreground">Your conversations stay yours. We process everything locally in your browser—no data is ever stored or sent to a server.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">📚 Ever-Growing Library</h4>
              <p className="text-sm text-muted-foreground">Stay current with the latest internet slang. Our Shortcutpedia is constantly updated with trending terms and abbreviations.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">✨ All-in-One Toolkit</h4>
              <p className="text-sm text-muted-foreground">From decoding slang to repeating text for emphasis, we have everything you need to master digital communication.</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">How to Use This Tool</h3>
          <div className="space-y-4 text-muted-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li><span className="font-semibold">Shortcutpedia:</span> The ultimate slang dictionary. Use the search bar to find meanings for "rizz", "no cap", "POV", and more. Click "Library" to browse our full collection alphabetically.</li>
              <li><span className="font-semibold">cham AI (Coming Soon):</span> An intelligent assistant to help you craft the perfect response for any situation—whether professional, casual, or flirty.</li>
              <li><span className="font-semibold">Text Repeater:</span> Need to spam (playfully!) or hit a word count? Enter your text, choose a repetition count, and generate instant copies. Perfect for emphasizing a point.</li>
            </ol>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">How Does MsgReplier Work?</h3>
          <div className="space-y-4 text-muted-foreground">
            <p>Our tool has three main features: an AI Reply Generator, a Text Repeater, and Shortcutpedia.</p>
            <p>The <span className="font-semibold">cham AI</span> uses advanced AI to understand the context you provide and craft replies in the tone you want. Just tell it who you are, what message you received, and how you want to sound.</p>
            <p>The <span className="font-semibold">Text Repeater</span> is straightforward. You enter text, choose formatting, and it generates the repeated text.</p>
            <p><span className="font-semibold">Shortcutpedia</span> helps you quickly look up chat shortcuts and emojis so you always understand the message and can reply in the right way.</p>
            <p className="font-semibold text-foreground border-l-4 border-primary pl-4">Your privacy is our priority. We do not require any login, and we do not save, store, or collect any of your data. All text processing is done in your browser.</p>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">Common Uses</h3>
          <div className="space-y-4 text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
                <li><span className="font-semibold">Breaking the Ice:</span> Not sure how to reply to &quot;hey&quot; or &quot;what&apos;s up&quot;? Let the AI give you a creative and engaging start.</li>
                <li><span className="font-semibold">Finding the Right Tone:</span> Effortlessly switch between a formal, playful, or supportive tone depending on the situation.</li>
                <li><span className="font-semibold">Understanding Shortcuts:</span> Use Shortcutpedia to decode chat slang, abbreviations, and emojis so you never get confused by a shortcut again.</li>
                <li><span className="font-semibold">Meeting Character Minimums:</span> Use the Text Repeater to quickly pad your message to meet minimum length requirements on forums or forms.</li>
                <li><span className="font-semibold">Creating Emphasis:</span> Repeating a word or phrase can be a powerful way to draw attention to your message.</li>
            </ul>
          </div>
        </div>

        <footer className="mt-12 py-6 border-t w-full">
          <div className="container max-w-2xl flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-5 w-5" />
              <span>© {new Date().getFullYear()} MsgReplier. All rights reserved.</span>
            </div>
            <div className="flex items-center flex-wrap justify-center gap-x-4 gap-y-2">
               <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground">Terms and Conditions</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Terms and Conditions</DialogTitle>
                  </DialogHeader>
                  <DialogDescriptionPrimitive asChild>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      <div>Welcome to MsgReplier. By using our service, including features like cham AI, the Text Repeater, and Shortcutpedia, you agree to these terms. You must be at least 13 years old to use this service.</div>
                      <div>You agree not to use the service for any illegal or unauthorized purpose. You are responsible for your conduct and any data, text, information, and links that you submit.</div>
                      <div>We reserve the right to modify or terminate the service for any reason, without notice, at any time. We also reserve the right to refuse service to anyone for any reason at any time.</div>
                    </div>
                  </DialogDescriptionPrimitive>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" /> Privacy Policy
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-green-600" /> Privacy Policy</DialogTitle>
                  </DialogHeader>
                  <DialogDescriptionPrimitive asChild>
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>Your privacy is important to us. It is MsgReplier&apos;s policy to respect your privacy regarding any information we may collect from you across our website.</div>
                        <div className="font-bold p-3 bg-green-100 dark:bg-green-900/50 rounded-md border border-green-200 dark:border-green-800">This website does not require any login, and we do not save, store, or collect any of your data. All processing is done in your browser, including your use of cham AI, the Text Repeater, and Shortcutpedia.</div>
                        <div>We don&apos;t share any personally identifying information publicly or with third-parties, simply because we don&apos;t collect it in the first place.</div>
                      </div>
                  </DialogDescriptionPrimitive>
                </DialogContent>
              </Dialog>
              <a href="mailto:care.msgreplier@gmail.com" className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground hover:underline underline-offset-4">
                <Mail className="h-4 w-4" /> Suggestions & Feedback
              </a>
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
            <SheetHeader className="p-4 border-b">
                <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent>
              <div className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`/shortcutpedia`} onClick={() => setOpenMobile(false)}>
                    <BookText className="h-5 w-5" />
                    Shortcutpedia
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                       <a href="#text-repeater" onClick={() => setOpenMobile(false)}>
                          <Copy className="h-5 w-5" />
                          Text Repeater
                       </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                       <Link href={`/cham-ai`} onClick={() => setOpenMobile(false)}>
                          <Bot className="h-5 w-5" />
                          cham AI
                       </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <hr className="my-2"/>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <a href="mailto:care.msgreplier@gmail.com">
                            <Mail className="h-5 w-5" />
                            Suggestions & Feedback
                        </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Dialog>
                        <DialogTrigger asChild>
                            <SidebarMenuButton>
                                <BookText className="h-5 w-5" />
                                Terms & Conditions
                            </SidebarMenuButton>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Terms and Conditions</DialogTitle>
                        </DialogHeader>
                        <DialogDescriptionPrimitive asChild>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>Welcome to MsgReplier. By using our service, including features like cham AI, the Text Repeater, and Shortcutpedia, you agree to these terms. You must be at least 13 years old to use this service.</div>
                            <div>You agree not to use the service for any illegal or unauthorized purpose. You are responsible for your conduct and any data, text, information, and links that you submit.</div>
                            <div>We reserve the right to modify or terminate the service for any reason, without notice, at any time. We also reserve the right to refuse service to anyone for any reason at any time.</div>
                            </div>
                        </DialogDescriptionPrimitive>
                        </DialogContent>
                    </Dialog>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                     <Dialog>
                        <DialogTrigger asChild>
                            <SidebarMenuButton>
                                <ShieldCheck className="h-5 w-5" />
                                Privacy Policy
                            </SidebarMenuButton>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                           <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-green-600" /> Privacy Policy</DialogTitle>
                        </DialogHeader>
                        <DialogDescriptionPrimitive asChild>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                <div>Your privacy is important to us. It is MsgReplier&apos;s policy to respect your privacy regarding any information we may collect from you across our website.</div>
                                <div className="font-bold p-3 bg-green-100 dark:bg-green-900/50 rounded-md border border-green-200 dark:border-green-800">This website does not require any login, and we do not save, store, or collect any of your data. All processing is done in your browser, including your use of cham AI, the Text Repeater, and Shortcutpedia.</div>
                                <div>We don&apos;t share any personally identifying information publicly or with third-parties, simply because we don&apos;t collect it in the first place.</div>
                            </div>
                        </DialogDescriptionPrimitive>
                        </DialogContent>
                    </Dialog>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </SidebarContent>
        </>
    )
}


function DesktopSidebarMenu() {
    const { toggleSidebar, setOpenMobile } = useSidebar();
    return (
      <>
        <SidebarHeader className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Menu</h2>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">
              <X />
            </Button>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`/shortcutpedia`}>
                    <BookText className="h-5 w-5" />
                    <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Shortcutpedia</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <a href="#text-repeater" onClick={() => setOpenMobile(false)}>
                        <Copy className="h-5 w-5" />
                        <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Text Repeater</span>
                    </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href={`/cham-ai`}>
                        <Bot className="h-5 w-5" />
                        <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">cham AI</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <hr className="my-2"/>
               <SidebarMenuItem>
                  <a href="mailto:care.msgreplier@gmail.com" className="inline-flex items-center gap-2 w-full p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground">
                      <Mail className="h-5 w-5" />
                      <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Suggestions & Feedback</span>
                  </a>
              </SidebarMenuItem>
               <SidebarMenuItem>
                    <Dialog>
                        <DialogTrigger asChild>
                            <SidebarMenuButton>
                                <BookText className="h-5 w-5" />
                                <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Terms & Conditions</span>
                            </SidebarMenuButton>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Terms and Conditions</DialogTitle>
                        </DialogHeader>
                        <DialogDescriptionPrimitive asChild>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>Welcome to MsgReplier. By using our service, including features like cham AI, the Text Repeater, and Shortcutpedia, you agree to these terms. You must be at least 13 years old to use this service.</div>
                            <div>You agree not to use the service for any illegal or unauthorized purpose. You are responsible for your conduct and any data, text, information, and links that you submit.</div>
                            <div>We reserve the right to modify or terminate the service for any reason, without notice, at any time. We also reserve the right to refuse service to anyone for any reason at any time.</div>
                            </div>
                        </DialogDescriptionPrimitive>
                        </DialogContent>
                    </Dialog>
              </SidebarMenuItem>
              <SidebarMenuItem>
                    <Dialog>
                        <DialogTrigger asChild>
                            <SidebarMenuButton>
                                <ShieldCheck className="h-5 w-5" />
                                <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Privacy Policy</span>
                            </SidebarMenuButton>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                           <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-green-600" /> Privacy Policy</DialogTitle>
                        </DialogHeader>
                        <DialogDescriptionPrimitive asChild>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                <div>Your privacy is important to us. It is MsgReplier&apos;s policy to respect your privacy regarding any information we may collect from you across our website.</div>
                                <div className="font-bold p-3 bg-green-100 dark:bg-green-900/50 rounded-md border border-green-200 dark:border-green-800">This website does not require any login, and we do not save, store, or collect any of your data. All processing is done in your browser.</div>
                                <div>We don&apos;t share any personally identifying information publicly or with third-parties, simply because we don&apos;t collect it in the first place.</div>
                            </div>
                        </DialogDescriptionPrimitive>
                        </DialogContent>
                    </Dialog>
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
