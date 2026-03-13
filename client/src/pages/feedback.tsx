import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Star, MessageCircle, TrendingUp, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { KbFeedback } from "@shared/schema";
import { getKbFeedback } from "@/lib/store";

const feedbackItems = [
  {
    id: "fb-001",
    customer: "James Wilson",
    rating: 5,
    comment: "Agent resolved my terminal issue quickly. Very professional and knowledgeable about P400 firmware updates.",
    date: "2026-03-04",
    callTopic: "P400 Firmware Update",
  },
  {
    id: "fb-002",
    customer: "Lisa Park",
    rating: 4,
    comment: "Good support overall. Took a bit long to diagnose the connectivity issue, but the resolution worked perfectly.",
    date: "2026-03-03",
    callTopic: "V240m Wi-Fi Setup",
  },
  {
    id: "fb-003",
    customer: "Robert Chen",
    rating: 5,
    comment: "Excellent service! Agent walked me through the entire batch processing setup step by step. Very patient.",
    date: "2026-03-02",
    callTopic: "Batch Settlement Configuration",
  },
  {
    id: "fb-004",
    customer: "Maria Santos",
    rating: 3,
    comment: "Issue was eventually resolved but had to call back twice. The second agent was more helpful.",
    date: "2026-03-01",
    callTopic: "Card Reader Malfunction",
  },
];

export default function FeedbackPage() {
  const [kbFeedback, setKbFeedback] = useState<KbFeedback[]>([]);
  const avgRating = (feedbackItems.reduce((sum, f) => sum + f.rating, 0) / feedbackItems.length).toFixed(1);

  useEffect(() => {
    setKbFeedback(getKbFeedback());
  }, []);

  const kbHelpful = kbFeedback.filter((f) => f.vote === "up").length;
  const kbUnhelpful = kbFeedback.filter((f) => f.vote === "down").length;

  return (
    <div className="flex flex-col h-full" data-testid="page-feedback">
      <div className="px-6 py-4 glass-header">
        <h2 className="text-lg font-semibold">Feedback</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Customer satisfaction & knowledge base ratings</p>
      </div>

      <div className="px-6 py-4 grid grid-cols-3 gap-4 shrink-0">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg glass-bubble-primary flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-avg-rating">{avgRating}</p>
              <p className="text-xs text-muted-foreground">Avg. CSAT</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg glass-bubble-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-feedback">{feedbackItems.length}</p>
              <p className="text-xs text-muted-foreground">Total Reviews</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg glass-bubble-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-satisfaction-rate">
                {Math.round((feedbackItems.filter(f => f.rating >= 4).length / feedbackItems.length) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Satisfaction</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex-1 min-h-0 px-6 pb-4">
        <Tabs defaultValue="customer" className="flex flex-col h-full">
          <TabsList className="glass-subtle mb-3 shrink-0 w-fit">
            <TabsTrigger value="customer" className="text-xs">Customer Feedback</TabsTrigger>
            <TabsTrigger value="ai-kb" className="text-xs" data-testid="tab-ai-kb-feedback">
              KB Feedback
              {kbFeedback.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs px-1 py-0 h-4">{kbFeedback.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-1">
                {feedbackItems.map((item) => (
                  <Card key={item.id} className="p-4" data-testid={`card-feedback-${item.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{item.customer}</span>
                          <Badge variant="secondary" className="text-xs">{item.callTopic}</Badge>
                        </div>
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < item.rating ? "text-yellow-500 fill-yellow-500" : "text-muted/60"}`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-2">{item.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.comment}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai-kb" className="flex-1 min-h-0 mt-0">
            {kbFeedback.length > 0 && (
              <div className="flex items-center gap-4 mb-3 p-3 glass-panel rounded-lg">
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
                {kbFeedback.length > 0 && (
                  <>
                    <Separator orientation="vertical" className="h-5" />
                    <span className="text-xs text-muted-foreground">
                      {kbHelpful > 0 ? Math.round((kbHelpful / kbFeedback.length) * 100) : 0}% accuracy rate
                    </span>
                  </>
                )}
              </div>
            )}
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-1">
                {kbFeedback.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Sparkles className="w-10 h-10 mb-3 opacity-20 text-primary" />
                    <p className="text-sm font-medium text-foreground">No KB feedback yet</p>
                    <p className="text-xs mt-1 text-center max-w-xs">
                      Rate KB articles during a call using the thumbs up / down buttons on each suggestion card.
                    </p>
                  </div>
                ) : (
                  kbFeedback.map((item) => (
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
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
