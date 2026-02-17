import type { Metadata } from "next";
import PromptClient from "./PromptClient";

const getSiteUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const base = envUrl?.trim() || "https://msgreplier.com";
  return base.startsWith("https://") ? base : `https://${base.replace(/^http:\/\//, "")}`;
};

export const metadata: Metadata = {
  title: "Msg Prompt – Creative prompts for couple photos | MsgReplier",
  description:
    "Scroll a curated library of copyable couple prompts. Copy, paste, and use them in any AI image tool to generate better couple pictures and photoshoot ideas.",
  alternates: {
    canonical: `${getSiteUrl()}/prompt`,
  },
};

export default function PromptPage() {
  return <PromptClient />;
}
