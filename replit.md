# Verifone Assist - Support Agent Console

## Overview
An omnichannel support agent assist platform branded for Verifone. Provides a unified interface for support agents to handle customer calls with AI-powered assistance, live transcription, and intelligent knowledge base suggestions.

## Architecture
- **Frontend**: React + TypeScript with Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js (minimal, primarily frontend-focused demo)
- **State Management**: React state with simulated real-time data
- **Design System**: Liquid Glass (Glassmorphism) with Verifone mint green branding

## Key Features

### Call Section
- **Incoming Call Alert**: Animated alert with accept/decline buttons
- **Live Call Transcription**: Real-time simulated transcript with sentiment analysis indicator (Positive/Neutral/Concerned/Frustrated) based on customer speech
- **KB Assist (RAG)**: Contextual KB suggestions that appear based on conversation; clickable to open full article modal; thumbs up/down feedback on each card
- **KB Article Full View**: Dialog modal showing full article content, formatted sections, references as clickable links, feedback rating buttons, and "Copy to Chat Assist" action
- **Quick Actions**: Context-aware action buttons (Push Firmware, Escalate L2, Create Ticket, Schedule Technician) shown when KB suggestions are present; each triggers a confirmation toast
- **Chat Assist**: Interactive chat with localStorage persistence across sessions; quick prompt chips (Firmware, Warranty, Escalate, RMA); KB article "Copy to Chat Assist" prefill
- **Customer Profile**: Full customer details with account type, contact info
- **Device Information**: Terminal model, firmware, serial number, connection type; firmware update alert for P400
- **Past Calls & Tickets**: Historical support interactions
- **Call Summary**: Auto-generated summary panel when call ends, showing customer issues, KB articles referenced, and recommended next actions

### Chat Section
- **Queue Sidebar** (280px): Lists waiting and active chat sessions; filter by channel (All/Web/Email/WhatsApp/SMS); search; queue/history tabs; SLA countdown timers (amber at <2min, red at <1min); accept/decline buttons on waiting chats; max 3 active sessions enforced
- **Chat Thread**: Customer↔agent message bubbles with timestamps; internal notes (amber-styled, lock icon); typing indicator; "Seen" checkmarks; canned quick responses dropdown; auto-scrolling
- **KB Assist** (320px): Auto-surfaces relevant KB articles based on customer messages; manual search; confidence bars; copy-to-chat; thumbs up/down feedback
- **Info/AI Panel** (360px, collapsible): Tabbed — Info tab (customer profile, device, tickets, past interactions); AI Assist tab (per-session AI chat)
- **Session Tabs**: Switch between up to 3 active chats with unread badges
- **Actions**: Hold/resume, transfer (modal with agent list), close chat (triggers summary overlay), create email ticket (modal with pre-filled fields)
- **Chat Summary**: Overlay after closing a chat showing duration, message count, transcript, ticket status
- **Chat History**: Last 20 closed sessions persisted in localStorage, searchable in History tab
- **Simulated Messages**: Customers send timed responses like the calls page; paused when chat is on hold

### Other Sections
- **Feedback**: Two-tab view — Customer CSAT ratings, and KB Feedback (captures thumbs up/down votes from calls, persisted in localStorage)

## File Structure
- `client/src/pages/calls.tsx` - Main calls page with all call-related components
- `client/src/pages/chats.tsx` - Chat support page
- `client/src/pages/feedback.tsx` - Customer feedback page (two tabs: CSAT + KB Feedback)
- `client/src/components/app-sidebar.tsx` - Navigation sidebar (logo always dark bg for cross-theme consistency)
- `client/src/lib/mock-data.ts` - Simulated Verifone support data; KB articles with fullContent/references/suggestedResponse; chat sessions, simulated customer messages, canned responses, chat KB suggestions
- `client/src/lib/store.ts` - localStorage utilities for KB feedback, Chat Assist history, and closed chat session history persistence
- `client/src/lib/theme-provider.tsx` - Dark/light mode toggle
- `shared/schema.ts` - TypeScript interfaces; includes ChatSession, ChatConversationMessage, ClosedChatSummary for chat platform; AISuggestion with fullContent/references/suggestedResponse; KbFeedback interface

## Theme & Design

### Brand Color
- Primary: #6effd2 (HSL 161, 100%, 72%) - Verifone mint green
- Dark mode primary: Full brightness mint (#6effd2) with dark text on buttons
- Light mode primary: Darkened to 161 80% 38% for contrast on light backgrounds
- Primary foreground: Very dark (near-black) in both modes for accessibility

### Liquid Glass Design System
- **Glass utilities**: `.glass`, `.glass-panel`, `.glass-header`, `.glass-controls`, `.glass-subtle`, `.glass-bubble`, `.glass-bubble-primary`, `.glass-input`
- **CSS variables**: `--glass-bg`, `--glass-bg-subtle`, `--glass-border`, `--glass-border-subtle`, `--glass-highlight`, `--glass-shadow`, `--mint-glow`, `--mint-glow-subtle`
- **Effects**: backdrop-filter blur(16-24px) + saturate(180-200%), semi-transparent backgrounds, inset highlight shadows, mint-tinted glowing borders
- **Background**: Radial gradient body with subtle mint glow orbs for glass depth
- **Card override**: `.shadcn-card` class gets automatic glass treatment via CSS
- **Sidebar override**: `[data-sidebar="sidebar"]` gets glass treatment via CSS
- **Mint glow**: `.mint-glow` and `.mint-glow-sm` for glowing accent elements

### Dark Mode (Default)
- Background: HSL 220 20% 4% with mint radial gradient orbs
- Cards: rgba(255,255,255,0.025) with blur
- Borders: Mint-tinted at very low opacity
- Stored in localStorage as "verifone-theme"

### Animations
- pulse-ring, fade-in-up, slide-in-right, breathing, glass-shimmer
- Custom mint color: `mint-50` through `mint-900` in tailwind config

## Running
- `npm run dev` starts both the Express backend and Vite frontend on port 5000
