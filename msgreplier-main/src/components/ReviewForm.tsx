"use client";

import React, { useState } from "react";
import { Star, MessageSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";

export default function ReviewForm() {
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoverRating(value);
  };

  const handleStarMouseLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating of at least 1 star.",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Review comment required",
        description: "Please share some feedback about your experience.",
        variant: "destructive",
      });
      return;
    }

    if (comment.length > 1000) {
      toast({
        title: "Review too long",
        description: "Your review must be 1,000 characters or less.",
        variant: "destructive",
      });
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("reviews").insert([
        {
          email: email.trim() || null,
          rating,
          comment: comment.trim(),
        },
      ]);

      if (error) {
        throw error;
      }

      // Trigger Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#110f0f", "#eedfc6", "#2b95ff", "#f5eedf"],
      });

      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your review has been submitted successfully.",
      });

      // Reset form after a brief period
      setTimeout(() => {
        setRating(0);
        setComment("");
        setEmail("");
        setSubmitted(false);
      }, 5000);

    } catch (err: any) {
      console.error("Error submitting review:", {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        errorObject: err
      });
      toast({
        title: "Submission failed",
        description: `${err?.message || "An error occurred."} ${
          err?.hint ? `Hint: ${err.hint}` : ""
        } (Code: ${err?.code || "unknown"})`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 px-4 bg-[#eedfc6]/10 border-b border-[#d4c3ab]">
      <div className="container mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <div className="bg-[#eedfc6] border border-[#d4c3ab] px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wider text-[#110f0f] w-fit">
            Share Your Voice
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#110f0f]">
            Rate MsgReplier
          </h2>
          <p className="text-base text-[#5d6c7b] max-w-md">
            Let us know what you think of our private Love-Space or customizable Wishes Website.
          </p>
        </div>

        <div className="bg-white border border-[#d4c3ab] rounded-[32px] p-6 md:p-10 shadow-sm relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="review-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Star Rating Section */}
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-sm font-bold text-[#110f0f] font-heading uppercase tracking-wide">
                    Your Rating
                  </span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isHighlighted =
                        starValue <= (hoverRating || rating);
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => handleStarClick(starValue)}
                          onMouseEnter={() => handleStarHover(starValue)}
                          onMouseLeave={handleStarMouseLeave}
                          className="focus:outline-none transition-transform active:scale-95 duration-100 p-1"
                          aria-label={`Rate ${starValue} stars`}
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              isHighlighted
                                ? "fill-[#ffb800] text-[#ffb800]"
                                : "text-[#d4c3ab]"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2 text-left">
                  <label
                    htmlFor="email"
                    className="text-sm font-bold text-[#110f0f] font-heading"
                  >
                    Email <span className="text-xs text-[#948678] font-normal">(Optional)</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-[#f5eedf]/30 border-[#d4c3ab] rounded-xl focus-visible:ring-1 focus-visible:ring-[#110f0f] placeholder:text-[#948678]/80 text-[#110f0f]"
                  />
                </div>

                {/* Review Textarea */}
                <div className="space-y-2 text-left relative">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="comment"
                      className="text-sm font-bold text-[#110f0f] font-heading"
                    >
                      Your Review
                    </label>
                    <span
                      className={`text-xs font-medium ${
                        comment.length > 1000 ? "text-red-500 font-bold" : "text-[#948678]"
                      }`}
                    >
                      {comment.length} / 1000
                    </span>
                  </div>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your wishes website and love-space feature experience..."
                    maxLength={1000}
                    rows={4}
                    className="w-full bg-[#f5eedf]/30 border-[#d4c3ab] rounded-xl focus-visible:ring-1 focus-visible:ring-[#110f0f] placeholder:text-[#948678]/80 text-[#110f0f] resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#110f0f] hover:bg-[#2b95ff] text-white hover:text-white rounded-full py-6 text-base font-bold font-heading uppercase tracking-wider transition-all duration-300 transform active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#eedfc6] border border-[#d4c3ab] flex items-center justify-center text-[#110f0f]">
                  <Sparkles className="h-8 w-8 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-[#110f0f] font-heading">
                  Thank You!
                </h3>
                <p className="text-base text-[#5d6c7b] max-w-md">
                  Your feedback helps us make MsgReplier even better. We appreciate you taking the time to review us! ❤️
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
