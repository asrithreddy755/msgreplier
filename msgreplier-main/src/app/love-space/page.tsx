/**
 * love-space/page.tsx — Server Component wrapper
 *
 * The interactive Love-Space builder lives in LoveSpaceClient.tsx ("use client").
 * This server component wraps it and appends SSR-rendered descriptive sections
 * so Googlebot can fully understand and index the page's purpose and value.
 */
import LoveSpaceClient from "./LoveSpaceClient";

export default function LoveSpacePage() {
  return (
    <>
      {/* Interactive Love-Space builder — all client-side */}
      <LoveSpaceClient />

      {/* ── SSR content block — visible to Googlebot ────────────────────── */}
      <div
        id="about-love-space"
        className="bg-[#f5eedf]"
        style={{ fontFamily: '"Work Sans", sans-serif' }}
      >
        <div className="container mx-auto max-w-4xl px-4 py-16 space-y-14">

          {/* What Is Love-Space */}
          <section>
            <h2
              className="text-3xl font-extrabold tracking-tight text-[#110f0f] mb-4"
              style={{ fontFamily: "Unbounded, sans-serif" }}
            >
              What Is Love-Space?
            </h2>
            <p className="text-[#5d6c7b] leading-relaxed mb-4">
              <strong className="text-[#110f0f]">Love-Space</strong> is a 100% private, no-login digital
              room designed exclusively for couples. Instead of texting through busy apps with endless
              notifications, Love-Space gives you and your partner a quiet, personal corner of the
              internet — just for the two of you. No accounts, no ads inside the room, no data
              permanently stored.
            </p>
            <p className="text-[#5d6c7b] leading-relaxed">
              Each Love-Space room is accessed via a unique link. Only you and your partner know the
              link. The room auto-deletes after 24 hours, ensuring complete privacy. You can chat in
              real-time, see your partner&apos;s live status, and play interactive couple games including
              Ludo and XOX — all without downloading any app or registering an account.
            </p>
          </section>

          {/* How to Use */}
          <section>
            <h2
              className="text-3xl font-extrabold tracking-tight text-[#110f0f] mb-6"
              style={{ fontFamily: "Unbounded, sans-serif" }}
            >
              How to Create a Love-Space Room
            </h2>
            <ol className="space-y-5 text-[#5d6c7b] leading-relaxed">
              {[
                {
                  title: "Enter your nickname",
                  desc: "Choose a nickname — this is how your partner will see you. No real name or email required.",
                },
                {
                  title: "Create your room",
                  desc: "Click Create Room. You will be given a unique room link instantly. Copy the link.",
                },
                {
                  title: "Share the link with your partner",
                  desc: "Send the link via WhatsApp, iMessage, Instagram DM, or any messaging app. Only people with the exact link can enter.",
                },
                {
                  title: "Your partner joins",
                  desc: "Your partner opens the link, enters their nickname, and instantly appears in the room. You will both see each other's live status.",
                },
                {
                  title: "Chat, play games, and connect",
                  desc: "Send messages in real-time, challenge your partner to Ludo or XOX, and enjoy your private digital space together.",
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

          {/* Features */}
          <section>
            <h2
              className="text-3xl font-extrabold tracking-tight text-[#110f0f] mb-6"
              style={{ fontFamily: "Unbounded, sans-serif" }}
            >
              Love-Space Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  emoji: "💬",
                  title: "Real-time private chat",
                  desc: "Messages sync instantly between you and your partner. The chat is private, distraction-free, and designed for meaningful conversations.",
                },
                {
                  emoji: "🎲",
                  title: "Couple games (Ludo & XOX)",
                  desc: "Play classic board games together directly in your Love-Space room — no separate app needed. Perfect for a lazy evening together even when apart.",
                },
                {
                  emoji: "🟢",
                  title: "Live partner status",
                  desc: "See when your partner is active, typing, or away. No more wondering if your message was read.",
                },
                {
                  emoji: "🔒",
                  title: "Zero-login privacy",
                  desc: "No email, no password, no phone number. Just a nickname and a unique room link — everything is anonymous by design.",
                },
                {
                  emoji: "⏱️",
                  title: "Auto-delete after 24 hours",
                  desc: "All room data — messages, game history, everything — is permanently deleted after 24 hours. Your private conversations stay private.",
                },
                {
                  emoji: "📱",
                  title: "Works on any device",
                  desc: "Love-Space works on smartphones, tablets, and desktops. No app download required — it runs entirely in your browser.",
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
                  q: "Is Love-Space really free?",
                  a: "Yes. Creating and using a Love-Space room is completely free. There are no premium features, no subscriptions, and no paywalls.",
                },
                {
                  q: "Can anyone else join my Love-Space room?",
                  a: "Only people who have your exact unique room link can enter. As long as you keep the link private, your room is completely private.",
                },
                {
                  q: "What happens to my messages after 24 hours?",
                  a: "All messages, game data, and room information are permanently and automatically deleted after 24 hours. Nothing is stored long-term on our servers.",
                },
                {
                  q: "Does Love-Space work for long-distance relationships?",
                  a: "Absolutely. Love-Space was built with long-distance couples in mind. As long as both partners have an internet connection, they can use Love-Space from anywhere in the world.",
                },
                {
                  q: "How many people can be in a Love-Space room?",
                  a: "Love-Space is designed as a private room for exactly two people — you and your partner. It is not a group chat app.",
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
