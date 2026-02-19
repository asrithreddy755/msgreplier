import { PROMPT_ORDER } from "./prompts-order";

export interface PromptItem {
  id: string;
  image: string;
  tag: string;
  likes: number;
  text: string;
  author: string;
}

const promptsList: PromptItem[] = [
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
  },
  {
    id: "6",
    image: "/6.webp",
    tag: "CASUAL",
    likes: 742,
    text: "Use my uploaded reference image as the only face reference. Ultra-realistic cinematic couple portrait in the middle of a golden-hour countryside field with tall dry grass; woman hugging man with soft smile, man holding her and looking forward into the distance with a calm, thoughtful expression women’s head on the man’s chest .warm earthy tones, shallow depth of field, 85mm lens look, emotional and natural, photorealistic, no face changes, no stylization. Man wearing white shirt and Woman wearing a traditional red blouse with subtle gold border and white saree",
    author: "@msg replier"
  },
  {
    id: "7",
    image: "/7.webp",
    tag: "DATE NIGHT",
    likes: 521,
    text: "🔒 STRICT FACE & HAIR IDENTITY LOCK — NON-NEGOTIABLE\n\nUse the uploaded face reference(s) as the ONLY source of identity.\n\nPreserve the face and hairstyle EXACTLY as provided.\n\nNo reshaping, no beautification, no smoothing, no symmetry correction, no reinterpretation, no regeneration.\n\nMaintain identical facial structure, proportions, skin texture, hair texture, hair length, and natural details.\n\nIdentity must match the uploaded face reference 1:1.\n\n⚠️ The uploaded reference image(s) are used ONLY for face and hairstyle.\n\nClothing, pose, body position, composition, environment, and all scene elements MUST follow the specifications below — not the face reference image.\n\n⸻\n\nSUBJECT PLACEMENT & POSITION (LOCKED — MUST MATCH EXACTLY)\n\n* Female positioned on the LEFT side of the frame.\n\n* Male positioned on the RIGHT side of the frame.\n\nFEMALE — LEFT SIDE\n\nBody angled slightly toward the right (toward the male).\n\nOne arm lifted upward toward the forehead in a playful shielding gesture.\n\nWeight slightly shifted backward as if reacting to falling petals.\n\nSaree flowing naturally with visible motion in the fabric.\n\nFull-body visible within frame.\n\nMALE — RIGHT SIDE\n\nBody leaning slightly forward toward the female.\n\nOne leg stepping forward mid-motion.\n\nArms relaxed, one slightly extended downward.\n\nKurta fabric moving naturally with the step.\n\nFull-body visible within frame.\n\nBoth captured mid-step in a candid, playful interaction beneath falling petals.\n\nSubjects slightly off-center for dynamic balance.\n\nForeground leaves softly blurred along frame edges for depth.\n\nNatural spontaneous body language — not posed.\n\n⸻\n\nENVIRONMENT (LOCKED)\n\nOutdoor stone-paved courtyard.\n\nRustic aged stone wall in background.\n\nDense dark green trees forming backdrop.\n\nOverhanging branches with pink blossoms visible at top of frame.\n\nMultiple pink flower petals falling mid-air around both subjects.\n\n⸻\n\nCLOTHING (LOCKED — MUST MATCH EXACTLY)\n\nFEMALE (LEFT)\n\nTraditional flowing saree.\n\nCream/neutral base with intricate black printed patterns.\n\nDistinct red/orange border along pallu and edges.\n\nBlack blouse beneath saree drape.\n\nRealistic folds and natural fabric motion.\n\nMALE (RIGHT)\n\nSolid black traditional kurta.\n\nLong sleeves.\n\nRelaxed fit.\n\nNatural fabric flow responding to forward step.\n\nNo modern accessories.\n\nWardrobe must match this exactly regardless of the face reference image.\n\n⸻\n\nCAMERA & TECHNICAL (LOCKED)\n\nEye-level perspective.\n\nMedium full-body shot.\n\n85mm lens look.\n\nWide aperture (f/1.8–f/2.2).\n\nShallow depth of field.\n\nSoft background bokeh.\n\nNatural motion capture feel.\n\n⸻\n\nLIGHTING (LOCKED)\n\nGolden hour sunlight.\n\nWarm directional backlighting.\n\nSoft rim light along hair and clothing edges.\n\nGentle warm glow.\n\nNatural shadows, no harsh contrast.\n\n⸻\n\nCOLOR GRADING & TEXTURE (LOCKED)\n\nWarm amber and honey-toned cinematic grading.\n\nMuted greens in background.\n\nSoft highlight roll-off.\n\nNatural tones preserved.\n\nSubtle organic film grain.\n\nNo over-sharpening.\n\n⸻\n\nMOOD (LOCKED)\n\nRomantic.\n\nPlayful.\n\nCandid.\n\nNostalgic.\n\nAuthentic documentary-style realism.\n\n⸻\n\n⚠️ FINAL INSTRUCTION\n\nThe ONLY variable is the facial identity and hairstyle, taken exclusively from the uploaded face reference(s).\n\nEverything else — gender placement (female left, male right), clothing, pose, body position, environment, composition, lighting, color grading, mood, and cinematic treatment — must match the above specifications EXACTLY",
    author: "@msg replier"
  },
  {
    id: "8",
    image: "/8.webp",
    tag: "TRAVEL",
    likes: 889,
    text: "Candid indoor close-up couple selfie, cozy restaurant/bar setting, soft ambient light with gentle flash. Girl in the foreground resting her cheek on one hand, wearing a light floral sleeveless dress, soft blush and glossy lips, relaxed smile. Boy leaning in from the left, casual shirt, warm friendly expression. Curtains and dim lights in background, natural skin texture, smartphone front-camera selfie feel, real candid vibe.[LOCK-EXACT | same pose, same framing, same angle, same lighting, same expressions, zero variation]Ultra HD 8K, Ratio 4:5, keep my face 100% same as in the reference image. ",
    author: "@msg replier"
  },
  {
    id: "9",
    image: "/9.webp",
    tag: "ARTISTIC",
    likes: 456,
    text: "A candid, soft watercolor and ink sketch illustration on textured paper, showing an Indian couple in a tender embrace under a translucent pastel pink umbrella during a light rain. The woman, with natural makeup and small gold earrings, wears a flowing teal green saree with a simple blouse, and the man, with curly dark hair and a light beard, wears a damp teal casual shirt. They are smiling warmly into each other's eyes, with loose, expressive line work and blurred, abstract watercolor splashes of muted teal, beige, and grey in the background. The lighting is diffused, natural daylight, giving the scene a dreamy, cinematic quality with subtle paper grain visible.",
    author: "@msg replier"
  },
  {
    id: "10",
    image: "/10.webp",
    tag: "ARTISTIC",
    likes: 670,
    text: "A soft, romantic hand-drawn watercolor illustration of a young Indian couple in an intimate, loving pose. The man stands slightly behind the woman, gently holding her face with one hand, smiling warmly. He has thick, dark curly hair, light stubble, and is wearing a simple light pastel shirt. The woman has long, wavy dark hair, a small bindi, natural makeup, and a joyful smile. She is wearing a teal-green saree with subtle texture and traditional elegance. Both are looking at each other with deep affection and happiness. Art style: delicate watercolor painting with visible brush strokes, soft ink outlines, pastel green and teal color palette, dreamy romantic mood, minimal background with abstract watercolor splashes, smooth skin tones, gentle lighting, artistic illustration (not photo-realistic), high detail, emotional expression.",
    author: "@msg replier"
  },
  {
    id: "11",
    image: "/11.webp",
    tag: "ARTISTIC",
    likes: 912,
    text: "A soft, romantic hand-drawn digital illustration of an Indian couple standing close together, smiling lovingly at each other. The man has natural curly hair, light stubble, and a warm, joyful expression. He is wearing a casual light olive-green T-shirt and a black wristwatch, gentlytouching the woman’s shoulder. The woman has expressive eyes, long dark hair tied back loo",
    author: "@msg replier"
  }
];

export const prompts: PromptItem[] = [...promptsList].sort((a, b) => {
  const indexA = PROMPT_ORDER.indexOf(a.id);
  const indexB = PROMPT_ORDER.indexOf(b.id);

  if (indexA === -1 && indexB === -1) return 0;
  if (indexA === -1) return 1;
  if (indexB === -1) return -1;

  return indexA - indexB;
});
