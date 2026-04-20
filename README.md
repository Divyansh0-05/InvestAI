<div align="center">

# 🤝 InvestAI

### Aapka AI-powered financial dost — built for 400M+ Indians who save but don't get guidance.

[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.5-blue?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=for-the-badge)]()
[![Status](https://img.shields.io/badge/Status-Hackathon%20Project-orange?style=for-the-badge)]()

<br/>

### 🚀 [View Live Demo](https://invest-ai-sigma.vercel.app/) &nbsp;&nbsp;|&nbsp;&nbsp; Built for Bharat.

<br/>

</div>

---

## 🔴 The Problem

Most financial tools in India are built for English-speaking urban users.
**Groww, Zerodha, Paytm Money** — all English-first, jargon-heavy, and intimidating for first-time investors from tier 2/3 cities and rural India.

> **400 million Indians** have savings accounts and FDs but no trusted, simple guidance on where to put their money, what the tax implications are, or which bank to trust.

They rely on word of mouth, family advice, or just leave money in savings accounts earning **3.5%** — when FDs could give them **7.5%+**.

The problem isn't lack of money. It's lack of guidance in their language.

---

## 💡 What is InvestAI?

InvestAI is an **AI-powered financial assistant that speaks your language — literally.**

It understands Hinglish, Hindi, Bhojpuri, and Punjabi. It helps users compare FD rates, scan receipts, calculate tax, set reminders, and get personalized financial guidance — all through a simple chat interface that feels as familiar as WhatsApp.

No forms. No jargon. Just chat.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 💬 Hinglish AI Chat
- Powered by Gemini 2.5 Flash Lite
- Understands Hinglish, Hindi, Bhojpuri, Punjabi
- Context-aware multi-turn conversations
- Streaming responses token by token
- WhatsApp-style chat UI

</td>
<td width="50%">

### 🏦 FD Rate Comparison
- 10 major Indian banks side by side
- 1-year and 3-year rates compared
- Trust scores (★★★★★) for safety guidance
- Server-side rendered for instant load + SEO
- Mobile-responsive card and table views

</td>
</tr>
<tr>
<td width="50%">

### 📷 Receipt & Document Scanner
- Upload any FD receipt or bank document photo
- Gemini Vision extracts: bank name, amount, rate, maturity date, maturity amount
- Works on blurry phone photos
- Response delivered in user's chosen language

</td>
<td width="50%">

### 🎤 Voice Input
- Speak your question in Hindi or Hinglish
- Uses Web Speech API with hi-IN recognition
- Mic turns red while actively listening
- Works on all modern Android and iOS browsers

</td>
</tr>
<tr>
<td width="50%">

### 🧮 Tax Slab Calculator
- Pick your slab: 0%, 5%, 20%, 30%
- See pre-tax vs post-tax FD returns in real rupees
- Live calculation with no page reload
- Inline inside the chat — no separate page needed

</td>
<td width="50%">

### ⏰ Smart Reminders
- Say "mujhe 3 mahine baad yaad dilao"
- AI extracts the date automatically
- Saved to your account in Supabase
- Never miss an FD maturity date again

</td>
</tr>
<tr>
<td width="50%">

### 🕓 Chat History
- Every conversation saved per user account
- Sidebar just like Claude / ChatGPT
- Switch between past chats instantly
- Full authentication with login/signup

</td>
<td width="50%">

### 🌐 Language Switcher
- Switch between Hinglish / Hindi / Bhojpuri / Punjabi
- Preference stored in localStorage
- Changes AI tone and response language instantly
- Persists across all sessions

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **AI Model** | Google Gemini 2.5 Flash Lite (`gemini-2.5-flash-lite-preview-06-17`) |
| **Vision** | Gemini Multimodal — same model handles image + text |
| **Voice** | Web Speech API — browser-native, zero cost |
| **Database** | Supabase (PostgreSQL) — messages, sessions, reminders |
| **Auth** | Supabase Auth — email/password, session management |
| **Deployment** | Vercel — edge deployment, auto SSL, global CDN |
| **Rendering** | SSR for home/banks pages, CSR for all interactive components |

---

## 🏗️ Architecture