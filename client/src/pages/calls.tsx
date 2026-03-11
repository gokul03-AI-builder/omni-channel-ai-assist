import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  PhoneOff,
  PhoneIncoming,
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
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ListEnd,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSidebar } from "@/components/ui/sidebar";
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
} from "@/lib/store";

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
              Copy to AI Chat
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IncomingCallAlert({
  call,
  customer,
  onAccept,
  onDecline,
}: {
  call: Call;
  customer: Customer;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="px-3 py-3 space-y-2.5"
    >
      <div className="flex items-center gap-1.5 text-primary">
        <PhoneIncoming className="w-4 h-4 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider">Incoming Call</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10 border border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {customer.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full animate-pulse-ring" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" data-testid="text-incoming-caller">{customer.name}</p>
          <p className="text-xs text-muted-foreground truncate">{customer.company}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{call.topic}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Badge variant="secondary" className="text-xs">
          {call.priority.charAt(0).toUpperCase() + call.priority.slice(1)}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {customer.accountType}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onAccept}
          className="flex-1 gap-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm hover:bg-emerald-500/30 transition-all"
          data-testid="button-accept-call"
        >
          <Phone className="w-3.5 h-3.5" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDecline}
          className="flex-1 gap-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-sm hover:bg-red-500/30 transition-all"
          data-testid="button-decline-call"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          Decline
        </Button>
      </div>
    </motion.div>
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
}: {
  entries: TranscriptEntry[];
  isLive: boolean;
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
      <div className="flex items-center justify-between gap-2 px-4 py-3 glass-header">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Live Transcription</h3>
        </div>
        <div className="flex items-center gap-3">
          {entries.length > 0 && (
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
  suggestions,
  onOpenArticle,
  onQuickAction,
  callTopic,
}: {
  suggestions: AISuggestion[];
  onOpenArticle: (s: AISuggestion) => void;
  onQuickAction: (action: string) => void;
  callTopic?: string;
}) {
  const [votes, setVotes] = useState<Record<string, "up" | "down" | null>>({});
  const { toast } = useToast();

  useEffect(() => {
    const initialVotes: Record<string, "up" | "down" | null> = {};
    suggestions.forEach((s) => { initialVotes[s.id] = getKbVote(s.id); });
    setVotes(initialVotes);
  }, [suggestions.length]);

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

  const hasFirmwareSuggestion = suggestions.some((s) => s.category === "Firmware");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-4 py-3 glass-header">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">AI KB Assist</h3>
        </div>
        <Badge variant="secondary" className="text-xs">RAG</Badge>
      </div>

      {suggestions.length > 0 && (
        <div className="px-3 py-2 border-b border-border/20 flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center mr-0.5">Quick Actions:</span>
          {hasFirmwareSuggestion && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 gap-1 rounded-full px-2 text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
              onClick={() => onQuickAction("firmware")}
              data-testid="button-qa-firmware"
            >
              <Upload className="w-3 h-3" /> Push Firmware
            </Button>
          )}
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
          <Button
            size="sm"
            variant="ghost"
            className="h-6 gap-1 rounded-full px-2 text-xs bg-muted/50 text-muted-foreground border border-border/30 hover:bg-muted"
            onClick={() => onQuickAction("technician")}
            data-testid="button-qa-tech"
          >
            <Wrench className="w-3 h-3" /> Schedule Tech
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {suggestions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bot className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm text-center">AI suggestions will appear here based on the conversation</p>
            </div>
          )}
          <AnimatePresence>
            {suggestions.map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="p-3 space-y-2 cursor-pointer hover-elevate transition-all"
                  onClick={() => onOpenArticle(suggestion)}
                  data-testid={`card-suggestion-${suggestion.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-primary leading-snug">{suggestion.title}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {suggestion.content}
                  </p>
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs">{suggestion.source}</Badge>
                      <Badge variant="secondary" className="text-xs">{suggestion.category}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-primary font-medium mr-1">{Math.round(suggestion.confidence * 100)}%</span>
                      <button
                        className={`p-0.5 rounded hover:bg-muted transition-colors ${votes[suggestion.id] === "up" ? "text-emerald-400" : "text-muted-foreground/50 hover:text-emerald-400"}`}
                        onClick={(e) => handleVote(suggestion, "up", e)}
                        data-testid={`button-vote-up-${suggestion.id}`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        className={`p-0.5 rounded hover:bg-muted transition-colors ${votes[suggestion.id] === "down" ? "text-red-400" : "text-muted-foreground/50 hover:text-red-400"}`}
                        onClick={(e) => handleVote(suggestion, "down", e)}
                        data-testid={`button-vote-down-${suggestion.id}`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Card>
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
}: {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  prefillText?: string;
  onPrefillConsumed?: () => void;
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
      <div className="px-3 pt-2 pb-0 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Chat History</span>
        {messages.length > 0 && (
          <span className="text-xs text-muted-foreground">{messages.length} messages</span>
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

function RightPanel({
  customer,
  device,
  tickets,
  pastCalls,
  aiChatMessages,
  onSendAIChat,
  chatPrefill,
  onChatPrefillConsumed,
}: {
  customer: Customer;
  device: DeviceInfo;
  tickets: Ticket[];
  pastCalls: PastCall[];
  aiChatMessages: ChatMessage[];
  onSendAIChat: (text: string) => void;
  chatPrefill?: string;
  onChatPrefillConsumed?: () => void;
}) {
  const statusColor =
    device.status === "active"
      ? "text-status-online"
      : device.status === "maintenance"
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Tabs defaultValue="ai-chat" className="flex flex-col h-full overflow-hidden">
        <div className="px-3 pt-3 pb-2 shrink-0">
          <TabsList className="w-full glass-subtle">
            <TabsTrigger value="ai-chat" className="flex-1 text-xs" data-testid="tab-ai-chat">
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex-1 text-xs" data-testid="tab-profile">
              Profile
            </TabsTrigger>
            <TabsTrigger value="device" className="flex-1 text-xs" data-testid="tab-device">
              Device
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 text-xs" data-testid="tab-history">
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="relative flex-1 min-h-0">
          <TabsContent value="ai-chat" className="absolute inset-0 mt-0 flex flex-col">
            <AgentAIChatInline
              messages={aiChatMessages}
              onSendMessage={onSendAIChat}
              prefillText={chatPrefill}
              onPrefillConsumed={onChatPrefillConsumed}
            />
          </TabsContent>

          <TabsContent value="profile" className="absolute inset-0 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
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
            </ScrollArea>
          </TabsContent>

          <TabsContent value="device" className="absolute inset-0 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg glass-bubble-primary flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm" data-testid="text-device-model">{device.model}</h4>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${device.status === "active" ? "bg-status-online" : device.status === "maintenance" ? "bg-status-away" : "bg-status-offline"}`} />
                      <span className={`text-xs capitalize ${statusColor}`}>{device.status}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-3">
                  <InfoRow label="Serial Number" value={device.serialNumber} mono />
                  <InfoRow label="Firmware" value={device.firmwareVersion} mono />
                  <InfoRow label="OS" value={device.osVersion} />
                  <InfoRow label="Connection" value={device.connectionType} />
                  <InfoRow label="Last Updated" value={device.lastUpdated} />
                </div>

                {device.firmwareVersion !== "v4.2.1" && device.model.includes("P400") && (
                  <Card className="p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-primary">Firmware Update Available</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          v4.2.1 available with NFC fixes. Can be pushed remotely.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="absolute inset-0 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
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
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-xs text-muted-foreground font-mono">{ticket.id}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-sm capitalize ${ticketStatusColor(ticket.status)}`}>
                                {ticket.status}
                              </span>
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
                    Past Calls ({pastCalls.length})
                  </h4>
                  <div className="space-y-2">
                    {pastCalls.map((pc) => (
                      <Card key={pc.id} className="p-3" data-testid={`card-past-call-${pc.id}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">{pc.topic}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {pc.date}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(pc.duration)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                          <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-primary" />
                          {pc.resolution}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
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

function CallControls({
  isMuted,
  isOnHold,
  onToggleMute,
  onToggleHold,
  onEndCall,
}: {
  isMuted: boolean;
  isOnHold: boolean;
  onToggleMute: () => void;
  onToggleHold: () => void;
  onEndCall: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-2.5 glass-controls">
      <Button
        size="sm"
        variant="ghost"
        onClick={onToggleMute}
        className={`gap-1.5 rounded-full backdrop-blur-sm border transition-all ${
          isMuted
            ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
            : "bg-white/10 text-foreground border-white/15 hover:bg-white/20"
        }`}
        data-testid="button-mute"
      >
        {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        <span className="text-xs">{isMuted ? "Unmute" : "Mute"}</span>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onToggleHold}
        className={`gap-1.5 rounded-full backdrop-blur-sm border transition-all ${
          isOnHold
            ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
            : "bg-white/10 text-foreground border-white/15 hover:bg-white/20"
        }`}
        data-testid="button-hold"
      >
        {isOnHold ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        <span className="text-xs">{isOnHold ? "Resume" : "Hold"}</span>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onEndCall}
        className="gap-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-sm hover:bg-red-500/30 transition-all"
        data-testid="button-end-call"
      >
        <PhoneOff className="w-3.5 h-3.5" />
        <span className="text-xs">End Call</span>
      </Button>
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

function CallSummary({
  call,
  customer,
  duration,
  transcript,
  suggestions,
}: {
  call: Call;
  customer: Customer | null;
  duration: number;
  transcript: TranscriptEntry[];
  suggestions: AISuggestion[];
}) {
  const keyPoints = transcript
    .filter((t) => t.speaker === "customer")
    .slice(0, 3)
    .map((t) => t.text.length > 100 ? t.text.slice(0, 100) + "…" : t.text);

  const nextActions = [
    suggestions.some((s) => s.category === "Firmware") ? "Push firmware update via Device Management Portal" : null,
    "Send follow-up email with resolution steps",
    "Update ticket with call notes and resolution",
    "Flag for CSAT survey",
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col items-center justify-start h-full py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-4"
      >
        <div className="flex items-center gap-3 glass-panel rounded-xl p-4">
          <div className="w-10 h-10 rounded-lg glass-bubble-primary flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" data-testid="text-call-summary-title">Call Ended — {customer?.name ?? call.customerName}</p>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(duration)}</span>
              <span className="text-xs text-muted-foreground">{call.topic}</span>
              <Badge variant="secondary" className="text-xs capitalize">{call.priority} priority</Badge>
            </div>
          </div>
        </div>

        {keyPoints.length > 0 && (
          <div className="glass-panel rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Customer Issues
            </h4>
            <ul className="space-y-1.5">
              {keyPoints.map((point, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

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
      </motion.div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Phone;
  label: string;
  testId: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant={active ? "secondary" : "ghost"}
          onClick={onClick}
          className={`h-7 w-7 p-0 ${active ? "text-primary" : "text-muted-foreground"}`}
          data-testid={testId}
        >
          <Icon className="w-3.5 h-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs z-50">
        {active ? `Hide ${label}` : `Show ${label}`}
      </TooltipContent>
    </Tooltip>
  );
}

export default function CallsPage() {
  const { toast } = useToast();
  const [calls, setCalls] = useState<Call[]>(initialCalls);
  const [selectedCallId, setSelectedCallId] = useState<string | null>("call-001");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>(() => getChatHistory());
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [callElapsed, setCallElapsed] = useState<Record<string, number>>({ "call-001": 187 });

  const [showSidebar, setShowSidebar] = useState(true);
  const [showCallQueue, setShowCallQueue] = useState(true);
  const [showProfile, setShowProfile] = useState(true);

  const [selectedArticle, setSelectedArticle] = useState<AISuggestion | null>(null);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState<string | undefined>(undefined);
  const [endedCallSummary, setEndedCallSummary] = useState<{
    call: Call; customer: Customer | null; duration: number;
    transcript: TranscriptEntry[]; suggestions: AISuggestion[];
  } | null>(null);

  const { toggleSidebar, open: sidebarOpen } = useSidebar();

  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
    setShowSidebar((prev) => !prev);
  }, [toggleSidebar]);

  const selectedCall = calls.find((c) => c.id === selectedCallId);
  const incomingCall = calls.find((c) => c.status === "incoming");
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
        setAiSuggestions((prev) => [...prev, suggestions[newEntry.id]]);
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

  const handleAcceptCall = (callId: string) => {
    setCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: "active" as const } : c))
    );
    setSelectedCallId(callId);
    setTranscript([]);
    setAiSuggestions([]);
    setTranscriptIndex(0);
    setCallElapsed((prev) => ({ ...prev, [callId]: 0 }));
  };

  const handleDeclineCall = (callId: string) => {
    setCalls((prev) => prev.filter((c) => c.id !== callId));
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
    setTranscriptIndex(0);
    setEndedCallSummary(summaryData);
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
    const actionConfig: Record<string, { title: string; description: string }> = {
      firmware: {
        title: "Firmware push initiated",
        description: `Scheduling v4.2.1 remote push for ${currentCustomer?.name ?? "customer"}. ETA: ~3 minutes.`,
      },
      escalate: {
        title: "Escalated to Level 2",
        description: `Ticket ${currentTickets[0]?.id ?? "TKT-NEW"} assigned to L2 support queue. Avg. resolution: 4–6 hours.`,
      },
      ticket: {
        title: "Ticket created",
        description: `New ticket opened for ${currentCustomer?.name ?? "customer"} — ${selectedCall?.topic ?? "active call issue"}.`,
      },
      technician: {
        title: "Technician scheduled",
        description: `On-site visit requested for ${currentCustomer?.company ?? "customer location"}. Premium SLA: within 4 business hours.`,
      },
    };
    const cfg = actionConfig[action];
    if (cfg) toast({ title: cfg.title, description: cfg.description });
  };

  const handleOpenArticle = (s: AISuggestion) => {
    setSelectedArticle(s);
    setArticleModalOpen(true);
  };

  const hasActiveCall = selectedCall && selectedCall.status !== "ended";

  return (
    <div className="h-full flex flex-col" data-testid="page-calls">
      <div className="flex items-center justify-between px-3 py-1.5 mx-2 mt-2 glass-panel rounded-xl overflow-visible relative z-20">
        <div className="flex items-center gap-1">
          <ToggleButton
            active={sidebarOpen}
            onClick={handleToggleSidebar}
            icon={sidebarOpen ? PanelLeftClose : PanelLeftOpen}
            label="Agent Console"
            testId="button-toggle-sidebar"
          />
          <ToggleButton
            active={showCallQueue}
            onClick={() => setShowCallQueue(!showCallQueue)}
            icon={ListEnd}
            label="Call Queue"
            testId="button-toggle-queue"
          />
        </div>

        <div className="flex items-center gap-1">
          <ToggleButton
            active={showProfile}
            onClick={() => setShowProfile(!showProfile)}
            icon={UserCircle}
            label="Profile & Device"
            testId="button-toggle-profile"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-2 p-2">
        <AnimatePresence initial={false}>
          {showCallQueue && (
            <motion.div
              key="call-queue"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden"
            >
              <div className="flex flex-col h-full w-[300px] glass-panel rounded-xl overflow-hidden">
                <div className="px-4 py-3 glass-header">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold">Call Queue</h2>
                    <Badge variant="secondary" className="text-xs">
                      {activeCalls.length}
                    </Badge>
                  </div>
                </div>

                <AnimatePresence>
                  {incomingCall && customers[incomingCall.customerId] && (
                    <div className="shrink-0 border-b border-border/30">
                      <IncomingCallAlert
                        call={incomingCall}
                        customer={customers[incomingCall.customerId]}
                        onAccept={() => handleAcceptCall(incomingCall.id)}
                        onDecline={() => handleDeclineCall(incomingCall.id)}
                      />
                    </div>
                  )}
                </AnimatePresence>

                <ScrollArea className="flex-1">
                  <div className="py-1 space-y-1">
                    {activeCalls.map((call) => (
                      <CallQueueItem
                        key={call.id}
                        call={call}
                        isSelected={call.id === selectedCallId}
                        onClick={() => {
                          if (call.id !== selectedCallId) {
                            setSelectedCallId(call.id);
                            setTranscript([]);
                            setAiSuggestions([]);
                            setAiChatMessages([]);
                            setTranscriptIndex(0);
                          }
                        }}
                        elapsed={callElapsed[call.id] || 0}
                      />
                    ))}
                  </div>

                  {activeCalls.length === 0 && !incomingCall && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Phone className="w-6 h-6 mb-2 opacity-20" />
                      <p className="text-xs">No calls in queue</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasActiveCall ? (
          <div className="flex flex-col flex-1 min-w-0 gap-2">
            <div className="flex items-center justify-between gap-2 px-4 py-2 glass-panel rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-medium">{selectedCall!.customerName}</span>
                </div>
                <Badge variant="secondary" className="text-xs capitalize">
                  {selectedCall!.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono" data-testid="text-call-duration">
                  {formatDuration(callElapsed[selectedCall!.id] || 0)}
                </span>
              </div>
            </div>

            <div className="flex flex-1 min-h-0 gap-2">
              <div className="flex-1 flex flex-col min-w-0 glass-panel rounded-xl overflow-hidden">
                <LiveTranscription
                  entries={transcript}
                  isLive={selectedCall!.status === "active"}
                />
              </div>

              <div className="flex-1 flex flex-col min-w-0 glass-panel rounded-xl overflow-hidden">
                <AISuggestionsPanel
                  suggestions={aiSuggestions}
                  onOpenArticle={handleOpenArticle}
                  onQuickAction={handleQuickAction}
                  callTopic={selectedCall?.topic}
                />
              </div>

              <AnimatePresence initial={false}>
                {showProfile && currentCustomer && currentDevice && (
                  <motion.div
                    key="right-panel"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 300, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 overflow-hidden"
                  >
                    <div className="h-full w-[300px] glass-panel rounded-xl overflow-hidden">
                      <RightPanel
                        customer={currentCustomer}
                        device={currentDevice}
                        tickets={currentTickets}
                        pastCalls={currentPastCalls}
                        aiChatMessages={aiChatMessages}
                        onSendAIChat={handleSendAIChat}
                        chatPrefill={chatPrefill}
                        onChatPrefillConsumed={() => setChatPrefill(undefined)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden">
              <CallControls
                isMuted={isMuted}
                isOnHold={isOnHold}
                onToggleMute={() => setIsMuted(!isMuted)}
                onToggleHold={handleToggleHold}
                onEndCall={handleEndCall}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 glass-panel rounded-xl overflow-hidden">
            {endedCallSummary ? (
              <CallSummary
                call={endedCallSummary.call}
                customer={endedCallSummary.customer}
                duration={endedCallSummary.duration}
                transcript={endedCallSummary.transcript}
                suggestions={endedCallSummary.suggestions}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        )}
      </div>

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
    </div>
  );
}
