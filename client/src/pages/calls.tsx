import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneOff,
  PhoneIncoming,
  PhoneCall,
  Mic,
  MicOff,
  Pause,
  Play,
  Send,
  Bot,
  User,
  Clock,
  Shield,
  Cpu,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  BookOpen,
  Headphones,
  Volume2,
  ChevronLeft,
  UserCircle,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Zap,
  Upload,
  TicketPlus,
  Wrench,
  TrendingDown,
  TrendingUp,
  Minus,
  X,
  Copy,
  ClipboardCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Pencil,
  Check,
  MessageSquare,
  Plus,
  ArrowLeft,
  BarChart3,
  Target,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type {
  Call,
  TranscriptEntry,
  AISuggestion,
  ChatMessage,
  Customer,
  DeviceInfo,
  Ticket,
  PastCall,
} from "@shared/schema";
import {
  customers,
  deviceInfo,
  initialCalls,
  simulatedTranscript,
  simulatedTranscript2,
  suggestionsByTranscriptId,
  suggestionsByTranscriptId2,
  customerTickets,
  customerPastCalls,
  getAiResponse,
  formatDuration,
} from "@/lib/mock-data";
import {
  getKbVote,
  addKbFeedback,
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
} from "@/lib/store";
import { useSidebar } from "@/components/ui/sidebar";

function generateCallSummary(
  call: Call,
  customer: Customer | null,
  transcript: TranscriptEntry[],
  suggestions: AISuggestion[],
  duration: number
): string {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const customerLines = transcript.filter((e) => e.speaker === "customer");
  const agentLines = transcript.filter((e) => e.speaker === "agent");

  const issueText = customerLines.slice(0, 2).map((e) => e.text).join(" ");
  const stepsText = agentLines.slice(0, 2).map((e) => `• ${e.text.slice(0, 120)}${e.text.length > 120 ? "…" : ""}`).join("\n") || "• Steps provided during call";
  const kbText = suggestions.length > 0 ? suggestions.map((s) => `• ${s.source}: ${s.title}`).join("\n") : "• None";

  return `Call Date: ${date}
Duration: ${formatDuration(duration)}
Customer: ${customer?.name ?? call.customerName}${customer?.company ? ` (${customer.company})` : ""}
Account Type: ${customer?.accountType ?? ""}
Topic: ${call.topic}
Priority: ${call.priority.charAt(0).toUpperCase() + call.priority.slice(1)}

Issue Summary:
${issueText || "Customer contacted support regarding " + call.topic}

Troubleshooting Steps Taken:
${stepsText}

KB Articles Referenced:
${kbText}`;
}

function analyzeSentiment(entries: TranscriptEntry[]): "positive" | "neutral" | "concerned" | "frustrated" {
  const recentCustomer = entries.filter((e) => e.speaker === "customer").slice(-3);
  const neg = ["error", "broken", "frustrated", "urgent", "fail", "problem", "issue", "can't", "wrong", "hurting", "losing", "terrible"];
  const pos = ["thanks", "great", "good", "works", "resolved", "working", "perfect", "okay", "ok", "it's back"];
  let negScore = 0, posScore = 0;
  recentCustomer.forEach((e) => {
    const lower = e.text.toLowerCase();
    neg.forEach((k) => { if (lower.includes(k)) negScore++; });
    pos.forEach((k) => { if (lower.includes(k)) posScore++; });
  });
  if (negScore >= 3) return "frustrated";
  if (negScore >= 1) return "concerned";
  if (posScore > negScore) return "positive";
  return "neutral";
}

function renderArticleContent(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return <h3 key={i} className="text-xs font-bold text-foreground mt-4 mb-1 uppercase tracking-wider text-primary/80">{line.slice(3)}</h3>;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1");
      return <li key={i} className="text-xs text-muted-foreground ml-3 leading-relaxed list-disc">{content}</li>;
    }
    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/\*\*(.*?)\*\*/g, "$1");
      return <li key={i} className="text-xs text-muted-foreground ml-3 leading-relaxed list-decimal">{content}</li>;
    }
    if (line.startsWith("|")) {
      return null;
    }
    if (line.trim() === "") {
      return <div key={i} className="h-1" />;
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="text-xs text-muted-foreground leading-relaxed">
        {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-foreground font-medium">{part}</strong> : part)}
      </p>
    );
  });
}

function KbArticleModal({
  suggestion,
  open,
  onOpenChange,
  onCopyToChat,
  callTopic,
}: {
  suggestion: AISuggestion | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCopyToChat: (text: string) => void;
  callTopic?: string;
}) {
  const { toast } = useToast();
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (suggestion) setVote(getKbVote(suggestion.id));
  }, [suggestion?.id]);

  if (!suggestion) return null;

  const handleVote = (v: "up" | "down") => {
    const newVote = vote === v ? null : v;
    if (newVote) {
      addKbFeedback({
        id: `fb-kb-${Date.now()}`,
        suggestionId: suggestion.id,
        suggestionTitle: suggestion.title,
        source: suggestion.source,
        vote: newVote,
        timestamp: new Date().toISOString(),
        callTopic,
      });
      toast({ title: newVote === "up" ? "Marked as helpful" : "Feedback recorded", description: "Your feedback improves AI accuracy." });
    }
    setVote(newVote);
  };

  const handleCopy = () => {
    if (suggestion.suggestedResponse) {
      onCopyToChat(suggestion.suggestedResponse);
      setCopied(true);
      onOpenChange(false);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col glass-panel border-border/30 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/30 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant="secondary" className="text-xs">{suggestion.source}</Badge>
                <Badge variant="secondary" className="text-xs">{suggestion.category}</Badge>
                <span className="text-xs text-primary font-medium">{Math.round(suggestion.confidence * 100)}% match</span>
              </div>
              <DialogTitle className="text-sm font-semibold leading-snug">{suggestion.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-5 py-4 space-y-1">
            {renderArticleContent(suggestion.fullContent)}
          </div>

          {suggestion.references && suggestion.references.length > 0 && (
            <div className="px-5 pb-4">
              <Separator className="bg-border/30 mb-3" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">References</p>
              <div className="space-y-1.5">
                {suggestion.references.map((ref, i) => (
                  <a
                    key={i}
                    href={ref.url}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    data-testid={`link-ref-${i}`}
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {ref.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="px-5 py-3 border-t border-border/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Was this helpful?</span>
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 gap-1 rounded-full px-2.5 text-xs ${vote === "up" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-muted-foreground"}`}
              onClick={() => handleVote("up")}
              data-testid="button-kb-vote-up"
            >
              <ThumbsUp className="w-3 h-3" /> Yes
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 gap-1 rounded-full px-2.5 text-xs ${vote === "down" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-muted-foreground"}`}
              onClick={() => handleVote("down")}
              data-testid="button-kb-vote-down"
            >
              <ThumbsDown className="w-3 h-3" /> No
            </Button>
          </div>
          {suggestion.suggestedResponse && (
            <Button
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 h-7 rounded-full text-xs mint-glow-sm"
              data-testid="button-copy-to-chat"
            >
              {copied ? <ClipboardCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Copy to Chat Assist
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


function CallQueueItem({
  call,
  isSelected,
  onClick,
  elapsed,
}: {
  call: Call;
  isSelected: boolean;
  onClick: () => void;
  elapsed: number;
}) {
  const customer = customers[call.customerId];
  const priorityColor =
    call.priority === "urgent"
      ? "text-red-400"
      : call.priority === "high"
        ? "text-orange-400"
        : call.priority === "medium"
          ? "text-yellow-400"
          : "text-muted-foreground";

  return (
    <div
      className={`p-3 mx-2 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? "glass-bubble-primary"
          : "hover-elevate"
      }`}
      onClick={onClick}
      data-testid={`card-call-${call.id}`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className={`text-xs font-medium ${isSelected ? "bg-primary/15 text-primary" : "bg-muted"}`}>
            {customer?.avatarInitials || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm font-medium truncate">{call.customerName}</p>
            <div className="flex items-center gap-1 shrink-0">
              {call.status === "active" && (
                <span className="w-2 h-2 rounded-full bg-primary animate-breathing" />
              )}
              {call.status === "on-hold" && (
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground truncate">{call.topic}</p>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className={`text-xs font-medium ${priorityColor}`}>
              {call.priority.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {formatDuration(elapsed)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveTranscription({
  entries,
  isLive,
  showSentiment,
}: {
  entries: TranscriptEntry[];
  isLive: boolean;
  showSentiment?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentiment = analyzeSentiment(entries);

  const sentimentConfig = {
    positive: { icon: TrendingUp, label: "Positive", color: "text-emerald-400" },
    neutral: { icon: Minus, label: "Neutral", color: "text-muted-foreground" },
    concerned: { icon: TrendingDown, label: "Concerned", color: "text-yellow-400" },
    frustrated: { icon: TrendingDown, label: "Frustrated", color: "text-red-400" },
  };
  const sc = sentimentConfig[sentiment];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-4 py-3 glass-header mx-2 mt-2 rounded-xl">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Live Transcription</h3>
        </div>
        <div className="flex items-center gap-3">
          {showSentiment && entries.length > 0 && (
            <div className={`flex items-center gap-1 ${sc.color}`} data-testid="text-sentiment">
              <sc.icon className="w-3 h-3" />
              <span className="text-xs font-medium">{sc.label}</span>
            </div>
          )}
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-breathing" />
              <span className="text-xs text-primary font-medium">LIVE</span>
            </div>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {entries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Volume2 className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Waiting for conversation...</p>
            </div>
          )}
          <AnimatePresence>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${
                  entry.speaker === "agent" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  <AvatarFallback
                    className={`text-xs ${
                      entry.speaker === "agent"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/80 text-muted-foreground"
                    }`}
                  >
                    {entry.speaker === "agent" ? (
                      <Headphones className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 max-w-[80%] ${
                    entry.speaker === "agent" ? "text-right" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {entry.speaker === "agent" && <span className="flex-1" />}
                    <span className="text-xs font-medium">
                      {entry.speaker === "agent" ? "Agent" : "Customer"}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {entry.timestamp}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      entry.speaker === "agent"
                        ? "glass-bubble-primary"
                        : "glass-bubble"
                    }`}
                    data-testid={`text-transcript-${entry.id}`}
                  >
                    {entry.text}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLive && entries.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground pl-10">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs">Listening...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}

function AISuggestionsPanel({
  messagePairs,
  callTopic,
  onCopyToChat,
}: {
  messagePairs: { customerMessage: string; suggestion: AISuggestion }[];
  callTopic?: string;
  onCopyToChat: (text: string) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [votes, setVotes] = useState<Record<string, "up" | "down" | null>>({});
  const [kbSearch, setKbSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const initialVotes: Record<string, "up" | "down" | null> = {};
    messagePairs.forEach(({ suggestion: s }) => { initialVotes[s.id] = getKbVote(s.id); });
    setVotes(initialVotes);
  }, [messagePairs.map(p => p.suggestion.id).join(",")]);

  const handleVote = (s: AISuggestion, v: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const current = votes[s.id];
    const newVote = current === v ? null : v;
    if (newVote) {
      addKbFeedback({
        id: `fb-kb-${Date.now()}`,
        suggestionId: s.id,
        suggestionTitle: s.title,
        source: s.source,
        vote: newVote,
        timestamp: new Date().toISOString(),
        callTopic,
      });
      toast({ title: newVote === "up" ? "Marked as helpful" : "Feedback recorded", description: "Your feedback improves AI accuracy." });
    }
    setVotes((prev) => ({ ...prev, [s.id]: newVote }));
  };

  const toggleExpanded = (id: string) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  const displayPairs = kbSearch.trim() ? [] : messagePairs;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-4 py-3 glass-header mx-2 mt-2 rounded-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">KB Assist</h3>
        </div>
        <Badge variant="secondary" className="text-xs">RAG</Badge>
      </div>
      <div className="px-3 pt-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={kbSearch} onChange={e => setKbSearch(e.target.value)} placeholder="Search knowledge base..." className="glass-input pl-8 h-8 text-xs" data-testid="input-kb-search-calls" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {displayPairs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bot className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm text-center">{kbSearch ? "No articles found" : "AI suggestions will appear here based on the conversation"}</p>
            </div>
          )}
          <AnimatePresence>
            {displayPairs.map(({ customerMessage, suggestion }) => (
              <motion.div key={suggestion.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="space-y-2">
                  {/* Customer message bubble */}
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted/50 border border-border/30 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1.5">Customer</p>
                      <div className="rounded-xl p-3 bg-muted/20 border border-border/20">
                        <p className="text-sm leading-relaxed">{customerMessage}</p>
                      </div>
                      <button
                        className="flex items-center gap-1.5 text-xs text-primary mt-2 hover:opacity-75 transition-opacity"
                        onClick={() => toggleExpanded(suggestion.id)}
                        data-testid={`button-kb-toggle-${suggestion.id}`}
                      >
                        {expandedIds[suggestion.id]
                          ? <><ChevronUp className="w-3.5 h-3.5" />Collapse KB Article</>
                          : <><BookOpen className="w-3.5 h-3.5" />Show KB Article</>}
                      </button>
                    </div>
                  </div>

                  {/* Expanded article */}
                  {expandedIds[suggestion.id] && (
                    <div className="ml-9 glass-panel rounded-xl p-3 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          <BookOpen className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm font-bold text-primary leading-snug">{suggestion.title}</span>
                        </div>
                        <span className="text-sm font-bold text-primary shrink-0">{Math.round(suggestion.confidence * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground">{suggestion.source}</span>
                        <span className="text-xs text-muted-foreground">{suggestion.category}</span>
                      </div>
                      <div className="space-y-0.5">{renderArticleContent(suggestion.fullContent || suggestion.content)}</div>
                      {suggestion.references && suggestion.references.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">References</p>
                          <div className="space-y-1">
                            {suggestion.references.map(ref => (
                              <a key={ref.label} href={ref.url} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                                <ExternalLink className="w-3 h-3 shrink-0" />{ref.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border/20">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Helpful?</span>
                          <button className={`p-0.5 rounded transition-colors ${votes[suggestion.id] === "up" ? "text-emerald-400" : "text-muted-foreground/50 hover:text-emerald-400"}`} onClick={(e) => handleVote(suggestion, "up", e)} data-testid={`button-vote-up-${suggestion.id}`}><ThumbsUp className="w-3.5 h-3.5" /></button>
                          <button className={`p-0.5 rounded transition-colors ${votes[suggestion.id] === "down" ? "text-red-400" : "text-muted-foreground/50 hover:text-red-400"}`} onClick={(e) => handleVote(suggestion, "down", e)} data-testid={`button-vote-down-${suggestion.id}`}><ThumbsDown className="w-3.5 h-3.5" /></button>
                        </div>
                        {suggestion.suggestedResponse && (
                          <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => onCopyToChat(suggestion.suggestedResponse!)} data-testid={`button-kb-copy-${suggestion.id}`}>
                            <Copy className="w-3 h-3" /> Copy to Chat
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}

const QUICK_PROMPTS = [
  "Firmware update steps?",
  "Warranty coverage?",
  "How to escalate?",
  "RMA process?",
];

function AgentAIChatInline({
  messages,
  onSendMessage,
  prefillText,
  onPrefillConsumed,
  onNewChat,
}: {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  prefillText?: string;
  onPrefillConsumed?: () => void;
  onNewChat?: () => void;
}) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefillText) {
      setInput(prefillText);
      onPrefillConsumed?.();
    }
  }, [prefillText]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.sender === "agent") {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 pt-2 pb-0 flex items-center justify-between shrink-0">
        <span className="text-xs text-muted-foreground">
          Chat History{messages.length > 0 ? ` · ${messages.length} messages` : ""}
        </span>
        {onNewChat && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={onNewChat}
            data-testid="button-new-chat"
          >
            <Plus className="w-3 h-3" /> New Chat
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-4">
              <Bot className="w-8 h-8 opacity-20 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Ask about troubleshooting steps, firmware, warranty, or escalation. History is saved across sessions.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.sender === "agent" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                <AvatarFallback className={`text-xs ${msg.sender === "ai" ? "bg-primary/15 text-primary" : "bg-muted/80"}`}>
                  {msg.sender === "ai" ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg px-3 py-2 text-xs leading-relaxed max-w-[85%] ${
                  msg.sender === "ai" ? "glass-bubble-primary" : "glass-bubble"
                }`}
                data-testid={`text-chat-${msg.id}`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarFallback className="text-xs bg-primary/15 text-primary">
                  <Bot className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <div className="glass-bubble-primary rounded-lg px-3 py-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      {messages.length === 0 && (
        <div className="px-3 pb-1 flex flex-wrap gap-1">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="text-xs px-2 py-0.5 rounded-full border border-border/30 bg-muted/30 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors text-muted-foreground"
              data-testid={`chip-quick-prompt-${q.replace(/\s+/g, "-").toLowerCase()}`}
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="p-3 border-t border-border/30">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI assistant..."
            className="flex-1 glass-input"
            data-testid="input-ai-chat"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            className="mint-glow-sm"
            data-testid="button-send-ai-chat"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/10 transition-colors"
        data-testid={`section-toggle-${title.toLowerCase()}`}
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {icon} {title}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

function RightPanel({
  customer,
  device,
  tickets,
  pastCalls,
  aiChatMessages,
  onSendAIChat,
  chatPrefill,
  onChatPrefillConsumed,
  hasActiveSuggestions,
  onQuickAction,
  onNewChat,
  onCollapse,
}: {
  customer: Customer;
  device: DeviceInfo;
  tickets: Ticket[];
  pastCalls: PastCall[];
  aiChatMessages: ChatMessage[];
  onSendAIChat: (text: string) => void;
  chatPrefill?: string;
  onChatPrefillConsumed?: () => void;
  hasActiveSuggestions?: boolean;
  onQuickAction?: (action: string) => void;
  onNewChat?: () => void;
  onCollapse?: () => void;
}) {
  const devStatus = device.status.toLowerCase();
  const statusColor =
    devStatus === "active"
      ? "text-status-online"
      : devStatus === "maintenance"
        ? "text-status-away"
        : "text-status-offline";

  const ticketStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-500/15 text-blue-400";
      case "closed": return "bg-emerald-500/15 text-emerald-400";
      case "pending": return "bg-yellow-500/15 text-yellow-400";
      case "escalated": return "bg-red-500/15 text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };


  const [profileOpen, setProfileOpen] = useState(true);
  const [deviceOpen, setDeviceOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Tabs defaultValue="ai-chat" className="flex flex-col h-full overflow-hidden">
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <TabsList className="flex-1 glass-subtle">
              <TabsTrigger value="ai-chat" className="flex-1 text-xs" data-testid="tab-ai-chat">
                Chat Assist
              </TabsTrigger>
              <TabsTrigger value="info" className="flex-1 text-xs" data-testid="tab-info">
                Info
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="relative flex-1 min-h-0">
          <TabsContent value="ai-chat" className="absolute inset-0 mt-0 flex flex-col overflow-hidden">
            {hasActiveSuggestions && onQuickAction && (
              <div className="px-3 pt-2 pb-1 border-b border-border/20 shrink-0">
                <p className="text-xs text-muted-foreground mb-1.5">Quick Actions</p>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 gap-1 rounded-full px-2 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20"
                    onClick={() => onQuickAction("escalate")}
                    data-testid="button-qa-escalate"
                  >
                    <Zap className="w-3 h-3" /> Escalate L2
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 gap-1 rounded-full px-2 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                    onClick={() => onQuickAction("ticket")}
                    data-testid="button-qa-ticket"
                  >
                    <TicketPlus className="w-3 h-3" /> Create Ticket
                  </Button>
                </div>
              </div>
            )}
            <AgentAIChatInline
              messages={aiChatMessages}
              onSendMessage={onSendAIChat}
              prefillText={chatPrefill}
              onPrefillConsumed={onChatPrefillConsumed}
              onNewChat={onNewChat}
            />
          </TabsContent>

          <TabsContent value="info" className="absolute inset-0 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                <CollapsibleSection title="Profile" icon={<UserCircle className="w-3.5 h-3.5" />} open={profileOpen} onToggle={() => setProfileOpen(!profileOpen)}>
                  <div className="space-y-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                            {customer.avatarInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-status-online border-2 border-background" />
                      </div>
                      <div>
                        <h3 className="font-semibold" data-testid="text-customer-name">{customer.name}</h3>
                        <p className="text-sm text-muted-foreground">{customer.company}</p>
                      </div>
                      <Badge variant="default" className="text-xs">
                        {customer.accountType}
                      </Badge>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="space-y-3">
                      <InfoRow label="Email" value={customer.email} />
                      <InfoRow label="Phone" value={customer.phone} />
                      <InfoRow label="Location" value={customer.location} />
                      <InfoRow label="Member Since" value={new Date(customer.joinedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} />
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="Device" icon={<Cpu className="w-3.5 h-3.5" />} open={deviceOpen} onToggle={() => setDeviceOpen(!deviceOpen)}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg glass-bubble-primary flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm" data-testid="text-device-model">{device.model}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${devStatus === "active" ? "bg-status-online" : devStatus === "maintenance" ? "bg-status-away" : "bg-status-offline"}`} />
                          <span className={`text-xs capitalize ${statusColor}`}>{device.status}</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="space-y-3">
                      <InfoRow label="Serial Number" value={device.serialNumber} mono />
                      <InfoRow label="Device ID" value={device.deviceId || "—"} mono />
                      <InfoRow label="MID" value={device.mid} mono />
                      <InfoRow label="TID" value={device.tid || "—"} mono />
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
                      <InfoRow label="MAC Address" value={device.macAddress || "—"} mono />
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="space-y-3">
                      <InfoRow label="Last Heartbeat" value={new Date(device.lastHeartbeat).toLocaleString()} />
                      <InfoRow label="Last Communication" value={new Date(device.lastCommunication).toLocaleString()} />
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="History" icon={<Clock className="w-3.5 h-3.5" />} open={historyOpen} onToggle={() => setHistoryOpen(!historyOpen)}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Support Tickets ({tickets.length})
                      </h4>
                      <div className="space-y-2">
                        {tickets.map((ticket) => (
                          <Card key={ticket.id} className="p-3" data-testid={`card-ticket-${ticket.id}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{ticket.subject}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={`text-[10px] px-1.5 py-0 h-4 ${ticketStatusColor(ticket.status)}`}>{ticket.status}</Badge>
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

                    <Separator className="bg-border/50" />

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Past Interactions ({pastCalls.length})
                      </h4>
                      <div className="space-y-2">
                        {pastCalls.map((pc) => (
                          <Card key={pc.id} className="p-3" data-testid={`card-past-call-${pc.id}`}>
                            <p className="text-xs font-medium">{pc.topic}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{pc.date} · {formatDuration(pc.duration)}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{pc.resolution}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={`text-xs text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}


function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
        <Phone className="w-7 h-7 opacity-40 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground mb-1" data-testid="text-empty-state">No active calls</h3>
      <p className="text-sm">Waiting for incoming calls...</p>
    </div>
  );
}

interface CreatedTicket {
  id: string;
  customerName: string;
  company: string;
  topic: string;
  summary: string;
  notes: string;
  priority: string;
  createdAt: string;
}

function TicketDialog({
  open,
  onClose,
  initialSummary,
  customer,
  call,
  onTicketCreated,
}: {
  open: boolean;
  onClose: () => void;
  initialSummary: string;
  customer: Customer | null;
  call: Call | null;
  onTicketCreated: (ticket: CreatedTicket) => void;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [notes, setNotes] = useState("");
  const [ticketId] = useState(() => `TKT-${Date.now().toString().slice(-6)}`);
  const { toast } = useToast();

  useEffect(() => {
    if (open) setSummary(initialSummary);
  }, [open, initialSummary]);

  const handleCreate = () => {
    const ticket: CreatedTicket = {
      id: ticketId,
      customerName: customer?.name ?? call?.customerName ?? "Unknown",
      company: customer?.company ?? "",
      topic: call?.topic ?? "Support Issue",
      summary,
      notes,
      priority: call?.priority ?? "medium",
      createdAt: new Date().toISOString(),
    };
    onTicketCreated(ticket);
    toast({ title: `Ticket ${ticketId} created`, description: "Call summary has been attached to the ticket." });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg glass-panel border-border/30 max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <TicketPlus className="w-4 h-4 text-blue-400" />
            Create Support Ticket
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Review and edit the auto-generated summary before submitting.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="flex items-center justify-between glass-subtle rounded-lg px-3 py-2">
            <div>
              <p className="text-xs font-semibold" data-testid="text-ticket-id">{ticketId}</p>
              <p className="text-xs text-muted-foreground">{customer?.name ?? call?.customerName} • {customer?.company}</p>
            </div>
            <Badge variant="secondary" className="text-xs capitalize">{call?.priority ?? "medium"} priority</Badge>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Call Summary
              <span className="text-primary font-normal normal-case tracking-normal">(editable)</span>
            </label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[180px] text-xs font-mono resize-y glass-subtle border-border/30 focus:border-primary/40"
              data-testid="textarea-ticket-summary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" /> Agent Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes, follow-up actions, or observations..."
              className="min-h-[80px] text-xs resize-y glass-subtle border-border/30 focus:border-primary/40"
              data-testid="textarea-ticket-notes"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 shrink-0 border-t border-border/20">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">Cancel</Button>
          <Button size="sm" onClick={handleCreate} className="text-xs gap-1.5" data-testid="button-create-ticket-submit">
            <TicketPlus className="w-3.5 h-3.5" /> Create Ticket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CallSummary({
  call,
  customer,
  duration,
  transcript,
  suggestions,
  createdTicket,
  onOpenTicketDialog,
}: {
  call: Call;
  customer: Customer | null;
  duration: number;
  transcript: TranscriptEntry[];
  suggestions: AISuggestion[];
  createdTicket?: CreatedTicket | null;
  onOpenTicketDialog?: () => void;
}) {
  const { toast } = useToast();
  const generatedSummary = generateCallSummary(call, customer, transcript, suggestions, duration);
  const [editableSummary, setEditableSummary] = useState(generatedSummary);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [agentNotes, setAgentNotes] = useState(createdTicket?.notes ?? "");

  const nextActions = [
    suggestions.some((s) => s.category === "Firmware") ? "Push firmware update via Device Management Portal" : null,
    "Send follow-up email with resolution steps",
    "Update ticket with call notes and resolution",
    "Flag for CSAT survey",
  ].filter(Boolean) as string[];

  const handleCopy = () => {
    const fullText = `${editableSummary}${agentNotes ? `\n\nAgent Notes:\n${agentNotes}` : ""}`;
    navigator.clipboard.writeText(fullText).catch(() => {});
    toast({ title: "Copied to clipboard", description: "Call summary and notes have been copied." });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full"
      >
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border/30 shrink-0">
          <div className="w-9 h-9 rounded-lg glass-bubble-primary flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" data-testid="text-call-summary-title">Call Ended — {customer?.name ?? call.customerName}</p>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(duration)}</span>
              <span className="text-xs text-muted-foreground">{call.topic}</span>
              <Badge variant="secondary" className="text-xs capitalize">{call.priority} priority</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 shrink-0"
            onClick={handleCopy}
            data-testid="button-copy-summary"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 grid grid-cols-[1fr_340px] gap-4 p-4 overflow-hidden min-h-0">
          <div className="flex flex-col gap-3 overflow-y-auto min-h-0 pr-1">
            <div className="glass-panel rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> AI-Generated Summary
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsEditingSummary((v) => !v)}
                  data-testid="button-toggle-edit-summary"
                >
                  {isEditingSummary ? <><Check className="w-3 h-3 text-primary" /> Save</> : <><Pencil className="w-3 h-3" /> Edit</>}
                </Button>
              </div>
              {isEditingSummary ? (
                <Textarea
                  value={editableSummary}
                  onChange={(e) => setEditableSummary(e.target.value)}
                  className="min-h-[180px] text-xs font-mono resize-y glass-subtle border-border/30 focus:border-primary/40"
                  data-testid="textarea-edit-summary"
                />
              ) : (
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed" data-testid="text-summary-content">
                  {editableSummary}
                </pre>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="glass-panel rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> KB Articles Referenced
                </h4>
                <div className="space-y-1.5">
                  {suggestions.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs shrink-0">{s.source}</Badge>
                      <span className="text-xs text-muted-foreground truncate">{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto min-h-0 pr-1">
            <div className="glass-panel rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Agent Notes
              </h4>
              <Textarea
                value={agentNotes}
                onChange={(e) => setAgentNotes(e.target.value)}
                placeholder="Add notes, follow-up actions, or observations for the record..."
                className="min-h-[100px] text-xs resize-y glass-subtle border-border/30 focus:border-primary/40"
                data-testid="textarea-agent-notes"
              />
            </div>

            <div className="glass-panel rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Recommended Next Actions
              </h4>
              <ul className="space-y-1.5">
                {nextActions.map((action, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TicketPlus className="w-3.5 h-3.5" /> Support Ticket
              </h4>
              {createdTicket ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/20" data-testid="text-ticket-ref">{createdTicket.id}</Badge>
                    <span className="text-xs text-muted-foreground">Created during call</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Summary and notes have been attached to the ticket.</p>
                  {createdTicket.notes && (
                    <div className="glass-subtle rounded-lg p-2">
                      <p className="text-xs text-muted-foreground italic">{createdTicket.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">No ticket was created during this call.</p>
                  {onOpenTicketDialog && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                      onClick={onOpenTicketDialog}
                      data-testid="button-create-ticket-from-summary"
                    >
                      <TicketPlus className="w-3.5 h-3.5" /> Create Ticket Now
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function IncomingCallScreen({
  call,
  customer,
  onAccept,
}: {
  call: Call;
  customer: Customer;
  onAccept: () => void;
}) {
  const agentStats = [
    { label: "Today's Calls", value: "4", icon: PhoneCall, color: "text-primary" },
    { label: "Avg Handle Time", value: "6m 32s", icon: Clock, color: "text-blue-400" },
    { label: "CSAT Score", value: "4.8/5", icon: Star, color: "text-yellow-400" },
    { label: "FCR Rate", value: "87%", icon: Target, color: "text-emerald-400" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="flex-1 flex items-center justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      data-testid="incoming-call-screen"
    >
      <div className="w-full max-w-lg space-y-6 px-4">
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 w-24 h-24 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute -inset-3 w-30 h-30 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.3s" }} />
            <div className="absolute -inset-6 w-36 h-36 rounded-full border border-primary/5 animate-ping" style={{ animationDuration: "3s", animationDelay: "0.6s" }} />
            <div className="relative w-24 h-24 rounded-full glass-bubble-primary flex items-center justify-center">
              <PhoneIncoming className="w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1" data-testid="text-incoming-label">Incoming Call</p>
            <p className="text-sm text-muted-foreground">Connecting to customer...</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {customer.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full animate-pulse border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold" data-testid="text-incoming-customer-name">{customer.name}</h3>
                <p className="text-sm text-muted-foreground">{customer.company}</p>
                <p className="text-xs text-muted-foreground">{customer.phone}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-4 gap-2">
            {agentStats.map((stat) => (
              <div key={stat.label} className="glass-panel rounded-xl p-3 text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/[' ]/g, "-")}`}>
                <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1.5`} />
                <p className="text-sm font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            onClick={onAccept}
            className="w-full h-12 rounded-2xl gap-2 text-base font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
            data-testid="button-accept-incoming"
          >
            <PhoneCall className="w-5 h-5" />
            Accept Call
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FloatingCallWidget({
  call,
  customer,
  elapsed,
  isMuted,
  isOnHold,
  onToggleMute,
  onToggleHold,
  onEndCall,
}: {
  call: Call;
  customer: Customer | null;
  elapsed: number;
  isMuted: boolean;
  isOnHold: boolean;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onEndCall: () => void;
}) {
  const statusColor =
    call.status === "on-hold"
      ? "bg-yellow-500"
      : "bg-emerald-500";

  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={constraintsRef}
        style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      />
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        data-testid="floating-call-widget"
      >
        <div className="glass-panel rounded-2xl p-3 flex items-center gap-3 shadow-xl ring-2 ring-emerald-500/60 dark:ring-emerald-400/40">
        <div className="flex flex-col items-start gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusColor} animate-breathing shrink-0`} />
            <span className="text-sm font-medium truncate max-w-[120px]" data-testid="text-widget-caller">
              {customer?.name ?? call.customerName}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono pl-4" data-testid="text-widget-timer">
            {formatDuration(elapsed)}
          </span>
        </div>

        <div className="flex items-center gap-1.5" onPointerDownCapture={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleMute}
            className={`h-8 w-8 rounded-full backdrop-blur-sm border transition-all ${
              isMuted
                ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                : "bg-white/10 text-foreground border-white/15 hover:bg-white/20"
            }`}
            data-testid="button-widget-mute"
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleHold}
            className={`h-8 w-8 rounded-full backdrop-blur-sm border transition-all ${
              isOnHold
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                : "bg-white/10 text-foreground border-white/15 hover:bg-white/20"
            }`}
            data-testid="button-widget-hold"
          >
            {isOnHold ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onEndCall}
            className="h-8 w-8 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-sm hover:bg-red-500/30 transition-all"
            data-testid="button-widget-end"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
    </>
  );
}

export default function CallsPage() {
  const { toast } = useToast();
  const { setOpen: setSidebarOpen } = useSidebar();
  const [calls, setCalls] = useState<Call[]>(initialCalls);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiSuggestionPairs, setAiSuggestionPairs] = useState<{ customerMessage: string; suggestion: AISuggestion }[]>([]);
  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>(() => getChatHistory());
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [callElapsed, setCallElapsed] = useState<Record<string, number>>({});

  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const [selectedArticle, setSelectedArticle] = useState<AISuggestion | null>(null);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState<string | undefined>(undefined);
  const [endedCallSummary, setEndedCallSummary] = useState<{
    call: Call; customer: Customer | null; duration: number;
    transcript: TranscriptEntry[]; suggestions: AISuggestion[];
  } | null>(null);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketDialogSummary, setTicketDialogSummary] = useState("");

  const selectedCall = calls.find((c) => c.id === selectedCallId);

  const activeCalls = calls.filter((c) => c.status === "active" || c.status === "on-hold");

  const currentCustomer = selectedCall ? customers[selectedCall.customerId] : null;
  const currentDevice = selectedCall ? deviceInfo[selectedCall.customerId] : null;
  const currentTickets = selectedCall ? customerTickets[selectedCall.customerId] || [] : [];
  const currentPastCalls = selectedCall ? customerPastCalls[selectedCall.customerId] || [] : [];

  const getTranscriptForCall = useCallback((callId: string) => {
    return callId === "call-001" ? simulatedTranscript : simulatedTranscript2;
  }, []);

  const getSuggestionsForCall = useCallback((callId: string) => {
    return callId === "call-001" ? suggestionsByTranscriptId : suggestionsByTranscriptId2;
  }, []);

  useEffect(() => {
    if (!selectedCallId || selectedCall?.status !== "active") return;

    const transcriptData = getTranscriptForCall(selectedCallId);
    if (transcriptIndex >= transcriptData.length) return;

    const timer = setTimeout(() => {
      const newEntry = transcriptData[transcriptIndex];
      setTranscript((prev) => [...prev, newEntry]);

      const suggestions = getSuggestionsForCall(selectedCallId);
      if (suggestions[newEntry.id]) {
        const suggestion = suggestions[newEntry.id];
        setAiSuggestions((prev) => [...prev, suggestion]);
        setTranscript((prevTranscript) => {
          const allEntries = [...prevTranscript, newEntry];
          const lastCustomer = allEntries.filter(e => e.speaker === "customer").pop();
          const customerMessage = lastCustomer?.text ?? newEntry.text;
          setAiSuggestionPairs((prev) => [...prev, { customerMessage, suggestion }]);
          return prevTranscript;
        });
      }

      setTranscriptIndex((prev) => prev + 1);
    }, transcriptIndex === 0 ? 500 : 2500 + Math.random() * 1500);

    return () => clearTimeout(timer);
  }, [selectedCallId, selectedCall?.status, transcriptIndex, getTranscriptForCall, getSuggestionsForCall]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallElapsed((prev) => {
        const next = { ...prev };
        calls.forEach((c) => {
          if (c.status === "active") {
            next[c.id] = (next[c.id] || 0) + 1;
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [calls]);

  useEffect(() => {
    const t = setTimeout(() => setSelectedCallId("call-001"), 2500);
    return () => clearTimeout(t);
  }, []);

  const handleAcceptCall = (callId: string) => {
    setCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: "active" as const } : c))
    );
    setCallElapsed((prev) => ({ ...prev, [callId]: 0 }));
    setTranscript([]);
    setAiSuggestions([]);
    setAiSuggestionPairs([]);
    setTranscriptIndex(0);
    setSidebarOpen(false);
  };

  const handleBackFromSummary = () => {
    setEndedCallSummary(null);
    setSelectedCallId(null);
    setTicketCreated(false);
    setCreatedTicket(null);
    setCallElapsed({});
    setIsMuted(false);
    setIsOnHold(false);
    setTranscript([]);
    setAiSuggestions([]);
    setAiSuggestionPairs([]);
    setTranscriptIndex(0);
    setAiChatMessages(getChatHistory());
    setCalls(initialCalls.map((c) => ({ ...c, status: c.status === "active" ? "incoming" as const : c.status })));
    setTimeout(() => setSelectedCallId("call-001"), 3000);
  };

  const handleEndCall = () => {
    if (!selectedCallId || !selectedCall) return;
    const summaryData = {
      call: selectedCall,
      customer: currentCustomer,
      duration: callElapsed[selectedCallId] || 0,
      transcript: [...transcript],
      suggestions: [...aiSuggestions],
    };
    setCalls((prev) =>
      prev.map((c) => (c.id === selectedCallId ? { ...c, status: "ended" as const } : c))
    );
    setSelectedCallId(null);
    setTranscript([]);
    setAiSuggestions([]);
    setAiSuggestionPairs([]);
    setTranscriptIndex(0);
    setEndedCallSummary(summaryData);
    setAiChatMessages(getChatHistory());
  };

  const handleToggleHold = () => {
    if (!selectedCallId) return;
    setIsOnHold(!isOnHold);
    setCalls((prev) =>
      prev.map((c) => {
        if (c.id === selectedCallId) {
          return { ...c, status: isOnHold ? ("active" as const) : ("on-hold" as const) };
        }
        return c;
      })
    );
  };

  const handleSendAIChat = (text: string) => {
    const agentMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: "agent",
      text,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
    };
    setAiChatMessages((prev) => {
      const updated = [...prev, agentMsg];
      saveChatHistory(updated);
      return updated;
    });

    setTimeout(() => {
      const aiResponse = getAiResponse(text);
      const aiMsg: ChatMessage = {
        id: `chat-ai-${Date.now()}`,
        sender: "ai",
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
      };
      setAiChatMessages((prev) => {
        const updated = [...prev, aiMsg];
        saveChatHistory(updated);
        return updated;
      });
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    if (action === "ticket") {
      const summary = generateCallSummary(
        selectedCall!,
        currentCustomer,
        transcript,
        aiSuggestions,
        callElapsed[selectedCall!.id] || 0
      );
      setTicketDialogSummary(summary);
      setTicketDialogOpen(true);
      return;
    }

    const actionConfig: Record<string, { title: string; description: string }> = {
      escalate: {
        title: "Escalated to Level 2",
        description: `Ticket ${currentTickets[0]?.id ?? "TKT-NEW"} assigned to L2 support queue. Avg. resolution: 4–6 hours.`,
      },
    };
    const cfg = actionConfig[action];
    if (cfg) toast({ title: cfg.title, description: cfg.description });
  };

  const handleTicketCreated = (ticket: CreatedTicket) => {
    setCreatedTicket(ticket);
    setTicketCreated(true);
  };

  const handleNewChat = () => {
    setAiChatMessages([]);
    clearChatHistory();
  };

  const handleOpenArticle = (s: AISuggestion) => {
    setSelectedArticle(s);
    setArticleModalOpen(true);
  };

  const hasActiveCall = selectedCall && (selectedCall.status === "active" || selectedCall.status === "on-hold");
  const hasIncomingCall = selectedCall && selectedCall.status === "incoming";

  return (
    <div className="h-full flex flex-col" data-testid="page-calls">
      <div className="flex flex-1 overflow-hidden gap-2 p-2">
        {hasIncomingCall && currentCustomer ? (
          <IncomingCallScreen
            call={selectedCall!}
            customer={currentCustomer}
            onAccept={() => handleAcceptCall(selectedCall!.id)}
          />
        ) : hasActiveCall ? (
          <div className="flex flex-col flex-1 min-w-0 gap-2">

            <div className="flex flex-1 min-h-0 gap-2">
              <div className="w-[350px] shrink-0 flex flex-col glass-panel rounded-xl overflow-hidden">
                <LiveTranscription
                  entries={transcript}
                  isLive={selectedCall!.status === "active"}
                  showSentiment={ticketCreated}
                />
              </div>

              <div className="flex-1 flex flex-col min-w-0 glass-panel rounded-xl overflow-hidden">
                <AISuggestionsPanel
                  messagePairs={aiSuggestionPairs}
                  callTopic={selectedCall?.topic}
                  onCopyToChat={(text) => setChatPrefill(text)}
                />
              </div>

              {currentCustomer && currentDevice && (
                <div className="shrink-0 flex">
                  <AnimatePresence initial={false}>
                    {rightPanelOpen ? (
                      <motion.div
                        key="right-panel-expanded"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 380, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="h-full w-[380px] glass-panel rounded-xl overflow-hidden">
                          <RightPanel
                            customer={currentCustomer}
                            device={currentDevice}
                            tickets={currentTickets}
                            pastCalls={currentPastCalls}
                            aiChatMessages={aiChatMessages}
                            onSendAIChat={handleSendAIChat}
                            chatPrefill={chatPrefill}
                            onChatPrefillConsumed={() => setChatPrefill(undefined)}
                            hasActiveSuggestions={aiSuggestions.length > 0}
                            onQuickAction={handleQuickAction}
                            onNewChat={handleNewChat}
                            onCollapse={() => setRightPanelOpen(false)}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="right-panel-collapsed"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 36, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="h-full w-[36px] glass-panel rounded-xl flex flex-col items-center pt-3 gap-2">
                          <button
                            onClick={() => setRightPanelOpen(true)}
                            className="p-1 rounded-md hover:bg-muted/40 transition-colors"
                            data-testid="button-expand-right-panel"
                          >
                            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-2">
            {endedCallSummary ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackFromSummary}
                  className="self-start gap-1.5 text-muted-foreground hover:text-foreground"
                  data-testid="button-back-from-summary"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Queue
                </Button>
                <div className="flex-1 glass-panel rounded-xl overflow-hidden">
                  <CallSummary
                    call={endedCallSummary.call}
                    customer={endedCallSummary.customer}
                    duration={endedCallSummary.duration}
                    transcript={endedCallSummary.transcript}
                    suggestions={endedCallSummary.suggestions}
                    createdTicket={createdTicket}
                    onOpenTicketDialog={() => {
                      const summary = generateCallSummary(
                        endedCallSummary.call,
                        endedCallSummary.customer,
                        endedCallSummary.transcript,
                        endedCallSummary.suggestions,
                        endedCallSummary.duration
                      );
                      setTicketDialogSummary(summary);
                      setTicketDialogOpen(true);
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 glass-panel rounded-xl overflow-hidden">
                <EmptyState />
              </div>
            )}
          </div>
        )}
      </div>

      <TicketDialog
        open={ticketDialogOpen}
        onClose={() => setTicketDialogOpen(false)}
        initialSummary={ticketDialogSummary}
        customer={currentCustomer ?? endedCallSummary?.customer ?? null}
        call={selectedCall ?? endedCallSummary?.call ?? null}
        onTicketCreated={handleTicketCreated}
      />

      <KbArticleModal
        suggestion={selectedArticle}
        open={articleModalOpen}
        onOpenChange={setArticleModalOpen}
        onCopyToChat={(text) => {
          setChatPrefill(text);
          setArticleModalOpen(false);
        }}
        callTopic={endedCallSummary?.call.topic ?? selectedCall?.topic}
      />

      <AnimatePresence>
        {hasActiveCall && selectedCall && (
          <FloatingCallWidget
            call={selectedCall}
            customer={currentCustomer}
            elapsed={callElapsed[selectedCall.id] || 0}
            isMuted={isMuted}
            isOnHold={isOnHold}
            onToggleMute={() => setIsMuted(!isMuted)}
            onToggleHold={handleToggleHold}
            onEndCall={handleEndCall}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
