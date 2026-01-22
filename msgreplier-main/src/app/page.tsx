import { redirect } from "next/navigation";
import { PLATFORMS } from "@/lib/constants";

export default function HomePage() {
  const defaultPlatform = PLATFORMS.find(p => p.id === 'shortcutpedia');
  if (defaultPlatform) {
    redirect(`/${defaultPlatform.slug}`);
  } else {
    redirect('/custom-text-repeater');
  }
}
