import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Star, MessageCircle, Sparkles, Phone, MessageSquare, Mail, Filter, Brain } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { KbFeedback } from "@shared/schema";
import { getKbFeedback } from "@/lib/store";
import RLApproval from "@/components/rl-approval";

type ChannelType = "calls" | "chats" | "email";

const feedbackItems: { id: string; customer: string; rating: number; comment: string; date: string; callTopic: string; channel: ChannelType }[] = [
  {
    id: "fb-001",
    customer: "James Wilson",
    rating: 5,
    comment: "Agent resolved my terminal issue quickly. Very professional and knowledgeable about P400 firmware updates.",
    date: "2026-03-04",
    callTopic: "P400 Firmware Update",
    channel: "calls",
  },
  {
    id: "fb-002",
    customer: "Lisa Park",
    rating: 4,
    comment: "Good support overall. Took a bit long to diagnose the connectivity issue, but the resolution worked perfectly.",
    date: "2026-03-03",
    callTopic: "V240m Wi-Fi Setup",
    channel: "chats",
  },
  {
    id: "fb-003",
    customer: "Robert Chen",
    rating: 5,
    comment: "Excellent service! Agent walked me through the entire batch processing setup step by step. Very patient.",
    date: "2026-03-02",
    callTopic: "Batch Settlement Configuration",
    channel: "calls",
  },
  {
    id: "fb-004",
    customer: "Maria Santos",
    rating: 3,
    comment: "Issue was eventually resolved but had to call back twice. The second agent was more helpful.",
    date: "2026-03-01",
    callTopic: "Card Reader Malfunction",
    channel: "chats",
  },
];

const channelMeta: Record<ChannelType | "all", { label: string; icon: React.ElementType }> = {
  all: { label: "All", icon: Filter },
  calls: { label: "Calls", icon: Phone },
  chats: { label: "Chats", icon: MessageSquare },
  email: { label: "Email", icon: Mail },
};

export default function FeedbackPage() {
  const [kbFeedback, setKbFeedback] = useState<KbFeedback[]>([]);
  const [kbChannelFilter, setKbChannelFilter] = useState<ChannelType | "all">("all");

  useEffect(() => {
    setKbFeedback(getKbFeedback());
  }, []);

  const filteredKbFeedback = kbChannelFilter === "all" ? kbFeedback : kbFeedback.filter(f => f.channel === kbChannelFilter);

  const kbHelpful = filteredKbFeedback.filter((f) => f.vote === "up").length;
  const kbUnhelpful = filteredKbFeedback.filter((f) => f.vote === "down").length;

  const getKbChannelCount = (ch: ChannelType | "all") => ch === "all" ? kbFeedback.length : kbFeedback.filter(f => f.channel === ch).length;

  return (
    <div className="flex flex-col h-full" data-testid="page-feedback">
      <div className="px-6 py-4 glass-header mx-4 mt-4 rounded-2xl">
        <h2 className="text-lg font-semibold">Feedback</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Customer satisfaction & knowledge base ratings</p>
      </div>

      <div className="flex-1 min-h-0 px-6 pb-4">
        <Tabs defaultValue="rl-approval" className="flex flex-col h-full">
          <TabsList className="glass-subtle mb-3 shrink-0 w-fit">
            <TabsTrigger value="rl-approval" className="text-xs gap-1.5" data-testid="tab-rl-approval">
              <Brain className="w-3 h-3" />
              RL Approval
            </TabsTrigger>
            <TabsTrigger value="customer" className="text-xs">Customer Feedback</TabsTrigger>
            <TabsTrigger value="ai-kb" className="text-xs" data-testid="tab-ai-kb-feedback">
              KB Feedback
              {kbFeedback.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs px-1 py-0 h-4">{kbFeedback.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rl-approval" className="flex-1 min-h-0 mt-0">
            <RLApproval />
          </TabsContent>

          <TabsContent value="customer" className="flex-1 min-h-0 mt-0 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center gap-4" data-testid="customer-feedback-coming-soon">
              <div className="w-16 h-16 rounded-2xl glass-bubble-primary flex items-center justify-center">
                <Star className="w-8 h-8 text-primary opacity-60" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">Coming Soon</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Customer satisfaction scores and post-interaction ratings will appear here once the integration is live.
                </p>
              </div>
              <span className="text-xs italic text-muted-foreground/50 border border-border/30 rounded-full px-3 py-1 bg-muted/20">
                In development
              </span>
            </div>
          </TabsContent>

          <TabsContent value="ai-kb" className="flex-1 min-h-0 mt-0 flex flex-col gap-3">
            <div className="flex items-center gap-2 shrink-0" data-testid="channel-filter-kb">
              <span className="text-xs text-muted-foreground font-medium shrink-0">Channel:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {(["all", "calls", "chats", "email"] as const).map((ch) => {
                  const meta = channelMeta[ch];
                  const count = getKbChannelCount(ch);
                  const isActive = kbChannelFilter === ch;
                  return (
                    <button
                      key={ch}
                      onClick={() => setKbChannelFilter(ch)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${isActive ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-primary/5 hover:text-primary/80"}`}
                      data-testid={`button-kb-filter-${ch}`}
                    >
                      <meta.icon className="w-3 h-3" />
                      {meta.label} <span className={`${isActive ? "text-primary/70" : "text-muted-foreground/70"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {filteredKbFeedback.length > 0 && (
              <div className="flex items-center gap-4 shrink-0 p-3 glass-panel rounded-lg">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">{kbHelpful}</span>
                  <span className="text-xs text-muted-foreground">helpful</span>
                </div>
                <Separator orientation="vertical" className="h-5" />
                <div className="flex items-center gap-1.5 text-red-400">
                  <ThumbsDown className="w-4 h-4" />
                  <span className="text-sm font-semibold">{kbUnhelpful}</span>
                  <span className="text-xs text-muted-foreground">not helpful</span>
                </div>
                <Separator orientation="vertical" className="h-5" />
                <span className="text-xs text-muted-foreground">
                  {filteredKbFeedback.length > 0 && kbHelpful > 0 ? Math.round((kbHelpful / filteredKbFeedback.length) * 100) : 0}% accuracy rate
                </span>
              </div>
            )}
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-3 pr-1">
                {kbFeedback.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Sparkles className="w-10 h-10 mb-3 opacity-20 text-primary" />
                    <p className="text-sm font-medium text-foreground">No KB feedback yet</p>
                    <p className="text-xs mt-1 text-center max-w-xs">
                      Rate KB articles during calls or chats using the thumbs up / down buttons on each suggestion card.
                    </p>
                  </div>
                ) : filteredKbFeedback.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Sparkles className="w-8 h-8 mb-2 opacity-20 text-primary" />
                    <p className="text-sm">No KB feedback for this channel</p>
                  </div>
                ) : (
                  filteredKbFeedback.map((item) => {
                    const chMeta = item.channel ? channelMeta[item.channel] : null;
                    return (
                      <Card key={item.id} className="p-4" data-testid={`card-kb-feedback-${item.id}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.vote === "up" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                            {item.vote === "up" ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.suggestionTitle}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="secondary" className="text-xs">{item.source}</Badge>
                              {item.callTopic && (
                                <span className="text-xs text-muted-foreground">{item.callTopic}</span>
                              )}
                              {chMeta && (
                                <span className="flex items-center gap-1 text-[10px] text-primary/70 bg-primary/10 border border-primary/20 rounded-full px-1.5 py-0.5">
                                  <chMeta.icon className="w-2.5 h-2.5" />
                                  {chMeta.label}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
                              at {new Date(item.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs shrink-0 ${item.vote === "up" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                          >
                            {item.vote === "up" ? "Helpful" : "Not Helpful"}
                          </Badge>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
