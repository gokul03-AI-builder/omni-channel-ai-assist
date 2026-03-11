import type { KbFeedback, ChatMessage } from "@shared/schema";

const KB_FEEDBACK_KEY = "vf-kb-feedback";
const CHAT_HISTORY_KEY = "vf-chat-history";

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
