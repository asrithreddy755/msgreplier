import type { Metadata } from "next";
import PromptClient from "./PromptClient";

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
        {/* What is Msg Prompt */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            What is Msg Prompt?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Msg Prompt is a curated library of AI image prompts designed for couples and romantic photography. Instead of spending hours crafting the perfect prompt from scratch, you can browse our hand-tested collection, copy a prompt in one tap, and paste it directly into any AI image generator — Midjourney, DALL·E, Adobe Firefly, Stable Diffusion, Ideogram, or Leonardo AI. Each prompt has been refined to produce high-quality results with rich lighting descriptions, mood settings, and cinematic detail that generic prompts consistently miss.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Couples use Msg Prompt to generate unique digital artwork for anniversaries, to plan real-world photoshoots by visualising different styles first, to create personalised Valentine&apos;s Day cards, or to brainstorm content ideas for social media. It is completely free, works without any login, and is compatible with every major AI image platform available today.
          </p>
        </section>

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
                Scroll through the curated card-style feed. Each prompt card includes a style tag (e.g. Romantic, Cinematic, Golden Hour, Candid) and the full prompt text.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-900 dark:text-white shrink-0">2.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Copy the prompt.</strong>{" "}
                Tap the &quot;Copy&quot; button on any card to copy the full prompt text to your clipboard instantly — no sign-up or login needed.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-900 dark:text-white shrink-0">3.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Paste into any AI image tool.</strong>{" "}
                Open Midjourney, DALL·E, Adobe Firefly, Stable Diffusion, or any AI image generator, paste the prompt, and generate your image.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-900 dark:text-white shrink-0">4.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Customise as needed.</strong>{" "}
                Personalise the prompt by adding your names, a specific location, skin tones, or a favourite colour palette before generating. This makes the result feel uniquely yours.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-900 dark:text-white shrink-0">5.</span>
              <span>
                <strong className="text-slate-900 dark:text-white">Load more prompts.</strong>{" "}
                Use the &quot;Load More&quot; button at the bottom of the page to browse the full library of couple and relationship-themed AI prompts.
              </span>
            </li>
          </ol>
        </section>

        {/* Example Prompts */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Example Prompts from the Library
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
            Here are three sample prompts to show the style and detail level you can expect. All prompts in the library follow this structure — rich scene-setting, lighting direction, mood, and camera style:
          </p>
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
              <p className="text-xs font-semibold text-pink-500 uppercase tracking-wider mb-2">Golden Hour Romance</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &quot;A couple holding hands and walking barefoot on a wide sandy beach at golden hour. The sun is low on the horizon, casting long warm shadows. Shot from behind at a low angle with a 85mm lens, shallow depth of field, cinematic color grading, warm amber tones, serene and romantic mood.&quot;
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Cosy Indoor Candid</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &quot;A young couple curled up together on a cosy sofa under a warm knit blanket, sharing a mug of hot coffee. Window light from the side, bokeh background, a stack of books and a candle visible. Natural, unposed, candid lifestyle photography, 50mm lens, film grain.&quot;
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
              <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-2">Night City Aesthetic</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &quot;A couple standing together on a rain-wet city street at night, surrounded by neon reflections. One person holds a clear umbrella. Long exposure, neon lighting in pink and blue, moody cinematic aesthetic, wide-angle street photography, urban romance.&quot;
              </p>
            </div>
          </div>
        </section>

        {/* Why Use */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Why Use Msg Prompt?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">✍️ Save Time</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Writing detailed AI prompts from scratch takes time. Msg Prompt gives you a tested, professional starting point in seconds — skip the trial-and-error.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">🎨 Better Results</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Our prompts include lighting, lens, mood, and style directives that dramatically improve output quality compared to simple one-line descriptions.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">🔒 No Login Needed</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Browse the entire library and copy any prompt without creating an account. Completely free, permanently free.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Which AI tools do these prompts work with?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                All prompts work with any major AI image generator — Midjourney, DALL·E 3 (via ChatGPT), Adobe Firefly, Stable Diffusion (all variants), Ideogram, Leonardo AI, and Bing Image Creator. Simply copy and paste.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Can I edit the prompts before using them?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Absolutely — in fact, we encourage it. After copying a prompt, you can paste it into any text editor and adjust details like location, clothing, hair colour, or lighting mood before submitting to the AI. This personalises the output to your actual relationship.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Are new prompts added regularly?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Yes. The MsgReplier team tests and adds new prompts regularly based on trending aesthetics, seasonal occasions (Valentine&apos;s Day, anniversaries, winter), and community suggestions. Check back monthly for new additions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Can I use the generated images commercially?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                The commercial usage rights depend on the AI platform you use to generate the image — not on Msg Prompt itself. MsgReplier does not claim any rights over images you generate using our prompts. Please check the terms of your chosen AI tool for commercial licensing details.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
