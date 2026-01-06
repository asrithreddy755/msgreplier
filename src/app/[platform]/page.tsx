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
import PlatformIcon from "@/components/platform-icon";
import { Copy, Check, MessageSquare, Menu, X, Bot, BookText, ShieldCheck, Sparkles, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { generateReplies } from "@/ai/flows/reply-generator";


type RepetitionType = "row" | "column";
type ReplyLength = "short" | "medium" | "long";

function AppContent() {
  const router = useRouter();
  const params = useParams();
  const platformSlug = params.platform as string;
  const { setOpenMobile, open: sidebarOpen, toggleSidebar } = useSidebar();

  const initialPlatform = useMemo(() => {
    const platformFromSlug = PLATFORMS.find((p) => p.slug === platformSlug);
    // If slug is for AI generator or not found, default to instagram for repeater
    if (!platformFromSlug || platformFromSlug.id === 'ai-reply') {
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

  // AI assistant state
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiInputText, setAiInputText] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [userGender, setUserGender] = useState("male");
  const [replyCount, setReplyCount] = useState(5);
  const [replyTone, setReplyTone] = useState("Friendly and Casual");
  const [replyLength, setReplyLength] = useState(1); // 0: short, 1: medium, 2: long
  const [generatedReplies, setGeneratedReplies] = useState<string[]>([]);
  const [copiedReplies, setCopiedReplies] = useState<boolean[]>([]);
  
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
      router.replace(`/cham-ai`);
    } 
  }, [platformSlug, router]);
  
  const handlePlatformChange = (newPlatformId: Platform["id"]) => {
    const platform = PLATFORMS.find((p) => p.id === newPlatformId);
    if (platform) {
      setPlatformId(newPlatformId);
      if (platform.slug !== platformSlug) {
         router.push(`/${platform.slug}`);
      }
    }
  };
  
  const handleAiGenerate = async () => {
    if (!aiInputText.trim()) {
      toast({
        variant: "destructive",
        title: "Input is empty",
        description: "Please enter the message you received.",
      });
      return;
    }
    setAiIsLoading(true);
    setGeneratedReplies([]);

    try {
      const result = await generateReplies({
        message: aiInputText,
        additionalInfo,
        userGender,
        replyCount: replyCount,
        replyTone,
        replyLength: replyLengthMap[replyLength],
      });
      setGeneratedReplies(result.replies);
      setCopiedReplies(new Array(result.replies.length).fill(false));
    } catch (error) {
      console.error("AI generation failed:", error);
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: "Something went wrong while generating replies. Please try again.",
      });
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleCopyReply = (index: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedReplies(prev => {
        const newCopied = [...prev];
        newCopied[index] = true;
        return newCopied;
      });
      setTimeout(() => {
        setCopiedReplies(prev => {
          const newCopied = [...prev];
          newCopied[index] = false;
          return newCopied;
        });
      }, 2000);
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

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="flex flex-wrap items-center justify-between p-4 border-b bg-card shadow-sm gap-4">
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-2xl font-bold tracking-tight">
                MsgReplier
            </h1>
            </Link>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </header>
      <main className="flex flex-1 w-full flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h2 className="font-headline text-4xl font-bold tracking-tight">
            AI Replies & Text Tools for Everyone
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Use our AI to craft the perfect reply, or use the text repeater to meet character limits. Your complete messaging toolkit.
          </p>
        </div>

        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              cham AI
            </CardTitle>
            <CardDescription>
              Craft the perfect reply for any situation. Just paste the message you received and let our AI generate responses for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-6">
              <div className="flex flex-col space-y-2">
                <Label>Your Gender</Label>
                <RadioGroup
                  value={userGender}
                  onValueChange={setUserGender}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="gender-male" />
                    <Label htmlFor="gender-male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="gender-female" />
                    <Label htmlFor="gender-female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="gender-other" />
                    <Label htmlFor="gender-other">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="reply-count">Number of Replies</Label>
                  <span className="text-sm text-muted-foreground font-medium">{replyCount}</span>
                </div>
                <Slider
                  id="reply-count"
                  min={1}
                  max={20}
                  step={1}
                  value={[replyCount]}
                  onValueChange={(value) => setReplyCount(value[0])}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="tone">Desired Tone</Label>
                <Select value={replyTone} onValueChange={setReplyTone}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Witty and Humorous">Witty and Humorous</SelectItem>
                    <SelectItem value="Friendly and Casual">Friendly and Casual</SelectItem>
                    <SelectItem value="Caring and Supportive">Caring and Supportive</SelectItem>
                    <SelectItem value="Playful and Fun">Playful and Fun</SelectItem>
                    <SelectItem value="Romantic and Affectionate">Romantic and Affectionate</SelectItem>
                    <SelectItem value="Direct and Straightforward">Direct and Straightforward</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="reply-length">Reply Length</Label>
                  <span className="text-sm text-muted-foreground font-medium">
                    {replyLengthLabels[replyLength]}
                  </span>
                </div>
                <Slider
                  id="reply-length"
                  min={0}
                  max={2}
                  step={1}
                  value={[replyLength]}
                  onValueChange={(value) => setReplyLength(value[0])}
                />
              </div>

               <div className="flex flex-col space-y-2">
                <Label htmlFor="ai-input-text">Message You Received</Label>
                <Textarea
                  id="ai-input-text"
                  placeholder="e.g., 'hey what's up?'"
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  rows={3}
                />
              </div>

               <div className="flex flex-col space-y-2">
                <Label htmlFor="ai-additional-info">Additional Information (Optional)</Label>
                <Textarea
                  id="ai-additional-info"
                  placeholder="e.g., 'She is my colleague and I have a crush on her.'"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Button className="w-full" onClick={handleAiGenerate} disabled={aiIsLoading}>
                  {aiIsLoading ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-5 w-5" />
                      Generate Replies
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  cham AI may give misinformation. Please check important info.
                </p>
              </div>

              {aiIsLoading && (
                <div className="space-y-4">
                  {[...Array(replyCount)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              )}

              {!aiIsLoading && generatedReplies.length > 0 && (
                <div className="space-y-4">
                   <h3 className="text-lg font-medium text-center">AI Generated Replies</h3>
                   {generatedReplies.map((reply, index) => (
                     <div key={index} className="relative flex items-center">
                       <p className="flex-1 p-3 pr-12 text-sm bg-muted/50 rounded-md border">
                         {reply}
                       </p>
                       <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-accent/50"
                          onClick={() => handleCopyReply(index, reply)}
                          disabled={copiedReplies[index]}
                          aria-label="Copy reply"
                        >
                          {copiedReplies[index] ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </Button>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                <div className="flex gap-4">
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
                      {PLATFORMS.filter(p => p.id !== 'ai-reply').map((platform) => (
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
                    <div className="flex flex-col space-y-2 w-40">
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
                <div className="flex items-center space-x-6 flex-wrap gap-y-2">
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
                <div className="flex items-center gap-4 p-4 border rounded-md">
                    <Checkbox
                      id="use-repetition-count"
                      checked={useRepetitionCount}
                      onCheckedChange={(checked) => setUseRepetitionCount(!!checked)}
                    />
                    <Label htmlFor="use-repetition-count" className="flex-1 text-sm font-normal">
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
                  If unchecked, it will repeat as many times as possible within the platform's character limit.
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

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">How to Use This Tool</h3>
          <div className="space-y-4 text-muted-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li><span className="font-semibold">cham AI:</span> Use the "cham AI" to create perfect replies. Just enter the message you received, provide optional context, and select the tone, length, and number of replies you want. The AI does the rest!</li>
              <li><span className="font-semibold">Text Repeater:</span> Need to make a point or hit a character limit? Scroll down to the "Text Repeater" tool.</li>
              <li><span className="font-semibold">Enter Your Text:</span> Type the text you want to repeat into the "Your Text" field.</li>
              <li><span className="font-semibold">Choose a Platform:</span> Select a platform to auto-set the character limit, or choose "Custom".</li>
              <li><span className="font-semibold">Set Formatting Options:</span> Repeat your text in a "Row" or "Column".</li>
              <li><span className="font-semibold">Generate and Copy:</span> Click "Generate" and then copy the resulting text.</li>
            </ol>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">How Does MsgReplier Work?</h3>
          <div className="space-y-4 text-muted-foreground">
            <p>Our tool has two main features: an AI Reply Generator and a Text Repeater.</p>
            <p>The <span className="font-semibold">cham AI</span> uses advanced AI to understand the context you provide and craft replies in the tone you want. Just tell it who you are, what message you received, and how you want to sound.</p>
            <p>The <span className="font-semibold">Text Repeater</span> is straightforward. You enter text, choose formatting, and it generates the repeated text.</p>
            <p className="font-semibold text-foreground border-l-4 border-primary pl-4">Your privacy is our priority. We do not require any login, and we do not save, store, or collect any of your data. All text processing is done in your browser.</p>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">Common Uses</h3>
          <div className="space-y-4 text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
                <li><span className="font-semibold">Breaking the Ice:</span> Not sure how to reply to "hey" or "what's up"? Let the AI give you a creative and engaging start.</li>
                <li><span className="font-semibold">Finding the Right Tone:</span> Effortlessly switch between a formal, playful, or supportive tone depending on the situation.</li>
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
                      <div>Welcome to MsgReplier. By using our service, you agree to these terms. You must be at least 13 years old to use this service.</div>
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
                        <div>Your privacy is important to us. It is MsgReplier's policy to respect your privacy regarding any information we may collect from you across our website.</div>
                        <div className="font-bold p-3 bg-green-100 dark:bg-green-900/50 rounded-md border border-green-200 dark:border-green-800">This website does not require any login, and we do not save, store, or collect any of your data. All processing is done in your browser.</div>
                        <div>We don’t share any personally identifying information publicly or with third-parties, simply because we don't collect it in the first place.</div>
                      </div>
                  </DialogDescriptionPrimitive>
                </DialogContent>
              </Dialog>
              <Button asChild variant="link" className="p-0 h-auto text-sm text-muted-foreground flex items-center gap-1">
                <a href="mailto:care.msgreplier@gmail.com">
                  <Mail className="h-4 w-4" /> Suggestions & Feedback
                </a>
              </Button>
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
                      <Link href={`/cham-ai`}>
                        <Bot className="h-5 w-5" />
                        cham AI
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
                            <div>Welcome to MsgReplier. By using our service, you agree to these terms. You must be at least 13 years old to use this service.</div>
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
                                <div>Your privacy is important to us. It is MsgReplier's policy to respect your privacy regarding any information we may collect from you across our website.</div>
                                <div className="font-bold p-3 bg-green-100 dark:bg-green-900/50 rounded-md border border-green-200 dark:border-green-800">This website does not require any login, and we do not save, store, or collect any of your data. All processing is done in your browser.</div>
                                <div>We don’t share any personally identifying information publicly or with third-parties, simply because we don't collect it in the first place.</div>
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
                  <Link href={`/cham-ai`}>
                    <Bot className="h-5 w-5" />
                    <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">cham AI</span>
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
              <hr className="my-2"/>
               <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <a href="mailto:care.msgreplier@gmail.com">
                            <Mail className="h-5 w-5" />
                            <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Suggestions & Feedback</span>
                        </a>
                    </SidebarMenuButton>
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
                            <div>Welcome to MsgReplier. By using our service, you agree to these terms. You must be at least 13 years old to use this service.</div>
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
                                <div>Your privacy is important to us. It is MsgReplier's policy to respect your privacy regarding any information we may collect from you across our website.</div>
                                <div className="font-bold p-3 bg-green-100 dark:bg-green-900/50 rounded-md border border-green-200 dark:border-green-800">This website does not require any login, and we do not save, store, or collect any of your data. All processing is done in your browser.</div>
                                <div>We don’t share any personally identifying information publicly or with third-parties, simply because we don't collect it in the first place.</div>
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
    <SidebarProvider defaultOpen={false}>
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
