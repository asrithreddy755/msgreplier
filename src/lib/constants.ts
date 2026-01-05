export type Platform = {
  id: 'instagram' | 'whatsapp' | 'telegram' | 'x' | 'facebook' | 'youtube' | 'custom' | 'ai-reply';
  name: string;
  charLimit: number;
  slug: string;
};

export const PLATFORMS: Platform[] = [
  { id: 'ai-reply', name: 'AI Reply Generator', charLimit: 0, slug: 'ai-reply-generator' },
  { id: 'instagram', name: 'Instagram', charLimit: 2200, slug: 'instagram-text-repeater' },
  { id: 'x', name: 'X (Twitter)', charLimit: 280, slug: 'x-text-repeater' },
  { id: 'facebook', name: 'Facebook', charLimit: 8000, slug: 'facebook-text-repeater' },
  { id: 'whatsapp', name: 'WhatsApp', charLimit: 4096, slug: 'whatsapp-text-repeater' },
  { id: 'telegram', name: 'Telegram', charLimit: 4096, slug: 'telegram-text-repeater' },
  { id: 'youtube', name: 'YouTube Live', charLimit: 200, slug: 'youtube-text-repeater' },
  { id: 'custom', name: 'Custom', charLimit: 280, slug: 'custom-text-repeater' },
];
