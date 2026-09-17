# Dr. Tasrif Ahmed — Portfolio Website

Modern, animated portfolio website for Dr. Tasrif Ahmed, Oral & Maxillofacial Surgeon (Dhaka, Bangladesh).
Built with Next.js (App Router), React, TypeScript, Tailwind CSS and Framer Motion. Includes English & Bengali (বাংলা) language toggle.

## Requirements

- Node.js 18.17+ (Node 20 recommended)
- npm

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 (use any free port with `npm run dev -- -p 3100` if 3000 is taken).

Production build:

```bash
npm run build
npm run start
```

## Project structure

- `app/` — Next.js App Router: layout, page, global styles, favicon
- `components/` — UI sections: Navbar, Hero, About, Specializations, BeforeAfter, Gallery, Appointment, Contact, Footer, FloatingChat, Modal
- `lib/` — i18n dictionary/provider (EN + BN), animation variants, scroll-spy hook
- `public/images/` — all site imagery

## Notes

- All credentials, contact details, publications and case visuals are intentional placeholders (marked "(placeholder)" / "(নমুনা)") — replace them with verified information before publishing.
- WhatsApp / Messenger floating buttons point to placeholder handles in `components/FloatingChat.tsx` (`WHATSAPP_NUMBER`, `MESSENGER_USERNAME`).
- Language toggle lives in the navbar and footer; translations are in `lib/i18n.tsx`.
