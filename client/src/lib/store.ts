import type { KbFeedback, ChatMessage, ClosedChatSummary } from "@shared/schema";

const KB_FEEDBACK_KEY = "vf-kb-feedback";
const CHAT_HISTORY_KEY = "vf-chat-history";
const CHAT_SESSIONS_HISTORY_KEY = "vf-chat-sessions-history";

const SEED_KB_FEEDBACK: KbFeedback[] = [
  {
    id: "seed-kb-001",
    suggestionId: "seed-s-001",
    suggestionTitle: "P400 Firmware Rollback Procedure",
    source: "Internal KB",
    vote: "up",
    timestamp: "2026-03-28T09:14:00.000Z",
    callTopic: "Firmware Update Failure",
    channel: "calls",
  },
  {
    id: "seed-kb-002",
    suggestionId: "seed-s-002",
    suggestionTitle: "V240m Wi-Fi Certificate Reset",
    source: "Verifone Docs",
    vote: "up",
    timestamp: "2026-03-27T14:32:00.000Z",
    callTopic: "Wi-Fi Connectivity",
    channel: "chats",
  },
  {
    id: "seed-kb-003",
    suggestionId: "seed-s-003",
    suggestionTitle: "Batch Settlement Troubleshooting Guide",
    source: "Internal KB",
    vote: "down",
    timestamp: "2026-03-26T11:05:00.000Z",
    callTopic: "Settlement Error",
    channel: "calls",
  },
  {
    id: "seed-kb-004",
    suggestionId: "seed-s-004",
    suggestionTitle: "VX 820 NFC Reader Calibration",
    source: "Verifone Docs",
    vote: "up",
    timestamp: "2026-03-25T16:48:00.000Z",
    callTopic: "Contactless Payment Issue",
    channel: "chats",
  },
  {
    id: "seed-kb-005",
    suggestionId: "seed-s-005",
    suggestionTitle: "Commander App License Renewal Steps",
    source: "Internal KB",
    vote: "up",
    timestamp: "2026-03-24T10:20:00.000Z",
    callTopic: "License Expiry",
    channel: "calls",
  },
  {
    id: "seed-kb-006",
    suggestionId: "seed-s-006",
    suggestionTitle: "E285 Screen Replacement Instructions",
    source: "Field Service Manual",
    vote: "down",
    timestamp: "2026-03-22T08:55:00.000Z",
    callTopic: "Hardware Damage",
    channel: "calls",
  },
];

export function getKbFeedback(): KbFeedback[] {
  try {
    const userFeedback: KbFeedback[] = JSON.parse(localStorage.getItem(KB_FEEDBACK_KEY) || "[]");
    const merged = [...userFeedback];
    for (const seed of SEED_KB_FEEDBACK) {
      if (!userFeedback.find((u) => u.suggestionId === seed.suggestionId)) {
        merged.push(seed);
      }
    }
    return merged;
  } catch {
    return SEED_KB_FEEDBACK;
  }
}

export function addKbFeedback(entry: KbFeedback): void {
  const existing = getKbFeedback();
  const filtered = existing.filter((e) => e.suggestionId !== entry.suggestionId);
  localStorage.setItem(KB_FEEDBACK_KEY, JSON.stringify([entry, ...filtered]));
}

export function getKbVote(suggestionId: string): "up" | "down" | null {
  const feedback = getKbFeedback();
  return feedback.find((f) => f.suggestionId === suggestionId)?.vote ?? null;
}

export function getChatHistory(): ChatMessage[] {
  try {
    return JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
}

export function clearChatHistory(): void {
  localStorage.removeItem(CHAT_HISTORY_KEY);
}

export function getClosedChatSessions(): ClosedChatSummary[] {
  try {
    return JSON.parse(localStorage.getItem(CHAT_SESSIONS_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addClosedChatSession(summary: ClosedChatSummary): void {
  const existing = getClosedChatSessions();
  const updated = [summary, ...existing].slice(0, 20);
  localStorage.setItem(CHAT_SESSIONS_HISTORY_KEY, JSON.stringify(updated));
}

export function clearClosedChatSessions(): void {
  localStorage.removeItem(CHAT_SESSIONS_HISTORY_KEY);
}
