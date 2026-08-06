# MsgReplier

MsgReplier is a modern, feature-rich digital toolkit and interactive platform designed specifically for couples and digital communication. Built with Next.js 15, React 19, TypeScript, and Supabase, it offers a suite of private tools including secure chat rooms, interactive personalized wishes websites, compatibility tests, and creative AI prompt generators.

## 🚀 Key Features

*   💬 **Love Space**: A 100% private, login-free room shared exclusively between two partners. Includes a secure real-time chat and built-in interactive mini-games like Ludo and Tic-Tac-Toe (XOX) to enjoy together.
*   🎉 **Wishes Website**: Build personalized, beautiful, and interactive greeting websites for birthdays, anniversaries, and special moments in seconds. Supports dynamic theme templates, background music, custom photo uploads, and reveal animations. Premium themes and features are integrated with Razorpay payments.
*   🔥 **FLAMES Calculator**: Relive childhood nostalgia with a digital compatibility calculator based on the classic FLAMES algorithm.
*   🎨 **AI Couple Prompts**: Curated prompts designed to help generate high-quality couple photography and creative illustration ideas using AI art models.
*   📖 **Shortcutpedia**: A comprehensive dictionary of modern slang, text abbreviations, and emojis, complete with definitions and context/tone indicators.
*   🔁 **Text Repeater**: A simple utility designed to repeat words, sentences, or characters for emphasis or messaging purposes.

---

## 🛠️ Tech Stack

### Frontend Framework & Language
*   **Next.js 15 (App Router)**: Hybrid static & server-side rendering for optimal speed and SEO.
*   **React 19**: Modern UI rendering engine.
*   **TypeScript**: Static typing for clean, readable, and robust code.

### Styling & Animations
*   **Tailwind CSS**: Rapid utility-first styling.
*   **Radix UI & Radix Colors**: Accessible primitives for building clean design systems.
*   **Shadcn UI**: Modern pre-configured components.
*   **Framer Motion & GSAP**: Fluid micro-interactions, page transitions, and landing animations.
*   **Canvas Confetti**: High-performance reward animations.

### State & Form Management
*   **Redux Toolkit & React Redux**: Global state management.
*   **React Hook Form**: Performant form handling.
*   **Zod**: TypeScript-first validation schemas.

### Backend & Databases
*   **Supabase (PostgreSQL & Realtime)**: Realtime messaging, client session storage, and database persistence.
*   **Cloudflare R2**: Secure, high-performance object storage for greeting media and custom user uploads.

### Hosting & Deployment
*   **Cloudflare Pages**: Serverless edge hosting via `@opennextjs/cloudflare`.
*   **Wrangler**: Cloudflare command-line interface for staging and deployment.
*   **Razorpay**: Automated checkout flow handling premium purchases.

---

## 📁 Project Structure

```text
├── db/                         # Supabase database SQL schema files and migrations
├── docs/                       # Project documentation
├── patches/                    # Package-patch files for Next.js and opennextjs-cloudflare
├── scripts/                    # Build, migration, and developer utilities
├── src/
│   ├── app/                    # Next.js page routing structure (App Router)
│   ├── components/             # Shared UI components (Shadcn, custom blocks)
│   ├── data/                   # Static data libraries
│   ├── hooks/                  # Custom React hooks (realtime state, localstorage)
│   ├── lib/                    # Supabase client, helpers, and configurations
│   └── types/                  # TypeScript interfaces and type definitions
├── wrangler.json               # Cloudflare configuration file
└── next.config.mjs             # Next.js configurations
```

---

## 🛠️ Setup & Local Installation

### Prerequisites
*   Node.js (v18.17 or later)
*   npm, yarn, or pnpm
*   A Supabase project
*   A Cloudflare R2 bucket (or equivalent S3 storage)
*   A Razorpay developer account

### Step 1: Clone the Repository
```bash
git clone https://github.com/asrithreddy755/msgreplier.git
cd msgreplier/msgreplier-main
```

### Step 2: Configure Environment Variables
Create a `.env.local` file inside the `msgreplier-main` folder:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Access
ADMIN_PASSWORD=your_secure_admin_password
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudflare R2 Credentials
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_URL=your_r2_public_domain_url

# Razorpay Settings
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Step 3: Run Database Migrations
Import the database schema and policy definitions from the SQL scripts in the [db/](file:///c:/Users/S.B.Reddy/Desktop/msgreplier-main/msgreplier-main/db/) folder directly into your Supabase SQL Editor.

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Start the Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

---

## ☁️ Deployment

MsgReplier is fully optimized for serverless edge deployment using Cloudflare Pages.

### Build and Deploy Command
```bash
# Build the application using OpenNext
npm run pages:build

# Deploy the output directly to Cloudflare Pages
npm run deploy
```

---

## 📄 License

This project is licensed under the MIT License.
