import { useState, useRef, useEffect } from "react";
import {
  Mail, Search, Star, StarOff, Inbox, Send, Archive, Trash2,
  Paperclip, RefreshCw, Plus, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Link, Image, Code, Sparkles, Languages, Bot,
  UserCircle, Clock, Tag, User, Phone, Globe, CheckCircle2,
  Reply, ReplyAll, Forward, Copy, Ticket, Building2, CalendarDays,
  Hash, Zap, ChevronLeft, BookOpen, ChevronDown, ChevronUp,
  MapPin, Briefcase, ShieldCheck, PenLine, Lock, Cpu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

type EmailStatus   = "open" | "pending" | "resolved" | "closed" | "in_progress";
type EmailPriority = "low" | "medium" | "high" | "urgent";

interface EmailMessage {
  id: string; from: string; fromEmail: string;
  to: string[]; cc?: string[]; body: string;
  timestamp: string; isAgent: boolean;
}

interface EmailThread {
  id: string; subject: string; ticketId: string;
  customerName: string; customerEmail: string; customerCompany: string;
  customerPhone: string; customerAccountType: string; customerLocation: string;
  customerSince: string;
  avatarInitials: string; avatarColor: string;
  status: EmailStatus; priority: EmailPriority;
  category: string; assignee: string; tags: string[];
  createdAt: string; updatedAt: string; slaDeadline: string;
  starred: boolean; unread: boolean; messages: EmailMessage[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const aiDraftSuggestion = (t: EmailThread) =>
  `Hi ${t.customerName.split(" ")[0]},\n\nThank you for contacting Verifone Support. I've reviewed your case (${t.ticketId}) regarding "${t.subject}".\n\nI'm currently investigating this issue and will provide you with a resolution as quickly as possible. In the meantime, could you please confirm:\n1. The exact model and serial number of the affected terminal(s)\n2. Any recent changes made before the issue started\n3. Whether you've tried restarting the device\n\nI'll follow up within 2 hours.\n\nBest regards,\nVerifone Support Team`;

const emailThreads: EmailThread[] = [
  {
    id: "em-001", ticketId: "TKT-4821",
    subject: "P400 terminal not accepting contactless payments",
    customerName: "Sarah Chen", customerEmail: "sarah.chen@goldenwok.com",
    customerPhone: "+1 (415) 555-0142", customerCompany: "Golden Wok Restaurant",
    customerAccountType: "Premium", customerLocation: "San Francisco, CA", customerSince: "Mar 2023",
    avatarInitials: "SC", avatarColor: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    status: "open", priority: "urgent", category: "Hardware Issue",
    assignee: "Priya Sharma", tags: ["contactless", "P400", "urgent"],
    createdAt: "2026-03-17T08:30:00Z", updatedAt: "2026-03-17T09:15:00Z",
    slaDeadline: "2026-03-17T12:30:00Z", starred: true, unread: true,
    messages: [
      { id: "msg-1a", from: "Sarah Chen", fromEmail: "sarah.chen@goldenwok.com", to: ["support@verifone.com"], body: "Hi,\n\nOur P400 terminal has stopped accepting contactless payments since this morning. Tap-to-pay and Apple Pay are both failing. Chip and swipe still work. This is affecting our lunch rush significantly.\n\nTerminal serial: P400-SN-884721\nSoftware version: 5.4.2\n\nPlease help urgently.\n\nBest,\nSarah Chen\nGolden Wok Restaurant", timestamp: "2026-03-17T08:30:00Z", isAgent: false },
      { id: "msg-1b", from: "Priya Sharma", fromEmail: "priya.sharma@verifone.com", to: ["sarah.chen@goldenwok.com"], body: "Hi Sarah,\n\nThank you for contacting Verifone support. I've picked up your case (TKT-4821) and will help resolve this immediately.\n\nPlease try:\n1. Restart the terminal (hold power for 5 seconds)\n2. Navigate to Settings > Contactless > Re-enable NFC\n3. Run a test tap with a contactless card\n\nBest regards,\nPriya Sharma | Verifone Support", timestamp: "2026-03-17T09:15:00Z", isAgent: true },
    ],
  },
  {
    id: "em-002", ticketId: "TKT-4819",
    subject: "V240m Wi-Fi configuration not saving after reboot",
    customerName: "Michael Rodriguez", customerEmail: "m.rodriguez@urbanstyle.com",
    customerPhone: "+1 (212) 555-0387", customerCompany: "Urban Style Boutique",
    customerAccountType: "Enterprise", customerLocation: "New York, NY", customerSince: "Aug 2022",
    avatarInitials: "MR", avatarColor: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    status: "in_progress", priority: "high", category: "Network & Connectivity",
    assignee: "Gokul Nath", tags: ["V240m", "wifi", "config"],
    createdAt: "2026-03-16T14:00:00Z", updatedAt: "2026-03-17T08:00:00Z",
    slaDeadline: "2026-03-17T18:00:00Z", starred: false, unread: true,
    messages: [
      { id: "msg-2a", from: "Michael Rodriguez", fromEmail: "m.rodriguez@urbanstyle.com", to: ["support@verifone.com"], body: "Hello Support,\n\nWe have 3 V240m terminals at our flagship store. Every time we reboot them, the Wi-Fi settings reset to factory and we have to reconfigure manually.\n\nWe're on firmware 2.1.5. Is there a known bug for this?\n\nThanks,\nMichael", timestamp: "2026-03-16T14:00:00Z", isAgent: false },
    ],
  },
  {
    id: "em-003", ticketId: "TKT-4815",
    subject: "e285 batch processing failing — error code E_BATCH_408",
    customerName: "Emma Thompson", customerEmail: "emma@brewcraft.co",
    customerPhone: "+1 (503) 555-0219", customerCompany: "BrewCraft Coffee Chain",
    customerAccountType: "Enterprise", customerLocation: "Portland, OR", customerSince: "Nov 2021",
    avatarInitials: "ET", avatarColor: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    status: "pending", priority: "high", category: "Software / Firmware",
    assignee: "Priya Sharma", tags: ["e285", "batch", "error"],
    createdAt: "2026-03-15T10:00:00Z", updatedAt: "2026-03-16T16:00:00Z",
    slaDeadline: "2026-03-18T10:00:00Z", starred: false, unread: false,
    messages: [
      { id: "msg-3a", from: "Emma Thompson", fromEmail: "emma@brewcraft.co", to: ["support@verifone.com"], body: "Hi,\n\nAll our e285 terminals are failing end-of-day batch processing with error E_BATCH_408. Started after the firmware update pushed last Tuesday.\n\nWe have 12 locations affected. Please escalate.\n\nEmma Thompson\nBrewCraft Coffee Chain — IT Director", timestamp: "2026-03-15T10:00:00Z", isAgent: false },
      { id: "msg-3b", from: "Priya Sharma", fromEmail: "priya.sharma@verifone.com", to: ["emma@brewcraft.co"], cc: ["l2support@verifone.com"], body: "Hi Emma,\n\nI've escalated this to our L2 firmware team. Error E_BATCH_408 relates to a known issue in firmware 3.2.1 affecting batch settlement timing.\n\nA hotfix patch is being prepared. ETA: 48 hours.\n\nPriya", timestamp: "2026-03-16T16:00:00Z", isAgent: true },
    ],
  },
  {
    id: "em-004", ticketId: "TKT-4812",
    subject: "VX520 display showing corrupted text on receipt screen",
    customerName: "David Kim", customerEmail: "dkim@quickfuel.net",
    customerPhone: "+1 (713) 555-0456", customerCompany: "QuickFuel Gas Stations",
    customerAccountType: "Premium", customerLocation: "Houston, TX", customerSince: "Jan 2023",
    avatarInitials: "DK", avatarColor: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    status: "resolved", priority: "medium", category: "Hardware Issue",
    assignee: "Gokul Nath", tags: ["VX520", "display", "receipt"],
    createdAt: "2026-03-14T09:00:00Z", updatedAt: "2026-03-17T07:00:00Z",
    slaDeadline: "2026-03-16T09:00:00Z", starred: false, unread: false,
    messages: [
      { id: "msg-4a", from: "David Kim", fromEmail: "dkim@quickfuel.net", to: ["support@verifone.com"], body: "The receipt screen on 2 of our VX520 units is showing corrupted/garbled text. Transactions complete fine but the customer-facing display is unreadable.\n\nDavid Kim\nQuickFuel", timestamp: "2026-03-14T09:00:00Z", isAgent: false },
      { id: "msg-4b", from: "Gokul Nath", fromEmail: "gokul.nath@verifone.com", to: ["dkim@quickfuel.net"], body: "Hi David,\n\nResolved by clearing the font cache: Settings > Maintenance > Reset Display Cache. Please confirm if the issue is resolved.\n\nBest,\nGokul", timestamp: "2026-03-17T07:00:00Z", isAgent: true },
    ],
  },
  {
    id: "em-005", ticketId: "TKT-4808",
    subject: "Requesting bulk replacement quote for 50 MX915 units",
    customerName: "Michael Rodriguez", customerEmail: "m.rodriguez@urbanstyle.com",
    customerPhone: "+1 (212) 555-0387", customerCompany: "Urban Style Boutique",
    customerAccountType: "Enterprise", customerLocation: "New York, NY", customerSince: "Aug 2022",
    avatarInitials: "MR", avatarColor: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    status: "open", priority: "low", category: "Sales & Procurement",
    assignee: "Unassigned", tags: ["MX915", "quote", "bulk"],
    createdAt: "2026-03-13T11:00:00Z", updatedAt: "2026-03-13T11:00:00Z",
    slaDeadline: "2026-03-20T11:00:00Z", starred: false, unread: false,
    messages: [
      { id: "msg-5a", from: "Michael Rodriguez", fromEmail: "m.rodriguez@urbanstyle.com", to: ["sales@verifone.com"], body: "Hi,\n\nLooking to replace our aging MX915 PIN pad fleet across 8 store locations (~50 units). Could you send a volume pricing quote?\n\nMichael Rodriguez\nUrban Style Boutique", timestamp: "2026-03-13T11:00:00Z", isAgent: false },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<EmailStatus, { label: string; color: string }> = {
  open:        { label: "Open",        color: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400" },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" },
  pending:     { label: "Pending",     color: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400" },
  resolved:    { label: "Resolved",    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" },
  closed:      { label: "Closed",      color: "bg-muted text-muted-foreground" },
};

const priorityConfig: Record<EmailPriority, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400" },
  high:   { label: "High",   color: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400" },
  low:    { label: "Low",    color: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400" },
};

const categories = ["Hardware Issue", "Network & Connectivity", "Software / Firmware", "Sales & Procurement", "Billing", "Account Management", "Integration", "Other"];
const agents = ["Priya Sharma", "Gokul Nath", "Alex Chen", "Riya Patel", "Unassigned"];
const languages = ["Spanish", "French", "German", "Japanese", "Mandarin", "Portuguese", "Arabic", "Hindi"];

const kbArticles = [
  { id: "kb-1", title: "P400: Contactless NFC troubleshooting guide", relevance: 97, preview: "Step-by-step guide to diagnose and resolve NFC/contactless payment failures on P400 terminals. Covers firmware checks, NFC re-enable steps, and antenna diagnostics.", tags: ["P400", "NFC", "contactless"] },
  { id: "kb-2", title: "Re-enabling NFC after firmware update", relevance: 91, preview: "When firmware is updated, NFC may be disabled by default. Navigate to Settings > Contactless > NFC Settings and toggle the Enable NFC switch.", tags: ["firmware", "NFC"] },
  { id: "kb-3", title: "V240m Wi-Fi configuration persistence fix", relevance: 88, preview: "Known issue in V240m firmware 2.1.x: Wi-Fi credentials do not persist across reboots. Apply patch KB-V240M-218 to resolve.", tags: ["V240m", "wifi"] },
  { id: "kb-4", title: "e285 batch error E_BATCH_408 — known issue", relevance: 95, preview: "Batch settlement failure with E_BATCH_408 affects firmware 3.2.1. Hotfix available. Do not attempt manual batch close.", tags: ["e285", "batch"] },
  { id: "kb-5", title: "VX520 display cache reset procedure", relevance: 84, preview: "Corrupted display characters are resolved by clearing the font cache: Settings > Maintenance > Reset Display Cache.", tags: ["VX520", "display"] },
];

// ─── Email-channel Device Info ────────────────────────────────────────────────

const emailDeviceInfo: Record<string, {
  model: string; serialNumber: string; deviceId: string; mid: string; tid: string;
  status: "active" | "maintenance" | "offline";
  softwareVersion: string; agentVersion: string;
  network: string; ipAddress: string; macAddress: string;
  lastHeartbeat: string; lastCommunication: string;
}> = {
  "em-001": { model: "Verifone P400", serialNumber: "P400-SN-884721", deviceId: "DEV-P400-001", mid: "MID-884721", tid: "TID-2201", status: "active", softwareVersion: "5.4.2", agentVersion: "3.1.0", network: "Wi-Fi", ipAddress: "192.168.1.42", macAddress: "AA:BB:CC:11:22:33", lastHeartbeat: "2026-03-17T09:00:00Z", lastCommunication: "2026-03-17T09:15:00Z" },
  "em-002": { model: "Verifone V240m", serialNumber: "V240M-SN-339821", deviceId: "DEV-V240M-003", mid: "MID-339821", tid: "TID-5503", status: "maintenance", softwareVersion: "2.1.5", agentVersion: "2.8.1", network: "Wi-Fi", ipAddress: "192.168.2.15", macAddress: "DD:EE:FF:44:55:66", lastHeartbeat: "2026-03-16T13:55:00Z", lastCommunication: "2026-03-16T14:00:00Z" },
  "em-003": { model: "Verifone e285", serialNumber: "E285-SN-221347", deviceId: "DEV-E285-012", mid: "MID-221347", tid: "TID-7712", status: "offline", softwareVersion: "3.2.1", agentVersion: "2.5.0", network: "4G LTE", ipAddress: "10.0.0.34", macAddress: "11:22:33:AA:BB:CC", lastHeartbeat: "2026-03-15T09:45:00Z", lastCommunication: "2026-03-15T10:00:00Z" },
  "em-004": { model: "Verifone VX520", serialNumber: "VX520-SN-112233", deviceId: "DEV-VX520-007", mid: "MID-112233", tid: "TID-3308", status: "active", softwareVersion: "4.8.3", agentVersion: "3.0.2", network: "Ethernet", ipAddress: "10.10.0.22", macAddress: "CC:DD:EE:77:88:99", lastHeartbeat: "2026-03-17T06:55:00Z", lastCommunication: "2026-03-17T07:00:00Z" },
  "em-005": { model: "Verifone MX915", serialNumber: "MX915-SN-998877", deviceId: "DEV-MX915-050", mid: "MID-998877", tid: "TID-1104", status: "active", softwareVersion: "3.6.0", agentVersion: "2.9.0", network: "USB", ipAddress: "—", macAddress: "—", lastHeartbeat: "2026-03-13T10:55:00Z", lastCommunication: "2026-03-13T11:00:00Z" },
};

const emailSupportTickets: Record<string, { id: string; subject: string; status: EmailStatus; resolution?: string }[]> = {
  "em-001": [
    { id: "TKT-4801", subject: "P400 paper jam issue", status: "resolved", resolution: "Replaced paper feeder assembly" },
    { id: "TKT-4793", subject: "NFC calibration request", status: "closed", resolution: "NFC antenna re-calibrated" },
  ],
  "em-002": [
    { id: "TKT-4790", subject: "V240m initial Wi-Fi setup", status: "closed" },
  ],
  "em-003": [
    { id: "TKT-4798", subject: "e285 OTA update failure", status: "resolved", resolution: "Cleared OTA queue, update completed" },
    { id: "TKT-4771", subject: "Terminal EOL replacement query", status: "closed" },
  ],
  "em-004": [
    { id: "TKT-4785", subject: "VX520 network timeout issues", status: "resolved", resolution: "Network timeout config updated" },
  ],
  "em-005": [
    { id: "TKT-4776", subject: "MX915 driver compatibility", status: "closed", resolution: "Updated POS driver to v8.2" },
  ],
};

const emailPastInteractions: Record<string, { id: string; topic: string; date: string; duration: string; resolution: string }[]> = {
  "em-001": [
    { id: "pi-1a", topic: "P400 EMV chip reader calibration", date: "Jan 15, 2026", duration: "22 min", resolution: "Recalibrated EMV reader via maintenance menu" },
    { id: "pi-1b", topic: "Contactless payment decline rate review", date: "Dec 8, 2025", duration: "35 min", resolution: "Reset NFC antenna, resolved intermittent declines" },
  ],
  "em-002": [
    { id: "pi-2a", topic: "V240m Wi-Fi dropout during peak hours", date: "Feb 20, 2026", duration: "18 min", resolution: "Updated to firmware 2.1.4, improved connectivity" },
  ],
  "em-003": [
    { id: "pi-3a", topic: "e285 firmware rollback after 3.2.0 issue", date: "Mar 1, 2026", duration: "45 min", resolution: "Rolled back to firmware 3.1.9, batch issue resolved" },
    { id: "pi-3b", topic: "e285 batch settlement timeout", date: "Jan 28, 2026", duration: "30 min", resolution: "Adjusted settlement window, no more timeouts" },
  ],
  "em-004": [
    { id: "pi-4a", topic: "VX520 receipt paper alignment", date: "Feb 5, 2026", duration: "12 min", resolution: "Replaced paper guide mechanism" },
  ],
  "em-005": [
    { id: "pi-5a", topic: "MX915 PIN pad keypad sensitivity", date: "Feb 28, 2026", duration: "20 min", resolution: "Updated PIN pad firmware to 3.5.9" },
  ],
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function slaRemaining(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff < 0) return { label: "SLA Breached", urgent: true };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return { label: `${h}h ${m}m remaining`, urgent: h < 2 };
}

// ─── Inbox Screen ─────────────────────────────────────────────────────────────

function InboxScreen({ threads, onSelect, onToggleStar }: {
  threads: EmailThread[];
  onSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [inboxTab, setInboxTab] = useState<"all" | "unread" | "starred" | "open" | "resolved">("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const filtered = threads.filter(t => {
    if (inboxTab === "unread" && !t.unread) return false;
    if (inboxTab === "starred" && !t.starred) return false;
    if (inboxTab === "open" && t.status !== "open" && t.status !== "in_progress") return false;
    if (inboxTab === "resolved" && t.status !== "resolved" && t.status !== "closed") return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (assigneeFilter !== "all" && t.assignee.toLowerCase() !== assigneeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.subject.toLowerCase().includes(q) || t.customerName.toLowerCase().includes(q) || t.ticketId.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col p-2" data-testid="screen-inbox">
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border/20 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold">Email Inbox</h2>
              {threads.filter(t => t.unread).length > 0 && (
                <Badge className="text-[10px] px-1.5 h-4 bg-primary/15 text-primary">
                  {threads.filter(t => t.unread).length} unread
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toast({ title: "Refreshed" })} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors" data-testid="button-refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => toast({ title: "Compose", description: "New email compose window" })}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                data-testid="button-compose">
                <Plus className="w-3.5 h-3.5" /> Compose
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by subject, sender, or ticket ID..." className="pl-8 h-8 text-xs glass-input" data-testid="input-email-search" />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-8 text-xs w-[120px] glass-input border-border/30" data-testid="select-priority-filter"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-[130px] glass-input border-border/30" data-testid="select-status-filter"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="h-8 text-xs w-[130px] glass-input border-border/30" data-testid="select-assignee-filter"><SelectValue placeholder="Assignee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                {agents.filter(a => a !== "Unassigned").map(a => (
                  <SelectItem key={a} value={a.toLowerCase()}>{a}</SelectItem>
                ))}
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1 mt-3">
            {(["all", "unread", "starred", "open", "resolved"] as const).map(tab => (
              <button key={tab} onClick={() => setInboxTab(tab)}
                className={`text-xs px-3 py-1 rounded-full capitalize transition-colors ${inboxTab === tab ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-muted/30"}`}
                data-testid={`tab-inbox-${tab}`}>
                {tab === "all" ? `All (${threads.length})` : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[auto_2fr_1fr_1fr_120px_110px_80px] items-center px-5 py-2 border-b border-border/10 bg-muted/10 shrink-0">
          {["", "Subject / Customer", "Ticket", "Category", "Assignee", "Status", "Updated"].map((h, i) => (
            <span key={i} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
          ))}
        </div>

        <ScrollArea className="flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Inbox className="w-10 h-10 opacity-20" />
              <p className="text-sm">No emails match your filters</p>
            </div>
          ) : filtered.map(t => (
            <div key={t.id} onClick={() => onSelect(t.id)}
              className={`grid grid-cols-[auto_2fr_1fr_1fr_120px_110px_80px] items-center px-5 py-3 border-b border-border/10 cursor-pointer transition-colors hover:bg-primary/5 ${t.unread ? "bg-primary/[0.02]" : ""}`}
              data-testid={`row-email-${t.id}`}>
              <div className="flex items-center gap-2 pr-3">
                <button onClick={e => { e.stopPropagation(); onToggleStar(t.id); }}
                  className="text-muted-foreground hover:text-amber-400 transition-colors" data-testid={`button-star-${t.id}`}>
                  {t.starred ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <StarOff className="w-3.5 h-3.5" />}
                </button>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${t.avatarColor}`}>
                  {t.avatarInitials}
                </div>
              </div>
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  {t.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  <p className={`text-sm truncate ${t.unread ? "font-semibold" : "text-muted-foreground"}`}>{t.subject}</p>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{t.customerName} · {t.customerEmail}</p>
              </div>
              <div className="pr-4">
                <p className="text-[10px] font-mono text-muted-foreground">{t.ticketId}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityConfig[t.priority].color}`}>{priorityConfig[t.priority].label}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate pr-4">{t.category}</p>
              <p className="text-xs text-muted-foreground truncate pr-4">{t.assignee}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium w-fit ${statusConfig[t.status].color}`}>{statusConfig[t.status].label}</span>
              <p className="text-[10px] text-muted-foreground">{timeAgo(t.updatedAt)}</p>
            </div>
          ))}
        </ScrollArea>

        <div className="px-5 py-2 border-t border-border/10 bg-muted/5 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-muted-foreground">{filtered.length} of {threads.length} emails</span>
          <span className="text-[10px] text-muted-foreground">Click any row to open the conversation</span>
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: EmailMessage }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`flex gap-3 ${message.isAgent ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${message.isAgent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
        {message.isAgent ? "V" : message.from.split(" ").map(w => w[0]).join("").slice(0, 2)}
      </div>
      <div className={`flex-1 max-w-[80%] flex flex-col gap-1 ${message.isAgent ? "items-end" : ""}`}>
        <div className={`rounded-xl px-4 py-3 ${message.isAgent ? "bg-primary/10 border border-primary/20" : "bg-muted/50 border border-border/40"}`}>
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <span className="font-semibold text-xs">{message.from}</span>
              <span className="text-[10px] text-muted-foreground ml-2">{message.fromEmail}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-muted-foreground">{formatTime(message.timestamp)}</span>
              <button onClick={() => { navigator.clipboard.writeText(message.body); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          {message.cc && <p className="text-[10px] text-muted-foreground mb-2">CC: {message.cc.join(", ")}</p>}
          <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">{message.body}</pre>
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{formatDate(message.timestamp)}</span>
      </div>
    </div>
  );
}

// ─── Collapsible Section (benchmark: matches Chat / Calls exactly) ─────────────

function CollapsibleSection({ title, icon, open, onToggle, children }: {
  title: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/10 transition-colors" data-testid={`section-toggle-${title.toLowerCase()}`}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {icon} {title}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className={`text-sm text-foreground text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

// ─── Collapsible Block (for AI tab accordion — simple internal state) ──────────

function CollapsibleBlock({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center justify-between w-full text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground transition-colors group"
        data-testid={`section-toggle-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <span>{title}</span>
        {open
          ? <ChevronUp className="w-3 h-3 opacity-50 group-hover:opacity-100" />
          : <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />}
      </button>
      {open && children}
    </div>
  );
}

// ─── KB Article Card ──────────────────────────────────────────────────────────

function KBArticleCard({ article, onInsert }: { article: typeof kbArticles[0]; onInsert: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border border-border/30 bg-muted/10 hover:bg-primary/5 hover:border-primary/20 transition-colors" data-testid={`card-kb-${article.id}`}>
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-[10px] font-medium leading-relaxed flex-1">{article.title}</p>
          <span className="text-[9px] font-bold text-primary shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-full">{article.relevance}%</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {article.tags.map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">#{tag}</span>
          ))}
        </div>
        {expanded && (
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-2 p-2 rounded-md bg-background/50 border border-border/20">
            {article.preview}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button onClick={() => setExpanded(p => !p)} className="flex items-center gap-1 text-[9px] text-primary hover:underline" data-testid={`button-kb-expand-${article.id}`}>
            {expanded ? <><ChevronUp className="w-3 h-3" />Hide</> : <><ChevronDown className="w-3 h-3" />View article</>}
          </button>
          <button onClick={onInsert} className="text-[9px] text-muted-foreground hover:text-primary transition-colors" data-testid={`button-kb-insert-${article.id}`}>
            Insert in reply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Screen ────────────────────────────────────────────────────────────

function DetailScreen({ thread, onBack, onUpdateThread, onSendReply }: {
  thread: EmailThread;
  onBack: () => void;
  onUpdateThread: (updates: Partial<EmailThread>) => void;
  onSendReply: (body: string, to: string, cc: string) => void;
}) {
  const { toast } = useToast();
  const [replyText, setReplyText] = useState(() => aiDraftSuggestion(thread));
  const [isDraft, setIsDraft] = useState(true);
  const [replyTo, setReplyTo] = useState(thread.customerEmail);
  const [replyCc, setReplyCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [replyBcc, setReplyBcc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [replyMode, setReplyMode] = useState<"reply" | "note">("reply");
  const [aiQuery, setAiQuery] = useState("");
  const [aiChat, setAiChat] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const sla = slaRemaining(thread.slaDeadline);
  const [profileOpen, setProfileOpen] = useState(true);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const device = emailDeviceInfo[thread.id];
  const supportTickets = emailSupportTickets[thread.id] || [];
  const pastInteractions = emailPastInteractions[thread.id] || [];

  // Auto-resize textarea whenever replyText changes programmatically
  useEffect(() => {
    const el = replyRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [replyText]);

  const handleRephrase = () => {
    if (!replyText.trim()) { toast({ title: "Write something first" }); return; }
    setAiLoading(true);
    setTimeout(() => {
      setReplyText(`Thank you for reaching out to Verifone Support. I understand the urgency of your situation and want to assure you this is our top priority.\n\n${replyText}\n\nWe appreciate your patience and will ensure a swift resolution.\n\nBest regards,\nVerifone Support Team`);
      setAiLoading(false);
      setIsDraft(false);
      toast({ title: "Text rephrased by Wingman AI" });
    }, 1200);
  };

  const handleTranslate = (lang: string) => {
    setAiLoading(true);
    setTimeout(() => {
      setReplyText(`[Translated to ${lang}]\n\n${replyText}`);
      setAiLoading(false);
      setShowTranslate(false);
      toast({ title: `Translated to ${lang}` });
    }, 1200);
  };

  const handleSend = () => {
    if (!replyText.trim()) return;
    onSendReply(replyText, replyTo, replyCc);
    setReplyText("");
    setIsDraft(false);
  };

  const handleAiQuery = () => {
    if (!aiQuery.trim()) return;
    const q = aiQuery.trim();
    setAiChat(prev => [...prev, { role: "user", text: q }]);
    setAiQuery("");
    setAiChatLoading(true);
    setTimeout(() => {
      setAiChat(prev => [...prev, {
        role: "ai",
        text: `Based on the Verifone Knowledge Base: For "${q}", I recommend checking the relevant troubleshooting guide. The most common resolution involves verifying firmware version compatibility and running a soft reset on the affected terminal. Reference article: "${kbArticles[0].title}" (${kbArticles[0].relevance}% match).`,
      }]);
      setAiChatLoading(false);
    }, 1400);
  };

  return (
    <div className="h-full flex flex-col p-2 gap-2" data-testid="screen-detail">
      {/* Top bar */}
      <div className="glass-panel rounded-xl px-4 py-2 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="button-back-inbox">
          <ChevronLeft className="w-4 h-4" /> Back to Inbox
        </button>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-[10px] font-mono text-muted-foreground">{thread.ticketId}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig[thread.status].color}`}>{statusConfig[thread.status].label}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityConfig[thread.priority].color}`}>{priorityConfig[thread.priority].label}</span>
        <span className="flex-1 text-sm font-semibold truncate">{thread.subject}</span>
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => onUpdateThread({ starred: !thread.starred })} className="p-1.5 rounded-md hover:bg-muted/30 transition-colors" data-testid="button-star">
                  {thread.starred ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> : <StarOff className="w-4 h-4 text-muted-foreground" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{thread.starred ? "Unstar" : "Star"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => toast({ title: "Archived" })} className="p-1.5 rounded-md hover:bg-muted/30 transition-colors text-muted-foreground" data-testid="button-archive"><Archive className="w-4 h-4" /></button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Archive</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => toast({ title: "Forwarded" })} className="p-1.5 rounded-md hover:bg-muted/30 transition-colors text-muted-foreground" data-testid="button-forward"><Forward className="w-4 h-4" /></button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Forward</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => toast({ title: "Deleted" })} className="p-1.5 rounded-md hover:bg-muted/30 transition-colors text-muted-foreground" data-testid="button-delete"><Trash2 className="w-4 h-4" /></button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Delete</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Content row */}
      <div className="flex flex-1 gap-2 min-h-0">

        {/* Thread + Reply */}
        <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col min-w-0">
          <div className="px-5 py-3 border-b border-border/20 shrink-0">
            <h2 className="text-sm font-semibold mb-0.5">{thread.subject}</h2>
            <p className="text-xs text-muted-foreground">{thread.customerName} · {thread.customerEmail} · {thread.customerCompany}</p>
          </div>

          <ScrollArea className="flex-1 px-5 py-4">
            <div className="space-y-6">
              {thread.messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
            </div>
          </ScrollArea>

          {/* Reply composer */}
          <div className={`border-t px-4 py-3 shrink-0 space-y-2 ${replyMode === "note" ? "border-amber-300/30 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-500/5" : "border-border/20"}`}>
            {/* Mode toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/20 border border-border/20 w-fit">
              <button
                onClick={() => setReplyMode("reply")}
                className={`flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-md font-medium transition-colors ${replyMode === "reply" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="button-mode-reply"
              >
                <Reply className="w-3 h-3" />Reply
              </button>
              <button
                onClick={() => setReplyMode("note")}
                className={`flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-md font-medium transition-colors ${replyMode === "note" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="button-mode-note"
              >
                <Lock className="w-3 h-3" />Internal Note
              </button>
            </div>

            {/* Note mode info banner */}
            {replyMode === "note" && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 dark:text-amber-400">Internal note — visible only to your team, not sent to the customer.</p>
              </div>
            )}

            {/* Draft indicator */}
            {isDraft && replyMode === "reply" && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 dark:text-amber-400 flex-1">AI drafted a suggested reply — review, edit, and send when ready.</p>
                <button onClick={() => { setReplyText(""); setIsDraft(false); }} className="text-[10px] text-amber-600 hover:text-amber-800 font-medium">Clear</button>
              </div>
            )}

            {/* To/CC/BCC — reply mode only */}
            {replyMode === "reply" && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-7 shrink-0 font-medium">To</span>
                  <Input value={replyTo} onChange={e => setReplyTo(e.target.value)} className="h-6 text-xs glass-input flex-1" data-testid="input-reply-to" />
                  <button onClick={() => setShowCc(p => !p)} className="text-[10px] text-muted-foreground hover:text-primary">Cc</button>
                  <button onClick={() => setShowBcc(p => !p)} className="text-[10px] text-muted-foreground hover:text-primary">Bcc</button>
                </div>
                {showCc && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-7 shrink-0 font-medium">Cc</span>
                    <Input value={replyCc} onChange={e => setReplyCc(e.target.value)} placeholder="Add CC..." className="h-6 text-xs glass-input flex-1" data-testid="input-reply-cc" />
                  </div>
                )}
                {showBcc && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-7 shrink-0 font-medium">Bcc</span>
                    <Input value={replyBcc} onChange={e => setReplyBcc(e.target.value)} placeholder="Add BCC..." className="h-6 text-xs glass-input flex-1" data-testid="input-reply-bcc" />
                  </div>
                )}
              </div>
            )}

            {/* Formatting toolbar */}
            <div className="flex items-center gap-0.5 border border-border/20 rounded-lg px-2 py-1 bg-muted/10 flex-wrap">
              {[{ icon: Bold, id: "bold" }, { icon: Italic, id: "italic" }, { icon: Underline, id: "underline" }, { icon: Strikethrough, id: "strike" }].map(b => (
                <button key={b.id} className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-format-${b.id}`} onClick={() => replyRef.current?.focus()}>
                  <b.icon className="w-3.5 h-3.5" />
                </button>
              ))}
              <div className="w-px h-4 bg-border/40 mx-0.5" />
              {[{ icon: List, id: "bullet" }, { icon: ListOrdered, id: "number" }, { icon: Link, id: "link" }, { icon: Image, id: "image" }, { icon: Code, id: "code" }, { icon: Paperclip, id: "attach" }].map(b => (
                <button key={b.id} className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-format-${b.id}`}>
                  <b.icon className="w-3.5 h-3.5" />
                </button>
              ))}
              <div className="w-px h-4 bg-border/40 mx-0.5" />
              <button onClick={handleRephrase} disabled={aiLoading} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors text-[10px] font-medium" data-testid="button-ai-rephrase">
                <Sparkles className="w-3.5 h-3.5" />{aiLoading ? "..." : "Rephrase"}
              </button>
              <div className="relative">
                <button onClick={() => setShowTranslate(p => !p)} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors text-[10px] font-medium" data-testid="button-ai-translate">
                  <Languages className="w-3.5 h-3.5" />Translate
                </button>
                {showTranslate && (
                  <div className="absolute bottom-full left-0 mb-1 bg-popover border border-border/30 rounded-lg shadow-lg p-2 z-50 min-w-[140px]">
                    <p className="text-[10px] font-semibold mb-1 text-muted-foreground">Translate to:</p>
                    {languages.map(lang => (
                      <button key={lang} onClick={() => handleTranslate(lang)}
                        className="block w-full text-xs px-2 py-1 rounded hover:bg-primary/10 hover:text-primary text-left transition-colors" data-testid={`button-lang-${lang.toLowerCase()}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => { setReplyText("Thank you for contacting Verifone Support. I'd be happy to help you resolve this. Could you please confirm the terminal serial number and current firmware version?"); setIsDraft(false); toast({ title: "AI suggestion applied" }); }}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors text-[10px] font-medium" data-testid="button-ai-suggest">
                <Bot className="w-3.5 h-3.5" />Suggest
              </button>
            </div>

            <Textarea
              ref={replyRef}
              value={replyText}
              onChange={e => {
                setReplyText(e.target.value);
                setIsDraft(false);
                const el = e.target;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
              placeholder={replyMode === "note" ? "Add an internal note for your team..." : "Type your reply..."}
              className={`text-xs resize-none min-h-[90px] overflow-hidden transition-all duration-150 ${replyMode === "note" ? "glass-input border-amber-300/40 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5" : "glass-input"}`}
              data-testid="textarea-reply"
            />

            <div className="flex items-center justify-between">
              {replyMode === "reply" ? (
                <Select defaultValue="reply">
                  <SelectTrigger className="h-7 text-xs glass-input w-[110px]" data-testid="select-reply-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reply"><div className="flex items-center gap-1.5"><Reply className="w-3 h-3" />Reply</div></SelectItem>
                    <SelectItem value="reply-all"><div className="flex items-center gap-1.5"><ReplyAll className="w-3 h-3" />Reply All</div></SelectItem>
                    <SelectItem value="forward"><div className="flex items-center gap-1.5"><Forward className="w-3 h-3" />Forward</div></SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                  <Lock className="w-3 h-3" />Team-only note
                </div>
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => { setReplyText(""); setIsDraft(false); }} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/30 transition-colors" data-testid="button-discard-reply">Discard</button>
                <Button size="sm" onClick={handleSend} disabled={!replyText.trim()}
                  className={`h-7 text-xs px-4 ${replyMode === "note" ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                  data-testid="button-send-reply">
                  {replyMode === "note" ? <><PenLine className="w-3 h-3 mr-1" />Add Note</> : <><Send className="w-3 h-3 mr-1" />Send</>}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[350px] shrink-0 glass-panel rounded-xl overflow-hidden">
          <Tabs defaultValue="properties" className="flex flex-col h-full">
            <div className="px-3 pt-3 pb-2 shrink-0">
              <TabsList className="w-full glass-subtle">
                {[
                  { value: "properties", icon: Ticket, label: "Properties" },
                  { value: "customer", icon: UserCircle, label: "Info" },
                  { value: "kb", icon: BookOpen, label: "KB" },
                  { value: "ai", icon: Bot, label: "AI" },
                ].map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value}
                    className="flex-1 text-[10px]"
                    data-testid={`tab-${tab.value}`}>
                    <tab.icon className="w-3 h-3 mr-1" />{tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="relative flex-1 min-h-0">

            {/* ── Properties Tab ── */}
            <TabsContent value="properties" className="absolute inset-0 mt-0 overflow-hidden">
              <ScrollArea className="h-full px-0">
                <div className="p-3 space-y-4">

                  {/* Status — dropdown */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
                    <Select value={thread.status} onValueChange={v => { onUpdateThread({ status: v as EmailStatus }); toast({ title: `Status → ${statusConfig[v as EmailStatus].label}` }); }}>
                      <SelectTrigger className="h-8 text-xs glass-input" data-testid="select-status">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig[thread.status].color}`}>{statusConfig[thread.status].label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(statusConfig) as EmailStatus[]).map(s => (
                          <SelectItem key={s} value={s}>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig[s].color}`}>{statusConfig[s].label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority — dropdown */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Priority</p>
                    <Select value={thread.priority} onValueChange={v => { onUpdateThread({ priority: v as EmailPriority }); toast({ title: `Priority → ${v}` }); }}>
                      <SelectTrigger className="h-8 text-xs glass-input" data-testid="select-priority">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${priorityConfig[thread.priority].color}`}>{thread.priority}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {(["urgent", "high", "medium", "low"] as EmailPriority[]).map(p => (
                          <SelectItem key={p} value={p}>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${priorityConfig[p].color}`}>{p}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-border/20" />

                  {/* Ticket Details — category & assignee editable */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket Details</p>

                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[10px] text-muted-foreground w-16 shrink-0">Ticket ID</span>
                      <span className="text-[10px] font-mono font-medium flex-1 text-right">{thread.ticketId}</span>
                    </div>

                    {/* Category — editable */}
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[10px] text-muted-foreground w-16 shrink-0">Category</span>
                      <Select value={thread.category} onValueChange={v => { onUpdateThread({ category: v }); toast({ title: `Category updated` }); }}>
                        <SelectTrigger className="h-6 text-[10px] glass-input flex-1 border-border/30" data-testid="select-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assignee — editable */}
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[10px] text-muted-foreground w-16 shrink-0">Assignee</span>
                      <Select value={thread.assignee} onValueChange={v => { onUpdateThread({ assignee: v }); toast({ title: `Assigned to ${v}` }); }}>
                        <SelectTrigger className="h-6 text-[10px] glass-input flex-1 border-border/30" data-testid="select-assignee">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[10px] text-muted-foreground w-16 shrink-0">Created</span>
                      <span className="text-[10px] font-medium flex-1 text-right">{formatDate(thread.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[10px] text-muted-foreground w-16 shrink-0">Updated</span>
                      <span className="text-[10px] font-medium flex-1 text-right">{formatDate(thread.updatedAt)}</span>
                    </div>
                  </div>

                  <Separator className="bg-border/20" />

                  {/* SLA */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">SLA</p>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${sla.urgent ? "bg-red-50 dark:bg-red-500/10" : "bg-emerald-50 dark:bg-emerald-500/10"}`}>
                      <Clock className={`w-3.5 h-3.5 ${sla.urgent ? "text-red-500" : "text-emerald-500"}`} />
                      <span className={`text-[10px] font-medium ${sla.urgent ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>{sla.label}</span>
                    </div>
                  </div>

                  <Separator className="bg-border/20" />

                  {/* Tags */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {thread.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-border/30">#{tag}</span>
                      ))}
                      <button className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors" data-testid="button-add-tag">
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ── Customer Tab ── */}
            <TabsContent value="customer" className="absolute inset-0 mt-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-2">

                  {/* Profile */}
                  <CollapsibleSection title="Profile" icon={<UserCircle className="w-3.5 h-3.5" />} open={profileOpen} onToggle={() => setProfileOpen(!profileOpen)}>
                    <div className="space-y-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                          <Avatar className="h-16 w-16 border border-primary/20">
                            <AvatarFallback className={`bg-primary/10 text-primary font-semibold text-lg ${thread.avatarColor}`}>
                              {thread.avatarInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-status-online border-2 border-background" />
                        </div>
                        <div>
                          <h3 className="font-semibold" data-testid="text-email-customer-name">{thread.customerName}</h3>
                          <p className="text-sm text-muted-foreground">{thread.customerCompany}</p>
                        </div>
                        <Badge variant="default" className="text-xs">{thread.customerAccountType}</Badge>
                      </div>
                      <Separator className="bg-border/50" />
                      <div className="space-y-3">
                        <InfoRow label="Email" value={thread.customerEmail} />
                        <InfoRow label="Phone" value={thread.customerPhone} />
                        <InfoRow label="Location" value={thread.customerLocation} />
                        <InfoRow label="Member Since" value={thread.customerSince} />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Device */}
                  {device && (
                    <CollapsibleSection title="Device" icon={<Cpu className="w-3.5 h-3.5" />} open={deviceOpen} onToggle={() => setDeviceOpen(!deviceOpen)}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg glass-bubble-primary flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm" data-testid="text-email-device-model">{device.model}</h4>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${device.status === "active" ? "bg-status-online" : device.status === "maintenance" ? "bg-status-away" : "bg-status-offline"}`} />
                              <span className={`text-xs capitalize ${device.status === "active" ? "text-status-online" : device.status === "maintenance" ? "text-status-away" : "text-status-offline"}`}>{device.status}</span>
                            </div>
                          </div>
                        </div>
                        <Separator className="bg-border/50" />
                        <div className="space-y-3">
                          <InfoRow label="Serial Number" value={device.serialNumber} mono />
                          <InfoRow label="Device ID" value={device.deviceId} mono />
                          <InfoRow label="MID" value={device.mid} mono />
                          <InfoRow label="TID" value={device.tid} mono />
                        </div>
                        <Separator className="bg-border/50" />
                        <div className="space-y-3">
                          <InfoRow label="Software Version" value={device.softwareVersion} mono />
                          <InfoRow label="Agent Version" value={device.agentVersion} mono />
                        </div>
                        <Separator className="bg-border/50" />
                        <div className="space-y-3">
                          <InfoRow label="Network" value={device.network} />
                          <InfoRow label="IP Address" value={device.ipAddress} mono />
                          <InfoRow label="MAC Address" value={device.macAddress} mono />
                        </div>
                        <Separator className="bg-border/50" />
                        <div className="space-y-3">
                          <InfoRow label="Last Heartbeat" value={new Date(device.lastHeartbeat).toLocaleString()} />
                          <InfoRow label="Last Communication" value={new Date(device.lastCommunication).toLocaleString()} />
                        </div>
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* History */}
                  <CollapsibleSection title="History" icon={<Clock className="w-3.5 h-3.5" />} open={historyOpen} onToggle={() => setHistoryOpen(!historyOpen)}>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Support Tickets ({supportTickets.length})</h4>
                        <div className="space-y-2">
                          {supportTickets.map(ticket => (
                            <Card key={ticket.id} className="p-3" data-testid={`card-email-ticket-${ticket.id}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{ticket.subject}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className={`text-[10px] px-1.5 py-0 h-4 ${statusConfig[ticket.status].color}`}>{statusConfig[ticket.status].label}</Badge>
                                    <span className="text-[10px] text-muted-foreground">{ticket.id}</span>
                                  </div>
                                </div>
                              </div>
                              {ticket.resolution && (
                                <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-status-online shrink-0 mt-0.5" />
                                  {ticket.resolution}
                                </p>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                      {pastInteractions.length > 0 && (
                        <>
                          <Separator className="bg-border/50" />
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Past Interactions ({pastInteractions.length})</h4>
                            <div className="space-y-2">
                              {pastInteractions.map(pi => (
                                <Card key={pi.id} className="p-3" data-testid={`card-email-interaction-${pi.id}`}>
                                  <p className="text-xs font-medium">{pi.topic}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1">{pi.date} · {pi.duration}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{pi.resolution}</p>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CollapsibleSection>

                </div>
              </ScrollArea>
            </TabsContent>

            {/* ── KB Assist Tab ── */}
            <TabsContent value="kb" className="absolute inset-0 mt-0 overflow-hidden flex flex-col">
              <div className="px-3 pt-3 pb-2 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input placeholder="Search knowledge base..." className="pl-8 h-7 text-xs glass-input" data-testid="input-kb-search" />
                </div>
              </div>
              <ScrollArea className="flex-1 px-3 pb-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested Articles</p>
                <div className="space-y-2">
                  {kbArticles.map(a => (
                    <KBArticleCard key={a.id} article={a} onInsert={() => toast({ title: "Article added to reply" })} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ── AI Assist Tab ── */}
            <TabsContent value="ai" className="absolute inset-0 mt-0 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
                  {/* Summary */}
                  <CollapsibleBlock title="AI Summary">
                    <p className="text-[10px] text-muted-foreground leading-relaxed p-2.5 rounded-lg bg-primary/5 border border-primary/15">
                      Customer reports {thread.category.toLowerCase()} — ticket {thread.ticketId} is currently {statusConfig[thread.status].label.toLowerCase()} with {thread.priority} priority. {thread.messages.length} message{thread.messages.length !== 1 ? "s" : ""} in thread.
                    </p>
                  </CollapsibleBlock>
                  <Separator className="bg-border/20" />

                  {/* Sentiment */}
                  <CollapsibleBlock title="Sentiment">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-amber-400" style={{ width: "65%" }} />
                        </div>
                        <span className="text-[10px] font-medium text-amber-600">Frustrated</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[["Urgency", "High", "text-red-500"], ["Tone", "Formal", "text-amber-500"], ["Risk", "Medium", "text-orange-500"]].map(([l, v, c]) => (
                          <div key={l} className="text-center p-1.5 rounded bg-muted/20">
                            <p className="text-[10px] font-semibold">{l}</p>
                            <p className={`text-xs font-bold ${c}`}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleBlock>
                  <Separator className="bg-border/20" />

                  {/* Recommendations */}
                  <CollapsibleBlock title="Recommendations">
                    <div className="space-y-2">
                      {["Prioritise immediate resolution — customer is affected during business hours.", "SLA breach risk detected. Escalate to L2 if unresolved within 30 minutes.", "Consider offering a temporary workaround while investigating root cause."].map((s, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                          <Zap className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </CollapsibleBlock>
                  <Separator className="bg-border/20" />

                  {/* AI chat with KB */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ask Wingman AI</p>
                    <div className="space-y-2 mb-2 max-h-48 overflow-y-auto">
                      {aiChat.length === 0 && (
                        <p className="text-[10px] text-muted-foreground italic">Ask anything about this ticket or search the knowledge base...</p>
                      )}
                      {aiChat.map((msg, i) => (
                        <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`text-[10px] leading-relaxed p-2 rounded-lg max-w-[85%] ${msg.role === "ai" ? "bg-primary/5 border border-primary/15 text-foreground" : "bg-muted/50 text-foreground"}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {aiChatLoading && (
                        <div className="flex gap-1 p-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <Input value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAiQuery()}
                        placeholder="Ask about KB, troubleshooting..." className="h-7 text-xs glass-input flex-1" data-testid="input-ai-query" />
                      <button onClick={handleAiQuery} disabled={!aiQuery.trim() || aiChatLoading}
                        className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40" data-testid="button-ai-send">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            </div>{/* end relative flex-1 min-h-0 */}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EmailPage() {
  const { toast } = useToast();
  const { setOpen } = useSidebar();
  const [threads, setThreads] = useState(emailThreads);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedThread = threads.find(t => t.id === selectedId) ?? null;

  // Auto-close sidebar when entering detail view
  useEffect(() => {
    if (selectedId) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [selectedId]);

  const handleSelect = (id: string) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: false } : t));
    setSelectedId(id);
  };

  const handleBack = () => setSelectedId(null);

  const handleToggleStar = (id: string) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  };

  const handleUpdateThread = (updates: Partial<EmailThread>) => {
    setThreads(prev => prev.map(t => t.id === selectedId ? { ...t, ...updates } : t));
  };

  const handleSendReply = (body: string, to: string, cc: string) => {
    setThreads(prev => prev.map(t => {
      if (t.id !== selectedId) return t;
      const newMsg: EmailMessage = {
        id: `msg-${Date.now()}`, from: "Support Agent", fromEmail: "support@verifone.com",
        to: [to], cc: cc ? cc.split(",").map(s => s.trim()) : undefined,
        body, timestamp: new Date().toISOString(), isAgent: true,
      };
      return { ...t, messages: [...t.messages, newMsg], updatedAt: new Date().toISOString(), status: "in_progress" };
    }));
    toast({ title: "Reply sent", description: `Email sent to ${to}` });
  };

  if (selectedThread) {
    return (
      <DetailScreen
        thread={selectedThread}
        onBack={handleBack}
        onUpdateThread={handleUpdateThread}
        onSendReply={handleSendReply}
      />
    );
  }

  return (
    <InboxScreen
      threads={threads}
      onSelect={handleSelect}
      onToggleStar={handleToggleStar}
    />
  );
}
