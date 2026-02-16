export interface PromptItem {
  id: string;
  image: string;
  tag: string;
  likes: number;
  text: string;
  author: string;
}

export const prompts: PromptItem[] = [
  {
    id: "1",
    image: "/1.webp",
    tag: "PORTRAIT",
    likes: 420,
    text: "Night-time casual couple selfie, high-angle top-down shot, camera held above head and tilted downward. Two people standing close together on a street beside a parked car. 🔒 STRICT FACE LOCK — IDENTITY PRIORITY Use the uploaded male and female photos as the ONLY facial identity sources. Faces must match EXACTLY with: identical identity same structure & proportions same skin tone same eyes, nose, lips, jawline no reshaping no beautification no smoothing no reinterpretation no regeneration no symmetry correction If likeness is not exact, consider the image incorrect. Male on the left wearing a black-and-cream striped sweater, relaxed posture, slight smirk, eyes at camera, korean wavy hair. 💍 Proposal moment: Male subtly holding a ring toward the girl in a natural proposing gesture while still taking the selfie. Ring visible but realistic and not oversized. Female on the right (same girl as reference), matching striped sweater. She looks happy and emotional, lightly holding onto the boy’s arm/chest with both hands. Slight genuine smile (not wide grin), soft romantic expression. Shoulder-length brown hair. White bag strap visible. Warm streetlight lighting, dark car and asphalt background. Tight framing. Realistic phone-camera photo. Natural healthy skin texture with subtle glass-skin glow, no plastic lo",
    author: "@msg replier"
  },
  {
    id: "2",
    image: "/2.webp",
    tag: "SUBMERGED",
    likes: 634,
    text: "Use 100% of both faces above the image uploaded, Create an image of a selfie, without any clear subject or composition-just a random blueish snapshot taken unintentionally. The image should have slight motion blur and consistent lighting from streetlights. Both characters are together in the selfie and the image size ratio is 9:16 and don't change facial features. Both skins are real skin texture do not use plastic skin don't change both faces and don't change both hairstyle",
    author: "@msg replier"
  },
  {
    id: "3",
    image: "/3.webp",
    tag: "GINI",
    likes: 555,
    text: "Vertical 9:16 Instagram Story image, 1080x1920 resolution. Photorealistic smartphone front camera shot, direct flash, eye-level angle, slight wide-angle. Two subjects: a boy and a girl standing side by side, bodies slightly angled inward, arms raised above heads with hands meeting to form a heart shape. Both smiling directly at camera with joyful, affectionate expressions. Boy wears oversized black full-zip spider-themed hoodie, heavy premium cotton fleece, red spider emblem on chest, red web patterns on shoulders/sleeves, white spider-eye shapes on hood, no text/branding, thin red thread bracelet. Girl wears oversized white full-zip spider-themed hoodie, premium thick cotton fleece, red spider emblem on chest, red web patterns on sleeves, subtle spider-eye design on hood, no text/branding, small earrings. Girl features: light warm beige skin, long dark brown hair, loose waves, side-parted, soft oval face, natural makeup. Lighting: strong phone flash on faces, bright skin tones, deep shadows, dark blue night sky background with faint garden lights/trees. Details: Strict identity lock, preserve natural skin texture/pores, no beautification, fabric texture focus, warm natural tones, realistic contrast, DSLR-level detail, authentic smartphone look. --ar 3:4",
    author: "@msg replier"
  },
  {
    id: "4",
    image: "/4.webp",
    tag: "SCENIC",
    likes: 312,
    text: "preserve our face 100%.resembling exact as uploaded image. A romantic Indian wedding couple standing close in an intimate pose, softly touching foreheads and smiling gently. The woman is wearing a traditional Maharashtrian silk saree in rich orange-red tones with intricate gold embroidery, heavy bridal gold jewelry, nath, layered necklaces, bangles, and fresh jasmine flowers (gajra) in her neatly tied braid. The man is wearing a traditional dhoti with a red-orange angavastram draped over his shoulder, minimal jewelry, and a sacred thread visible, giving a classic South Indian wedding look. Soft natural window light from behind creates a bright, dreamy, airy background with white curtains, shallow depth of field, cinematic photography style. Warm skin tones, emotional connection, elegant posture, luxury wedding editorial, ultra-realistic, high detail, professional DSLR look, soft shadows, 85mm lens feel, natural expressions, wedding editorial, soft light, candid romance, luxury Indian wedding --ar 4:5 Negative Prompt: blurry, low quality, cartoon, overexposed faces, extra fingers, distorted hands, harsh lighting, artificial skin, exaggerated features.",
    author: "@msg replier"
  },
  {
    id: "5",
    image: "/5.webp",
    tag: "FUTURISTIC",
    likes: 890,
    text: "Create a high-quality, close-up smartphone selfie of a young couple — a man and a woman — pressing their cheeks together under a bright, clear blue summer sky. Each has half of a red heart hand-painted on their cheek with lipstick, which forms a complete heart when they lean in. Both have genuine, happy smiles.The lighting is warm and natural. The man has messy, darkest brown wavy hair, while the woman has dark brown hair and soft winged eyeliner. Realistic skin textures, vibrant colors, and a joyful, youthful atmosphere.Keep my face 100% matches as in the reference image. 9:16 size in 4k quality",
    author: "@msg replier"
  }
];
