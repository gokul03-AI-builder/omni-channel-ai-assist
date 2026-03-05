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
  Wifi,
  Cpu,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  BookOpen,
  Headphones,
  Volume2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
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
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      className="p-3"
    >
      <div className="glass-panel rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-primary">
          <PhoneIncoming className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider">Incoming Call</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-11 w-11 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {customer.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full animate-pulse-ring" />
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
            onClick={onAccept}
            className="flex-1 gap-2 mint-glow-sm"
            data-testid="button-accept-call"
          >
            <Phone className="w-4 h-4" />
            Accept
          </Button>
          <Button
            variant="destructive"
            onClick={onDecline}
            className="flex-1 gap-2"
            data-testid="button-decline-call"
          >
            <PhoneOff className="w-4 h-4" />
            Decline
          </Button>
        </div>
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
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-breathing" />
            <span className="text-xs text-primary font-medium">LIVE</span>
          </div>
        )}
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
}: {
  suggestions: AISuggestion[];
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-4 py-3 glass-header">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Assist</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          RAG
        </Badge>
      </div>
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
                <Card className="p-3 space-y-2" data-testid={`card-suggestion-${suggestion.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-primary">{suggestion.title}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {suggestion.content}
                  </p>
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.source}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-primary font-medium">
                      {Math.round(suggestion.confidence * 100)}% match
                    </span>
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

function AgentAIChat({
  messages,
  onSendMessage,
}: {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
      <div className="flex items-center justify-between gap-2 px-4 py-3 glass-header">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">AI Chat Assistant</h3>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">
                Ask the AI assistant about troubleshooting steps, firmware details, warranty info, or escalation procedures.
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
                  msg.sender === "ai"
                    ? "glass-bubble-primary"
                    : "glass-bubble"
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
      <div className="p-3 glass-header" style={{ borderBottom: "none" }}>
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

function CustomerProfilePanel({
  customer,
  device,
  tickets,
  pastCalls,
}: {
  customer: Customer;
  device: DeviceInfo;
  tickets: Ticket[];
  pastCalls: PastCall[];
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
    <div className="flex flex-col h-full">
      <Tabs defaultValue="profile" className="flex flex-col h-full">
        <div className="px-3 pt-3">
          <TabsList className="w-full glass-subtle">
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

        <TabsContent value="profile" className="flex-1 mt-0">
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

        <TabsContent value="device" className="flex-1 mt-0">
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

        <TabsContent value="history" className="flex-1 mt-0">
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
    <div className="flex items-center justify-center gap-2 px-4 py-2 glass-controls">
      <Button
        size="sm"
        variant={isMuted ? "destructive" : "secondary"}
        onClick={onToggleMute}
        className="gap-1.5"
        data-testid="button-mute"
      >
        {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        <span className="text-xs">{isMuted ? "Unmute" : "Mute"}</span>
      </Button>
      <Button
        size="sm"
        variant={isOnHold ? "default" : "secondary"}
        onClick={onToggleHold}
        className="gap-1.5"
        data-testid="button-hold"
      >
        {isOnHold ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        <span className="text-xs">{isOnHold ? "Resume" : "Hold"}</span>
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={onEndCall}
        className="gap-1.5"
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

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>(initialCalls);
  const [selectedCallId, setSelectedCallId] = useState<string | null>("call-001");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [callElapsed, setCallElapsed] = useState<Record<string, number>>({ "call-001": 187 });

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
    if (!selectedCallId) return;
    setCalls((prev) =>
      prev.map((c) => (c.id === selectedCallId ? { ...c, status: "ended" as const } : c))
    );
    setSelectedCallId(null);
    setTranscript([]);
    setAiSuggestions([]);
    setTranscriptIndex(0);
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
    setAiChatMessages((prev) => [...prev, agentMsg]);

    setTimeout(() => {
      const aiResponse = getAiResponse(text);
      const aiMsg: ChatMessage = {
        id: `chat-ai-${Date.now()}`,
        sender: "ai",
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }),
      };
      setAiChatMessages((prev) => [...prev, aiMsg]);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col" data-testid="page-calls">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={18} minSize={14} maxSize={25}>
          <div className="flex flex-col h-full border-r border-border/50">
            <div className="px-4 py-3 glass-header">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Call Queue</h2>
                <Badge variant="secondary" className="text-xs">
                  {activeCalls.length}
                </Badge>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <AnimatePresence>
                {incomingCall && customers[incomingCall.customerId] && (
                  <IncomingCallAlert
                    call={incomingCall}
                    customer={customers[incomingCall.customerId]}
                    onAccept={() => handleAcceptCall(incomingCall.id)}
                    onDecline={() => handleDeclineCall(incomingCall.id)}
                  />
                )}
              </AnimatePresence>

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
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={52} minSize={35}>
          {selectedCall && selectedCall.status !== "ended" ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between gap-2 px-4 py-2 glass-header">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-medium">{selectedCall.customerName}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {selectedCall.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono" data-testid="text-call-duration">
                    {formatDuration(callElapsed[selectedCall.id] || 0)}
                  </span>
                </div>
              </div>

              <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={60} minSize={40}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={65} minSize={30}>
                      <LiveTranscription
                        entries={transcript}
                        isLive={selectedCall.status === "active"}
                      />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={35} minSize={20}>
                      <AgentAIChat
                        messages={aiChatMessages}
                        onSendMessage={handleSendAIChat}
                      />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={40} minSize={25}>
                  <AISuggestionsPanel suggestions={aiSuggestions} />
                </ResizablePanel>
              </ResizablePanelGroup>

              <CallControls
                isMuted={isMuted}
                isOnHold={isOnHold}
                onToggleMute={() => setIsMuted(!isMuted)}
                onToggleHold={handleToggleHold}
                onEndCall={handleEndCall}
              />
            </div>
          ) : (
            <EmptyState />
          )}
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          {currentCustomer && currentDevice ? (
            <CustomerProfilePanel
              customer={currentCustomer}
              device={currentDevice}
              tickets={currentTickets}
              pastCalls={currentPastCalls}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 opacity-30 text-primary" />
              </div>
              <p className="text-sm">Select a call to view customer details</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
