# Verifone Assist — Agent Console · Product Feature Reference

**Version:** Current (March 2026)
**Description:** An omnichannel support agent assist platform for Verifone support agents. Provides a unified interface for handling customer calls with AI-powered assistance, live transcription, and knowledge base suggestions.

---

## App-Level

| Feature | Details |
|---|---|
| **Navigation Sidebar** | Links to three sections: Calls, Chats, Feedback |
| **Verifone Branding** | Logo (dark background for cross-theme consistency), mint green (#6effd2) accent |
| **Dark / Light Mode** | Toggle in sidebar footer; persisted across sessions in localStorage |
| **Logout** | Button in sidebar footer (UI only, no auth backend) |
| **Design System** | Liquid Glass (glassmorphism) — backdrop blur, semi-transparent panels, mint-glow borders throughout |

---

## Calls Page

This is the primary workspace. It is a four-panel layout that assembles itself as a call progresses.

---

### 1. Call Queue Panel *(left, toggleable)*
- Lists all calls: active and incoming
- Each entry shows customer name, topic, priority badge (high / medium / low), and call duration
- Clicking a call selects it into the workspace
- Panel can be collapsed/expanded with a toggle button to maximize workspace

---

### 2. Incoming Call Alert
- Full-screen animated alert fires when a new call comes in
- Displays caller name, company, call topic, and priority
- Two actions: **Accept** (opens the full workspace) or **Decline**
- Pulse ring animation while ringing

---

### 3. Live Call Controls *(top bar, active during a call)*
- Live call timer counting up from 00:00
- **Mute / Unmute** toggle with mic icon
- **Hold / Resume** toggle
- **End Call** — ends the call, triggers Call Summary, clears chat history

---

### 4. Live Transcription Panel *(center)*
- Real-time simulated transcript, auto-scrolling
- Each entry is labeled by speaker (Customer / Agent) with a timestamp
- Color-coded bubbles distinguishing the two speakers
- **Sentiment Indicator** — appears at the top of the panel *only after a ticket has been created*; updates dynamically as the conversation progresses
  - States: Positive · Neutral · Concerned · Frustrated
  - Driven by keyword scoring on recent customer utterances

---

### 5. KB Assist — RAG Suggestions *(center-right)*
- Suggestion cards appear contextually as the transcript progresses (tied to specific transcript entries)
- Each card displays:
  - Article title
  - Source ID (e.g., KB-2847) and category badge
  - Confidence match percentage
  - Short content preview
  - Thumbs up / thumbs down feedback buttons
- Cards animate in as new suggestions become relevant

**KB Article Full View (modal):**
- Opens when a suggestion card is clicked
- Full formatted article with sections (headers, bullet lists, numbered steps)
- Source, category, and confidence displayed in the header
- References section with clickable links (opens in new tab)
- Thumbs up / down vote (persisted to localStorage, synced to Feedback page)
- **"Copy Suggested Response to Chat Assist"** button — closes modal and prefills the Chat Assist input with the article's suggested response

---

### 6. Right Panel *(right, 4 tabs)*

**Tab 1 — Chat Assist**
- Header: "Chat History" label + message count (e.g., "Chat History · 6 messages")
- **New Chat** button — clears conversation history (also cleared automatically on call end)
- **Quick Prompt Chips** — shown only when chat is empty: *Firmware Rollback?, Warranty Status?, Escalate to L2?, RMA Process?*
- Conversation bubbles — agent messages (right-aligned) and AI responses (left-aligned), each with a timestamp
- Simulates contextual responses keyed to the current call topic
- Text input + Send button (Enter key also sends)
- **Quick Actions bar** — appears at the top of the chat tab when KB suggestions are present:
  - **Escalate L2** — triggers a confirmation toast notification
  - **Create Ticket** — opens the Create Ticket dialog

**Tab 2 — Customer Profile**
- Customer avatar with initials
- Full name, company, email, phone number, location
- Account type badge (Premium / Enterprise)
- Member since date

**Tab 3 — Device Info**
- Terminal model (e.g., Verifone P400, V240m, e285, VX 520)
- Serial number, firmware version, OS version
- Connection type (Ethernet, Wi-Fi / 4G LTE, Bluetooth, Dial-up)
- Status badge (Active / Maintenance)
- Last updated date
- Firmware update alert shown when device is running an outdated version

**Tab 4 — History**
- **Open Tickets** — lists current support tickets with status badge, topic, and date
- **Past Calls** — lists historical calls with topic, duration, and date

---

### 7. Create Ticket Dialog
- Opens from the "Create Ticket" Quick Action button
- Pre-populated fields: auto-generated ticket ID, customer name, company, call topic
- Auto-generated summary (editable textarea, pre-filled from call transcript and KB articles)
- Agent notes textarea (free-form)
- Priority selector
- **Create Ticket** button — records the ticket and enables the Sentiment indicator in the transcription panel

---

### 8. Call Summary *(shown after call ends)*
- Displayed when the agent clicks End Call
- Auto-generated structured summary including: call date, duration, customer name, account type, topic, priority, issue summary from transcript, troubleshooting steps, and KB articles referenced
- **Editable** — pencil icon toggles the summary into an editable textarea
- Agent notes textarea always visible
- Ticket section — shows the created ticket (if one was made during the call) or a "Create Now" button

---

## Chats Page

Placeholder state — displays a "waiting for chats" screen. The feature is not yet implemented.

---

## Feedback Page

Two-tab view for reviewing quality signals.

**Tab 1 — Customer CSAT**
- Aggregate metrics: average CSAT rating, total reviews count
- Individual feedback cards showing: customer name, star rating (1–5), comment, call topic, and date

**Tab 2 — KB Feedback**
- Lists all thumbs up / thumbs down votes submitted on KB articles during calls
- Each entry shows: article title, source ID, vote (Helpful / Not Helpful), associated call topic, and timestamp
- Persisted in localStorage; survives page refresh

---

## Data Persistence

| What | Where |
|---|---|
| KB article votes (thumbs up/down) | localStorage (`vf-kb-feedback`) |
| Chat Assist history (current call) | localStorage (`vf-chat-history`), cleared on call end |
| Theme preference | localStorage (`verifone-theme`) |
