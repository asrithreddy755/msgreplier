"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Copy, Check, MessageSquare, Menu } from "lucide-react";
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
  DialogDescription,
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
} from "@/components/ui/sidebar";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

type RepetitionType = "row" | "column";


function AppContent() {
  const router = useRouter();
  const params = useParams();
  const platformSlug = params.platform as string;
  const { setOpenMobile } = useSidebar();

  const initialPlatform = useMemo(() => {
    return PLATFORMS.find((p) => p.slug === platformSlug) || PLATFORMS[0];
  }, [platformSlug]);

  const [platformId, setPlatformId] = useState<Platform["id"]>(initialPlatform.id);
  const [inputText, setInputText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [repetitionType, setRepetitionType] =
    useState<RepetitionType>("row");
  const [addSpace, setAddSpace] = useState(true);
  const [customCharLimit, setCustomCharLimit] = useState(initialPlatform.charLimit);
  const [useRepetitionCount, setUseRepetitionCount] = useState(false);
  const [repetitionCount, setRepetitionCount] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    const currentPlatform = PLATFORMS.find(p => p.slug === platformSlug);
    if (!currentPlatform) {
      const defaultPlatform = PLATFORMS.find(p => p.id === 'x') || PLATFORMS[0];
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
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
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
      setIsLoading(false);
      
      if (repeatedText) {
        navigator.clipboard.writeText(repeatedText).then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        });
      }

    }, 300);
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
        <Link href="/" className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            MsgRepeater
          </h1>
        </Link>
        <div className="flex items-center gap-4 flex-shrink-0">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setOpenMobile(true)} className="md:hidden">
            <Menu />
          </Button>
        </div>
      </header>
      <main className="flex flex-1 w-full flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h2 className="font-headline text-4xl font-bold tracking-tight">
            Repeat Your Message Instantly
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Easily repeat your message to meet the character limits of any social media platform. Just type your text, choose your platform, and generate the repeated message instantly.
          </p>
        </div>
        <Card className="w-full max-w-2xl shadow-lg">
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
                <div className="flex items-center space-x-6">
                  <RadioGroup
                    defaultValue="row"
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
                      disabled={repetitionType === "column"}
                    />
                    <Label
                      htmlFor="add-space"
                      className={repetitionType === 'column' ? 'text-muted-foreground' : ''}
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
                  <div
                    className={`text-sm ${
                      isOverLimit ? "text-destructive font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {charCount} / {charLimit}
                  </div>
                </div>
                <div className="relative">
                  {isLoading ? (
                    <Skeleton className="h-[120px] w-full" />
                  ) : (
                    <Textarea
                      id="generated-text"
                      readOnly
                      value={generatedText}
                      placeholder="Generated text will appear here..."
                      className="pr-12 min-h-[120px] bg-muted/50"
                    />
                  )}
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
              <li><span className="font-semibold">Set Formatting Options:</span> Choose to repeat your text in a "Row" (side-by-side) or "Column" (line-by-line). You can also choose whether to add a space between repetitions for the "Row" option.</li>
              <li><span className="font-semibold">Specify Repetition Count (Optional):</span> If you want to repeat the text a specific number of times, check the box and enter the desired count. Otherwise, the tool will repeat it as many times as possible within the character limit.</li>
              <li><span className="font-semibold">Generate and Copy:</span> Click the "Generate" button. Your repeated text will appear below. You can then click the copy icon to copy it to your clipboard.</li>
            </ol>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">How Does Text MsgRepeater Work?</h3>
          <div className="space-y-4 text-muted-foreground">
            <p>Our tool is straightforward. You enter the text you want to repeat in the "Your Text" field. Then, you select a social media platform from the dropdown menu, which automatically sets the character limit for you. Alternatively, you can choose "Custom" to define your own limit.</p>
            <p>You can also decide if you want the text to be repeated in a single row or in a column format, and whether to add spaces between each repetition. Once you click "Generate," the tool repeats your text as many times as possible without exceeding the character limit and displays it in the "Generated Text" box. From there, you can easily copy it to your clipboard.</p>
          </div>
        </div>

        <div className="w-full max-w-2xl mt-12 text-left bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold tracking-tight mb-4">Common Uses</h3>
          <div className="space-y-4 text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-semibold">Meeting Character Minimums:</span> Some online forms or comment sections have a minimum character requirement. Quickly pad your message to meet the minimum length.</li>
              <li><span className="font-semibold">Creating Emphasis:</span> Repeating a word or phrase can be a powerful way to draw attention to your message in social media posts or chats.</li>
              <li><span className="font-semibold">Artistic Text Patterns:</span> Use the column feature to create ASCII art or interesting visual patterns with platforms like Discord or Twitter.</li>
              <li><span className="font-semibold">Testing and Development:</span> Developers can use this tool to generate long strings of text to test text fields, database limits, and layout constraints in their applications.</li>
            </ul>
          </div>
        </div>

        <footer className="mt-12 py-6 border-t w-full">
          <div className="container max-w-2xl flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-5 w-5" />
              <span>© {new Date().getFullYear()} MsgRepeater. All rights reserved.</span>
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
                  <DialogDescription asChild>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      <div>Welcome to MsgRepeater. By using our service, you agree to these terms. You must be at least 13 years old to use this service.</div>
                      <div>You agree not to use the service for any illegal or unauthorized purpose. You are responsible for your conduct and any data, text, information, and links that you submit.</div>
                      <div>We reserve the right to modify or terminate the service for any reason, without notice, at any time. We also reserve the right to refuse service to anyone for any reason at any time.</div>
                    </div>
                  </DialogDescription>
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
                  <DialogDescription asChild>
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>Your privacy is important to us. It is MsgRepeater's policy to respect your privacy regarding any information we may collect from you across our website.</div>
                        <div className="font-bold">This website does not save, store, or collect any of your data. All text processing is done in your browser and is not sent to our servers.</div>
                        <div>We don’t share any personally identifying information publicly or with third-parties, simply because we don't collect it in the first place.</div>
                      </div>
                  </DialogDescription>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function MsgRepeaterPage() {
  const params = useParams();
  const platformSlug = params.platform as string;
  const homePlatform = PLATFORMS.find(p => p.id === 'instagram');

  return (
    <SidebarProvider>
      <SidebarInset>
        <AppContent />
      </SidebarInset>
      <Sidebar side="right" className="md:border-l">
        <SheetHeader className="p-4 border-b md:hidden">
            <SheetTitle>Platforms</SheetTitle>
        </SheetHeader>
        <SidebarContent>
          <div className="p-4 md:p-0">
            <h2 className="text-xl font-semibold mb-4 hidden md:block">Platforms</h2>
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
      </Sidebar>
    </SidebarProvider>
  )
}
