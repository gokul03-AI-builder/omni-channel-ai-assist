import { useState, useRef } from "react";
import {
  Mail, Search, Star, StarOff, Inbox, Send, Archive, Trash2,
  Paperclip, RefreshCw, Plus, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Link, Image, Code, Sparkles, Languages, Bot,
  UserCircle, Clock, Tag, User, Phone, Globe, CheckCircle2, Circle,
  Reply, ReplyAll, Forward, Copy, SlidersHorizontal, Ticket,
  Building2, CalendarDays, Hash, Flag, Zap, ArrowLeft, BookOpen,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────

type EmailStatus = "open" | "pending" | "resolved" | "closed" | "in_progress";
type EmailPriority = "low" | "medium" | "high" | "urgent";

interface EmailMessage {
  id: string;
  from: string;
  fromEmail: string;
  to: string[];
  cc?: string[];
  body: string;
  timestamp: string;
  isAgent: boolean;
}

interface EmailThread {
  id: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  customerPhone: string;
  customerAccountType: string;
  customerLocation: string;
  avatarInitials: string;
  avatarColor: string;
  status: EmailStatus;
  priority: EmailPriority;
  category: string;
  assignee: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  ticketId: string;
  starred: boolean;
  unread: boolean;
  messages: EmailMessage[];
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const emailThreads: EmailThread[] = [
  {
    id: "em-001", ticketId: "TKT-4821",
    subject: "P400 terminal not accepting contactless payments",
    customerName: "Sarah Chen", customerEmail: "sarah.chen@goldenwok.com",
    customerPhone: "+1 (415) 555-0142", customerCompany: "Golden Wok Restaurant",
    customerAccountType: "Premium", customerLocation: "San Francisco, CA",
    avatarInitials: "SC", avatarColor: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    status: "open", priority: "urgent", category: "Hardware Issue",
    assignee: "Priya Sharma", tags: ["contactless", "P400", "urgent"],
    createdAt: "2026-03-17T08:30:00Z", updatedAt: "2026-03-17T09:15:00Z",
    slaDeadline: "2026-03-17T12:30:00Z", starred: true, unread: true,
    messages: [
      { id: "msg-1a", from: "Sarah Chen", fromEmail: "sarah.chen@goldenwok.com", to: ["support@verifone.com"], body: "Hi,\n\nOur P400 terminal has stopped accepting contactless payments since this morning. Tap-to-pay and Apple Pay are both failing. Chip and swipe still work. This is affecting our lunch rush significantly.\n\nTerminal serial: P400-SN-884721\nSoftware version: 5.4.2\n\nPlease help urgently.\n\nBest,\nSarah Chen\nGolden Wok Restaurant", timestamp: "2026-03-17T08:30:00Z", isAgent: false },
      { id: "msg-1b", from: "Priya Sharma", fromEmail: "priya.sharma@verifone.com", to: ["sarah.chen@goldenwok.com"], body: "Hi Sarah,\n\nThank you for contacting Verifone support. I've picked up your case (TKT-4821) and will help you resolve this immediately.\n\nCould you please try the following steps?\n1. Restart the terminal (hold power for 5 seconds)\n2. Navigate to Settings > Contactless > Re-enable NFC\n3. Run a test tap with a contactless card\n\nPlease let me know the outcome.\n\nBest regards,\nPriya Sharma | Verifone Support", timestamp: "2026-03-17T09:15:00Z", isAgent: true },
    ],
  },
  {
    id: "em-002", ticketId: "TKT-4819",
    subject: "V240m Wi-Fi configuration not saving after reboot",
    customerName: "Michael Rodriguez", customerEmail: "m.rodriguez@urbanstyle.com",
    customerPhone: "+1 (212) 555-0387", customerCompany: "Urban Style Boutique",
    customerAccountType: "Enterprise", customerLocation: "New York, NY",
    avatarInitials: "MR", avatarColor: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    status: "in_progress", priority: "high", category: "Network & Connectivity",
    assignee: "Gokul Nath", tags: ["V240m", "wifi", "config"],
    createdAt: "2026-03-16T14:00:00Z", updatedAt: "2026-03-17T08:00:00Z",
    slaDeadline: "2026-03-17T18:00:00Z", starred: false, unread: true,
    messages: [
      { id: "msg-2a", from: "Michael Rodriguez", fromEmail: "m.rodriguez@urbanstyle.com", to: ["support@verifone.com"], body: "Hello Support,\n\nWe have 3 V240m terminals at our flagship store. Every time we reboot them, the Wi-Fi settings reset to factory and we have to reconfigure manually. This is happening across all 3 units.\n\nWe're on firmware 2.1.5. Is there a known bug for this?\n\nThanks,\nMichael", timestamp: "2026-03-16T14:00:00Z", isAgent: false },
    ],
  },
  {
    id: "em-003", ticketId: "TKT-4815",
    subject: "e285 batch processing failing — error code E_BATCH_408",
    customerName: "Emma Thompson", customerEmail: "emma@brewcraft.co",
    customerPhone: "+1 (503) 555-0219", customerCompany: "BrewCraft Coffee Chain",
    customerAccountType: "Enterprise", customerLocation: "Portland, OR",
    avatarInitials: "ET", avatarColor: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    status: "pending", priority: "high", category: "Software / Firmware",
    assignee: "Priya Sharma", tags: ["e285", "batch", "error"],
    createdAt: "2026-03-15T10:00:00Z", updatedAt: "2026-03-16T16:00:00Z",
    slaDeadline: "2026-03-18T10:00:00Z", starred: false, unread: false,
    messages: [
      { id: "msg-3a", from: "Emma Thompson", fromEmail: "emma@brewcraft.co", to: ["support@verifone.com"], body: "Hi,\n\nAll our e285 terminals are failing end-of-day batch processing with error E_BATCH_408. This started after the firmware update pushed last Tuesday.\n\nWe have 12 locations affected. Please escalate immediately.\n\nEmma Thompson\nBrewCraft Coffee Chain — IT Director", timestamp: "2026-03-15T10:00:00Z", isAgent: false },
      { id: "msg-3b", from: "Priya Sharma", fromEmail: "priya.sharma@verifone.com", to: ["emma@brewcraft.co"], cc: ["l2support@verifone.com"], body: "Hi Emma,\n\nI've escalated this to our L2 firmware team. Error E_BATCH_408 relates to a known issue in firmware 3.2.1 affecting batch settlement timing.\n\nA hotfix patch is being prepared. ETA: 48 hours. I'll send the patch download link as soon as it's available.\n\nApologies for the inconvenience.\n\nPriya", timestamp: "2026-03-16T16:00:00Z", isAgent: true },
    ],
  },
  {
    id: "em-004", ticketId: "TKT-4812",
    subject: "VX520 display showing corrupted text on receipt screen",
    customerName: "David Kim", customerEmail: "dkim@quickfuel.net",
    customerPhone: "+1 (713) 555-0456", customerCompany: "QuickFuel Gas Stations",
    customerAccountType: "Premium", customerLocation: "Houston, TX",
    avatarInitials: "DK", avatarColor: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    status: "resolved", priority: "medium", category: "Hardware Issue",
    assignee: "Gokul Nath", tags: ["VX520", "display", "receipt"],
    createdAt: "2026-03-14T09:00:00Z", updatedAt: "2026-03-17T07:00:00Z",
    slaDeadline: "2026-03-16T09:00:00Z", starred: false, unread: false,
    messages: [
      { id: "msg-4a", from: "David Kim", fromEmail: "dkim@quickfuel.net", to: ["support@verifone.com"], body: "The receipt screen on 2 of our VX520 units is showing corrupted/garbled text. The transactions complete fine but the customer-facing display is unreadable.\n\nDavid Kim\nQuickFuel", timestamp: "2026-03-14T09:00:00Z", isAgent: false },
      { id: "msg-4b", from: "Gokul Nath", fromEmail: "gokul.nath@verifone.com", to: ["dkim@quickfuel.net"], body: "Hi David,\n\nThis was resolved by clearing the font cache: Settings > Maintenance > Reset Display Cache. Please confirm if the issue is resolved on your end.\n\nBest,\nGokul", timestamp: "2026-03-17T07:00:00Z", isAgent: true },
    ],
  },
  {
    id: "em-005", ticketId: "TKT-4808",
    subject: "Requesting bulk replacement quote for 50 MX915 units",
    customerName: "Michael Rodriguez", customerEmail: "m.rodriguez@urbanstyle.com",
    customerPhone: "+1 (212) 555-0387", customerCompany: "Urban Style Boutique",
    customerAccountType: "Enterprise", customerLocation: "New York, NY",
    avatarInitials: "MR", avatarColor: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    status: "open", priority: "low", category: "Sales & Procurement",
    assignee: "Unassigned", tags: ["MX915", "quote", "bulk"],
    createdAt: "2026-03-13T11:00:00Z", updatedAt: "2026-03-13T11:00:00Z",
    slaDeadline: "2026-03-20T11:00:00Z", starred: false, unread: false,
    messages: [
      { id: "msg-5a", from: "Michael Rodriguez", fromEmail: "m.rodriguez@urbanstyle.com", to: ["sales@verifone.com"], body: "Hi,\n\nWe are looking to replace our aging MX915 PIN pad fleet across 8 store locations. Approximately 50 units total. Could you please send a volume pricing quote?\n\nWe are an existing Enterprise customer.\n\nMichael Rodriguez\nUrban Style Boutique", timestamp: "2026-03-13T11:00:00Z", isAgent: false },
    ],
  },
  {
    id: "em-006", ticketId: "TKT-4803",
    subject: "UX300 printer not printing EMV receipts",
    customerName: "Sarah Chen", customerEmail: "sarah.chen@goldenwok.com",
    customerPhone: "+1 (415) 555-0142", customerCompany: "Golden Wok Restaurant",
    customerAccountType: "Premium", customerLocation: "San Francisco, CA",
    avatarInitials: "SC", avatarColor: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    status: "closed", priority: "low", category: "Hardware Issue",
    assignee: "Priya Sharma", tags: ["UX300", "printer", "receipt"],
    createdAt: "2026-03-10T13:00:00Z", updatedAt: "2026-03-12T09:00:00Z",
    slaDeadline: "2026-03-12T13:00:00Z", starred: false, unread: false,
    messages: [
      { id: "msg-6a", from: "Sarah Chen", fromEmail: "sarah.chen@goldenwok.com", to: ["support@verifone.com"], body: "Our UX300 printer stopped printing receipts after the latest firmware update. No error shown on screen — it just silently fails.\n\nSarah Chen", timestamp: "2026-03-10T13:00:00Z", isAgent: false },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<EmailStatus, { label: string; color: string }> = {
  open:        { label: "Open",        color: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400" },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" },
  pending:     { label: "Pending",     color: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400" },
  resolved:    { label: "Resolved",    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" },
  closed:      { label: "Closed",      color: "bg-muted text-muted-foreground" },
};

const priorityConfig: Record<EmailPriority, { label: string; color: string; dot: string }> = {
  urgent: { label: "Urgent", color: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",       dot: "bg-red-500" },
  high:   { label: "High",   color: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400", dot: "bg-orange-500" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400", dot: "bg-yellow-500" },
  low:    { label: "Low",    color: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400", dot: "bg-slate-400" },
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

const kbArticles = [
  { id: "kb-1", title: "P400: Contactless NFC troubleshooting guide", relevance: 97 },
  { id: "kb-2", title: "Re-enabling NFC after firmware update", relevance: 91 },
  { id: "kb-3", title: "V240m Wi-Fi configuration persistence fix", relevance: 88 },
  { id: "kb-4", title: "e285 batch error E_BATCH_408 — known issue", relevance: 95 },
  { id: "kb-5", title: "VX520 display cache reset procedure", relevance: 84 },
];

const languages = ["Spanish", "French", "German", "Japanese", "Mandarin", "Portuguese", "Arabic", "Hindi"];

// ─── Inbox Screen ─────────────────────────────────────────────────────────────

function InboxScreen({
  threads, onSelect, onToggleStar,
}: {
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

  const unreadCount = threads.filter(t => t.unread).length;

  return (
    <div className="h-full flex flex-col p-2" data-testid="screen-inbox">
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1">

        {/* Header */}
        <div className="px-5 py-3 border-b border-border/20 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold">Email Inbox</h2>
              {unreadCount > 0 && (
                <Badge className="text-[10px] px-1.5 h-4 bg-primary/15 text-primary">{unreadCount} unread</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toast({ title: "Refreshed" })}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                data-testid="button-refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => toast({ title: "Compose", description: "New email compose window" })}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                data-testid="button-compose"
              >
                <Plus className="w-3.5 h-3.5" /> Compose
              </button>
            </div>
          </div>

          {/* Toolbar row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by subject, sender, or ticket ID..."
                className="pl-8 h-8 text-xs glass-input"
                data-testid="input-email-search"
              />
            </div>
            {/* Filter dropdowns */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-8 text-xs w-[120px] glass-input border-border/30" data-testid="select-priority-filter">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-[130px] glass-input border-border/30" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
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
              <SelectTrigger className="h-8 text-xs w-[130px] glass-input border-border/30" data-testid="select-assignee-filter">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                <SelectItem value="priya sharma">Priya Sharma</SelectItem>
                <SelectItem value="gokul nath">Gokul Nath</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tab pills */}
          <div className="flex gap-1 mt-3">
            {(["all", "unread", "starred", "open", "resolved"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setInboxTab(tab)}
                className={`text-xs px-3 py-1 rounded-full capitalize transition-colors ${inboxTab === tab ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-muted/30"}`}
                data-testid={`tab-inbox-${tab}`}
              >
                {tab === "all" ? `All (${threads.length})` : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[auto_2fr_1fr_1fr_120px_100px_80px] items-center px-5 py-2 border-b border-border/10 bg-muted/10 shrink-0">
          {["", "Subject / Customer", "Ticket", "Category", "Assignee", "Status", "Updated"].map((h, i) => (
            <span key={i} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</span>
          ))}
        </div>

        {/* Email rows */}
        <ScrollArea className="flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Inbox className="w-10 h-10 opacity-20" />
              <p className="text-sm">No emails match your filters</p>
            </div>
          ) : (
            filtered.map(t => (
              <div
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={`grid grid-cols-[auto_2fr_1fr_1fr_120px_100px_80px] items-center px-5 py-3 border-b border-border/10 cursor-pointer transition-colors hover:bg-primary/5 ${t.unread ? "bg-primary/[0.02]" : ""}`}
                data-testid={`row-email-${t.id}`}
              >
                {/* Avatar + star */}
                <div className="flex items-center gap-2 pr-3">
                  <button
                    onClick={e => { e.stopPropagation(); onToggleStar(t.id); }}
                    className="text-muted-foreground hover:text-amber-400 transition-colors"
                    data-testid={`button-star-${t.id}`}
                  >
                    {t.starred
                      ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      : <StarOff className="w-3.5 h-3.5" />}
                  </button>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${t.avatarColor}`}>
                    {t.avatarInitials}
                  </div>
                </div>

                {/* Subject / Customer */}
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    {t.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    <p className={`text-sm truncate ${t.unread ? "font-semibold" : "text-muted-foreground"}`}>{t.subject}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{t.customerName} · {t.customerEmail}</p>
                </div>

                {/* Ticket ID + priority */}
                <div className="pr-4">
                  <p className="text-[10px] font-mono text-muted-foreground">{t.ticketId}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityConfig[t.priority].color}`}>
                    {priorityConfig[t.priority].label}
                  </span>
                </div>

                {/* Category */}
                <p className="text-xs text-muted-foreground truncate pr-4">{t.category}</p>

                {/* Assignee */}
                <p className="text-xs text-muted-foreground truncate pr-4">{t.assignee}</p>

                {/* Status */}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium w-fit ${statusConfig[t.status].color}`}>
                  {statusConfig[t.status].label}
                </span>

                {/* Updated */}
                <p className="text-[10px] text-muted-foreground">{timeAgo(t.updatedAt)}</p>
              </div>
            ))
          )}
        </ScrollArea>

        {/* Footer */}
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
        <div className={`rounded-xl px-4 py-3 text-sm ${message.isAgent ? "bg-primary/10 border border-primary/20" : "bg-muted/50 border border-border/40"}`}>
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <span className="font-semibold text-xs">{message.from}</span>
              <span className="text-[10px] text-muted-foreground ml-2">{message.fromEmail}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-muted-foreground">{formatTime(message.timestamp)}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(message.body); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
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

// ─── Detail Screen ────────────────────────────────────────────────────────────

function DetailScreen({
  thread, onBack, onUpdateStatus, onUpdatePriority, onToggleStar, onSendReply,
}: {
  thread: EmailThread;
  onBack: () => void;
  onUpdateStatus: (s: EmailStatus) => void;
  onUpdatePriority: (p: EmailPriority) => void;
  onToggleStar: () => void;
  onSendReply: (body: string, to: string, cc: string) => void;
}) {
  const { toast } = useToast();
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(thread.customerEmail);
  const [replyCc, setReplyCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [replyBcc, setReplyBcc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const sla = slaRemaining(thread.slaDeadline);

  const handleRephrase = () => {
    if (!replyText.trim()) { toast({ title: "Write something first" }); return; }
    setAiLoading(true);
    setTimeout(() => {
      setReplyText(`Thank you for reaching out to Verifone Support. I understand your concern and want to assure you that resolving this quickly is our top priority.\n\n${replyText}\n\nPlease don't hesitate to reach out if you need any further assistance.`);
      setAiLoading(false);
      toast({ title: "Text rephrased by AI" });
    }, 1200);
  };

  const handleTranslate = (lang: string) => {
    if (!replyText.trim()) { toast({ title: "Write something first" }); return; }
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
  };

  return (
    <div className="h-full flex flex-col p-2 gap-2" data-testid="screen-detail">
      {/* Breadcrumb / back bar */}
      <div className="glass-panel rounded-xl px-4 py-2 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-testid="button-back-inbox"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Inbox
        </button>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-[10px] font-mono text-muted-foreground">{thread.ticketId}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig[thread.status].color}`}>
          {statusConfig[thread.status].label}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityConfig[thread.priority].color}`}>
          {priorityConfig[thread.priority].label}
        </span>
        <span className="flex-1 text-sm font-semibold truncate">{thread.subject}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={onToggleStar} className="p-1.5 rounded-md hover:bg-muted/30 transition-colors" data-testid="button-star">
            {thread.starred ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> : <StarOff className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button onClick={() => toast({ title: "Archived" })} className="p-1.5 rounded-md hover:bg-muted/30 transition-colors text-muted-foreground" data-testid="button-archive">
            <Archive className="w-4 h-4" />
          </button>
          <button onClick={() => toast({ title: "Forwarded" })} className="p-1.5 rounded-md hover:bg-muted/30 transition-colors text-muted-foreground" data-testid="button-forward">
            <Forward className="w-4 h-4" />
          </button>
          <button onClick={() => toast({ title: "Deleted" })} className="p-1.5 rounded-md hover:bg-muted/30 transition-colors text-muted-foreground" data-testid="button-delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main row: thread + right panel */}
      <div className="flex flex-1 gap-2 min-h-0">

        {/* Thread + Reply */}
        <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col min-w-0">
          {/* Thread header */}
          <div className="px-5 py-3 border-b border-border/20 shrink-0">
            <h2 className="text-sm font-semibold mb-0.5">{thread.subject}</h2>
            <p className="text-xs text-muted-foreground">{thread.customerName} · {thread.customerEmail} · {thread.customerCompany}</p>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-5 py-4">
            <div className="space-y-6">
              {thread.messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          </ScrollArea>

          {/* Reply composer */}
          <div className="border-t border-border/20 px-4 py-3 shrink-0 space-y-2">
            {/* To / CC / BCC */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-7 shrink-0 font-medium">To</span>
                <Input value={replyTo} onChange={e => setReplyTo(e.target.value)} className="h-6 text-xs glass-input flex-1" data-testid="input-reply-to" />
                <button onClick={() => setShowCc(p => !p)} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Cc</button>
                <button onClick={() => setShowBcc(p => !p)} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Bcc</button>
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

            {/* Formatting toolbar */}
            <div className="flex items-center gap-0.5 border border-border/20 rounded-lg px-2 py-1 bg-muted/10 flex-wrap">
              {[
                { icon: Bold, label: "Bold", id: "bold" }, { icon: Italic, label: "Italic", id: "italic" },
                { icon: Underline, label: "Underline", id: "underline" }, { icon: Strikethrough, label: "Strike", id: "strike" },
              ].map(btn => (
                <button key={btn.id} title={btn.label} onClick={() => replyRef.current?.focus()}
                  className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid={`button-format-${btn.id}`}>
                  <btn.icon className="w-3.5 h-3.5" />
                </button>
              ))}
              <div className="w-px h-4 bg-border/40 mx-0.5" />
              {[{ icon: List, id: "bullet" }, { icon: ListOrdered, id: "number" }].map(btn => (
                <button key={btn.id} className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-format-${btn.id}`}>
                  <btn.icon className="w-3.5 h-3.5" />
                </button>
              ))}
              <div className="w-px h-4 bg-border/40 mx-0.5" />
              {[{ icon: Link, id: "link" }, { icon: Image, id: "image" }, { icon: Code, id: "code" }, { icon: Paperclip, id: "attach" }].map(btn => (
                <button key={btn.id} className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-format-${btn.id}`}>
                  <btn.icon className="w-3.5 h-3.5" />
                </button>
              ))}
              <div className="w-px h-4 bg-border/40 mx-0.5" />
              {/* AI tools */}
              <button onClick={handleRephrase} disabled={aiLoading}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors text-[10px] font-medium"
                data-testid="button-ai-rephrase">
                <Sparkles className="w-3.5 h-3.5" />{aiLoading ? "..." : "Rephrase"}
              </button>
              <div className="relative">
                <button onClick={() => setShowTranslate(p => !p)}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors text-[10px] font-medium"
                  data-testid="button-ai-translate">
                  <Languages className="w-3.5 h-3.5" />Translate
                </button>
                {showTranslate && (
                  <div className="absolute bottom-full left-0 mb-1 bg-popover border border-border/30 rounded-lg shadow-lg p-2 z-50 min-w-[140px]">
                    <p className="text-[10px] font-semibold mb-1 text-muted-foreground">Translate to:</p>
                    {languages.map(lang => (
                      <button key={lang} onClick={() => handleTranslate(lang)}
                        className="block w-full text-xs px-2 py-1 rounded hover:bg-primary/10 hover:text-primary text-left transition-colors"
                        data-testid={`button-lang-${lang.toLowerCase()}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => { setReplyText("Thank you for contacting Verifone Support. I'd be happy to help you resolve this. Could you please provide the terminal serial number and current firmware version?"); toast({ title: "AI suggestion applied" }); }}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors text-[10px] font-medium"
                data-testid="button-ai-suggest">
                <Bot className="w-3.5 h-3.5" />Suggest
              </button>
            </div>

            <Textarea
              ref={replyRef}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="glass-input text-xs resize-none min-h-[80px]"
              data-testid="textarea-reply"
            />

            <div className="flex items-center justify-between">
              <Select defaultValue="reply">
                <SelectTrigger className="h-7 text-xs glass-input w-[110px]" data-testid="select-reply-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reply"><div className="flex items-center gap-1.5"><Reply className="w-3 h-3" />Reply</div></SelectItem>
                  <SelectItem value="reply-all"><div className="flex items-center gap-1.5"><ReplyAll className="w-3 h-3" />Reply All</div></SelectItem>
                  <SelectItem value="forward"><div className="flex items-center gap-1.5"><Forward className="w-3 h-3" />Forward</div></SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <button onClick={() => setReplyText("")}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/30 transition-colors"
                  data-testid="button-discard-reply">Discard</button>
                <Button size="sm" onClick={handleSend} disabled={!replyText.trim()}
                  className="h-7 text-xs px-4 bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-send-reply">
                  <Send className="w-3 h-3 mr-1" />Send
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[300px] shrink-0 glass-panel rounded-xl overflow-hidden">
          <Tabs defaultValue="properties" className="flex flex-col h-full">
            <TabsList className="w-full rounded-none border-b border-border/20 bg-transparent h-auto p-0 shrink-0">
              {[
                { value: "properties", icon: Ticket, label: "Properties" },
                { value: "customer", icon: UserCircle, label: "Customer" },
                { value: "kb", icon: BookOpen, label: "KB" },
                { value: "ai", icon: Bot, label: "AI" },
              ].map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}
                  className="flex-1 text-[10px] py-2.5 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                  data-testid={`tab-${tab.value}`}>
                  <tab.icon className="w-3 h-3 mr-1" />{tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Properties */}
            <TabsContent value="properties" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-4">
                  {/* Status quick-set */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(Object.keys(statusConfig) as EmailStatus[]).map(s => (
                        <button key={s} onClick={() => onUpdateStatus(s)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border transition-colors ${thread.status === s ? statusConfig[s].color + " border-current" : "border-border/30 text-muted-foreground hover:border-primary/30 hover:text-primary"}`}
                          data-testid={`button-status-${s}`}>
                          {statusConfig[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Separator className="bg-border/20" />

                  {/* Ticket details */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket Details</p>
                    {[
                      { icon: Hash, label: "Ticket ID", value: thread.ticketId },
                      { icon: Tag, label: "Category", value: thread.category },
                      { icon: User, label: "Assignee", value: thread.assignee },
                      { icon: CalendarDays, label: "Created", value: formatDate(thread.createdAt) },
                      { icon: RefreshCw, label: "Updated", value: formatDate(thread.updatedAt) },
                    ].map(row => (
                      <div key={row.label} className="flex items-center gap-2">
                        <row.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[10px] text-muted-foreground w-16 shrink-0">{row.label}</span>
                        <span className="text-[10px] font-medium flex-1 text-right">{row.value}</span>
                      </div>
                    ))}
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

                  {/* Priority */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Priority</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(Object.keys(priorityConfig) as EmailPriority[]).map(p => (
                        <button key={p} onClick={() => onUpdatePriority(p)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border capitalize transition-colors ${thread.priority === p ? priorityConfig[p].color + " border-current" : "border-border/30 text-muted-foreground hover:border-primary/30"}`}
                          data-testid={`button-priority-${p}`}>
                          {p}
                        </button>
                      ))}
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
                  <Separator className="bg-border/20" />

                  {/* Assignee */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assign To</p>
                    <Select defaultValue={thread.assignee} onValueChange={v => toast({ title: `Assigned to ${v}` })}>
                      <SelectTrigger className="h-7 text-xs glass-input" data-testid="select-assignee">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Priya Sharma">Priya Sharma</SelectItem>
                        <SelectItem value="Gokul Nath">Gokul Nath</SelectItem>
                        <SelectItem value="Alex Chen">Alex Chen</SelectItem>
                        <SelectItem value="Unassigned">Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Customer */}
            <TabsContent value="customer" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${thread.avatarColor}`}>
                      {thread.avatarInitials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{thread.customerName}</p>
                      <p className="text-[10px] text-muted-foreground">{thread.customerAccountType} Account</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: Mail, text: thread.customerEmail },
                      { icon: Phone, text: thread.customerPhone },
                      { icon: Building2, text: thread.customerCompany },
                      { icon: Globe, text: thread.customerLocation },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <row.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-[10px] text-muted-foreground truncate">{row.text}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="bg-border/20" />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Past Tickets</p>
                    {[
                      { id: "TKT-4801", subject: "P400 paper jam issue", status: "resolved" as EmailStatus, date: "Mar 10" },
                      { id: "TKT-4793", subject: "NFC calibration request", status: "closed" as EmailStatus, date: "Feb 28" },
                      { id: "TKT-4771", subject: "Terminal EOL replacement", status: "closed" as EmailStatus, date: "Feb 14" },
                    ].map(t => (
                      <div key={t.id} className="flex items-start gap-2 py-2 border-b border-border/10 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium truncate">{t.subject}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-mono text-muted-foreground">{t.id}</span>
                            <span className={`text-[9px] px-1 py-0.5 rounded-full ${statusConfig[t.status].color}`}>{statusConfig[t.status].label}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{t.date}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="bg-border/20" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Account Stats</p>
                    {[["Total tickets", "12"], ["Resolved", "10"], ["Open", "2"], ["Avg. CSAT", "4.3 / 5"], ["Customer since", "2022"]].map(([l, v]) => (
                      <div key={l} className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{l}</span>
                        <span className="text-[10px] font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* KB Assist */}
            <TabsContent value="kb" className="flex-1 overflow-hidden mt-0 flex flex-col">
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
                    <div key={a.id} className="p-2.5 rounded-lg border border-border/30 bg-muted/10 hover:bg-primary/5 hover:border-primary/20 transition-colors cursor-pointer" data-testid={`card-kb-${a.id}`}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-[10px] font-medium leading-relaxed flex-1">{a.title}</p>
                        <span className="text-[9px] font-semibold text-primary shrink-0">{a.relevance}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-[9px] text-primary hover:underline" data-testid={`button-kb-view-${a.id}`}>View</button>
                        <button className="text-[9px] text-muted-foreground hover:text-primary" data-testid={`button-kb-insert-${a.id}`}
                          onClick={() => { toast({ title: "Article added to reply" }); }}>
                          Insert in reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* AI Assist */}
            <TabsContent value="ai" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <div className="p-3 space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <p className="text-[10px] font-semibold uppercase tracking-wider">AI Summary</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed p-2.5 rounded-lg bg-primary/5 border border-primary/15">
                      Customer reports {thread.category.toLowerCase()} on their terminal. Ticket is currently {statusConfig[thread.status].label.toLowerCase()} with {thread.priority} priority. {thread.messages.length} message{thread.messages.length !== 1 ? "s" : ""} in thread.
                    </p>
                  </div>
                  <Separator className="bg-border/20" />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sentiment</p>
                    <div className="flex items-center gap-2 mb-2">
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
                  <Separator className="bg-border/20" />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommendations</p>
                    {[
                      "Prioritise immediate resolution — customer is affected during business hours.",
                      "SLA breach risk detected. Escalate to L2 if unresolved within 30 minutes.",
                      "Consider offering a temporary workaround while the root cause is investigated.",
                    ].map((s, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20 mb-2">
                        <Zap className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                  <Separator className="bg-border/20" />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested Reply</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed p-2.5 rounded-lg bg-muted/10 border border-border/20 mb-2">
                      "Thank you for reaching out. I've reviewed your case and escalated it to our specialist team. You can expect a response within 2 hours. Reference: {thread.ticketId}."
                    </p>
                    <button
                      className="w-full text-[10px] py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                      onClick={() => toast({ title: "Applied to reply box" })}
                      data-testid="button-apply-suggestion"
                    >
                      Use this reply
                    </button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EmailPage() {
  const { toast } = useToast();
  const [threads, setThreads] = useState(emailThreads);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedThread = threads.find(t => t.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: false } : t));
    setSelectedId(id);
  };

  const handleBack = () => setSelectedId(null);

  const handleToggleStar = (id: string) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  };

  const handleUpdateStatus = (status: EmailStatus) => {
    setThreads(prev => prev.map(t => t.id === selectedId ? { ...t, status } : t));
    toast({ title: "Status updated", description: `Marked as ${statusConfig[status].label}` });
  };

  const handleUpdatePriority = (priority: EmailPriority) => {
    setThreads(prev => prev.map(t => t.id === selectedId ? { ...t, priority } : t));
    toast({ title: "Priority updated" });
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
        onUpdateStatus={handleUpdateStatus}
        onUpdatePriority={handleUpdatePriority}
        onToggleStar={() => handleToggleStar(selectedThread.id)}
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
