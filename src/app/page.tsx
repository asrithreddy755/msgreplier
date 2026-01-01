"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Copy, Check, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

type RepetitionType = "row" | "column";

export default function MsgRepeaterPage() {
  const [platformId, setPlatformId] = useState<Platform["id"]>(PLATFORMS[0].id);
  const [inputText, setInputText] = useState("Hello! ");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [repetitionType, setRepetitionType] =
    useState<RepetitionType>("row");
  const [addSpace, setAddSpace] = useState(true);

  const selectedPlatform = useMemo(
    () => PLATFORMS.find((p) => p.id === platformId)!,
    [platformId]
  );

  const handleGenerate = useCallback(() => {
    if (!inputText.trim()) {
      setGeneratedText("");
      return;
    }
    setIsLoading(true);

    // Simulate a short delay for loading effect
    setTimeout(() => {
      let separator = "";
      if (repetitionType === "column") {
        separator = "\n";
      } else if (addSpace) {
        separator = " ";
      }
      
      const textWithSeparator = inputText + separator;

      let repeatedText = "";
      if (textWithSeparator.length > 0) {
        while ((repeatedText + textWithSeparator).length <= selectedPlatform.charLimit) {
          repeatedText += textWithSeparator;
        }
      }
      
      // Trim the last separator
      if (repeatedText.endsWith(separator) && separator !== "") {
          repeatedText = repeatedText.slice(0, -separator.length);
      }
      
      // Final check to see if just the input text fits
      if (repeatedText.length === 0 && inputText.length <= selectedPlatform.charLimit) {
          repeatedText = inputText;
      }

      setGeneratedText(repeatedText);
      setIsLoading(false);
    }, 300);
  }, [inputText, selectedPlatform, repetitionType, addSpace]);

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const charCount = generatedText.length;
  const charLimit = selectedPlatform.charLimit;
  const isOverLimit = charCount > charLimit;

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
             <MessageSquare className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-3xl tracking-tight">
              MsgRepeater
            </CardTitle>
          </div>
          <CardDescription>
            Repeat your text for any social media platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-6">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={platformId}
                onValueChange={(value) => setPlatformId(value as Platform["id"])}
              >
                <SelectTrigger id="platform">
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

            <Button onClick={handleGenerate} disabled={isLoading || !inputText.trim()}>
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
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">
          Created by an AI assistant in Firebase Studio.
        </p>
        <div className="flex justify-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto">Terms and Conditions</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Terms and Conditions</DialogTitle>
              </DialogHeader>
              <DialogDescription className="space-y-4 max-h-[60vh] overflow-y-auto">
                <p>Welcome to MsgRepeater. By using our service, you agree to these terms. You must be at least 13 years old to use this service.</p>
                <p>You agree not to use the service for any illegal or unauthorized purpose. You are responsible for your conduct and any data, text, information, and links that you submit.</p>
                <p>We reserve the right to modify or terminate the service for any reason, without notice, at any time. We also reserve the right to refuse service to anyone for any reason at any time.</p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Privacy Policy</DialogTitle>
              </DialogHeader>
              <DialogDescription className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <p>Your privacy is important to us. It is MsgRepeater's policy to respect your privacy regarding any information we may collect from you across our website.</p>
                  <p className="font-bold">This website does not save, store, or collect any of your data. All text processing is done in your browser and is not sent to our servers.</p>
                  <p>We don’t share any personally identifying information publicly or with third-parties, simply because we don't collect it in the first place.</p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
      </footer>
    </main>
  );
}
