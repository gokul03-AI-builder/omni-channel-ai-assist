import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Sparkles, Phone, MessageSquare, Mail, Filter, ArrowLeft, ChevronRight, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { KbFeedback } from "@shared/schema";
import { getKbFeedback } from "@/lib/store";

type ChannelFilter = "all" | "calls" | "chats" | "email";

const channelMeta: Record<ChannelFilter, { label: string; icon: React.ElementType }> = {
  all: { label: "All", icon: Filter },
  calls: { label: "Calls", icon: Phone },
  chats: { label: "Chats", icon: MessageSquare },
  email: { label: "Email", icon: Mail },
};

function formatTs(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function FeedbackKBPage() {
  const [allFeedback, setAllFeedback] = useState<KbFeedback[]>([]);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setAllFeedback(getKbFeedback());
  }, []);

  const filtered = channelFilter === "all" ? allFeedback : allFeedback.filter(f => f.channel === channelFilter);
  const selected = selectedId ? allFeedback.find(f => f.id === selectedId) ?? null : null;

  const helpful = filtered.filter(f => f.vote === "up").length;
  const notHelpful = filtered.filter(f => f.vote === "down").length;
  const total = filtered.length;
  const accuracy = total > 0 && helpful > 0 ? Math.round((helpful / total) * 100) : 0;

  const getCount = (ch: ChannelFilter) => ch === "all" ? allFeedback.length : allFeedback.filter(f => f.channel === ch).length;

  return (
    <div className="flex flex-col h-full" data-testid="page-feedback-kb">
      {/* Page header */}
      <div className="px-6 py-4 glass-header mx-4 mt-4 rounded-2xl shrink-0">
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">KB Feedback</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Helpfulness ratings on AI-suggested knowledge base articles</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-6 py-4 grid grid-cols-3 gap-4 shrink-0">
        <Card className="p-4" data-testid="card-kb-metric-helpful">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400" data-testid="text-kb-helpful">{helpful}</p>
              <p className="text-xs text-muted-foreground">Helpful</p>
            </div>
          </div>
        </Card>
        <Card className="p-4" data-testid="card-kb-metric-unhelpful">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center">
              <ThumbsDown className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400" data-testid="text-kb-unhelpful">{notHelpful}</p>
              <p className="text-xs text-muted-foreground">Not Helpful</p>
            </div>
          </div>
        </Card>
        <Card className="p-4" data-testid="card-kb-metric-accuracy">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg glass-bubble-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-kb-accuracy">{accuracy}%</p>
              <p className="text-xs text-muted-foreground">Accuracy Rate</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex-1 min-h-0 px-6 pb-4">
        {!selected ? (
          <div className="flex flex-col h-full gap-3">
            {/* Channel filter */}
            <div className="flex items-center gap-2 shrink-0" data-testid="kb-channel-filter">
              <span className="text-xs text-muted-foreground font-medium">Channel:</span>
              {(["all", "calls", "chats", "email"] as const).map((ch) => {
                const meta = channelMeta[ch];
                const isActive = channelFilter === ch;
                return (
                  <button
                    key={ch}
                    onClick={() => setChannelFilter(ch)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${isActive ? "bg-primary/15 text-primary border-primary/30" : "bg-muted/30 text-muted-foreground border-border/30 hover:bg-primary/5 hover:text-primary/80"}`}
                    data-testid={`button-kb-filter-${ch}`}
                  >
                    <meta.icon className="w-3 h-3" />
                    {meta.label}
                    <span className={`text-[10px] ${isActive ? "text-primary/70" : "text-muted-foreground/60"}`}>{getCount(ch)}</span>
                  </button>
                );
              })}
            </div>

            {/* Queue list */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-2 pr-1">
                {allFeedback.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Sparkles className="w-10 h-10 mb-3 opacity-20 text-primary" />
                    <p className="text-sm font-medium text-foreground">No KB feedback yet</p>
                    <p className="text-xs mt-1 text-center max-w-xs">Rate KB articles during calls or chats using the thumbs up / down buttons.</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Sparkles className="w-8 h-8 mb-2 opacity-20 text-primary" />
                    <p className="text-sm">No KB feedback for this channel</p>
                  </div>
                ) : filtered.map((item) => {
                  const chMeta = item.channel ? channelMeta[item.channel] : null;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className="w-full text-left glass-panel rounded-xl p-4 border border-border/20 hover:border-primary/25 hover:bg-primary/5 transition-all group"
                      data-testid={`button-kb-queue-${item.id}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.vote === "up" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                            {item.vote === "up" ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate mb-1">{item.suggestionTitle}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">{item.source}</Badge>
                              {item.callTopic && <span className="text-xs text-muted-foreground">{item.callTopic}</span>}
                              {chMeta && (
                                <span className="flex items-center gap-1 text-[10px] text-primary/70 bg-primary/10 border border-primary/20 rounded-full px-1.5 py-0.5">
                                  <chMeta.icon className="w-2.5 h-2.5" />
                                  {chMeta.label}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <Badge variant="secondary" className={`text-xs ${item.vote === "up" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                              {item.vote === "up" ? "Helpful" : "Not Helpful"}
                            </Badge>
                            <p className="text-[11px] text-muted-foreground mt-1">{formatTs(item.timestamp)}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Detail view */
          <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="button-kb-back">
                <ArrowLeft className="w-3.5 h-3.5" />
                All KB Feedback
              </button>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-4 pr-1">
                <Card className="p-5 glass-panel border-border/30">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected.vote === "up" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                      {selected.vote === "up" ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold mb-1">{selected.suggestionTitle}</h3>
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge variant="secondary">{selected.source}</Badge>
                        {selected.callTopic && <span className="text-xs text-muted-foreground">{selected.callTopic}</span>}
                        {selected.channel && (
                          <span className="flex items-center gap-1 text-[10px] text-primary/70 bg-primary/10 border border-primary/20 rounded-full px-1.5 py-0.5">
                            {selected.channel === "calls" ? <Phone className="w-2.5 h-2.5" /> : selected.channel === "chats" ? <MessageSquare className="w-2.5 h-2.5" /> : <Mail className="w-2.5 h-2.5" />}
                            {selected.channel === "calls" ? "Calls" : selected.channel === "chats" ? "Chats" : "Email"}
                          </span>
                        )}
                      </div>
                      <Separator className="mb-3" />
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={`${selected.vote === "up" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                          {selected.vote === "up" ? "Marked as Helpful" : "Marked as Not Helpful"}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{formatTs(selected.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                </Card>
                <div className="glass-panel rounded-xl p-4 border border-border/20">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Article Source</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{selected.suggestionTitle}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{selected.source}</p>
                    </div>
                    <a href="#" className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors">
                      View Article →
                    </a>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
