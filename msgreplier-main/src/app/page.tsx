import { redirect } from "next/navigation";
import { PLATFORMS } from "@/lib/constants";

export const metadata = {
  title: "MsgReplier - Free Text Repeater, Slang Dictionary & AI Reply Generator",
  description:
    "The ultimate messaging toolkit. distinct features include a Text Repeater for WhatsApp/Instagram, a Gen Z Slang Dictionary (Shortcutpedia), and an AI Reply Generator. No login required.",
};

export default function HomePage() {
  const defaultPlatform = PLATFORMS.find(p => p.id === 'shortcutpedia');
  if (defaultPlatform) {
    redirect(`/${defaultPlatform.slug}`);
  } else {
    redirect('/custom-text-repeater');
  }
}
