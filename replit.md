# Savorah — AI-Powered Personal Finance App

## Overview
Savorah is a React + TypeScript + Express web app that uses Google Gemini AI to help users manage personal finances. Features include:
- AI budget recommendations
- Smart transaction categorization
- Spending insights & anomaly detection
- Financial coach chatbot
- Vision board image generation
- Monthly summary reports

## Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Recharts, Framer Motion
- **Backend:** Express (served via `server.ts`), Vite middleware in dev mode
- **AI:** Google Gemini via `@google/genai`
- **Runtime:** Bun (package management) / Node.js (tsx for dev)

## How to Run
The dev workflow runs: `tsx server.ts`  
The server starts on **port 3000** (Express + Vite middleware combined).

## Environment Variables / Secrets
- `GEMINI_API_KEY` — required for all AI features (set as a Replit Secret)

## User Preferences
