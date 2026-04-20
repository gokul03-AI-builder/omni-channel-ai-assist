import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatarInitials: string;
  accountType: "Premium" | "Standard" | "Enterprise";
  location: string;
  joinedDate: string;
}

export interface DeviceInfo {
  serialNumber: string;
  model: string;
  deviceId: string | null;
  mid: string;
  tid: string | null;
  status: string;
  softwareVersion: string;
  agentVersion: string;
  lastHeartbeat: string;
  lastCommunication: string;
  network: string;
  ipAddress: string;
  macAddress: string | null;
  hierarchyId: string;
  hierarchyPath: string | null;
  refSetId: string | null;
  serviceId?: string | null;
  tunnelIp?: string | null;
  hardwareType?: string | null;
  contractType?: string | null;
  contractEndDate?: string | null;
  commanderApp?: string | null;
  commanderVersion?: string | null;
  connectionStatusCSit?: string | null;
}

export interface Call {
  id: string;
  customerId: string;
  customerName: string;
  status: "incoming" | "active" | "on-hold" | "ended";
  startTime: string;
  duration: number;
  topic: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export interface TranscriptEntry {
  id: string;
  callId: string;
  speaker: "customer" | "agent";
  text: string;
  timestamp: string;
}

export interface AISuggestion {
  id: string;
  title: string;
  content: string;
  fullContent: string;
  source: string;
  confidence: number;
  category: string;
  references?: { label: string; url: string }[];
  suggestedResponse?: string;
}

export interface KbFeedback {
  id: string;
  suggestionId: string;
  suggestionTitle: string;
  source: string;
  vote: "up" | "down";
  timestamp: string;
  callTopic?: string;
  channel?: "calls" | "chats" | "email";
}

export interface ChatMessage {
  id: string;
  sender: "agent" | "ai";
  text: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  subject: string;
  status: "open" | "closed" | "pending" | "escalated";
  createdAt: string;
  priority: "low" | "medium" | "high";
  resolution?: string;
}

export interface PastCall {
  id: string;
  date: string;
  duration: number;
  topic: string;
  resolution: string;
}

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  customerInitials: string;
  status: "waiting" | "active" | "on-hold" | "closed";
  channel: "web" | "email" | "whatsapp" | "sms";
  priority: "low" | "medium" | "high" | "urgent";
  startTime: string;
  lastMessageTime: string;
  topic: string;
  unreadCount: number;
  waitTimeSec: number;
  slaDeadlineSec: number;
}

export interface ChatConversationMessage {
  id: string;
  sessionId: string;
  sender: "customer" | "agent" | "system";
  text: string;
  timestamp: string;
  isInternal?: boolean;
}

export interface ClosedChatSummary {
  id: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  channel: string;
  topic: string;
  duration: number;
  messageCount: number;
  closedAt: string;
  ticketCreated?: string;
}

export interface CallHistoryRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  date: string;
  duration: number;
  topic: string;
  outcome: "resolved" | "escalated" | "follow-up" | "unresolved";
  summary: string;
  agentNotes: string;
  transcriptHighlights: string[];
  resolution: string;
  agentName: string;
}

export interface RLKbLink {
  id: string;
  title: string;
  source: string;
  url?: string;
}

export interface RLSession {
  id: string;
  channel: "calls" | "chats";
  customerName: string;
  customerCompany: string;
  agentName: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
  topic: string;
  issueSummary: string;
  aiResolution: string;
  agentResolution: string;
  editedAiResolution?: string;
  kbLinks: RLKbLink[];
}

export interface ChatHistoryRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  date: string;
  channel: "web" | "email" | "whatsapp" | "sms";
  topic: string;
  outcome: "resolved" | "escalated" | "follow-up" | "unresolved";
  summary: string;
  agentNotes: string;
  messages: { sender: "customer" | "agent"; text: string; time: string }[];
  resolution: string;
  agentName: string;
  messageCount: number;
}
