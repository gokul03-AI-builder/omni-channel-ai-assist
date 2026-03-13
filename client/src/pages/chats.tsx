import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
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
  PanelRightClose,
  PanelRightOpen,
  UserCircle,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Zap,
  TicketPlus,
  X,
  Copy,
  ClipboardCheck,
  ChevronDown,
  Plus,
  Globe,
  Mail,
  Phone,
  Search,
  Lock,
  CheckCheck,
  Pause,
  Play,
  ArrowRightLeft,
  Filter,
  History,
  Hash,
  Paperclip,
  Ticket as TicketIcon,
  ArrowUpDown,
  Timer,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type {
  ChatSession,
  ChatConversationMessage,
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
  initialChatSessions,
  chatInitialMessages,
  simulatedChatResponses,
  chatCannedResponses,
  chatKbSuggestions,
  customerTickets,
  customerPastCalls,
  getAiResponse,
  formatDuration,
  availableAgents,
} from "@/lib/mock-data";
import {
  getKbVote,
  addKbFeedback,
  addClosedChatSession,
  getClosedChatSessions,
} from "@/lib/store";
import { useSidebar } from "@/components/ui/sidebar";

const MAX_ACTIVE = 3;
const SLA_SECONDS = 300;

function channelIcon(channel: string, className = "w-3.5 h-3.5") {
  switch (channel) {
    case "web": return <Globe className={className} />;
    case "email": return <Mail className={className} />;
    case "whatsapp": return <SiWhatsapp className={className} />;
    case "sms": return <Phone className={className} />;
    default: return <MessageSquare className={className} />;
  }
}

function priorityColor(p: string) {
  switch (p) {
    case "urgent": return "text-red-400";
    case "high": return "text-orange-400";
    case "medium": return "text-yellow-400";
    default: return "text-muted-foreground";
  }
}

function priorityBadgeClass(p: string) {
  switch (p) {
    case "urgent": return "bg-red-500/15 text-red-400 border-red-500/30";
    case "high": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "medium": return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
    default: return "bg-muted text-muted-foreground border-border/30";
  }
}

function slaColor(sec: number) {
  if (sec <= 0) return "text-red-400 animate-pulse";
  if (sec < 120) return "text-red-400";
  if (sec < 180) return "text-amber-400";
  return "text-muted-foreground";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function matchKbSuggestions(text: string): AISuggestion[] {
  const lower = text.toLowerCase();
  const results: AISuggestion[] = [];
  for (const [keyword, suggestions] of Object.entries(chatKbSuggestions)) {
    if (lower.includes(keyword)) {
      results.push(...suggestions);
    }
  }
  return results;
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
    if (line.startsWith("|")) return null;
    if (line.trim() === "") return <div key={i} className="h-1" />;
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
  chatTopic,
}: {
  suggestion: AISuggestion | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCopyToChat: (text: string) => void;
  chatTopic?: string;
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
        callTopic: chatTopic,
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
                  <a key={i} href={ref.url} className="flex items-center gap-1.5 text-xs text-primary hover:underline" data-testid={`link-ref-${i}`}>
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
              size="sm" variant="ghost"
              className={`h-7 gap-1 rounded-full px-2.5 text-xs ${vote === "up" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-muted-foreground"}`}
              onClick={() => handleVote("up")}
              data-testid="button-kb-vote-up"
            >
              <ThumbsUp className="w-3 h-3" /> Yes
            </Button>
            <Button
              size="sm" variant="ghost"
              className={`h-7 gap-1 rounded-full px-2.5 text-xs ${vote === "down" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-muted-foreground"}`}
              onClick={() => handleVote("down")}
              data-testid="button-kb-vote-down"
            >
              <ThumbsDown className="w-3 h-3" /> No
            </Button>
          </div>
          {suggestion.suggestedResponse && (
            <Button size="sm" onClick={handleCopy} className="gap-1.5 h-7 rounded-full text-xs mint-glow-sm" data-testid="button-copy-to-chat">
              {copied ? <ClipboardCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Copy to Chat
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CollapsibleSection({
  title, icon, open, onToggle, children,
}: {
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
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={`text-xs text-foreground text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function QueueItem({
  session,
  isSelected,
  onClick,
}: {
  session: ChatSession;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 shrink-0 min-w-[180px] max-w-[220px] ${isSelected ? "glass-bubble-primary" : "hover-elevate"}`}
      onClick={onClick}
      data-testid={`card-chat-${session.id}`}
    >
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-medium truncate" data-testid={`text-name-${session.id}`}>{session.customerName}</p>
          <span className="text-muted-foreground shrink-0">{channelIcon(session.channel, "w-3 h-3")}</span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate" data-testid={`text-email-${session.id}`}>{session.customerEmail}</p>
      </div>
    </div>
  );
}

function ChatThread({
  messages,
  isTyping,
  onSend,
  cannedOpen,
  setCannedOpen,
  inputRef,
  inputValue,
  setInputValue,
  isInternal,
  setIsInternal,
  onKbCopy,
}: {
  messages: ChatConversationMessage[];
  isTyping: boolean;
  onSend: (text: string, internal: boolean) => void;
  cannedOpen: boolean;
  setCannedOpen: (v: boolean) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  inputValue: string;
  setInputValue: (v: string) => void;
  isInternal: boolean;
  setIsInternal: (v: boolean) => void;
  onKbCopy?: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  useEffect(() => {
    if (onKbCopy) {
      setInputValue(onKbCopy);
      inputRef.current?.focus();
    }
  }, [onKbCopy]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSend(inputValue.trim(), isInternal);
    setInputValue("");
    setIsInternal(false);
  };

  const lastAgentIdx = [...messages].reverse().findIndex(m => m.sender === "agent" && !m.isInternal);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">No messages yet</p>
            </div>
          )}
          <AnimatePresence>
            {messages.map((msg, idx) => {
              const isAgent = msg.sender === "agent";
              const isSystem = msg.sender === "system";
              const isNote = msg.isInternal;
              const isLastAgent = isAgent && !isNote && (messages.length - 1 - idx) === lastAgentIdx;

              if (isSystem) {
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                    <span className="text-xs text-muted-foreground bg-muted/30 rounded-full px-3 py-1">{msg.text}</span>
                  </motion.div>
                );
              }

              if (isNote) {
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-medium">Internal Note</span>
                        <span className="text-[10px] text-muted-foreground font-mono ml-1">{formatTime(msg.timestamp)}</span>
                      </div>
                      <div className="rounded-lg px-3 py-2 text-sm leading-relaxed bg-amber-500/10 border border-amber-500/20 text-foreground" data-testid={`text-note-${msg.id}`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${isAgent ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                    <AvatarFallback className={`text-xs ${isAgent ? "bg-primary/15 text-primary" : "bg-muted/80 text-muted-foreground"}`}>
                      {isAgent ? <User className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-[80%] ${isAgent ? "text-right" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isAgent && <span className="flex-1" />}
                      <span className="text-xs font-medium">{isAgent ? "Agent" : "Customer"}</span>
                      <span className="text-xs text-muted-foreground font-mono">{formatTime(msg.timestamp)}</span>
                      {isLastAgent && (
                        <CheckCheck className="w-3 h-3 text-primary ml-0.5" />
                      )}
                    </div>
                    <div className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${isAgent ? "glass-bubble-primary" : "glass-bubble"}`} data-testid={`text-msg-${msg.id}`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {isTyping && (
            <div className="flex items-center gap-2 text-muted-foreground pl-10">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs">Customer is typing...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border/30">
        <AnimatePresence>
          {cannedOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5">
                {chatCannedResponses.map((resp, i) => (
                  <button
                    key={i}
                    onClick={() => { setInputValue(resp); setCannedOpen(false); inputRef.current?.focus(); }}
                    className="text-xs px-2.5 py-1 rounded-full border border-border/30 bg-muted/30 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors text-muted-foreground text-left"
                    data-testid={`button-canned-${i}`}
                  >
                    {resp.length > 60 ? resp.slice(0, 57) + "..." : resp}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Button
              size="sm" variant="ghost"
              className={`h-6 px-2 text-xs gap-1 rounded-full ${isInternal ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-muted-foreground"}`}
              onClick={() => setIsInternal(!isInternal)}
              data-testid="button-toggle-internal"
            >
              <Lock className="w-3 h-3" /> {isInternal ? "Internal Note" : "Note"}
            </Button>
            <Button
              size="sm" variant="ghost"
              className={`h-6 px-2 text-xs gap-1 rounded-full ${cannedOpen ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground"}`}
              onClick={() => setCannedOpen(!cannedOpen)}
              data-testid="button-toggle-canned"
            >
              <Zap className="w-3 h-3" /> Quick
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1 rounded-full text-muted-foreground" data-testid="button-attach">
              <Paperclip className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isInternal ? "Type an internal note..." : "Type your reply..."}
              className={`flex-1 glass-input min-h-[40px] max-h-[100px] resize-none ${isInternal ? "border-amber-500/30" : ""}`}
              rows={1}
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`self-end shrink-0 ${isInternal ? "bg-amber-500 hover:bg-amber-600" : "mint-glow-sm"}`}
              data-testid="button-send-chat"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KbAssistPanel({
  suggestions,
  onOpenArticle,
  onCopyToChat,
  chatTopic,
  searchQuery,
  setSearchQuery,
}: {
  suggestions: AISuggestion[];
  onOpenArticle: (s: AISuggestion) => void;
  onCopyToChat: (text: string) => void;
  chatTopic?: string;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) {
  const [votes, setVotes] = useState<Record<string, "up" | "down" | null>>({});
  const { toast } = useToast();

  useEffect(() => {
    const initialVotes: Record<string, "up" | "down" | null> = {};
    suggestions.forEach((s) => { initialVotes[s.id] = getKbVote(s.id); });
    setVotes(initialVotes);
  }, [suggestions.map(s => s.id).join(",")]);

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
        callTopic: chatTopic,
      });
      toast({ title: newVote === "up" ? "Marked as helpful" : "Feedback recorded", description: "Your feedback improves AI accuracy." });
    }
    setVotes((prev) => ({ ...prev, [s.id]: newVote }));
  };

  const allSuggestions = searchQuery.trim()
    ? matchKbSuggestions(searchQuery)
    : suggestions;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-4 py-3 glass-header">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">KB Assist</h3>
        </div>
        <Badge variant="secondary" className="text-xs">RAG</Badge>
      </div>
      <div className="px-3 pt-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="glass-input pl-8 h-8 text-xs"
            data-testid="input-kb-search"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {allSuggestions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bot className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm text-center">
                {searchQuery ? "No articles found" : "AI suggestions will appear here based on the conversation"}
              </p>
            </div>
          )}
          <AnimatePresence>
            {allSuggestions.map((suggestion) => (
              <motion.div key={suggestion.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <Card
                  className="p-3 space-y-2 cursor-pointer hover-elevate transition-all"
                  onClick={() => onOpenArticle(suggestion)}
                  data-testid={`card-kb-${suggestion.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-primary leading-snug">{suggestion.title}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{suggestion.content}</p>
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
                  {suggestion.suggestedResponse && (
                    <Button
                      size="sm" variant="ghost"
                      className="w-full h-6 text-xs gap-1 text-primary hover:bg-primary/10 mt-1"
                      onClick={(e) => { e.stopPropagation(); onCopyToChat(suggestion.suggestedResponse!); }}
                      data-testid={`button-kb-copy-${suggestion.id}`}
                    >
                      <Copy className="w-3 h-3" /> Copy to Chat
                    </Button>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}

function ChatInfoPanel({
  session,
  customer,
  device,
  tickets,
  pastCalls,
  aiMessages,
  onSendAI,
  onCollapse,
  onNewAIChat,
  onCreateTicket,
  createdTicketId,
  chatMessages,
}: {
  session: ChatSession;
  customer: Customer;
  device: DeviceInfo;
  tickets: Ticket[];
  pastCalls: PastCall[];
  aiMessages: ChatMessage[];
  onSendAI: (text: string) => void;
  onCollapse?: () => void;
  onNewAIChat?: () => void;
  onCreateTicket: (ticket: { subject: string; body: string; priority: string; cc: string }) => void;
  createdTicketId?: string;
  chatMessages: ChatConversationMessage[];
}) {
  const devStatus = device.status.toLowerCase();
  const statusColor = devStatus === "active" ? "text-status-online" : devStatus === "maintenance" ? "text-status-away" : "text-status-offline";
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
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [aiInput, setAiInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const aiBtmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiBtmRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages.length, aiTyping]);

  useEffect(() => {
    const lastMsg = aiMessages[aiMessages.length - 1];
    if (lastMsg?.sender === "agent") {
      setAiTyping(true);
      const t = setTimeout(() => setAiTyping(false), 1200);
      return () => clearTimeout(t);
    }
  }, [aiMessages.length]);

  const handleSendAI = () => {
    if (!aiInput.trim()) return;
    onSendAI(aiInput.trim());
    setAiInput("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Tabs defaultValue="info" className="flex flex-col h-full overflow-hidden">
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            {onCollapse && (
              <button onClick={onCollapse} className="shrink-0 p-1 rounded-md hover:bg-muted/40 transition-colors" data-testid="button-collapse-right-panel">
                <PanelRightClose className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            <TabsList className="flex-1 glass-subtle">
              <TabsTrigger value="info" className="flex-1 text-xs" data-testid="tab-chat-info">Info</TabsTrigger>
              <TabsTrigger value="ai" className="flex-1 text-xs" data-testid="tab-chat-ai">AI Assist</TabsTrigger>
              <TabsTrigger value="ticket" className="flex-1 text-xs" data-testid="tab-chat-ticket">Ticket</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="relative flex-1 min-h-0">
          <TabsContent value="info" className="absolute inset-0 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                <CollapsibleSection title="Profile" icon={<UserCircle className="w-3.5 h-3.5" />} open={profileOpen} onToggle={() => setProfileOpen(!profileOpen)}>
                  <div className="space-y-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">{customer.avatarInitials}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-status-online border-2 border-background" />
                      </div>
                      <div>
                        <h3 className="font-semibold" data-testid="text-chat-customer-name">{customer.name}</h3>
                        <p className="text-sm text-muted-foreground">{customer.company}</p>
                      </div>
                      <Badge variant="default" className="text-xs">{customer.accountType}</Badge>
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
                        <h4 className="font-semibold text-sm" data-testid="text-chat-device-model">{device.model}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${devStatus === "active" ? "bg-status-online" : devStatus === "maintenance" ? "bg-status-away" : "bg-status-offline"}`} />
                          <span className={`text-xs capitalize ${statusColor}`}>{device.status}</span>
                        </div>
                      </div>
                    </div>
                    <Separator className="bg-border/50" />
                    <div className="space-y-3">
                      <InfoRow label="Serial Number" value={device.serialNumber} mono />
                      <InfoRow label="Model" value={device.model} mono />
                      <InfoRow label="Software" value={device.softwareVersion} mono />
                      <InfoRow label="Network" value={device.network} />
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="History" icon={<Clock className="w-3.5 h-3.5" />} open={historyOpen} onToggle={() => setHistoryOpen(!historyOpen)}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Support Tickets ({tickets.length})</h4>
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
                          </Card>
                        ))}
                      </div>
                    </div>
                    {pastCalls.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Past Interactions ({pastCalls.length})</h4>
                        <div className="space-y-2">
                          {pastCalls.map((pc) => (
                            <Card key={pc.id} className="p-3">
                              <p className="text-xs font-medium">{pc.topic}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{pc.date} · {formatDuration(pc.duration)}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{pc.resolution}</p>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai" className="absolute inset-0 mt-0 flex flex-col overflow-hidden">
            <div className="px-3 pt-2 pb-0 flex items-center justify-between shrink-0">
              <span className="text-xs text-muted-foreground">AI Chat{aiMessages.length > 0 ? ` · ${aiMessages.length}` : ""}</span>
              {onNewAIChat && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={onNewAIChat} data-testid="button-new-ai-chat">
                  <Plus className="w-3 h-3" /> New
                </Button>
              )}
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                {aiMessages.length === 0 && (
                  <div className="text-center py-4">
                    <Bot className="w-8 h-8 opacity-20 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Ask about troubleshooting, firmware, warranty, or escalation.</p>
                  </div>
                )}
                {aiMessages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${msg.sender === "agent" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                      <AvatarFallback className={`text-xs ${msg.sender === "ai" ? "bg-primary/15 text-primary" : "bg-muted/80"}`}>
                        {msg.sender === "ai" ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg px-3 py-2 text-xs leading-relaxed max-w-[85%] ${msg.sender === "ai" ? "glass-bubble-primary" : "glass-bubble"}`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {aiTyping && (
                  <div className="flex gap-2">
                    <Avatar className="h-6 w-6 shrink-0"><AvatarFallback className="text-xs bg-primary/15 text-primary"><Bot className="w-3 h-3" /></AvatarFallback></Avatar>
                    <div className="glass-bubble-primary rounded-lg px-3 py-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={aiBtmRef} />
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-border/30">
              <div className="flex gap-2">
                <Input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendAI()}
                  placeholder="Ask AI assistant..."
                  className="flex-1 glass-input"
                  data-testid="input-chat-ai"
                />
                <Button size="icon" onClick={handleSendAI} disabled={!aiInput.trim()} className="mint-glow-sm" data-testid="button-send-chat-ai">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ticket" className="absolute inset-0 mt-0 flex flex-col overflow-hidden">
            <TicketTabForm
              session={session}
              customer={customer}
              chatMessages={chatMessages}
              onCreateTicket={onCreateTicket}
              createdTicketId={createdTicketId}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function TicketTabForm({
  session,
  customer,
  chatMessages,
  onCreateTicket,
  createdTicketId,
}: {
  session: ChatSession;
  customer: Customer;
  chatMessages: ChatConversationMessage[];
  onCreateTicket: (ticket: { subject: string; body: string; priority: string; cc: string }) => void;
  createdTicketId?: string;
}) {
  const [subject, setSubject] = useState(`Chat: ${session.topic}`);
  const [body, setBody] = useState(() => {
    const lastMsgs = chatMessages.slice(-5).map(m => `[${m.sender}] ${m.text}`).join("\n");
    return `Customer: ${customer.name}\nChannel: ${session.channel}\n\nRecent messages:\n${lastMsgs}`;
  });
  const [priority, setPriority] = useState("medium");
  const [cc, setCc] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const lastMsgs = chatMessages.slice(-5).map(m => `[${m.sender}] ${m.text}`).join("\n");
    setSubject(`Chat: ${session.topic}`);
    setBody(`Customer: ${customer.name}\nChannel: ${session.channel}\n\nRecent messages:\n${lastMsgs}`);
    setPriority("medium");
    setCc("");
    setSubmitted(!!createdTicketId);
  }, [session.id]);

  useEffect(() => {
    if (createdTicketId) setSubmitted(true);
  }, [createdTicketId]);

  if (submitted && createdTicketId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
        <h4 className="text-sm font-semibold">Ticket Created</h4>
        <p className="text-xs text-muted-foreground">{createdTicketId}</p>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSubmitted(false)} data-testid="button-ticket-new">
          Create Another
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <TicketIcon className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold">Create Support Ticket</h4>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="glass-input text-xs h-8" data-testid="input-ticket-subject" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="glass-input text-xs min-h-[120px] resize-none" rows={6} data-testid="input-ticket-body" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
            <div className="flex gap-1.5">
              {["low", "medium", "high", "urgent"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 text-xs py-1.5 rounded-md capitalize transition-colors ${priority === p
                    ? p === "urgent" ? "bg-red-500/15 text-red-400 border border-red-500/30"
                      : p === "high" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                        : p === "medium" ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                          : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                    : "text-muted-foreground hover:bg-muted/30 border border-transparent"
                  }`}
                  data-testid={`button-ticket-priority-${p}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">CC (optional)</label>
            <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="email@verifone.com" className="glass-input text-xs h-8" data-testid="input-ticket-cc" />
          </div>
          <Button
            className="w-full mint-glow-sm text-sm gap-2 mt-2"
            onClick={() => onCreateTicket({ subject, body, priority, cc })}
            disabled={!subject.trim() || !body.trim()}
            data-testid="button-ticket-submit"
          >
            <TicketIcon className="w-4 h-4" /> Create Ticket
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}

function TransferModal({
  open,
  onOpenChange,
  onTransfer,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onTransfer: (agentId: string, agentName: string) => void;
}) {
  const [selected, setSelected] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-border/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Transfer Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {availableAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelected(agent.id)}
              disabled={agent.status !== "available"}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${selected === agent.id ? "glass-bubble-primary" : "hover-elevate"} ${agent.status !== "available" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              data-testid={`button-agent-${agent.id}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-muted">{agent.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{agent.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{agent.status}</p>
              </div>
              {agent.status === "available" && (
                <span className="w-2 h-2 rounded-full bg-status-online" />
              )}
            </button>
          ))}
        </div>
        <Button
          className="w-full mt-3 mint-glow-sm"
          disabled={!selected}
          onClick={() => {
            const agent = availableAgents.find(a => a.id === selected);
            if (agent) onTransfer(agent.id, agent.name);
            onOpenChange(false);
          }}
          data-testid="button-confirm-transfer"
        >
          Transfer
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function TicketModal({
  open,
  onOpenChange,
  session,
  messages,
  onCreateTicket,
  createdTicketId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  session: ChatSession;
  messages: ChatConversationMessage[];
  onCreateTicket: (ticket: { subject: string; body: string; priority: string; cc: string }) => void;
  createdTicketId?: string;
}) {
  const customerMsgs = messages.filter(m => m.sender === "customer").map(m => m.text).join("\n");
  const [subject, setSubject] = useState(session.topic);
  const [body, setBody] = useState(`Chat transcript summary:\n\n${customerMsgs.slice(0, 500)}`);
  const [priority, setPriority] = useState<string>(session.priority === "urgent" ? "high" : session.priority);
  const [cc, setCc] = useState("");
  const [created, setCreated] = useState(false);

  useEffect(() => {
    if (open) {
      setSubject(session.topic);
      setBody(`Chat transcript summary:\n\n${customerMsgs.slice(0, 500)}`);
      setPriority(session.priority === "urgent" ? "high" : session.priority);
      setCc("");
      setCreated(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-border/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <TicketPlus className="w-4 h-4 text-primary" /> Create Email Ticket
          </DialogTitle>
        </DialogHeader>
        {created ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Ticket Created</h3>
            <p className="text-sm text-muted-foreground">{createdTicketId || "Ticket created"}</p>
            <Button className="mt-4" onClick={() => onOpenChange(false)} data-testid="button-ticket-done">Done</Button>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="glass-input" data-testid="input-ticket-subject" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="glass-input min-h-[120px]" data-testid="input-ticket-body" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="glass-input" data-testid="select-ticket-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">CC (optional)</label>
                <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="email@company.com" className="glass-input" data-testid="input-ticket-cc" />
              </div>
            </div>
            <Button
              className="w-full mint-glow-sm"
              onClick={() => {
                onCreateTicket({ subject, body, priority, cc });
                setCreated(true);
              }}
              data-testid="button-create-ticket"
            >
              Create Ticket
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChatSummaryOverlay({
  session,
  messages,
  duration,
  ticketId,
  onClose,
}: {
  session: ChatSession;
  messages: ChatConversationMessage[];
  duration: number;
  ticketId?: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-20 flex items-center justify-center p-8"
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <Card className="relative glass-panel border-border/30 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold">Chat Summary</h3>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{session.customerName}</span>
            <span>·</span>
            <span>{session.customerCompany}</span>
            <span>·</span>
            <span>{formatDuration(duration)}</span>
            <span>·</span>
            <span>{messages.filter(m => m.sender !== "system").length} messages</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">{session.channel}</Badge>
            <Badge variant="outline" className={`text-xs ${priorityBadgeClass(session.priority)}`}>{session.priority}</Badge>
            {ticketId && <Badge className="text-xs bg-blue-500/15 text-blue-400">Ticket: {ticketId}</Badge>}
          </div>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-5 py-3 space-y-2">
            {messages.filter(m => m.sender !== "system").map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.sender === "agent" ? "flex-row-reverse" : ""}`}>
                <span className={`text-[10px] font-medium shrink-0 mt-1 ${msg.sender === "agent" ? "text-primary" : "text-muted-foreground"}`}>
                  {msg.sender === "agent" ? "Agent" : "Customer"}
                </span>
                <p className={`text-xs leading-relaxed rounded-lg px-2.5 py-1.5 max-w-[80%] ${msg.sender === "agent" ? "glass-bubble-primary" : "glass-bubble"} ${msg.isInternal ? "border border-amber-500/20 bg-amber-500/5" : ""}`}>
                  {msg.isInternal && <Lock className="w-2.5 h-2.5 inline mr-1 text-amber-400" />}
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="px-5 py-3 border-t border-border/30">
          <Button className="w-full mint-glow-sm" onClick={onClose} data-testid="button-close-summary">
            Close Summary
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export default function ChatsPage() {
  const { toast } = useToast();
  const { setOpen: setSidebarOpen } = useSidebar();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [sessions, setSessions] = useState<ChatSession[]>(initialChatSessions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatConversationMessage[]>>(() => ({ ...chatInitialMessages }));
  const [simulatedIdx, setSimulatedIdx] = useState<Record<string, number>>({});
  const [customerTyping, setCustomerTyping] = useState<Record<string, boolean>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [cannedOpen, setCannedOpen] = useState(false);
  const [kbSearchQuery, setKbSearchQuery] = useState("");
  const [kbSuggestions, setKbSuggestions] = useState<Record<string, AISuggestion[]>>({});
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<AISuggestion | null>(null);
  const [kbCopyText, setKbCopyText] = useState<string | undefined>(undefined);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [aiChatMessages, setAiChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [transferOpen, setTransferOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [createdTickets, setCreatedTickets] = useState<Record<string, string>>({});
  const [summarySession, setSummarySession] = useState<ChatSession | null>(null);
  const [summaryMessages, setSummaryMessages] = useState<ChatConversationMessage[]>([]);
  const [summaryDuration, setSummaryDuration] = useState(0);
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [queueTab, setQueueTab] = useState<"queue" | "history">("queue");
  const [closedHistory, setClosedHistory] = useState(getClosedChatSessions);
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});
  const [slaTimers, setSlaTimers] = useState<Record<string, number>>({});
  const [activeSlaTimes, setActiveSlaTimes] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<"wait" | "priority">("wait");
  const [historySearch, setHistorySearch] = useState("");

  const activeSessions = sessions.filter(s => s.status === "active" || s.status === "on-hold");
  const simEligibleSessions = sessions.filter(s => s.status === "active");
  const waitingSessions = sessions.filter(s => s.status === "waiting");
  const selectedSession = sessions.find(s => s.id === selectedId) || null;
  const activeCount = activeSessions.length;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

  const filteredWaiting = waitingSessions
    .filter(s => {
      if (channelFilter !== "all" && s.channel !== channelFilter) return false;
      if (searchFilter && !s.customerName.toLowerCase().includes(searchFilter.toLowerCase()) && !s.topic.toLowerCase().includes(searchFilter.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "priority") return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

  const filteredActive = activeSessions.filter(s => {
    if (channelFilter !== "all" && s.channel !== channelFilter) return false;
    if (searchFilter && !s.customerName.toLowerCase().includes(searchFilter.toLowerCase()) && !s.topic.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const filteredHistory = closedHistory.filter(h => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return h.customerName.toLowerCase().includes(q) || h.topic.toLowerCase().includes(q);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTimes(() => {
        const now = Date.now();
        const times: Record<string, number> = {};
        sessions.forEach(s => {
          if (s.status === "waiting" || s.status === "active" || s.status === "on-hold") {
            times[s.id] = Math.floor((now - new Date(s.startTime).getTime()) / 1000);
          }
        });
        return times;
      });
      setSlaTimers(() => {
        const now = Date.now();
        const timers: Record<string, number> = {};
        sessions.forEach(s => {
          if (s.status === "waiting") {
            const elapsed = Math.floor((now - new Date(s.startTime).getTime()) / 1000);
            timers[s.id] = Math.max(0, SLA_SECONDS - elapsed);
          }
        });
        return timers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlaTimes(prev => {
        const next = { ...prev };
        activeSessions.forEach(s => {
          if (!(s.id in next)) next[s.id] = 300;
          if (s.status === "active") {
            next[s.id] = next[s.id] - 1;
          }
        });
        Object.keys(next).forEach(k => {
          if (!activeSessions.find(s => s.id === k)) delete next[k];
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSessions.map(s => `${s.id}-${s.status}`).join(",")]);

  const getSlaBadgeClass = (remaining: number) => {
    if (remaining <= 0) return "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse";
    if (remaining < 60) return "bg-red-500/15 text-red-400 border-red-500/30";
    if (remaining < 120) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    return "bg-muted/30 text-muted-foreground";
  };

  const formatSla = (secs: number) => {
    const abs = Math.abs(secs);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    return `${secs < 0 ? "-" : ""}${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const outerTimers: ReturnType<typeof setTimeout>[] = [];
    const innerTimers: ReturnType<typeof setTimeout>[] = [];
    simEligibleSessions.forEach(session => {
      const simMsgs = simulatedChatResponses[session.id];
      if (!simMsgs) return;
      const idx = simulatedIdx[session.id] || 0;
      if (idx >= simMsgs.length) return;

      const delay = 8000 + Math.random() * 7000;
      const outer = setTimeout(() => {
        setCustomerTyping(prev => ({ ...prev, [session.id]: true }));
        const typeDelay = 1500 + Math.random() * 1500;
        const inner = setTimeout(() => {
          setCustomerTyping(prev => ({ ...prev, [session.id]: false }));
          const newMsg: ChatConversationMessage = {
            ...simMsgs[idx],
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => ({
            ...prev,
            [session.id]: [...(prev[session.id] || []), newMsg],
          }));
          setSimulatedIdx(prev => ({ ...prev, [session.id]: (prev[session.id] || 0) + 1 }));
          if (selectedIdRef.current !== session.id) {
            setSessions(prev => prev.map(s => s.id === session.id ? { ...s, unreadCount: s.unreadCount + 1, lastMessageTime: newMsg.timestamp } : s));
          }
          setMessages(prev => {
            const allMsgs = prev[session.id] || [];
            const lastCustomer = allMsgs.filter(m => m.sender === "customer").pop();
            if (lastCustomer) {
              const suggestions = matchKbSuggestions(lastCustomer.text);
              if (suggestions.length > 0) {
                setKbSuggestions(p => ({ ...p, [session.id]: suggestions }));
              }
            }
            return prev;
          });
        }, typeDelay);
        innerTimers.push(inner);
      }, delay);

      outerTimers.push(outer);
    });

    return () => {
      outerTimers.forEach(t => clearTimeout(t));
      innerTimers.forEach(t => clearTimeout(t));
    };
  }, [simEligibleSessions.map(s => s.id).join(","), JSON.stringify(simulatedIdx)]);

  useEffect(() => {
    if (selectedId) {
      const sessionMsgs = messages[selectedId] || [];
      const lastCustomer = sessionMsgs.filter(m => m.sender === "customer").pop();
      if (lastCustomer) {
        const suggestions = matchKbSuggestions(lastCustomer.text);
        if (suggestions.length > 0) {
          setKbSuggestions(prev => ({ ...prev, [selectedId]: suggestions }));
        }
      }
    }
  }, [selectedId]);

  const handleAccept = useCallback((sessionId: string) => {
    if (activeCount >= MAX_ACTIVE) {
      toast({ title: "Maximum chats reached", description: "You can handle up to 3 simultaneous chats. Close one first.", variant: "destructive" });
      return;
    }
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: "active" as const, startTime: new Date().toISOString() } : s));
    setSelectedId(sessionId);
    const sysMsgId = `sys-${Date.now()}`;
    setMessages(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), {
        id: sysMsgId,
        sessionId,
        sender: "system" as const,
        text: "Agent joined the chat",
        timestamp: new Date().toISOString(),
      }],
    }));
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, unreadCount: 0 } : s));
    setSidebarOpen(false);
    toast({ title: "Chat accepted", description: `You're now chatting with ${sessions.find(s => s.id === sessionId)?.customerName}` });
  }, [activeCount, sessions, setSidebarOpen]);

  const handleDecline = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (selectedId === sessionId) setSelectedId(null);
    toast({ title: "Chat declined" });
  }, [selectedId]);

  const handleSendMessage = useCallback((text: string, internal: boolean) => {
    if (!selectedId) return;
    const newMsg: ChatConversationMessage = {
      id: `msg-${Date.now()}`,
      sessionId: selectedId,
      sender: "agent",
      text,
      timestamp: new Date().toISOString(),
      isInternal: internal || undefined,
    };
    setMessages(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg],
    }));
    setSessions(prev => prev.map(s => s.id === selectedId ? { ...s, lastMessageTime: newMsg.timestamp } : s));
  }, [selectedId]);

  const handleSelectSession = useCallback((id: string) => {
    setSelectedId(id);
    setSessions(prev => prev.map(s => s.id === id ? { ...s, unreadCount: 0 } : s));
    setCannedOpen(false);
    setKbCopyText(undefined);
  }, []);

  const handleHoldToggle = useCallback(() => {
    if (!selectedId) return;
    const session = sessions.find(s => s.id === selectedId);
    if (!session) return;
    const newStatus = session.status === "on-hold" ? "active" : "on-hold";
    setSessions(prev => prev.map(s => s.id === selectedId ? { ...s, status: newStatus as "active" | "on-hold" } : s));
    const sysMsgId = `sys-${Date.now()}`;
    setMessages(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), {
        id: sysMsgId,
        sessionId: selectedId,
        sender: "system" as const,
        text: newStatus === "on-hold" ? "Chat placed on hold" : "Chat resumed",
        timestamp: new Date().toISOString(),
      }],
    }));
    toast({ title: newStatus === "on-hold" ? "Chat on hold" : "Chat resumed" });
  }, [selectedId, sessions]);

  const handleCloseChat = useCallback(() => {
    if (!selectedId) return;
    const session = sessions.find(s => s.id === selectedId);
    if (!session) return;
    const sessionMessages = messages[selectedId] || [];
    const duration = elapsedTimes[selectedId] || 0;
    setSummarySession(session);
    setSummaryMessages(sessionMessages);
    setSummaryDuration(duration);
    addClosedChatSession({
      id: session.id,
      customerId: session.customerId,
      customerName: session.customerName,
      customerCompany: session.customerCompany,
      channel: session.channel,
      topic: session.topic,
      duration,
      messageCount: sessionMessages.filter(m => m.sender !== "system").length,
      closedAt: new Date().toISOString(),
      ticketCreated: createdTickets[session.id],
    });
    setClosedHistory(getClosedChatSessions());
    setSessions(prev => prev.filter(s => s.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, sessions, messages, elapsedTimes, createdTickets]);

  const handleTransfer = useCallback((agentId: string, agentName: string) => {
    if (!selectedId) return;
    const sysMsgId = `sys-${Date.now()}`;
    setMessages(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), {
        id: sysMsgId,
        sessionId: selectedId,
        sender: "system" as const,
        text: `Chat transferred to ${agentName}`,
        timestamp: new Date().toISOString(),
      }],
    }));
    setTimeout(() => {
      setSessions(prev => prev.filter(s => s.id !== selectedId));
      setSelectedId(null);
    }, 1000);
    toast({ title: "Chat transferred", description: `Transferred to ${agentName}` });
  }, [selectedId]);

  const handleCreateTicket = useCallback((sid: string, ticket: { subject: string; body: string; priority: string; cc: string }) => {
    const ticketId = `TKT-${Math.floor(Math.random() * 9000 + 1000)}`;
    setCreatedTickets(prev => ({ ...prev, [sid]: ticketId }));
    const sysMsgId = `sys-${Date.now()}`;
    setMessages(prev => ({
      ...prev,
      [sid]: [...(prev[sid] || []), {
        id: sysMsgId,
        sessionId: sid,
        sender: "system" as const,
        text: `Ticket ${ticketId} created: ${ticket.subject}`,
        timestamp: new Date().toISOString(),
      }],
    }));
    toast({ title: "Ticket created", description: ticketId });
  }, []);

  const handleSendAI = useCallback((sessionId: string, text: string) => {
    const agentMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: "agent",
      text,
      timestamp: new Date().toISOString(),
    };
    setAiChatMessages(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), agentMsg],
    }));
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}-r`,
        sender: "ai",
        text: getAiResponse(text),
        timestamp: new Date().toISOString(),
      };
      setAiChatMessages(prev => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), aiReply],
      }));
    }, 1200);
  }, []);

  const handleNewAIChat = useCallback(() => {
    if (selectedId) {
      setAiChatMessages(prev => ({ ...prev, [selectedId]: [] }));
    }
  }, [selectedId]);

  const currentCustomer = selectedSession ? customers[selectedSession.customerId] : null;
  const currentDevice = selectedSession ? deviceInfo[selectedSession.customerId] : null;
  const currentTickets = selectedSession ? (customerTickets[selectedSession.customerId] || []) : [];
  const currentPastCalls = selectedSession ? (customerPastCalls[selectedSession.customerId] || []) : [];
  const currentMessages = selectedId ? (messages[selectedId] || []) : [];
  const currentKbSuggestions = selectedId ? (kbSuggestions[selectedId] || []) : [];
  const currentAiMessages = selectedId ? (aiChatMessages[selectedId] || []) : [];
  const isCustomerTyping = selectedId ? (customerTyping[selectedId] || false) : false;
  const currentInputValue = selectedId ? (inputValues[selectedId] || "") : "";

  const noSessions = sessions.length === 0 && !summarySession;

  if (noSessions) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground" data-testid="page-chats-empty">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-primary opacity-60" />
        </div>
        <h3 className="font-semibold text-foreground mb-1" data-testid="text-no-chats">No active chats</h3>
        <p className="text-sm">Waiting for customer sessions...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" data-testid="page-chats">
      <AnimatePresence>
        {summarySession && (
          <ChatSummaryOverlay
            session={summarySession}
            messages={summaryMessages}
            duration={summaryDuration}
            ticketId={createdTickets[summarySession.id]}
            onClose={() => setSummarySession(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 overflow-hidden gap-2 p-2">

      <div className="shrink-0 glass-panel rounded-xl overflow-hidden">
        <div className="px-3 py-2 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold" data-testid="text-chats-title">Chats</h2>
            {waitingSessions.length > 0 && (
              <Badge className="text-[10px] px-1.5 h-4 bg-primary/15 text-primary">{waitingSessions.length}</Badge>
            )}
            <span className="text-xs text-muted-foreground">{activeCount}/{MAX_ACTIVE} active</span>
          </div>

          <div className="flex gap-1 items-center shrink-0">
            <button
              onClick={() => setQueueTab("queue")}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${queueTab === "queue" ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-muted/30"}`}
              data-testid="tab-queue"
            >
              Queue
            </button>
            <button
              onClick={() => setQueueTab("history")}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${queueTab === "history" ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:bg-muted/30"}`}
              data-testid="tab-history"
            >
              <History className="w-3 h-3" /> History
            </button>
          </div>

          <div className="flex gap-1 items-center shrink-0">
            {["all", "web", "email", "whatsapp", "sms"].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`text-[10px] px-2 py-1 rounded-full transition-colors ${channelFilter === ch ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-muted/30"}`}
                data-testid={`filter-${ch}`}
              >
                {ch === "all" ? "All" : channelIcon(ch, "w-3 h-3 inline")}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search chats..."
              className="glass-input pl-8 h-7 text-xs w-[160px]"
              data-testid="input-chat-search"
            />
          </div>

          <button
            onClick={() => setSortBy(prev => prev === "wait" ? "priority" : "wait")}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-muted/20 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground shrink-0"
            title={`Sort by ${sortBy === "wait" ? "Wait Time" : "Priority"}`}
            data-testid="button-sort-toggle"
          >
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>

        {queueTab === "queue" ? (
          <div className="px-3 pb-2">
            {filteredWaiting.length > 0 && (
              <div className="mb-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pb-1">
                  Waiting ({filteredWaiting.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1" data-testid="queue-waiting-row">
                  {filteredWaiting.map((session) => (
                    <QueueItem
                      key={session.id}
                      session={session}
                      isSelected={selectedId === session.id}
                      onClick={() => handleAccept(session.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {filteredActive.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pb-1">
                  Active ({filteredActive.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1" data-testid="queue-active-row">
                  {filteredActive.map((session) => (
                    <QueueItem
                      key={session.id}
                      session={session}
                      isSelected={selectedId === session.id}
                      onClick={() => handleSelectSession(session.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {filteredWaiting.length === 0 && filteredActive.length === 0 && (
              <div className="flex items-center justify-center py-2 text-muted-foreground">
                <Filter className="w-4 h-4 mr-2 opacity-30" />
                <p className="text-xs">No matching chats</p>
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 pb-2">
            <div className="flex gap-2 items-start">
              <div className="relative shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search history..."
                  className="glass-input pl-8 h-7 text-xs w-[160px]"
                  data-testid="input-history-search"
                />
              </div>
              {filteredHistory.length === 0 ? (
                <div className="flex items-center py-1 text-muted-foreground">
                  <History className="w-4 h-4 mr-2 opacity-30" />
                  <p className="text-xs">{historySearch ? "No matching history" : "No chat history yet"}</p>
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1" data-testid="queue-history-row">
                  {filteredHistory.map((h) => (
                    <Card key={h.id} className="p-2 shrink-0 min-w-[180px] max-w-[220px] space-y-0.5" data-testid={`card-history-${h.id}`}>
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-medium truncate">{h.customerName}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{new Date(h.closedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{h.topic}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span>{formatDuration(h.duration)}</span>
                        <span>·</span>
                        <span>{h.messageCount} msgs</span>
                        {h.ticketCreated && (
                          <>
                            <span>·</span>
                            <span className="text-primary">{h.ticketCreated}</span>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!selectedSession || (selectedSession.status === "waiting") ? (
          <div className="flex flex-col items-center justify-center h-full glass-panel rounded-xl text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7 text-primary opacity-60" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              {selectedSession ? "Accept chat to start" : "Select a chat"}
            </h3>
            <p className="text-sm">
              {selectedSession ? `${selectedSession.customerName} is waiting` : "Choose from the queue above"}
            </p>
          </div>
        ) : (
          <div className="flex h-full gap-2">
            <div className="flex-1 flex flex-col h-full min-w-0 glass-panel rounded-xl overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-4 py-2 glass-header">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/15 text-primary">{selectedSession.customerInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{selectedSession.customerName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{selectedSession.topic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {selectedSession.status === "on-hold" && (
                    <Badge className="text-[10px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 mr-1">ON HOLD</Badge>
                  )}
                  {(selectedSession.status === "active" || selectedSession.status === "on-hold") && activeSlaTimes[selectedId!] !== undefined && (
                    <Badge className={`text-[10px] font-mono border mr-1 ${getSlaBadgeClass(activeSlaTimes[selectedId!])}`} data-testid="badge-active-sla">
                      <Timer className="w-3 h-3 mr-1" />
                      SLA {formatSla(activeSlaTimes[selectedId!])}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground font-mono mr-2">{formatDuration(elapsedTimes[selectedId!] || 0)}</span>
                  <Button
                    size="sm" variant="ghost"
                    className={`h-7 w-7 p-0 ${selectedSession.status === "on-hold" ? "text-yellow-400" : "text-muted-foreground"}`}
                    onClick={handleHoldToggle}
                    data-testid="button-hold"
                  >
                    {selectedSession.status === "on-hold" ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground"
                    onClick={() => setTransferOpen(true)}
                    data-testid="button-transfer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground"
                    onClick={() => setTicketOpen(true)}
                    data-testid="button-ticket"
                  >
                    <TicketPlus className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={handleCloseChat}
                    data-testid="button-close-chat"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {activeSessions.length > 1 && (
                <div className="flex gap-1 px-3 py-1.5 border-b border-border/30 bg-muted/5">
                  {activeSessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSession(s.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${selectedId === s.id ? "bg-primary/15 text-primary font-medium border border-primary/30" : "text-muted-foreground hover:bg-muted/30"}`}
                      data-testid={`tab-session-${s.id}`}
                    >
                      {channelIcon(s.channel, "w-3 h-3")}
                      <span className="truncate max-w-[80px]">{s.customerName.split(" ")[0]}</span>
                      {s.unreadCount > 0 && selectedId !== s.id && (
                        <span className="min-w-[14px] h-[14px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-0.5">
                          {s.unreadCount}
                        </span>
                      )}
                      {s.status === "on-hold" && (
                        <Pause className="w-2.5 h-2.5 text-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <ChatThread
                messages={currentMessages}
                isTyping={isCustomerTyping}
                onSend={handleSendMessage}
                cannedOpen={cannedOpen}
                setCannedOpen={setCannedOpen}
                inputRef={inputRef}
                inputValue={currentInputValue}
                setInputValue={(v) => setInputValues(prev => ({ ...prev, [selectedId!]: v }))}
                isInternal={isInternalNote}
                setIsInternal={setIsInternalNote}
                onKbCopy={kbCopyText}
              />
            </div>

            <div className="w-[320px] shrink-0 glass-panel rounded-xl overflow-hidden">
              <KbAssistPanel
                suggestions={currentKbSuggestions}
                onOpenArticle={(s) => { setSelectedArticle(s); setArticleModalOpen(true); }}
                onCopyToChat={(text) => { setInputValues(prev => ({ ...prev, [selectedId!]: text })); }}
                chatTopic={selectedSession.topic}
                searchQuery={kbSearchQuery}
                setSearchQuery={setKbSearchQuery}
              />
            </div>

            {currentCustomer && currentDevice && (
              <div className="shrink-0 flex">
                <AnimatePresence initial={false}>
                  {rightPanelOpen ? (
                    <motion.div
                      key="right-panel-expanded"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 360, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="h-full w-[360px] glass-panel rounded-xl overflow-hidden">
                        <ChatInfoPanel
                          session={selectedSession}
                          customer={currentCustomer}
                          device={currentDevice}
                          tickets={currentTickets}
                          pastCalls={currentPastCalls}
                          aiMessages={currentAiMessages}
                          onSendAI={(text) => handleSendAI(selectedId!, text)}
                          onCollapse={() => setRightPanelOpen(false)}
                          onNewAIChat={handleNewAIChat}
                          onCreateTicket={(t) => handleCreateTicket(selectedId!, t)}
                          createdTicketId={createdTickets[selectedId!]}
                          chatMessages={currentMessages}
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
                          <PanelRightOpen className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      </div>

      <KbArticleModal
        suggestion={selectedArticle}
        open={articleModalOpen}
        onOpenChange={setArticleModalOpen}
        onCopyToChat={(text) => setKbCopyText(text)}
        chatTopic={selectedSession?.topic}
      />

      {selectedSession && (
        <>
          <TransferModal
            open={transferOpen}
            onOpenChange={setTransferOpen}
            onTransfer={handleTransfer}
          />
          <TicketModal
            open={ticketOpen}
            onOpenChange={setTicketOpen}
            session={selectedSession}
            messages={currentMessages}
            onCreateTicket={(t) => handleCreateTicket(selectedId!, t)}
            createdTicketId={createdTickets[selectedId!]}
          />
        </>
      )}
    </div>
  );
}
