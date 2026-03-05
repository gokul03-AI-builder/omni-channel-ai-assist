import { ThumbsUp, Star, MessageCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const avgRating = (feedbackItems.reduce((sum, f) => sum + f.rating, 0) / feedbackItems.length).toFixed(1);

  return (
    <div className="flex flex-col h-full" data-testid="page-feedback">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Customer Feedback</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Post-call satisfaction ratings and comments</p>
      </div>

      <div className="px-6 py-4 grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-avg-rating">{avgRating}</p>
              <p className="text-xs text-muted-foreground">Avg. Rating</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
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
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
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

      <ScrollArea className="flex-1 px-6 pb-4">
        <div className="space-y-3">
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
                        className={`w-3.5 h-3.5 ${i < item.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
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
    </div>
  );
}
