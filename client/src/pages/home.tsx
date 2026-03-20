import { useMemo } from "react";
import {
  Globe,
  Sparkles,
  Clock,
  MessageSquare,
  Star,
  ChevronDown,
  PhoneCall,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

function getFirstName(): string {
  const role = localStorage.getItem("wingman_auth");
  if (role === "admin") return "Gokul";
  return "Priya";
}

const resolutionSparkline = [
  { v: 62 }, { v: 68 }, { v: 65 }, { v: 70 }, { v: 69 }, { v: 74 }, { v: 75 },
];

const metricCards = [
  {
    id: "csat",
    title: "CSAT score",
    value: "4.2",
    unit: "out of 5",
    sub: "Based on 74 customer ratings",
    icon: Star,
    iconColor: "text-primary",
  },
  {
    id: "fcr",
    title: "First contact resolution",
    value: "87",
    unit: "%",
    sub: "Resolved without escalation",
    icon: PhoneCall,
    iconColor: "text-primary",
  },
  {
    id: "handle-time",
    title: "Avg handle time",
    value: "8",
    unit: "min",
    sub: "Per support session",
    icon: Clock,
    iconColor: "text-primary",
  },
  {
    id: "kb-assists",
    title: "KB articles surfaced",
    value: "45",
    unit: "",
    sub: "Suggested by Wingman today",
    icon: BookOpen,
    iconColor: "text-primary",
  },
];

const reviewItems = [
  { id: "rv-1", initials: "AS", name: "Alex Storm", topic: "P400 contactless failure — needs L2 escalation", time: "2h ago", color: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400" },
  { id: "rv-2", initials: "MR", name: "Michael Rodriguez", topic: "V240m Wi-Fi setup — config review required", time: "3h ago", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400" },
  { id: "rv-3", initials: "ET", name: "Emma Thompson", topic: "e285 batch processing — recurring error pattern", time: "4h ago", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" },
  { id: "rv-4", initials: "DK", name: "David Kim", topic: "VX520 display issue — warranty claim review", time: "5h ago", color: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" },
];

export default function HomePage() {
  const firstName = useMemo(() => getFirstName(), []);

  return (
    <div className="flex flex-col h-full" data-testid="page-home">
      <div className="px-6 py-4 glass-header max-w-4xl mx-auto mt-4 rounded-2xl flex items-center gap-3" data-testid="section-welcome">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold" data-testid="text-welcome-name">Welcome, <span className="text-primary">{firstName}</span></h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your daily support overview</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 py-8">

          {/* Centred: AI Summary + subtitle */}
          <div className="px-8 space-y-6 max-w-4xl mx-auto">

          {/* AI Summary card */}
          <Card className="p-5 border-primary/15 bg-primary/5" data-testid="card-ai-summary">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Here's what I've done for you today</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-primary font-bold text-base leading-none">»</span>
                <span className="text-sm text-muted-foreground">Resolved</span>
                <span className="ml-1 text-xs font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full" data-testid="text-resolved-count">
                  1,300 conversations
                </span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
                <span className="text-sm text-muted-foreground">Tickets routed for your review</span>
                <span className="ml-1 text-xs font-semibold bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400 px-2 py-0.5 rounded-full" data-testid="text-tickets-count">
                  4
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">You've saved</span>
                <span className="ml-1 text-xs font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full" data-testid="text-saved-time">
                  24 hrs
                </span>
                <span className="text-sm text-muted-foreground">average</span>
              </div>
            </div>
          </Card>

          {/* Wingman subtitle */}
          <p className="text-sm text-muted-foreground text-center">
            Intelligent support, powered by <span className="text-primary font-medium">Verifone Wingman</span>
          </p>

          </div>{/* end centred section */}

          {/* Full-width: metrics + review */}
          <div className="px-8 space-y-6">

          {/* Main metrics grid: big resolution card + 2x2 right */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4" data-testid="section-metrics">

            {/* Resolution rate — big left card */}
            <Card className="p-5 flex flex-col gap-3" data-testid="card-resolution-rate">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground font-medium">Resolution rate</span>
                </div>
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border/40 rounded px-2 py-0.5" data-testid="button-period-filter">
                  This week <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div>
                <p className="text-5xl font-bold tracking-tight" data-testid="text-resolution-rate">75%</p>
                <p className="text-xs text-muted-foreground mt-1">Resolved by Wingman without human handoff</p>
              </div>
              <div className="flex-1 min-h-[100px]">
                <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={resolutionSparkline} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(161 80% 38%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(161 80% 38%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="hsl(161 80% 38%)"
                      strokeWidth={2}
                      fill="url(#resGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 2x2 metric cards */}
            <div className="grid grid-cols-2 gap-4">
              {metricCards.map((m) => {
                const Icon = m.icon;
                return (
                  <Card key={m.id} className="p-4 flex flex-col gap-2" data-testid={`card-metric-${m.id}`}>
                    <p className="text-xs font-medium text-foreground">{m.title}</p>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 shrink-0 ${m.iconColor}`} />
                      <span className="text-xl font-bold" data-testid={`text-metric-value-${m.id}`}>{m.value}</span>
                      {m.unit && <span className="text-sm text-muted-foreground">{m.unit}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.sub}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Awaiting your review */}
          <Card className="p-5" data-testid="card-awaiting-review">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0" />
              <h3 className="text-sm font-semibold">Awaiting your review</h3>
              <span className="text-xs font-semibold bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400 px-1.5 py-0.5 rounded-full">
                {reviewItems.length}
              </span>
            </div>
            <div className="space-y-3">
              {reviewItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-1" data-testid={`row-review-${item.id}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${item.color}`}>
                    {item.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.topic}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Bottom spacing */}
          <div className="h-4" />

          </div>{/* end full-width section */}

        </div>
      </ScrollArea>
    </div>
  );
}
