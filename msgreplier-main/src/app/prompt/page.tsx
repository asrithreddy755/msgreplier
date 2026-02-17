import type { Metadata } from "next";
import PromptClient from "./PromptClient";

const getSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const base = envUrl?.trim() || "https://msgreplier.com";
  return base.startsWith("https://") ? base : `https://${base.replace(/^http:\/\//, "")}`;
};

export const metadata: Metadata = {
  title: "Msg Prompt – Ready-to-use AI prompts for chats | MsgReplier",
  description:
    "Browse a library of copyable prompts for ChatGPT, Gemini, and other AI tools. Copy, paste, and customize prompts to craft better replies for dating, work, and everyday chats.",
  alternates: {
    canonical: `${getSiteUrl()}/prompt`,
  },
};

export default function PromptPage() {
  return <PromptClient />;
}
