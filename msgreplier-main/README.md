# MsgReplier

MsgReplier is a modern web application designed to enhance digital communication. It offers a suite of tools including a slang dictionary (Shortcutpedia), a text repeater, and an upcoming AI-powered reply assistant.

## Features

- **Shortcutpedia**: A comprehensive library of text abbreviations, slang, and emojis with meanings and tone indicators.
- **Text Repeater**: A utility to repeat text multiple times for emphasis or meeting character limits.
- **cham AI (Coming Soon)**: An intelligent assistant for crafting perfect responses in various tones (Professional, Casual, Flirty, etc.).
- **Privacy First**: All processing is done locally in the browser; no data is stored or sent to external servers.
- **Responsive Design**: Fully optimized for both desktop and mobile devices.

## Tech Stack

This project is built using the following technologies:

### Core Framework & Language
- **[Next.js 15](https://nextjs.org/)**: The React Framework for the Web (App Router).
- **[TypeScript](https://www.typescriptlang.org/)**: Strongly typed programming language that builds on JavaScript.
- **[React 19](https://react.dev/)**: The library for web and native user interfaces.

### Styling & UI
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.
- **[Radix UI](https://www.radix-ui.com/)**: Unstyled, accessible components for building high-quality design systems.
- **[Shadcn UI](https://ui.shadcn.com/)**: Re-usable components built using Radix UI and Tailwind CSS.
- **[Lucide React](https://lucide.dev/)**: Beautiful & consistent icon toolkit.
- **[Next Themes](https://github.com/pacocoursey/next-themes)**: Perfect dark mode in Next.js.

### Forms & Validation
- **[React Hook Form](https://react-hook-form.com/)**: Performant, flexible and extensible forms with easy-to-use validation.
- **[Zod](https://zod.dev/)**: TypeScript-first schema declaration and validation library.

### Development Tools
- **[ESLint](https://eslint.org/)**: Pluggable JavaScript linter.
- **[Turbopack](https://turbo.build/pack)**: Incremental bundler optimized for Next.js.

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites
- Node.js (v18.17 or later)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/asrithreddy755/msgreplier.git
   cd msgreplier
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

- `/src/app`: Application routes and pages (App Router).
- `/src/components`: Reusable UI components.
- `/src/lib`: Utility functions, constants, and data (e.g., `shortcuts.json`).
- `/src/hooks`: Custom React hooks.
