import { useState, useRef } from "react";
import {
  Mail, Search, Star, StarOff, Inbox, Send, Archive, Trash2,
  Paperclip, RefreshCw, Filter, ChevronDown, ChevronRight, Plus,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Link, Image, Code, AlignLeft, AlignCenter, AlignRight,
  Sparkles, Languages, RotateCcw, BookOpen, Bot, UserCircle,
  Clock, Tag, User, Phone, Globe, TicketIcon, AlertCircle,
  CheckCircle2, Circle, ArrowUpDown, Reply, ReplyAll, Forward,
  ExternalLink, ThumbsUp, ThumbsDown, Copy, X, SlidersHorizontal,
  Ticket, Building2, CalendarDays, Hash, Flag, Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  customerId: string;
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
    customerId: "cust-001", customerName: "Sarah Chen", customerEmail: "sarah.chen@goldenwok.com",
    customerPhone: "+1 (415) 555-0142", customerCompany: "Golden Wok Restaurant",
    customerAccountType: "Premium", customerLocation: "San Francisco, CA",
    avatarInitials: "SC", avatarColor: "bg-violet-100 text-violet-600",
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
    customerId: "cust-002", customerName: "Michael Rodriguez", customerEmail: "m.rodriguez@urbanstyle.com",
    customerPhone: "+1 (212) 555-0387", customerCompany: "Urban Style Boutique",
    customerAccountType: "Enterprise", customerLocation: "New York, NY",
    avatarInitials: "MR", avatarColor: "bg-blue-100 text-blue-600",
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
    customerId: "cust-003", customerName: "Emma Thompson", customerEmail: "emma@brewcraft.co",
    customerPhone: "+1 (503) 555-0219", customerCompany: "BrewCraft Coffee Chain",
    customerAccountType: "Enterprise", customerLocation: "Portland, OR",
    avatarInitials: "ET", avatarColor: "bg-emerald-100 text-emerald-600",
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
    customerId: "cust-004", customerName: "David Kim", customerEmail: "dkim@quickfuel.net",
    customerPhone: "+1 (713) 555-0456", customerCompany: "QuickFuel Gas Stations",
    customerAccountType: "Premium", customerLocation: "Houston, TX",
    avatarInitials: "DK", avatarColor: "bg-amber-100 text-amber-600",
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
    customerId: "cust-002", customerName: "Michael Rodriguez", customerEmail: "m.rodriguez@urbanstyle.com",
    customerPhone: "+1 (212) 555-0387", customerCompany: "Urban Style Boutique",
    customerAccountType: "Enterprise", customerLocation: "New York, NY",
    avatarInitials: "MR", avatarColor: "bg-blue-100 text-blue-600",
    status: "open", priority: "low", category: "Sales & Procurement",
    assignee: "Unassigned", tags: ["MX915", "quote", "bulk"],
    createdAt: "2026-03-13T11:00:00Z", updatedAt: "2026-03-13T11:00:00Z",
    slaDeadline: "2026-03-20T11:00:00Z", starred: false, unread: false,
    messages: [
      { id: "msg-5a", from: "Michael Rodriguez", fromEmail: "m.rodriguez@urbanstyle.com", to: ["sales@verifone.com"], body: "Hi,\n\nWe are looking to replace our aging MX915 PIN pad fleet across 8 store locations. Approximately 50 units total. Could you please send a volume pricing quote?\n\nWe are an existing Enterprise customer.\n\nMichael Rodriguez\nUrban Style Boutique", timestamp: "2026-03-13T11:00:00Z", isAgent: false },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<EmailStatus, { label: string; color: string; icon: typeof Circle }> = {
  open: { label: "Open", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400", icon: Circle },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400", icon: RefreshCw },
  pending: { label: "Pending", color: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400", icon: Clock },
  resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground", icon: Archive },
};

const priorityConfig: Record<EmailPriority, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400" },
  high: { label: "High", color: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400" },
  low: { label: "Low", color: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400" },
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

const kbArticles = [
  { id: "kb-1", title: "P400: Contactless NFC troubleshooting guide", relevance: 97 },
  { id: "kb-2", title: "Re-enabling NFC after firmware update", relevance: 91 },
  { id: "kb-3", title: "V240m Wi-Fi configuration persistence fix", relevance: 88 },
  { id: "kb-4", title: "e285 batch error E_BATCH_408 — known issue", relevance: 95 },
  { id: "kb-5", title: "VX520 display cache reset procedure", relevance: 84 },
];

const aiSuggestions = [
  "The customer is experiencing an urgent hardware issue during business hours. Prioritize immediate resolution and offer a temporary workaround.",
  "Based on past tickets, this customer has had 2 similar NFC issues. Consider recommending a firmware update to 5.5.0.",
  "SLA breach risk: 3 hours remaining. Escalate to L2 if not resolved in 30 minutes.",
];

const languages = ["Spanish", "French", "German", "Japanese", "Mandarin", "Portuguese", "Arabic", "Hindi"];

// ─── Rich Text Toolbar ────────────────────────────────────────────────────────

interface FormatBtn { icon: typeof Bold; label: string; action: string }
const formatButtons: FormatBtn[] = [
  { icon: Bold, label: "Bold", action: "bold" },
  { icon: Italic, label: "Italic", action: "italic" },
  { icon: Underline, label: "Underline", action: "underline" },
  { icon: Strikethrough, label: "Strike", action: "strikethrough" },
];
const listButtons: FormatBtn[] = [
  { icon: List, label: "Bullet list", action: "bullet" },
  { icon: ListOrdered, label: "Numbered list", action: "number" },
];

// ─── Components ───────────────────────────────────────────────────────────────

function EmailRow({ thread, selected, onClick }: { thread: EmailThread; selected: boolean; onClick: () => void }) {
  const status = statusConfig[thread.status];
  const priority = priorityConfig[thread.priority];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 border-b border-border/30 transition-colors hover:bg-primary/5 ${selected ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
      data-testid={`row-email-${thread.id}`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${thread.avatarColor}`}>
          {thread.avatarInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className={`text-xs font-semibold truncate ${thread.unread ? "text-foreground" : "text-muted-foreground"}`}>
              {thread.customerName}
            </span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{timeAgo(thread.updatedAt)}</span>
          </div>
          <p className={`text-xs truncate mb-1 ${thread.unread ? "font-medium text-foreground" : "text-muted-foreground"}`}>
            {thread.subject}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priority.color}`}>{priority.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
            {thread.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
          </div>
        </div>
        {thread.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0 mt-1" />}
      </div>
    </button>
  );
}

function MessageBubble({ message }: { message: EmailMessage }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(message.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className={`flex gap-3 ${message.isAgent ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${message.isAgent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
        {message.isAgent ? "V" : message.from.split(" ").map(w => w[0]).join("").slice(0, 2)}
      </div>
      <div className={`flex-1 max-w-[85%] ${message.isAgent ? "items-end" : ""} flex flex-col gap-1`}>
        <div className={`rounded-xl px-4 py-3 text-sm ${message.isAgent ? "bg-primary/10 border border-primary/20 ml-auto" : "bg-muted/50 border border-border/40"}`}>
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <span className="font-semibold text-xs">{message.from}</span>
              <span className="text-[10px] text-muted-foreground ml-2">{message.fromEmail}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-muted-foreground">{formatTime(message.timestamp)}</span>
              <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors" title="Copy">
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          {message.cc && (
            <p className="text-[10px] text-muted-foreground mb-2">CC: {message.cc.join(", ")}</p>
          )}
          <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">{message.body}</pre>
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{formatDate(message.timestamp)}</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EmailPage() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inboxFilter, setInboxFilter] = useState<"all" | "unread" | "starred" | "open" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [replyCc, setReplyCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [replyBcc, setReplyBcc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [selectedLang, setSelectedLang] = useState("Spanish");
  const [threads, setThreads] = useState(emailThreads);
  const [rightPanel, setRightPanel] = useState(true);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const selectedThread = threads.find(t => t.id === selectedId) || null;

  const filteredThreads = threads.filter(t => {
    if (inboxFilter === "unread" && !t.unread) return false;
    if (inboxFilter === "starred" && !t.starred) return false;
    if (inboxFilter === "open" && t.status !== "open" && t.status !== "in_progress") return false;
    if (inboxFilter === "resolved" && t.status !== "resolved" && t.status !== "closed") return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (assigneeFilter !== "all" && t.assignee.toLowerCase() !== assigneeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.subject.toLowerCase().includes(q) || t.customerName.toLowerCase().includes(q) || t.ticketId.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: false } : t));
    if (selectedThread?.id !== id) {
      const t = threads.find(x => x.id === id);
      setReplyTo(t?.customerEmail || "");
      setReplyText("");
    }
  };

  const handleSend = () => {
    if (!replyText.trim()) return;
    setThreads(prev => prev.map(t => {
      if (t.id !== selectedId) return t;
      const newMsg: EmailMessage = {
        id: `msg-${Date.now()}`, from: "Support Agent", fromEmail: "support@verifone.com",
        to: [replyTo], cc: replyCc ? replyCc.split(",").map(s => s.trim()) : undefined,
        body: replyText, timestamp: new Date().toISOString(), isAgent: true,
      };
      return { ...t, messages: [...t.messages, newMsg], updatedAt: new Date().toISOString(), status: "in_progress" as EmailStatus };
    }));
    setReplyText("");
    toast({ title: "Reply sent", description: `Email sent to ${replyTo}` });
  };

  const handleRephrase = () => {
    if (!replyText.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setReplyText(prev =>
        `Thank you for reaching out to Verifone Support. I understand your concern and want to assure you that resolving this quickly is our top priority.\n\n${prev}\n\nPlease don't hesitate to reach out if you need any further assistance.`
      );
      setAiLoading(false);
      toast({ title: "Text rephrased", description: "AI has improved your draft." });
    }, 1200);
  };

  const handleTranslate = () => {
    if (!replyText.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setReplyText(`[Translated to ${selectedLang}]\n\n${replyText}`);
      setAiLoading(false);
      setShowTranslate(false);
      toast({ title: `Translated to ${selectedLang}`, description: "AI translation applied." });
    }, 1200);
  };

  const toggleStar = (id: string) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  };

  const updateStatus = (status: EmailStatus) => {
    setThreads(prev => prev.map(t => t.id === selectedId ? { ...t, status } : t));
    toast({ title: "Status updated", description: `Ticket marked as ${statusConfig[status].label}` });
  };

  const updatePriority = (priority: EmailPriority) => {
    setThreads(prev => prev.map(t => t.id === selectedId ? { ...t, priority } : t));
    toast({ title: "Priority updated" });
  };

  const slaRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff < 0) return { label: "SLA Breached", urgent: true };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return { label: `${h}h ${m}m remaining`, urgent: h < 2 };
  };

  return (
    <div className="h-full flex flex-col" data-testid="page-email">
      <div className="flex flex-1 overflow-hidden gap-2 p-2">

        {/* ── Left Panel: Inbox ── */}
        <div className="w-[320px] shrink-0 glass-panel rounded-xl overflow-hidden flex flex-col">

          {/* Inbox header */}
          <div className="px-3 py-2 border-b border-border/20 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Email Inbox</h2>
                <Badge className="text-[10px] px-1.5 h-4 bg-primary/15 text-primary">
                  {threads.filter(t => t.unread).length}
                </Badge>
              </div>
              <button
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                data-testid="button-compose"
                onClick={() => toast({ title: "Compose", description: "New email compose window" })}
              >
                <Plus className="w-3 h-3" /> Compose
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search emails, tickets..."
                className="pl-8 h-7 text-xs glass-input"
                data-testid="input-email-search"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 flex-wrap">
              {(["all", "unread", "starred", "open", "resolved"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setInboxFilter(f)}
                  className={`text-[10px] px-2 py-0.5 rounded-full capitalize transition-colors ${inboxFilter === f ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:bg-muted/30"}`}
                  data-testid={`tab-inbox-${f}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Filter dropdowns */}
          <div className="px-3 py-1.5 border-b border-border/20 flex gap-1.5 shrink-0">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-6 text-[10px] flex-1 glass-input border-border/30" data-testid="select-priority-filter">
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
              <SelectTrigger className="h-6 text-[10px] flex-1 glass-input border-border/30" data-testid="select-status-filter">
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
              <SelectTrigger className="h-6 text-[10px] flex-1 glass-input border-border/30" data-testid="select-assignee-filter">
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

          {/* Email list */}
          <ScrollArea className="flex-1">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Inbox className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">No emails match your filters</p>
              </div>
            ) : (
              filteredThreads.map(t => (
                <EmailRow key={t.id} thread={t} selected={selectedId === t.id} onClick={() => handleSelect(t.id)} />
              ))
            )}
          </ScrollArea>
        </div>

        {/* ── Center Panel: Thread ── */}
        {selectedThread ? (
          <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col min-w-0">

            {/* Thread header */}
            <div className="px-4 py-2.5 border-b border-border/20 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                      {selectedThread.ticketId}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig[selectedThread.status].color}`}>
                      {statusConfig[selectedThread.status].label}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityConfig[selectedThread.priority].color}`}>
                      {priorityConfig[selectedThread.priority].label}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold truncate">{selectedThread.subject}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedThread.customerName} · {selectedThread.customerEmail} · {selectedThread.category}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleStar(selectedThread.id)} className="p-1.5 rounded-md hover:bg-muted/30 transition-colors" data-testid="button-star-email">
                    {selectedThread.starred
                      ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      : <StarOff className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => toast({ title: "Archive" })} className="p-1.5 rounded-md hover:bg-muted/30 transition-colors text-muted-foreground" title="Archive" data-testid="button-archive">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button onClick={() => toast({ title: "Forward" })} className="p-1.5 rounded-md hover:bg-muted/30 transition-colors text-muted-foreground" title="Forward" data-testid="button-forward">
                    <Forward className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRightPanel(p => !p)}
                    className="p-1.5 rounded-md hover:bg-muted/30 transition-colors text-muted-foreground"
                    title="Toggle details panel"
                    data-testid="button-toggle-panel"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3">
              <div className="space-y-5">
                {selectedThread.messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            </ScrollArea>

            {/* Reply composer */}
            <div className="border-t border-border/20 px-3 py-3 shrink-0">
              {/* To / CC / BCC */}
              <div className="space-y-1.5 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-6 shrink-0">To</span>
                  <Input value={replyTo} onChange={e => setReplyTo(e.target.value)} className="h-6 text-xs glass-input flex-1" data-testid="input-reply-to" />
                  <button onClick={() => setShowCc(p => !p)} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Cc</button>
                  <button onClick={() => setShowBcc(p => !p)} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Bcc</button>
                </div>
                {showCc && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-6 shrink-0">Cc</span>
                    <Input value={replyCc} onChange={e => setReplyCc(e.target.value)} placeholder="Add CC recipients..." className="h-6 text-xs glass-input flex-1" data-testid="input-reply-cc" />
                  </div>
                )}
                {showBcc && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-6 shrink-0">Bcc</span>
                    <Input value={replyBcc} onChange={e => setReplyBcc(e.target.value)} placeholder="Add BCC recipients..." className="h-6 text-xs glass-input flex-1" data-testid="input-reply-bcc" />
                  </div>
                )}
              </div>

              {/* Rich text toolbar */}
              <div className="flex items-center gap-0.5 mb-2 flex-wrap border border-border/20 rounded-lg px-2 py-1 bg-muted/10">
                {formatButtons.map(btn => (
                  <button key={btn.action} title={btn.label}
                    onClick={() => { replyRef.current?.focus(); }}
                    className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`button-format-${btn.action}`}
                  >
                    <btn.icon className="w-3.5 h-3.5" />
                  </button>
                ))}
                <div className="w-px h-4 bg-border/40 mx-0.5" />
                {listButtons.map(btn => (
                  <button key={btn.action} title={btn.label}
                    className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`button-format-${btn.action}`}
                  >
                    <btn.icon className="w-3.5 h-3.5" />
                  </button>
                ))}
                <div className="w-px h-4 bg-border/40 mx-0.5" />
                <button title="Insert link" className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-format-link">
                  <Link className="w-3.5 h-3.5" />
                </button>
                <button title="Insert image" className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-format-image">
                  <Image className="w-3.5 h-3.5" />
                </button>
                <button title="Code block" className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-format-code">
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button title="Attach file" className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors" data-testid="button-attach">
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-border/40 mx-0.5" />
                {/* AI tools */}
                <button
                  title="AI Rephrase"
                  onClick={handleRephrase}
                  disabled={aiLoading}
                  className="flex items-center gap-1 p-1.5 rounded hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors text-[10px] font-medium"
                  data-testid="button-ai-rephrase"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiLoading ? "..." : "Rephrase"}
                </button>
                <div className="relative">
                  <button
                    title="Translate"
                    onClick={() => setShowTranslate(p => !p)}
                    className="flex items-center gap-1 p-1.5 rounded hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors text-[10px] font-medium"
                    data-testid="button-ai-translate"
                  >
                    <Languages className="w-3.5 h-3.5" /> Translate
                  </button>
                  {showTranslate && (
                    <div className="absolute bottom-full left-0 mb-1 bg-popover border border-border/30 rounded-lg shadow-lg p-2 z-50 min-w-[160px]">
                      <p className="text-[10px] font-semibold mb-1.5 text-muted-foreground">Translate to:</p>
                      <div className="flex flex-col gap-0.5 max-h-40 overflow-auto">
                        {languages.map(lang => (
                          <button
                            key={lang}
                            onClick={() => { setSelectedLang(lang); handleTranslate(); }}
                            className="text-xs px-2 py-1 rounded hover:bg-primary/10 hover:text-primary text-left transition-colors"
                            data-testid={`button-lang-${lang.toLowerCase()}`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  title="Suggest reply"
                  onClick={() => {
                    setReplyText("Thank you for contacting Verifone Support. I'd be happy to help you resolve this issue. Could you please provide the terminal serial number and current firmware version so I can look into this further?");
                    toast({ title: "AI suggestion applied" });
                  }}
                  className="flex items-center gap-1 p-1.5 rounded hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors text-[10px] font-medium"
                  data-testid="button-ai-suggest"
                >
                  <Bot className="w-3.5 h-3.5" /> Suggest
                </button>
              </div>

              {/* Textarea */}
              <Textarea
                ref={replyRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="glass-input text-xs resize-none min-h-[80px] mb-2"
                data-testid="textarea-reply"
              />

              {/* Send row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select defaultValue="reply">
                    <SelectTrigger className="h-7 text-xs glass-input w-[110px]" data-testid="select-reply-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reply"><div className="flex items-center gap-1.5"><Reply className="w-3 h-3" /> Reply</div></SelectItem>
                      <SelectItem value="reply-all"><div className="flex items-center gap-1.5"><ReplyAll className="w-3 h-3" /> Reply All</div></SelectItem>
                      <SelectItem value="forward"><div className="flex items-center gap-1.5"><Forward className="w-3 h-3" /> Forward</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReplyText("")}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/30 transition-colors"
                    data-testid="button-discard-reply"
                  >
                    Discard
                  </button>
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={!replyText.trim()}
                    className="h-7 text-xs px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="button-send-reply"
                  >
                    <Send className="w-3 h-3 mr-1" /> Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 glass-panel rounded-xl flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Mail className="w-12 h-12 opacity-20" />
            <p className="text-sm">Select an email to view the conversation</p>
          </div>
        )}

        {/* ── Right Panel: Details ── */}
        {selectedThread && rightPanel && (
          <div className="w-[300px] shrink-0 glass-panel rounded-xl overflow-hidden">
            <Tabs defaultValue="properties" className="flex flex-col h-full">
              <TabsList className="w-full rounded-none border-b border-border/20 bg-transparent h-auto p-0 shrink-0">
                <TabsTrigger value="properties" className="flex-1 text-[10px] py-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none" data-testid="tab-properties">
                  <Ticket className="w-3 h-3 mr-1" />Properties
                </TabsTrigger>
                <TabsTrigger value="customer" className="flex-1 text-[10px] py-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none" data-testid="tab-customer">
                  <UserCircle className="w-3 h-3 mr-1" />Customer
                </TabsTrigger>
                <TabsTrigger value="kb" className="flex-1 text-[10px] py-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none" data-testid="tab-kb">
                  <BookOpen className="w-3 h-3 mr-1" />KB
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex-1 text-[10px] py-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none" data-testid="tab-ai">
                  <Bot className="w-3 h-3 mr-1" />AI
                </TabsTrigger>
              </TabsList>

              {/* Properties Tab */}
              <TabsContent value="properties" className="flex-1 overflow-hidden mt-0">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-4">
                    {/* Quick actions */}
                    <div className="flex gap-1.5 flex-wrap">
                      {(["open", "in_progress", "pending", "resolved", "closed"] as EmailStatus[]).map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(s)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border transition-colors ${selectedThread.status === s ? statusConfig[s].color + " border-current" : "border-border/30 text-muted-foreground hover:border-primary/30 hover:text-primary"}`}
                          data-testid={`button-status-${s}`}
                        >
                          {statusConfig[s].label}
                        </button>
                      ))}
                    </div>

                    <Separator className="bg-border/20" />

                    {/* Ticket details */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket Details</p>
                      {[
                        { icon: Hash, label: "Ticket ID", value: selectedThread.ticketId },
                        { icon: Flag, label: "Priority", value: priorityConfig[selectedThread.priority].label },
                        { icon: Circle, label: "Status", value: statusConfig[selectedThread.status].label },
                        { icon: Tag, label: "Category", value: selectedThread.category },
                        { icon: User, label: "Assignee", value: selectedThread.assignee },
                        { icon: CalendarDays, label: "Created", value: formatDate(selectedThread.createdAt) },
                        { icon: RefreshCw, label: "Updated", value: formatDate(selectedThread.updatedAt) },
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
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">SLA</p>
                      {(() => {
                        const sla = slaRemaining(selectedThread.slaDeadline);
                        return (
                          <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${sla.urgent ? "bg-red-50 dark:bg-red-500/10" : "bg-emerald-50 dark:bg-emerald-500/10"}`}>
                            <Clock className={`w-3.5 h-3.5 ${sla.urgent ? "text-red-500" : "text-emerald-500"}`} />
                            <span className={`text-[10px] font-medium ${sla.urgent ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>{sla.label}</span>
                          </div>
                        );
                      })()}
                    </div>

                    <Separator className="bg-border/20" />

                    {/* Priority selector */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Priority</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {(["low", "medium", "high", "urgent"] as EmailPriority[]).map(p => (
                          <button
                            key={p}
                            onClick={() => updatePriority(p)}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border transition-colors capitalize ${selectedThread.priority === p ? priorityConfig[p].color + " border-current" : "border-border/30 text-muted-foreground hover:border-primary/30"}`}
                            data-testid={`button-priority-${p}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-border/20" />

                    {/* Tags */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedThread.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-border/30">#{tag}</span>
                        ))}
                        <button className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors" data-testid="button-add-tag">
                          + Add tag
                        </button>
                      </div>
                    </div>

                    <Separator className="bg-border/20" />

                    {/* Assignee */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Assign To</p>
                      <Select defaultValue={selectedThread.assignee} onValueChange={v => toast({ title: `Assigned to ${v}` })}>
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

              {/* Customer Tab */}
              <TabsContent value="customer" className="flex-1 overflow-hidden mt-0">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-4">
                    {/* Profile card */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedThread.avatarColor}`}>
                        {selectedThread.avatarInitials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{selectedThread.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{selectedThread.customerAccountType} Account</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { icon: Mail, label: selectedThread.customerEmail },
                        { icon: Phone, label: selectedThread.customerPhone },
                        { icon: Building2, label: selectedThread.customerCompany },
                        { icon: Globe, label: selectedThread.customerLocation },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <row.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-[10px] text-muted-foreground truncate">{row.label}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-border/20" />

                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ticket History</p>
                      {[
                        { id: "TKT-4801", subject: "P400 paper jam issue", status: "resolved" as EmailStatus, date: "Mar 10" },
                        { id: "TKT-4793", subject: "NFC calibration request", status: "closed" as EmailStatus, date: "Feb 28" },
                        { id: "TKT-4771", subject: "Terminal EOL replacement query", status: "closed" as EmailStatus, date: "Feb 14" },
                      ].map(t => (
                        <div key={t.id} className="flex items-start gap-2 py-1.5 border-b border-border/10 last:border-0">
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
                      {[
                        { label: "Total tickets", value: "12" },
                        { label: "Resolved", value: "10" },
                        { label: "Open", value: "2" },
                        { label: "Avg. CSAT", value: "4.3 / 5" },
                        { label: "Customer since", value: "2022" },
                      ].map(s => (
                        <div key={s.label} className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{s.label}</span>
                          <span className="text-[10px] font-semibold">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* KB Assist Tab */}
              <TabsContent value="kb" className="flex-1 overflow-hidden mt-0">
                <div className="flex flex-col h-full">
                  <div className="px-3 pt-3 pb-2 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input placeholder="Search knowledge base..." className="pl-8 h-7 text-xs glass-input" data-testid="input-kb-search" />
                    </div>
                  </div>
                  <ScrollArea className="flex-1 px-3 pb-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested Articles</p>
                    <div className="space-y-2">
                      {kbArticles.map(article => (
                        <div key={article.id} className="p-2.5 rounded-lg border border-border/30 bg-muted/10 hover:bg-primary/5 hover:border-primary/20 transition-colors cursor-pointer" data-testid={`card-kb-${article.id}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[10px] font-medium leading-relaxed flex-1">{article.title}</p>
                            <span className="text-[9px] font-semibold text-primary shrink-0">{article.relevance}%</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <button className="text-[9px] text-primary hover:underline" data-testid={`button-kb-view-${article.id}`}>View article</button>
                            <button
                              className="text-[9px] text-muted-foreground hover:text-primary"
                              onClick={() => { setReplyText(prev => prev + `\n\nReference: ${article.title}`); toast({ title: "Article added to reply" }); }}
                              data-testid={`button-kb-insert-${article.id}`}
                            >
                              Insert in reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              {/* AI Assist Tab */}
              <TabsContent value="ai" className="flex-1 overflow-hidden mt-0">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-4">
                    {/* Summary */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <p className="text-[10px] font-semibold uppercase tracking-wider">AI Summary</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/15 text-[10px] text-muted-foreground leading-relaxed">
                        Customer reports {selectedThread.category.toLowerCase()} on {selectedThread.subject.split(" ")[0]}. {selectedThread.status === "open" ? "Issue is currently open and awaiting resolution." : `Status: ${statusConfig[selectedThread.status].label}.`} Priority is {selectedThread.priority}.
                      </div>
                    </div>

                    <Separator className="bg-border/20" />

                    {/* Sentiment */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Customer Sentiment</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-amber-400" style={{ width: "65%" }} />
                        </div>
                        <span className="text-[10px] font-medium text-amber-600">Frustrated</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 text-center p-1.5 rounded bg-muted/20">
                          <p className="text-[10px] font-semibold">Urgency</p>
                          <p className="text-xs font-bold text-red-500">High</p>
                        </div>
                        <div className="flex-1 text-center p-1.5 rounded bg-muted/20">
                          <p className="text-[10px] font-semibold">Tone</p>
                          <p className="text-xs font-bold text-amber-500">Formal</p>
                        </div>
                        <div className="flex-1 text-center p-1.5 rounded bg-muted/20">
                          <p className="text-[10px] font-semibold">Risk</p>
                          <p className="text-xs font-bold text-orange-500">Medium</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-border/20" />

                    {/* Suggestions */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">AI Recommendations</p>
                      {aiSuggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                          <Zap className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-border/20" />

                    {/* Suggested reply */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Suggested Reply</p>
                      <div className="p-2.5 rounded-lg bg-muted/10 border border-border/20 text-[10px] text-muted-foreground leading-relaxed">
                        "Thank you for reaching out to Verifone Support. I've reviewed your case and I'm escalating this to our specialist team. You can expect a response within 2 hours. Reference: {selectedThread.ticketId}."
                      </div>
                      <button
                        className="w-full text-[10px] py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                        onClick={() => { setReplyText(`Thank you for reaching out to Verifone Support. I've reviewed your case and I'm escalating this to our specialist team. You can expect a response within 2 hours. Reference: ${selectedThread.ticketId}.`); toast({ title: "Suggestion applied to reply" }); }}
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
        )}
      </div>
    </div>
  );
}
