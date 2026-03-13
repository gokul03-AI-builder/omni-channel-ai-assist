import type { KbFeedback, ChatMessage, ClosedChatSummary } from "@shared/schema";

const KB_FEEDBACK_KEY = "vf-kb-feedback";
const CHAT_HISTORY_KEY = "vf-chat-history";
const CHAT_SESSIONS_HISTORY_KEY = "vf-chat-sessions-history";

export function getKbFeedback(): KbFeedback[] {
  try {
    return JSON.parse(localStorage.getItem(KB_FEEDBACK_KEY) || "[]");
  } catch {
    return [];
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
