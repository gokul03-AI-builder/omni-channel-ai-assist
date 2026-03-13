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
