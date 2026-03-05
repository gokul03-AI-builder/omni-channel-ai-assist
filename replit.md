# Verifone Assist - Support Agent Console

## Overview
An omnichannel support agent assist platform branded for Verifone. Provides a unified interface for support agents to handle customer calls with AI-powered assistance, live transcription, and intelligent knowledge base suggestions.

## Architecture
- **Frontend**: React + TypeScript with Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js (minimal, primarily frontend-focused demo)
- **State Management**: React state with simulated real-time data
- **Styling**: Dark-first Verifone branding (black + green theme, hsl(148, 100%, 40%))

## Key Features

### Call Section
- **Incoming Call Alert**: Animated alert with accept/decline buttons
- **Live Call Transcription**: Real-time simulated transcript with agent and customer messages
- **AI Assist (RAG)**: Contextual suggestions from knowledge base that appear based on conversation
- **Agent AI Chat**: Interactive chat where agents can query the AI assistant
- **Customer Profile**: Full customer details with account type, contact info
- **Device Information**: Terminal model, firmware, serial number, connection type
- **Past Calls & Tickets**: Historical support interactions

### Other Sections
- **Chats**: Placeholder for chat-based support (waiting state)
- **Feedback**: Customer satisfaction ratings and reviews

## File Structure
- `client/src/pages/calls.tsx` - Main calls page with all call-related components
- `client/src/pages/chats.tsx` - Chat support page
- `client/src/pages/feedback.tsx` - Customer feedback page
- `client/src/components/app-sidebar.tsx` - Navigation sidebar
- `client/src/lib/mock-data.ts` - Simulated Verifone support data
- `client/src/lib/theme-provider.tsx` - Dark/light mode toggle
- `shared/schema.ts` - TypeScript interfaces for all data types

## Theme
- Primary green: hsl(148, 100%, 40%) - Verifone brand green
- Dark mode default with very dark backgrounds (4% lightness)
- Font: Inter (sans), JetBrains Mono (mono)
- Animations: pulse-ring, fade-in-up, slide-in-right, breathing

## Running
- `npm run dev` starts both the Express backend and Vite frontend
