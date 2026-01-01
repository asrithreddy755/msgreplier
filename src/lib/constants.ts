export type Platform = {
  id: 'instagram' | 'whatsapp' | 'telegram' | 'x' | 'facebook';
  name: string;
  charLimit: number;
};

export const PLATFORMS: Platform[] = [
  { id: 'instagram', name: 'Instagram', charLimit: 2200 },
  { id: 'x', name: 'X (Twitter)', charLimit: 280 },
  { id: 'facebook', name: 'Facebook', charLimit: 8000 },
  { id: 'whatsapp', name: 'WhatsApp', charLimit: 4096 },
  { id: 'telegram', name: 'Telegram', charLimit: 4096 },
];
