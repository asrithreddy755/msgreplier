import { redirect } from "next/navigation";
import { PLATFORMS } from "@/lib/constants";

export const metadata = {
  title: "MsgReplier – Shortcut Meanings, Slang Dictionary & Text Repeater",
  description:
    "MsgReplier helps you understand chat shortcuts and slang meanings, and repeat text easily to match platform character limits. Fast, simple, and privacy-first.",
};

export default function HomePage() {
  const defaultPlatform = PLATFORMS.find(p => p.id === 'shortcutpedia');
  if (defaultPlatform) {
    redirect(`/${defaultPlatform.slug}`);
  } else {
    redirect('/custom-text-repeater');
  }
}
