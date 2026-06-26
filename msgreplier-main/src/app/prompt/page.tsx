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
    canonical: "https://msgreplier.com/prompt",
  },
};

export default function PromptPage() {
  return (
    <>
      <PromptClient />

      {/* SSR descriptive content for SEO — visible to Googlebot */}
      <div
        className="max-w-3xl mx-auto px-4 py-12 space-y-12"
        style={{ fontFamily: '"Work Sans", sans-serif' }}
      >
        {/* How to Use */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            How to Use Msg Prompt
          </h2>
          <ol className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
            <li className="flex gap-3">
              <span className="font-bold text-slate-900 dark:text-white shrink-0">1.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Browse the prompt library.</strong>{" "}
                Scroll through the curated card-style feed. Each prompt card includes a preview image,
                a style tag (e.g. Romantic, Cinematic, Golden Hour), and the full prompt text.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-900 dark:text-white shrink-0">2.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Copy the prompt.</strong>{" "}
                Tap the &quot;Copy&quot; button on any card to copy the full prompt text to your clipboard
                instantly — no sign-up or login needed.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-900 dark:text-white shrink-0">3.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Paste into any AI image tool.</strong>{" "}
                Open Midjourney, DALL·E, Adobe Firefly, Stable Diffusion, or any AI image generator,
                paste the prompt, and generate your image.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-900 dark:text-white shrink-0">4.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Customise as needed.</strong>{" "}
                Personalise the prompt by adding your names, a specific location, or a favourite colour
                palette before generating. This makes the result feel uniquely yours.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-900 dark:text-white shrink-0">5.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Load more prompts.</strong>{" "}
                Use the &quot;Load More&quot; button at the bottom of the page to browse the full
                library of couple and relationship-themed AI prompts.
              </span>
            </li>
          </ol>
        </section>

        {/* Why Use */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Why Use Msg Prompt?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Writing the perfect AI image prompt from scratch is harder than it looks. Generic prompts
            produce generic results — flat lighting, awkward poses, and backgrounds that feel lifeless.
            Msg Prompt solves this by giving you a hand-curated library of prompts that have been
            tested and refined specifically for couple photography and romantic scenarios. Each prompt
            is crafted to unlock the best capabilities of modern AI image generators.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Whether you want a cinematic golden-hour portrait, a cosy indoor scene, or a playful
            candid moment, our prompts give you a professional-quality starting point in seconds.
            Couples use Msg Prompt to create personalised digital art for anniversaries, to brainstorm
            real photoshoot concepts, or simply to generate beautiful images that capture how they
            feel about each other. It is completely free, requires no login, and works with any AI
            image tool available today.
          </p>
        </section>
      </div>
    </>
  );
}
