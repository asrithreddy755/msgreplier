/**
 * digital-greeting/page.tsx — Server Component wrapper
 *
 * The interactive builder itself lives in DigitalGreetingClient.tsx ("use client").
 * This server component wraps it and appends SSR-rendered descriptive sections
 * so Google can crawl the tool's purpose and features.
 */
import DigitalGreetingClient from "./DigitalGreetingClient";

export default function DigitalGreetingPage() {
  return (
    <>
      {/* Interactive builder — all client-side JS */}
      <DigitalGreetingClient />

      {/* ── SSR content block — visible to Googlebot ────────────────────── */}
      <div
        id="about-wishes-website"
        className="bg-[#f5eedf]"
        style={{ fontFamily: '"Work Sans", sans-serif' }}
      >
        <div className="container mx-auto max-w-4xl px-4 py-16 space-y-14">

          {/* What Is a Wishes Website */}
          <section>
            <h2
              className="text-3xl font-extrabold tracking-tight text-[#110f0f] mb-4"
              style={{ fontFamily: "Unbounded, sans-serif" }}
            >
              What Is a Wishes Website?
            </h2>
            <p className="text-[#5d6c7b] leading-relaxed mb-4">
              A <strong className="text-[#110f0f]">Wishes Website</strong> is a personalised, animated
              digital greeting page you create for someone you love. Unlike a flat text message or a
              generic e-card, a Wishes Website is an immersive mini-webpage — complete with 3D
              animations, background music, confetti celebrations, and your heartfelt message displayed
              in a way they will remember. You share it by sending a single unique link.
            </p>
            <p className="text-[#5d6c7b] leading-relaxed">
              MsgReplier&apos;s Wishes Website builder lets you create one in under two minutes — no
              account, no coding, and completely free. It is perfect for birthdays, anniversaries,
              Valentine&apos;s Day, graduations, and any occasion that deserves more than a text.
            </p>
          </section>

          {/* How to Create a Wishes Website */}
          <section>
            <h2
              className="text-3xl font-extrabold tracking-tight text-[#110f0f] mb-6"
              style={{ fontFamily: "Unbounded, sans-serif" }}
            >
              How to Create a Wishes Website (Step-by-Step)
            </h2>
            <ol className="space-y-5 text-[#5d6c7b] leading-relaxed">
              {[
                {
                  title: "Choose an occasion",
                  desc: "Select Birthday, Anniversary, or another special occasion from the drop-down menu. This determines the theme palette and animation style.",
                },
                {
                  title: "Enter names",
                  desc: 'Type the recipient\'s name — this is the person who will receive the surprise. Add your own name so they know who the wishes are from.',
                },
                {
                  title: "Write your message",
                  desc: "Add a heartfelt personal message. You can write anything you like — from a single line to a full paragraph. Use the Magic Dice button if you need inspiration.",
                },
                {
                  title: "Pick a template and music",
                  desc: "Choose from beautiful animated templates including Classic, Aurora, Cosmic, and more. Optionally enable background music — Romantic Piano, Chill Lofi, or Happy Vibes.",
                },
                {
                  title: "Generate and share your link",
                  desc: "Click Create Wishes Website. Your unique link is generated instantly. Copy and send it via WhatsApp, iMessage, Instagram DM, or email.",
                },
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span
                    className="shrink-0 w-8 h-8 rounded-full bg-[#110f0f] text-white flex items-center justify-center text-sm font-bold"
                    style={{ fontFamily: "Unbounded, sans-serif" }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <strong className="text-[#110f0f]">{step.title}.</strong>{" "}
                    {step.desc}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Why Use */}
          <section>
            <h2
              className="text-3xl font-extrabold tracking-tight text-[#110f0f] mb-6"
              style={{ fontFamily: "Unbounded, sans-serif" }}
            >
              Why Create a Wishes Website?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  emoji: "🎂",
                  title: "More memorable than a text",
                  desc: "A personalised animated webpage stands out. Your recipient can open it, replay the animations, and share it with friends — none of which they can do with a WhatsApp message.",
                },
                {
                  emoji: "🎵",
                  title: "Music and animations included",
                  desc: "Choose from multiple musical themes and stunning 3D animations. The cinematic reveal experience makes every occasion feel like a real event.",
                },
                {
                  emoji: "🔒",
                  title: "Private and shareable",
                  desc: "Each wishes website has a unique URL. Only the person you share the link with can access it. No account required, and no data is permanently stored.",
                },
                {
                  emoji: "💸",
                  title: "Completely free",
                  desc: "Creating a Wishes Website on MsgReplier costs nothing. There are no subscriptions, paywalls, or in-app purchases. Every feature is available for free.",
                },
                {
                  emoji: "⚡",
                  title: "Ready in under 2 minutes",
                  desc: "The builder is designed for speed. Fill in three fields, pick a template, and your page is live. No design skills, no waiting, no technical knowledge required.",
                },
                {
                  emoji: "💌",
                  title: "Works for any occasion",
                  desc: "Birthday, anniversary, Valentine's Day, Mother's Day, graduation, or just because — the builder adapts to any occasion that deserves a special personal touch.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#d4c3ab] rounded-[20px] p-6 space-y-2"
                >
                  <div className="text-2xl">{item.emoji}</div>
                  <h3 className="font-bold text-[#110f0f]">{item.title}</h3>
                  <p className="text-sm text-[#5d6c7b] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2
              className="text-3xl font-extrabold tracking-tight text-[#110f0f] mb-6"
              style={{ fontFamily: "Unbounded, sans-serif" }}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-5 text-[#5d6c7b]">
              {[
                {
                  q: "Is the Wishes Website builder really free?",
                  a: "Yes, 100% free. There are no hidden costs, subscriptions, or premium tiers. Every template, music option, and animation is available at no charge.",
                },
                {
                  q: "Does the recipient need an account to view their wishes website?",
                  a: "No. The recipient simply opens the link you send them and the website loads instantly in their browser — no account, no app, no sign-up required on either end.",
                },
                {
                  q: "Can I send a Wishes Website internationally?",
                  a: "Absolutely. Because it is a web link, it works for any recipient anywhere in the world as long as they have an internet connection. It is perfect for long-distance relationships and family members overseas.",
                },
                {
                  q: "How long does my Wishes Website stay live?",
                  a: "Your wishes website link remains accessible as long as you have the link. There is no automatic expiry for Wishes Website pages.",
                },
                {
                  q: "Can I add a photo to my wishes website?",
                  a: "Some templates support a custom photo upload. Select a template that supports photos and upload your image during the creation process.",
                },
              ].map((faq, i) => (
                <details key={i} open className="group border-b border-[#d4c3ab] pb-4">
                  <summary className="font-bold text-[#110f0f] cursor-pointer list-none flex justify-between items-center">
                    {faq.q}
                    <span className="text-[#948678] text-lg leading-none ml-4">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
