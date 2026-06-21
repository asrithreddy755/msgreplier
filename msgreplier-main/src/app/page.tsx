import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, Heart, MessageSquare, Shield, Zap, Sparkles, Flame, Plus, ChevronRight } from "lucide-react";
import ReviewForm from "@/components/ReviewForm";

export const metadata = {
  title: "MsgReplier - Private Love Space, Wishes Website & AI Couple Tools",
  description:
    "The ultimate digital toolkit for couples. Create a private Love-Space chat room, build an interactive Wishes Website for birthdays and anniversaries, and use our free AI couple tools. No login required.",
  alternates: {
    canonical: "https://msgreplier.com",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MsgReplier",
    url: "https://msgreplier.com",
    description: "The ultimate digital toolkit for couples. Private Love-Space rooms, interactive Wishes Websites, FLAMES Calculator, and AI couple prompts. No login required.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://msgreplier.com/blog?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "MsgReplier",
      url: "https://msgreplier.com",
      logo: "https://msgreplier.com/icon.png",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "care.msgreplier@gmail.com",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div 
        className="min-h-screen bg-[#f5eedf] text-[#110f0f] antialiased" 
        style={{ fontFamily: '"Work Sans", sans-serif' }}
      >
        {/* Style block to apply Unbounded font to headings and handle details markers */}
        <style dangerouslySetInnerHTML={{ __html: `
          h1, h2, h3, h4, h5, h6, .font-heading {
            font-family: 'Unbounded', sans-serif !important;
          }
          summary::-webkit-details-marker {
            display: none;
          }
          summary {
            list-style: none;
          }
        `}} />

        {/* Hero Section */}
        <section className="pt-16 pb-20 px-3 md:px-4 md:pt-28 md:pb-32 border-b border-[#d4c3ab]">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Details Column */}
              <div className="flex flex-col space-y-6 md:space-y-8 text-left">
                {/* Hero Badge */}
                <div className="bg-[#eedfc6] border border-[#d4c3ab] px-4 py-1.5 rounded-full w-fit">
                  <p className="text-sm font-medium text-[#110f0f]">The Ultimate Place for Couples</p>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-[#110f0f]">
                  Your private space to connect
                </h1>
                
                <p className="text-lg md:text-xl text-[#5d6c7b] leading-relaxed max-w-xl">
                  From connecting with your partner in <strong className="text-[#110f0f]">Love-Space</strong> to creating a magical <strong className="text-[#110f0f]">Wishes Website</strong>, we have the tools you need.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link 
                    href="/love-space" 
                    target="_blank"
                    className="inline-flex items-center justify-center bg-[#110f0f] text-white hover:bg-[#2b95ff] font-medium text-lg rounded-full px-8 py-4 transition-all duration-300 transform hover:scale-102 shadow-sm text-center"
                    style={{ fontFamily: 'Unbounded, sans-serif' }}
                  >
                    Love Space
                  </Link>
                  <Link 
                    href="/digital-greeting" 
                    className="inline-flex items-center justify-center border border-[#110f0f] text-[#110f0f] hover:bg-[#110f0f] hover:text-white font-medium text-lg rounded-full px-8 py-4 transition-all duration-300 text-center"
                    style={{ fontFamily: 'Unbounded, sans-serif' }}
                  >
                    Wishes Website
                  </Link>
                </div>
              </div>

              {/* Right Image Column */}
              <div className="hidden lg:flex justify-center lg:justify-end">
                <div className="relative border border-[#d4c3ab] rounded-[32px] p-4 bg-white/40 shadow-sm max-w-md md:max-w-xl w-full">
                  <div className="overflow-hidden rounded-[24px] border border-[#d4c3ab]">
                    <Image 
                      src="/couple_hero.png" 
                      alt="Happy couple using digital greeting tools" 
                      width={600} 
                      height={500} 
                      className="object-cover w-full h-auto"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-3 md:px-4 border-b border-[#d4c3ab] bg-[#eedfc6]/30">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <div className="bg-[#eedfc6] border border-[#d4c3ab] px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wider text-[#110f0f]">
                Features
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#110f0f] max-w-2xl">
                Explore MsgReplier's Private Tools
              </h2>
              <p className="text-base md:text-lg text-[#5d6c7b] max-w-xl">
                Everything you need to master connection, surprises, and compatibility — all free, all instant.
              </p>
            </div>

            {/* Features 4-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1: Love Space */}
              <div className="group bg-white border border-[#d4c3ab] rounded-[24px] p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#f5eedf] border border-[#d4c3ab] flex items-center justify-center mb-6 text-[#110f0f] group-hover:bg-[#110f0f] group-hover:text-white transition-colors">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-[#110f0f]">Love Space</h3>
                  <p className="text-sm text-[#5d6c7b] leading-relaxed">
                    Create a 100% private, no-login space to chat and play games like Ludo and XOX with your partner.
                  </p>
                </div>
                <div className="pt-6">
                  <Link 
                    href="/love-space" 
                    target="_blank"
                    className="inline-flex items-center text-sm font-bold text-[#110f0f] hover:underline group/link"
                  >
                    Enter Love Space 
                    <ChevronRight className="ml-1 h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Feature 2: Wishes Website */}
              <div className="group bg-white border border-[#d4c3ab] rounded-[24px] p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#f5eedf] border border-[#d4c3ab] flex items-center justify-center mb-6 text-[#110f0f] group-hover:bg-[#110f0f] group-hover:text-white transition-colors">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-[#110f0f]">Wishes Website</h3>
                  <p className="text-sm text-[#5d6c7b] leading-relaxed">
                    Create a beautiful, interactive greeting website for birthdays, anniversaries, or special surprises in seconds.
                  </p>
                </div>
                <div className="pt-6">
                  <Link 
                    href="/digital-greeting" 
                    className="inline-flex items-center text-sm font-bold text-[#110f0f] hover:underline group/link"
                  >
                    Build Website 
                    <ChevronRight className="ml-1 h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Feature 3: AI Prompts */}
              <div className="group bg-white border border-[#d4c3ab] rounded-[24px] p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#f5eedf] border border-[#d4c3ab] flex items-center justify-center mb-6 text-[#110f0f] group-hover:bg-[#110f0f] group-hover:text-white transition-colors">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-[#110f0f]">AI Couple Prompts</h3>
                  <p className="text-sm text-[#5d6c7b] leading-relaxed">
                    Generate beautiful couple pictures or photoshoot ideas using our curated AI prompts.
                  </p>
                </div>
                <div className="pt-6">
                  <Link 
                    href="/prompt" 
                    className="inline-flex items-center text-sm font-bold text-[#110f0f] hover:underline group/link"
                  >
                    Get Prompts 
                    <ChevronRight className="ml-1 h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Feature 4: FLAMES Calculator */}
              <div className="group bg-white border border-[#d4c3ab] rounded-[24px] p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#f5eedf] border border-[#d4c3ab] flex items-center justify-center mb-6 text-[#110f0f] group-hover:bg-[#110f0f] group-hover:text-white transition-colors">
                    <Flame className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-[#110f0f]">FLAMES Test</h3>
                  <p className="text-sm text-[#5d6c7b] leading-relaxed">
                    Check your relationship destiny with the childhood destiny love compatibility test.
                  </p>
                </div>
                <div className="pt-6">
                  <Link 
                    href="/flames" 
                    className="inline-flex items-center text-sm font-bold text-[#110f0f] hover:underline group/link"
                  >
                    Check Love 
                    <ChevronRight className="ml-1 h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="works" className="py-20 px-3 md:px-4 border-b border-[#d4c3ab]">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16 items-start">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-[#eedfc6] border border-[#d4c3ab] px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wider text-[#110f0f] w-fit">
                  How it works
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#110f0f]">
                  Behind the process
                </h2>
                <p className="text-[#5d6c7b] leading-relaxed">
                  Learn how to use MsgReplier efficiently and get connected in no time.
                </p>
              </div>

              {/* Step cards list */}
              <div className="lg:col-span-2 space-y-8">
                {/* Step 1 */}
                <div className="border border-[#d4c3ab] bg-white/50 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="space-y-4 max-w-md text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-[#110f0f]">1. Choose Your Tool</h3>
                    <p className="text-[#5d6c7b] leading-relaxed text-sm md:text-base">
                      Pick from Love-Space, Wishes Website, FLAMES Calculator, or AI Prompts. Each tool is built to bring you closer and is completely free to use.
                    </p>
                    <Link href="/about" className="inline-flex items-center justify-center border border-[#110f0f] hover:bg-[#110f0f] hover:text-white font-medium text-sm rounded-full px-5 py-2 transition-all duration-300">
                      Learn More
                    </Link>
                  </div>
                  <div className="w-24 h-24 rounded-3xl bg-[#eedfc6]/40 border border-[#d4c3ab] flex items-center justify-center text-4xl font-bold text-[#110f0f] shrink-0">
                    🛠️
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border border-[#d4c3ab] bg-white/50 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="space-y-4 max-w-md text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-[#110f0f]">2. Enter Your Details</h3>
                    <p className="text-[#5d6c7b] leading-relaxed text-sm md:text-base">
                      No accounts or registration needed. Simply enter a nickname for a chatroom or a name and message for your wishes website. Start using it in seconds.
                    </p>
                    <Link href="/about" className="inline-flex items-center justify-center border border-[#110f0f] hover:bg-[#110f0f] hover:text-white font-medium text-sm rounded-full px-5 py-2 transition-all duration-300">
                      Learn More
                    </Link>
                  </div>
                  <div className="w-24 h-24 rounded-3xl bg-[#eedfc6]/40 border border-[#d4c3ab] flex items-center justify-center text-4xl font-bold text-[#110f0f] shrink-0">
                    ✍️
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border border-[#d4c3ab] bg-white/50 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="space-y-4 max-w-md text-left">
                    <h3 className="text-xl md:text-2xl font-bold text-[#110f0f]">3. Enjoy Results</h3>
                    <p className="text-[#5d6c7b] leading-relaxed text-sm md:text-base">
                      Share the unique generated link with your partner or loved one. Connect in real-time, play games, or surprise them with 3D animations and music.
                    </p>
                    <Link href="/about" className="inline-flex items-center justify-center border border-[#110f0f] hover:bg-[#110f0f] hover:text-white font-medium text-sm rounded-full px-5 py-2 transition-all duration-300">
                      Learn More
                    </Link>
                  </div>
                  <div className="w-24 h-24 rounded-3xl bg-[#eedfc6]/40 border border-[#d4c3ab] flex items-center justify-center text-4xl font-bold text-[#110f0f] shrink-0">
                    🎉
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section (Dark Accordion) */}
        <section id="benefits" className="py-20 px-3 md:px-4 bg-[#110f0f] text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <div className="bg-[#110f0f] border border-[#d4c3ab]/30 px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wider text-[#eedfc6]">
                Benefits
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-2xl">
                Why you should use MsgReplier
              </h2>
              <p className="text-base md:text-lg text-[#948678] max-w-xl">
                Learn how MsgReplier can help you connect and surprise your loved ones in no time.
              </p>
            </div>

            {/* Accordion Layout - 2 Columns using native details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 items-start">
              {/* Column 1 */}
              <div className="space-y-2">
                {[
                  {
                    num: "1",
                    title: "Zero login required",
                    desc: "Use any feature without creating an account or sharing an email address. Start connecting instantly with your loved ones."
                  },
                  {
                    num: "2",
                    title: "Private by design",
                    desc: "Love-Space rooms auto-delete after 24 hours. We never read, log, or permanently store your private chats and messages."
                  },
                  {
                    num: "3",
                    title: "Responsive design",
                    desc: "Our web tools are fully responsive, ensuring they look flawless and work smoothly on desktop, tablet, or mobile screens."
                  },
                  {
                    num: "4",
                    title: "Variety of use",
                    desc: "Whether you need a private games night with Ludo, an anniversary website surprise, or an compatibility check, we have it all."
                  }
                ].map((item, idx) => (
                  <details key={idx} className="group border-b border-[#d4c3ab]/20 py-4 cursor-pointer" open={idx === 0}>
                    <summary className="flex items-center justify-between list-none font-bold text-lg md:text-xl text-[#eedfc6] focus:outline-none py-2 select-none">
                      <span className="flex items-center gap-3">
                        <span className="text-xs font-bold opacity-60 text-white font-heading">{item.num}.</span>
                        <span>{item.title}</span>
                      </span>
                      <span className="p-1.5 rounded-full border border-[#d4c3ab]/20 transition-transform group-open:rotate-45 text-white">
                        <Plus className="h-4 w-4" />
                      </span>
                    </summary>
                    <div className="mt-2 pl-7 pr-4 text-sm md:text-base text-[#d4c3ab] leading-relaxed transition-all duration-300">
                      {item.desc}
                    </div>
                  </details>
                ))}
              </div>

              {/* Column 2 */}
              <div className="space-y-2">
                {[
                  {
                    num: "5",
                    title: "Time efficiency",
                    desc: "Pre-designed greeting templates and instant chat rooms help you set up surprises in seconds rather than spending hours coding."
                  },
                  {
                    num: "6",
                    title: "Cost effectiveness",
                    desc: "Achieve a premium, interactive custom greetings experience without hiring developers. MsgReplier is completely free."
                  },
                  {
                    num: "7",
                    title: "Ease of use",
                    desc: "Super simple interface. Just fill in a few greeting fields or share a URL, and you're ready to share the surprise."
                  },
                  {
                    num: "8",
                    title: "SEO friendly",
                    desc: "Every greeting page is built with search engine optimization, semantic HTML, and fast loading performance."
                  }
                ].map((item, idx) => (
                  <details key={idx} className="group border-b border-[#d4c3ab]/20 py-4 cursor-pointer">
                    <summary className="flex items-center justify-between list-none font-bold text-lg md:text-xl text-[#eedfc6] focus:outline-none py-2 select-none">
                      <span className="flex items-center gap-3">
                        <span className="text-xs font-bold opacity-60 text-white font-heading">{item.num}.</span>
                        <span>{item.title}</span>
                      </span>
                      <span className="p-1.5 rounded-full border border-[#d4c3ab]/20 transition-transform group-open:rotate-45 text-white">
                        <Plus className="h-4 w-4" />
                      </span>
                    </summary>
                    <div className="mt-2 pl-7 pr-4 text-sm md:text-base text-[#d4c3ab] leading-relaxed transition-all duration-300">
                      {item.desc}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Section (Stats, Illustration & Team) */}
        <section id="about" className="py-20 px-3 md:px-4 border-b border-[#d4c3ab]">
          <div className="container mx-auto max-w-6xl">
            {/* Mission Header */}
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <div className="bg-[#eedfc6] border border-[#d4c3ab] px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wider text-[#110f0f] w-fit">
                About
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#110f0f] max-w-2xl">
                Our Mission, Vision, and the People Behind the Brand
              </h2>
              <p className="text-base md:text-lg text-[#5d6c7b] max-w-xl">
                We're passionate about delivering exceptional digital products that make a difference.
              </p>
            </div>

            {/* Diversity Icon / Illustration Box */}
            <div className="flex justify-center mb-16">
              <div className="bg-white/40 border border-[#d4c3ab] rounded-[32px] p-12 max-w-3xl w-full text-center flex flex-col items-center gap-6 shadow-sm">
                <span className="text-6xl md:text-7xl">👩‍💻👨‍💻👩‍❤️‍👨</span>
                <h3 className="text-xl font-bold text-[#110f0f]">Connecting Couples Globally</h3>
                <p className="text-[#5d6c7b] max-w-lg leading-relaxed text-sm md:text-base">
                  MsgReplier was designed to reduce the distance between couples through fun tools, private chats, and creative digital surprise greeting sites.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              <div className="bg-white border border-[#d4c3ab] rounded-[24px] p-8 text-center space-y-3">
                <div className="text-4xl md:text-5xl font-extrabold text-[#110f0f] font-heading">15K</div>
                <h3 className="font-bold text-base text-[#110f0f]">Number of happy customers</h3>
                <p className="text-sm text-[#5d6c7b]">We strive to create the best service and products to our customers.</p>
              </div>
              <div className="bg-white border border-[#d4c3ab] rounded-[24px] p-8 text-center space-y-3">
                <div className="text-4xl md:text-5xl font-extrabold text-[#110f0f] font-heading">4.8 / 5</div>
                <h3 className="font-bold text-base text-[#110f0f]">Average review score</h3>
                <p className="text-sm text-[#5d6c7b]">Happy customers is the corner stone of successful business and we take it seriously.</p>
              </div>
              <div className="bg-white border border-[#d4c3ab] rounded-[24px] p-8 text-center space-y-3">
                <div className="text-4xl md:text-5xl font-extrabold text-[#110f0f] font-heading">100K+</div>
                <h3 className="font-bold text-base text-[#110f0f]">Messages Exchanged</h3>
                <p className="text-sm text-[#5d6c7b]">Couples are connecting and sharing memories securely every single day.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-3 md:px-4 border-b border-[#d4c3ab] bg-[#eedfc6]/20">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <div className="bg-[#eedfc6] border border-[#d4c3ab] px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wider text-[#110f0f] w-fit">
                Testimonials
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#110f0f]">
                What our customers say
              </h2>
              <p className="text-base md:text-lg text-[#5d6c7b] max-w-xl">
                Customer testimonials provide valuable insights into the quality and reliability of our services.
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Creating a Wishes Website for my partner's birthday was incredibly easy and beautiful! She was thrilled by the custom music and interactive themes. It's the perfect way to make someone feel special.",
                  author: "Visank",
                  title: "Wishes Website Creator"
                },
                {
                  quote: "Love-Space has become our private little corner on the internet. We can chat and play games like Ludo without any signup hassle or privacy worries. It's amazing for long-distance relationships!",
                  author: "Vijay",
                  title: "Love-Space Active Member"
                },
                {
                  quote: "I built a custom wishes site for our anniversary and then invited my girlfriend to our private Love-Space. Having these interactive couple features in one free platform is a total game-changer.",
                  author: "Jagan",
                  title: "Anniversary Planner"
                }
              ].map((item, idx) => (
                <div key={idx} className="border border-[#d4c3ab] bg-white rounded-[28px] p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
                  <p className="text-[#110f0f] italic text-base leading-relaxed mb-6 font-medium">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="pt-4 border-t border-[#d4c3ab]/40 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f5eedf] border border-[#d4c3ab] flex items-center justify-center font-bold text-xs text-[#110f0f] font-heading">
                      {item.author.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#110f0f]">{item.author}</h4>
                      <p className="text-xs text-[#948678]">{item.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* User Review Form */}
        <ReviewForm />

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-3 md:px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <div className="bg-[#eedfc6] border border-[#d4c3ab] px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wider text-[#110f0f] w-fit">
                FAQ
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#110f0f]">
                Frequently Asked Questions
              </h2>
              <p className="text-base md:text-lg text-[#5d6c7b]">
                Quick answers to the questions we hear most often.
              </p>
            </div>

            {/* Accordion details list */}
            <div className="space-y-2 border-t border-[#d4c3ab] pt-4">
              {[
                {
                  q: "Is MsgReplier completely free?",
                  a: "Yes! Every tool on MsgReplier — including Love-Space, Wishes Website, FLAMES Calculator, and AI Prompts — is completely free. We are supported by non-intrusive advertisements that keep the platform free for everyone, with no subscriptions or paywalls."
                },
                {
                  q: "Do I need to create an account?",
                  a: "No account needed at all. You can use every feature on MsgReplier without registering, providing an email, or entering any personal information. Just open the tool and start using it immediately."
                },
                {
                  q: "How private is Love-Space?",
                  a: "Love-Space is designed with privacy as the top priority. Each room is accessed via a unique link that only you and your partner have. Rooms and all their data are automatically deleted after 24 hours. We do not read, monitor, or store your private conversations permanently."
                },
                {
                  q: "What is a Wishes Website?",
                  a: "A Wishes Website is a personalised, interactive digital greeting page you create for someone special. Add a recipient name, occasion (birthday, anniversary, etc.), a heartfelt message, music, and a theme — then share the unique link with your loved one. It is much more immersive than a regular greeting card or text message."
                },
                {
                  q: "Does MsgReplier sell my data?",
                  a: "Absolutely not. We do not sell, rent, or trade any personal data to third parties. We use Google Analytics for anonymous traffic insights and Google AdSense for advertising. Both are governed by Google's privacy policy."
                }
              ].map((faq, idx) => (
                <details key={idx} className="group border-b border-[#d4c3ab] py-5 cursor-pointer">
                  <summary className="flex items-center justify-between list-none font-bold text-base md:text-lg text-[#110f0f] focus:outline-none select-none">
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-full border border-[#d4c3ab] transition-transform group-open:rotate-45">
                      <Plus className="h-4 w-4" />
                    </span>
                  </summary>
                  <div className="mt-3 text-[#5d6c7b] text-sm md:text-base leading-relaxed pl-1">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
