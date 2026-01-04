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
import { Copy, Check, MessageSquare, Menu, X, RotateCcw, Bot } from "lucide-react";
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


type RepetitionType = "row" | "column" | "separate";

function AppContent() {
  const router = useRouter();
  const params = useParams();
  const platformSlug = params.platform as string;
  const { setOpenMobile, open: sidebarOpen, toggleSidebar } = useSidebar();

  const initialPlatform = useMemo(() => {
    return PLATFORMS.find((p) => p.slug === platformSlug) || PLATFORMS[0];
  }, [platformSlug]);

  const [platformId, setPlatformId] = useState<Platform["id"]>(initialPlatform.id);
  const [inputText, setInputText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [generatedItems, setGeneratedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [repetitionType, setRepetitionType] =
    useState<RepetitionType>("row");
  const [addSpace, setAddSpace] = useState(true);
  const [customCharLimit, setCustomCharLimit] = useState(initialPlatform.charLimit);
  const [useRepetitionCount, setUseRepetitionCount] = useState(false);
  const [repetitionCount, setRepetitionCount] = useState(10);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isCycleCopied, setIsCycleCopied] = useState(false);
  const { toast } = useToast();

  // AI assistant state
  const [aiInputText, setAiInputText] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [userGender, setUserGender] = useState("male");
  const [replyCount, setReplyCount] = useState([5]);
  const [replyTone, setReplyTone] = useState("friendly-casual");

  useEffect(() => {
    const currentPlatform = PLATFORMS.find(p => p.slug === platformSlug);
    if (!currentPlatform) {
      const defaultPlatform = PLATFORMS.find(p => p.id === 'instagram') || PLATFORMS[0];
      router.replace(`/${defaultPlatform.slug}`);
    } else {
      setPlatformId(currentPlatform.id);
    }
  }, [platformSlug, router]);
  
  const handlePlatformChange = (newPlatformId: Platform["id"]) => {
    const platform = PLATFORMS.find((p) => p.id === newPlatformId);
    if (platform) {
      setPlatformId(newPlatformId);
      router.push(`/${platform.slug}`);
    }
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
      setGeneratedItems([]);
      return;
    }
    setIsLoading(true);
    setGeneratedText("");
    setGeneratedItems([]);
    setCurrentItemIndex(0);


    setTimeout(() => {
      if (repetitionType === 'separate') {
          const count = useRepetitionCount ? repetitionCount : Math.floor(charLimit / (inputText.length + 1)) || 1;
          if (inputText) {
              // Add invisible characters to make each item unique for clipboard
              let items = Array.from({ length: count }, (_, i) => inputText + '\u200B'.repeat(i));
              
              const totalLengthWithNewlines = items.reduce((acc, item) => acc + item.length + 1, -1);

              if (useRepetitionCount && totalLengthWithNewlines > charLimit) {
                  toast({
                      variant: "destructive",
                      title: "Content may exceed some limits",
                      description: "The total length of messages for your specified count is high. Ensure it fits within platform limits if pasting all at once.",
                  });
              } else if (!useRepetitionCount && totalLengthWithNewlines > charLimit) {
                  const singleItemLength = inputText.length + 1; // +1 for newline
                  const newCount = Math.floor(charLimit / singleItemLength);
                  if (newCount > 0) {
                      items = Array.from({ length: newCount }, (_, i) => inputText + '\u200B'.repeat(i));
                  } else {
                      toast({
                          variant: "destructive",
                          title: "Could not generate within limit",
                          description: "Even one repetition is over the character limit.",
                      });
                      items = [];
                  }
              }
              setGeneratedItems(items);
          }
      } else {
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
           if (repeatedText) {
            navigator.clipboard.writeText(repeatedText).then(() => {
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            });
          }
      }

      setIsLoading(false);
      

    }, 300);
  }, [inputText, charLimit, repetitionType, addSpace, useRepetitionCount, repetitionCount, toast]);

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleCopyCycle = () => {
    if (generatedItems.length === 0 || currentItemIndex >= generatedItems.length) return;
    
    const currentText = generatedItems[currentItemIndex];
    navigator.clipboard.writeText(currentText).then(() => {
        setIsCycleCopied(true);
        setTimeout(() => {
            setIsCycleCopied(false);
            if (currentItemIndex < generatedItems.length - 1) {
                setCurrentItemIndex(prev => prev + 1);
            }
        }, 1000);
    });
  };

  const resetCycle = () => {
    setCurrentItemIndex(0);
  };

  const charCount = generatedText.length;
  const isOverLimit = charCount > charLimit && repetitionType !== 'separate';

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
            Generate perfect replies for any message
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Use our AI to craft the perfect reply, or use the text repeater to meet character limits. Your complete messaging toolkit.
          </p>
        </div>

        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              MsgCham AI
            </CardTitle>
            <CardDescription>
              Craft the perfect reply for any situation. Describe the context and let our AI generate responses for you.
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
                  <span className="text-sm text-muted-foreground font-medium">{replyCount[0]}</span>
                </div>
                <Slider
                  id="reply-count"
                  min={1}
                  max={10}
                  step={1}
                  value={replyCount}
                  onValueChange={setReplyCount}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="tone">Desired Tone</Label>
                <Select value={replyTone} onValueChange={setReplyTone}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal-polite">Formal / Polite</SelectItem>
                    <SelectItem value="friendly-casual">Friendly / Casual</SelectItem>
                    <SelectItem value="caring-supportive">Caring / Supportive</SelectItem>
                    <SelectItem value="playful-fun">Playful / Fun</SelectItem>
                    <SelectItem value="romantic-affectionate">Romantic / Affectionate</SelectItem>
                    <SelectItem value="serious-honest">Serious / Honest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <div className="flex flex-col space-y-2">
                <Label htmlFor="ai-input-text">Message Received</Label>
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

              <Button>
                <Bot className="mr-2 h-5 w-5" />
                Generate Replies
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-2xl shadow-lg mt-8">
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
                      {PLATFORMS.map((platform) => (
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
                     <div className="flex items-center space-x-2">
                      <RadioGroupItem value="separate" id="r3" />
                      <Label htmlFor="r3">Separate</Label>
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

              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate"}
              </Button>

              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="generated-text">Generated Text</Label>
                  {repetitionType !== 'separate' && (
                  <div
                    className={`text-sm ${
                      isOverLimit ? "text-destructive font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {charCount} / {charLimit}
                  </div>
                  )}
                </div>
                {isLoading ? (
                    <Skeleton className="h-[120px] w-full" />
                ) : repetitionType === 'separate' ? (
                  <div className="space-y-3">
                    {generatedItems.length > 0 ? (
                      <>
                        <div className="relative">
                          <Input
                            readOnly
                            value={generatedItems[currentItemIndex]}
                            className="pr-12 bg-muted/50 text-lg h-12"
                            placeholder="Your message will appear here"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                           <Button
                            onClick={handleCopyCycle}
                            className="flex-1"
                            disabled={isCycleCopied || currentItemIndex >= generatedItems.length}
                          >
                            {isCycleCopied ? (
                              <>
                                <Check className="h-5 w-5 mr-2" />
                                Copied!
                              </>
                            ) : currentItemIndex < generatedItems.length -1 ? (
                              <>
                                <Copy className="h-5 w-5 mr-2" />
                                Copy & Show Next
                              </>
                            ) : (
                               <>
                                <Copy className="h-5 w-5 mr-2" />
                                Copy Last Message
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="icon" onClick={resetCycle} aria-label="Reset">
                              <RotateCcw className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                          {currentItemIndex >= generatedItems.length
                            ? `All ${generatedItems.length} messages copied!`
                            : `Message ${currentItemIndex + 1} of ${generatedItems.length}`}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                        Separated messages will appear here...
                      </div>
                    )}
                  </div>
                ) : (
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
                    disabled={isLoading || !generatedText || isCopied}
                    aria-label="Copy to clipboard"
                  >
                    {isCopied ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">How to Use This Tool</h3>
          <div className="space-y-4 text-muted-foreground">
            <ol className="list-decimal list-inside space-y-2">
              <li><span className="font-semibold">Enter Your Text:</span> Start by typing or pasting the text you want to repeat into the "Your Text" field.</li>
              <li><span className="font-semibold">Choose a Platform:</span> Select your target social media platform from the dropdown menu. This sets the correct character limit automatically. For a custom limit, choose "Custom" and enter a number.</li>
              <li><span className="font-semibold">Set Formatting Options:</span> Choose to repeat your text in a "Row" (side-by-side), "Column" (line-by-line), or "Separate" (for individual messages). You can also choose whether to add a space between repetitions for the "Row" option.</li>
              <li><span className="font-semibold">Specify Repetition Count (Optional):</span> If you want to repeat the text a specific number of times, check the box and enter the desired count. Otherwise, the tool will repeat it as many times as possible within the character limit.</li>
              <li><span className="font-semibold">Generate and Copy:</span> Click the "Generate" button.
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>For "Row" and "Column", your repeated text will appear in a single box. Click the copy icon to copy it all at once.</li>
                  <li>For "Separate" mode, use the "Copy & Show Next" button to copy each message one-by-one. This is perfect for mobile users who need to post multiple comments, as it avoids clipboard issues with duplicate content.</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">How Does Text MsgReplier Work?</h3>
          <div className="space-y-4 text-muted-foreground">
            <p>Our tool is straightforward. You enter the text you want to repeat, select a social media platform to set the character limit (or set a custom one), and choose your formatting. You can have the text repeated in a single "Row," a "Column" format with line breaks, or as "Separate" individual messages.</p>
            <p>The "Separate" option is designed for mobile users. It allows you to copy each repeated message one at a time with a "Copy & Show Next" button, preventing clipboard issues with duplicate content. Each copied message has a tiny, invisible character added, making it unique to your clipboard. Once you click "Generate," the tool processes your request and provides the output for you to easily copy.</p>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">Common Uses</h3>
          <div className="space-y-4 text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-semibold">Meeting Character Minimums:</span> Some online forms or comment sections have a minimum character requirement. Quickly pad your message to meet the minimum length.</li>
              <li><span className="font-semibold">Creating Emphasis:</span> Repeating a word or phrase can be a powerful way to draw attention to your message in social media posts or chats.</li>
              <li><span className="font-semibold">Spamming Comments (Responsibly!):</span> Use the "Separate" mode to quickly post multiple individual comments in a live stream or chat. The "Copy & Show Next" feature makes this fast and easy from a mobile device by ensuring each copy is unique.</li>
              <li><span className="font-semibold">Artistic Text Patterns:</span> Use the column feature to create ASCII art or interesting visual patterns with platforms like Discord or Twitter.</li>
              <li><span className="font-semibold">Testing and Development:</span> Developers can use this tool to generate long strings of text to test text fields, database limits, and layout constraints in their applications.</li>
            </ul>
          </div>
        </div>

        <footer className="mt-12 py-6 border-t w-full">
          <div className="container max-w-2xl flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-5 w-5" />
              <span>© {new Date().getFullYear()} MsgReplier. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
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
                  <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground">Privacy Policy</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Privacy Policy</DialogTitle>
                  </DialogHeader>
                  <DialogDescriptionPrimitive asChild>
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>Your privacy is important to us. It is MsgReplier's policy to respect your privacy regarding any information we may collect from you across our website.</div>
                        <div className="font-bold">This website does not save, store, or collect any of your data. All text processing is done in your browser and is not sent to our servers.</div>
                        <div>We don’t share any personally identifying information publicly or with third-parties, simply because we don't collect it in the first place.</div>
                      </div>
                  </DialogDescriptionPrimitive>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function MobileSidebarMenu({ platformSlug }: { platformSlug: string }) {
    const homePlatform = PLATFORMS.find(p => p.id === 'instagram');
    return (
        <>
            <SheetHeader className="p-4 border-b">
                <SheetTitle>Platforms</SheetTitle>
            </SheetHeader>
            <SidebarContent>
              <div className="p-4">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href={`/${homePlatform?.slug || ''}`}>
                        <PlatformIcon platformId="instagram" className="h-5 w-5" />
                        Home
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <hr className="my-2"/>
                  {PLATFORMS.map(platform => (
                    <SidebarMenuItem key={platform.id}>
                      <SidebarMenuButton asChild isActive={platform.slug === platformSlug}>
                        <Link href={`/${platform.slug}`}>
                          <PlatformIcon platformId={platform.id} className="h-5 w-5" />
                          <span>{platform.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            </SidebarContent>
        </>
    )
}


function DesktopSidebarMenu({ platformSlug }: { platformSlug: string }) {
    const homePlatform = PLATFORMS.find(p => p.id === 'instagram');
    const { toggleSidebar } = useSidebar();
    return (
      <>
        <SidebarHeader className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Platforms</h2>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">
              <X />
            </Button>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`/${homePlatform?.slug || ''}`}>
                    <PlatformIcon platformId="instagram" className="h-5 w-5" />
                    <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <hr className="my-2"/>
              {PLATFORMS.map(platform => (
                <SidebarMenuItem key={platform.id}>
                  <SidebarMenuButton asChild isActive={platform.slug === platformSlug}>
                    <Link href={`/${platform.slug}`}>
                      <PlatformIcon platformId={platform.id} className="h-5 w-5" />
                      <span className="transition-opacity duration-200 group-data-[state=collapsed]:opacity-0">{platform.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </SidebarContent>
      </>
    )
}

export default function MsgReplierPage() {
  const params = useParams();
  const platformSlug = params.platform as string;
  
  return (
    <SidebarProvider defaultOpen={false}>
      <SidebarInset>
        <AppContent />
      </SidebarInset>
      <Sidebar side="right" className="border-l bg-card">
        <MobileSidebarMenu platformSlug={platformSlug} />
        <DesktopSidebarMenu platformSlug={platformSlug} />
      </Sidebar>
    </SidebarProvider>
  )
}
