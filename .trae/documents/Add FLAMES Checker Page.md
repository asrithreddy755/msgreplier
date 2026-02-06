## Goal
- Add a new mobile-friendly FLAMES checker page with two inputs, a 2s spinning animation, and a smooth result reveal.
- Keep it Vercel-deployable without any backend dependencies (static-friendly behavior).

## Where It Will Live
- Create a dedicated route: `src/app/flames/page.tsx` (client UI + animation + FLAMES logic).
- Add metadata for the route via `src/app/flames/layout.tsx` (same pattern as `/library`).
- Add a navigation link to `/flames` in the existing sidebar menus inside `src/app/[platform]/page.tsx` so users can reach it.

## FLAMES Algorithm (Implementation Details)
- Normalize both names:
  - `trim`, `toLowerCase`, remove spaces, and keep only letters (`a-z`).
- Remove common letters (frequency-based):
  - Convert each name to an array of characters.
  - For each char in name1, if it exists in name2, remove one occurrence from both.
- Count remaining letters: `remainingCount = remainingName1.length + remainingName2.length`.
- Eliminate from `['F','L','A','M','E','S']` using the standard circular index method:
  - `index = (remainingCount - 1) % flames.length`, remove that item, continue from the same index.
  - If `remainingCount === 0`, return a deterministic result (I will set it to `S` to avoid undefined behavior).
- Map final letter to meaning:
  - F → Friendship 🤝
  - L → Love ❤️
  - A → Affection 🥰
  - M → Marriage 💍
  - E → Enemy 😈
  - S → Sister 😅

## UX Requirements (How They Will Be Built)
- Inputs:
  - Two fields: “Your Name” and “Partner Name”.
  - A “Check FLAMES” button.
- On click:
  - Validate both inputs are non-empty; otherwise show a destructive toast (existing `useToast` pattern).
  - Start a 2-second animation state.
  - Disable both inputs + button during animation.
- Animation (2 seconds):
  - Centered “F L A M E S” element with a smooth spin/rotate effect using Tailwind animations (`animate-spin`) plus soft scaling/opacity transitions.
- Result reveal (after animation):
  - Fade-in container with a short typing effect for the meaning text (implemented with a small interval that reveals characters progressively).
- Disclaimer:
  - Add the exact text at the bottom of the card: “This game is for fun and entertainment purposes only.”

## UI Style (Romantic + Clean)
- Use existing shadcn components (`Card`, `Input`, `Button`, `Label`) for consistency.
- Use light gradients and soft shadows:
  - Background: subtle pink/purple gradient + `bg-card/50 backdrop-blur-sm` style.
  - Rounded corners, gentle hover transitions, and readable spacing.
- Mobile-first layout:
  - Stacked inputs and button, max width (`max-w-md` or `max-w-lg`), comfortable padding.

## Static / Vercel Deployability
- Page will not use server actions, route handlers, or runtime fetches.
- It will work as a fully client-side interactive page that can be statically served by Vercel.
- If you mean “Next.js static export” specifically (`output: 'export'`), that’s a larger repo-wide change due to the existing dynamic `[platform]` route; I can include that as an optional follow-up.

## Verification
- Run `npm run build` to confirm no TypeScript/build errors.
- Quick manual check in dev: ensure inputs disable during animation, and result reveal works smoothly.
