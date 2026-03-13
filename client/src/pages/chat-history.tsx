import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  XCircle,
  X,
  ChevronRight,
  Headphones,
  StickyNote,
  Globe,
  Mail,
  Phone,
  ArrowUpDown,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { chatHistoryRecords, customers } from "@/lib/mock-data";
import type { ChatHistoryRecord } from "@shared/schema";

function channelIcon(channel: string, className = "w-3.5 h-3.5") {
  switch (channel) {
    case "web": return <Globe className={className} />;
    case "email": return <Mail className={className} />;
    case "whatsapp": return <SiWhatsapp className={className} />;
    case "sms": return <Phone className={className} />;
    default: return <MessageSquare className={className} />;
  }
}

function channelLabel(channel: string) {
  switch (channel) {
    case "web": return "Web Chat";
    case "email": return "Email";
    case "whatsapp": return "WhatsApp";
    case "sms": return "SMS";
    default: return channel;
  }
}

function outcomeConfig(outcome: string) {
  switch (outcome) {
    case "resolved":
      return { icon: CheckCircle2, label: "Resolved", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" };
    case "escalated":
      return { icon: ArrowUpRight, label: "Escalated", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" };
    case "follow-up":
      return { icon: AlertTriangle, label: "Follow-up", color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30" };
    case "unresolved":
      return { icon: XCircle, label: "Unresolved", color: "text-red-400", bg: "bg-red-500/15 border-red-500/30" };
    default:
      return { icon: CheckCircle2, label: outcome, color: "text-muted-foreground", bg: "bg-muted" };
  }
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatHistoryRow({
  record,
  isSelected,
  onClick,
}: {
  record: ChatHistoryRecord;
  isSelected: boolean;
  onClick: () => void;
}) {
  const oc = outcomeConfig(record.outcome);
  const customer = customers[record.customerId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected ? "glass-bubble-primary" : "hover-elevate glass-panel"
      }`}
      onClick={onClick}
      data-testid={`card-chat-history-${record.id}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0 mt-0.5">
          <AvatarFallback className={`text-xs font-medium ${isSelected ? "bg-primary/15 text-primary" : "bg-muted"}`}>
            {customer?.avatarInitials || record.customerName.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium truncate" data-testid={`text-name-${record.id}`}>{record.customerName}</p>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${oc.bg} ${oc.color} border`}>
              <oc.icon className="w-3 h-3 mr-1" />
              {oc.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5" data-testid={`text-topic-${record.id}`}>{record.topic}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateShort(record.date)}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              {channelIcon(record.channel, "w-3 h-3")}
              {channelLabel(record.channel)}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {record.messageCount} msgs
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              {record.agentName}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
      </div>
    </motion.div>
  );
}

function DetailPanel({
  record,
  onClose,
}: {
  record: ChatHistoryRecord;
  onClose: () => void;
}) {
  const oc = outcomeConfig(record.outcome);
  const customer = customers[record.customerId];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="h-full flex flex-col glass-panel rounded-xl border border-border/30 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Chat Details</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0" data-testid="button-close-detail">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-medium">
                {customer?.avatarInitials || record.customerName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" data-testid="text-detail-name">{record.customerName}</p>
              <p className="text-xs text-muted-foreground">{record.customerCompany}</p>
            </div>
            <Badge variant="outline" className={`text-xs ${oc.bg} ${oc.color} border`}>
              <oc.icon className="w-3 h-3 mr-1" />
              {oc.label}
            </Badge>
          </div>

          <div className="glass-panel rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              Chat Info
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-muted-foreground">Date & Time</span>
                <p className="text-xs font-medium" data-testid="text-detail-date">{formatDateTime(record.date)}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Channel</span>
                <p className="text-xs font-medium flex items-center gap-1" data-testid="text-detail-channel">
                  {channelIcon(record.channel, "w-3 h-3")}
                  {channelLabel(record.channel)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Agent</span>
                <p className="text-xs font-medium" data-testid="text-detail-agent">{record.agentName}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Messages</span>
                <p className="text-xs font-medium" data-testid="text-detail-messages">{record.messageCount}</p>
              </div>
            </div>
          </div>

          {customer && (
            <div className="glass-panel rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                Customer Info
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">Email</span>
                  <span className="text-xs">{customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">Phone</span>
                  <span className="text-xs">{customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">Account</span>
                  <span className="text-xs">{customer.accountType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">Location</span>
                  <span className="text-xs">{customer.location}</span>
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              Summary
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed" data-testid="text-detail-summary">{record.summary}</p>
          </div>

          <div className="glass-panel rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              Chat Transcript
            </div>
            <div className="space-y-2">
              {record.messages.map((msg, i) => {
                const isAgent = msg.sender === "agent";
                return (
                  <div
                    key={i}
                    className={`flex gap-2 ${isAgent ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                      <AvatarFallback className={`text-[10px] ${isAgent ? "bg-primary/15 text-primary" : "bg-muted/80 text-muted-foreground"}`}>
                        {isAgent ? <Headphones className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 max-w-[80%] ${isAgent ? "text-right" : ""}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {isAgent && <span className="flex-1" />}
                        <span className="text-[10px] font-medium">{isAgent ? "Agent" : "Customer"}</span>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <div
                        className={`rounded-lg px-2.5 py-1.5 text-xs leading-relaxed ${
                          isAgent ? "glass-bubble-primary" : "glass-bubble"
                        }`}
                        data-testid={`text-chat-msg-${i}`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolution
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed" data-testid="text-detail-resolution">{record.resolution}</p>
          </div>

          <div className="glass-panel rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <StickyNote className="w-3.5 h-3.5" />
              Agent Notes
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed" data-testid="text-detail-notes">{record.agentNotes}</p>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}

type SortOption = "newest" | "oldest" | "customer-az" | "customer-za" | "messages-most" | "messages-least";

export default function ChatHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedRecord, setSelectedRecord] = useState<ChatHistoryRecord | null>(null);

  const filteredRecords = useMemo(() => {
    const filtered = chatHistoryRecords.filter((record) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = record.customerName.toLowerCase().includes(q);
        const matchesTopic = record.topic.toLowerCase().includes(q);
        const matchesCompany = record.customerCompany.toLowerCase().includes(q);
        if (!matchesName && !matchesTopic && !matchesCompany) return false;
      }
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (new Date(record.date) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        if (new Date(record.date) > to) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest": return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "customer-az": return a.customerName.localeCompare(b.customerName);
        case "customer-za": return b.customerName.localeCompare(a.customerName);
        case "messages-most": return b.messageCount - a.messageCount;
        case "messages-least": return a.messageCount - b.messageCount;
        default: return 0;
      }
    });
  }, [searchQuery, dateFrom, dateTo, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setSortBy("newest");
  };

  const hasFilters = searchQuery || dateFrom || dateTo || sortBy !== "newest";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold" data-testid="text-page-title">Chat History</h1>
            <p className="text-xs text-muted-foreground">Browse and review past chat interactions</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, topic, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm glass-panel border-border/30"
              data-testid="input-search"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">From</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 text-xs w-[140px] glass-panel border-border/30"
                data-testid="input-date-from"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">To</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 text-xs w-[140px] glass-panel border-border/30"
                data-testid="input-date-to"
              />
            </div>
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="h-9 w-[160px] text-xs glass-panel border-border/30" data-testid="select-sort">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1 shrink-0" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="customer-az">Customer A–Z</SelectItem>
              <SelectItem value="customer-za">Customer Z–A</SelectItem>
              <SelectItem value="messages-most">Most Messages</SelectItem>
              <SelectItem value="messages-least">Fewest Messages</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-xs gap-1 text-muted-foreground" data-testid="button-clear-filters">
              <X className="w-3.5 h-3.5" /> Clear
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto" data-testid="text-result-count">
            {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <Separator className="bg-border/30" />

      <div className="flex-1 flex overflow-hidden">
        <div className={`${selectedRecord ? "w-1/2 xl:w-3/5" : "w-full"} transition-all duration-300`}>
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No chat records found</p>
                  <p className="text-xs mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <ChatHistoryRow
                    key={record.id}
                    record={record}
                    isSelected={selectedRecord?.id === record.id}
                    onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <AnimatePresence>
          {selectedRecord && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "50%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-border/30 overflow-hidden xl:max-w-[40%]"
            >
              <div className="h-full p-3">
                <DetailPanel
                  record={selectedRecord}
                  onClose={() => setSelectedRecord(null)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}