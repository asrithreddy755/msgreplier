import { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    // We can't use absolute URL during build, so we'll fallback to a generic title
    return {
      title: "A Special Message 💌",
      description: "Someone has sent you a magical digital greeting. Open it to reveal the surprise!",
    };
  } catch (e) {
    return {
      title: "Digital Greeting 💌",
      description: "A special surprise is waiting for you.",
    };
  }
}

export default function GreetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
