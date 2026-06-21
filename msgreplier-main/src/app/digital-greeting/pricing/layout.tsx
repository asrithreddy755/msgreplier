import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — MsgReplier",
  description: "Simple, transparent pricing for MsgReplier. Start free and upgrade when you're ready. Starter from ₹29/mo, Pro from ₹49/mo, Builder from ₹99/mo.",
  alternates: {
    canonical: "https://msgreplier.com/digital-greeting/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
