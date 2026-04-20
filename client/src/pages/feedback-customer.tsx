import { Star, TrendingUp, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function FeedbackCustomerPage() {
  return (
    <div className="flex flex-col h-full" data-testid="page-feedback-customer">
      {/* Page header */}
      <div className="px-6 py-4 glass-header mx-4 mt-4 rounded-2xl shrink-0">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Customer Feedback</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Post-interaction satisfaction scores and customer reviews</p>
          </div>
        </div>
      </div>

      {/* Placeholder metrics (greyed out) */}
      <div className="px-6 py-4 grid grid-cols-3 gap-4 shrink-0 opacity-30 pointer-events-none select-none">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg glass-bubble-primary flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">—</p>
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
              <p className="text-2xl font-bold">—</p>
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
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground">Satisfaction</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Coming Soon */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 pb-16">
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
    </div>
  );
}
