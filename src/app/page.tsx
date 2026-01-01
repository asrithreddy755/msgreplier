"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { optimizeRepeatedTextForPlatform } from "@/ai/flows/optimize-repeated-text-for-platform";
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
import { Copy, Check, MessageSquare, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function MsgRepeaterPage() {
  const [platformId, setPlatformId] = useState<Platform["id"]>(PLATFORMS[0].id);
  const [inputText, setInputText] = useState("Hello! ");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const selectedPlatform = useMemo(
    () => PLATFORMS.find((p) => p.id === platformId)!,
    [platformId]
  );

  const generateRepeatedText = useCallback(
    async (text: string, platform: Platform) => {
      if (!text.trim()) {
        setGeneratedText("");
        return;
      }
      setIsLoading(true);
      try {
        const result = await optimizeRepeatedTextForPlatform({
          platform: platform.name,
          text: text,
          characterLimit: platform.charLimit,
        });
        setGeneratedText(result.optimizedText);
      } catch (error) {
        console.error("Error generating text:", error);
        setGeneratedText("Error: Could not generate text.");
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description:
            "There was an issue generating the text. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      generateRepeatedText(inputText, selectedPlatform);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inputText, selectedPlatform, generateRepeatedText]);

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
            Optimize repeated text for any social media platform, powered by AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid w-full items-center gap-6">
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
          </form>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Created by an AI assistant in Firebase Studio.
        </p>
      </footer>
    </main>
  );
}
