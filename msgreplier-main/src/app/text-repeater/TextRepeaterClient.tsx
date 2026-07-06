"use client";

import { useState, useMemo, useCallback } from "react";
import { PLATFORMS, Platform } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PlatformIcon from "@/components/platform-icon";

type RepetitionType = "row" | "column";

const REPEATER_PLATFORMS = PLATFORMS.filter(
  (p) => p.id !== "ai-reply" && p.id !== "shortcutpedia"
);

export default function TextRepeaterClient() {
  const [platformId, setPlatformId] = useState<Platform["id"]>("custom");
  const [inputText, setInputText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [repetitionType, setRepetitionType] = useState<RepetitionType>("row");
  const [addSpace, setAddSpace] = useState(true);
  const [customCharLimit, setCustomCharLimit] = useState(2200);
  const [useRepetitionCount, setUseRepetitionCount] = useState(false);
  const [repetitionCount, setRepetitionCount] = useState(10);
  const { toast } = useToast();

  const selectedPlatform = useMemo(
    () => REPEATER_PLATFORMS.find((p) => p.id === platformId)!,
    [platformId]
  );

  const charLimit = useMemo(() => {
    return platformId === "custom" ? customCharLimit : selectedPlatform.charLimit;
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
            description: `The generated text exceeds the platform limit of ${charLimit} characters and has been truncated.`,
          });
        }
        repeatedText = result.slice(0, charLimit);
      }
    } else {
      if (textWithSeparator.length > 0 && inputText.length > 0) {
        let tempText = "";
        while ((tempText + textWithSeparator).length <= charLimit) {
          tempText += textWithSeparator;
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
    <Card id="text-repeater-tool" className="w-full shadow-sm hover:shadow-md transition-all duration-300 border-border/60 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Text Repeater Tool</CardTitle>
        <CardDescription>
          Repeat any text, emoji, or phrase to fill character limits or create emphasis.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid w-full items-center gap-6">

          {/* Platform Selector */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="tr-platform">Platform</Label>
            <div className="flex flex-col md:flex-row gap-4">
              <Select
                value={platformId}
                onValueChange={(value) => setPlatformId(value as Platform["id"])}
              >
                <SelectTrigger id="tr-platform" className="flex-1">
                  <SelectValue placeholder="Select a platform">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platformId={platformId} className="h-5 w-5" />
                      <span>{selectedPlatform.name}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {REPEATER_PLATFORMS.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      <div className="flex items-center gap-2">
                        <PlatformIcon platformId={platform.id} className="h-5 w-5" />
                        <span>{platform.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {platformId === "custom" && (
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

          {/* Input Text */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="tr-input">Your Text</Label>
            <Textarea
              id="tr-input"
              placeholder="Enter text to repeat… e.g. 'lol' or '❤️'"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={3}
            />
          </div>

          {/* Formatting Options */}
          <div className="flex flex-col space-y-4">
            <Label>Formatting Options</Label>
            <div className="flex items-center flex-wrap gap-4 md:gap-6 gap-y-2">
              <RadioGroup
                value={repetitionType}
                onValueChange={(value) => setRepetitionType(value as RepetitionType)}
                className="flex items-center"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="row" id="tr-row" />
                  <Label htmlFor="tr-row">Row</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="column" id="tr-col" />
                  <Label htmlFor="tr-col">Column</Label>
                </div>
              </RadioGroup>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tr-add-space"
                  checked={addSpace}
                  onCheckedChange={(checked) => setAddSpace(!!checked)}
                  disabled={repetitionType !== "row"}
                />
                <Label
                  htmlFor="tr-add-space"
                  className={repetitionType !== "row" ? "text-muted-foreground" : ""}
                >
                  Add space
                </Label>
              </div>
            </div>
          </div>

          {/* Repetition Count */}
          <div className="flex flex-col space-y-2">
            <Label>Repetition Count</Label>
            <div className="flex items-center gap-3 p-4 border rounded-md">
              <Checkbox
                id="tr-use-count"
                checked={useRepetitionCount}
                onCheckedChange={(checked) => setUseRepetitionCount(!!checked)}
              />
              <Label htmlFor="tr-use-count" className="flex-1 text-sm font-normal cursor-pointer">
                Specify how many times to repeat
              </Label>
              <Input
                id="tr-count"
                type="number"
                value={repetitionCount}
                onChange={(e) => setRepetitionCount(Number(e.target.value))}
                className="w-24"
                disabled={!useRepetitionCount}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              If unchecked, repeats as many times as possible within the platform&apos;s character limit.
            </p>
          </div>

          <Button id="tr-generate" onClick={handleGenerate} className="w-full sm:w-auto">
            Generate
          </Button>

          {/* Output */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="tr-output">Generated Text</Label>
              <div className={`text-sm ${isOverLimit ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                {charCount} / {charLimit}
              </div>
            </div>
            <div className="relative">
              <Textarea
                id="tr-output"
                readOnly
                value={generatedText}
                placeholder="Generated text will appear here…"
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
  );
}
