import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  MessageSquare,
  Star,
  Bot,
  MessageCircle,
  Phone,
  Mail,
  Smile,
  Meh,
  Frown,
  Zap,
  Shield,
  Brain,
  Globe,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ranges = ["7D", "30D", "90D"] as const;
type Range = (typeof ranges)[number];

const csatTrendData: Record<Range, { period: string; score: number }[]> = {
  "7D": [
    { period: "Mon", score: 4.5 },
    { period: "Tue", score: 4.6 },
    { period: "Wed", score: 4.7 },
    { period: "Thu", score: 4.6 },
    { period: "Fri", score: 4.8 },
    { period: "Sat", score: 4.9 },
    { period: "Sun", score: 4.8 },
  ],
  "30D": [
    { period: "W1", score: 4.4 },
    { period: "W2", score: 4.5 },
    { period: "W3", score: 4.7 },
    { period: "W4", score: 4.8 },
  ],
  "90D": [
    { period: "Jan", score: 4.3 },
    { period: "Feb", score: 4.5 },
    { period: "Mar", score: 4.8 },
  ],
};

const responseTimeData: Record<Range, { period: string; human: number; ai: number }[]> = {
  "7D": [
    { period: "Mon", human: 4.2, ai: 1.1 },
    { period: "Tue", human: 3.8, ai: 1.0 },
    { period: "Wed", human: 4.5, ai: 1.3 },
    { period: "Thu", human: 3.9, ai: 1.1 },
    { period: "Fri", human: 4.1, ai: 1.2 },
    { period: "Sat", human: 3.5, ai: 0.9 },
    { period: "Sun", human: 3.2, ai: 0.8 },
  ],
  "30D": [
    { period: "W1", human: 4.3, ai: 1.2 },
    { period: "W2", human: 4.0, ai: 1.1 },
    { period: "W3", human: 3.8, ai: 1.0 },
    { period: "W4", human: 3.6, ai: 1.2 },
  ],
  "90D": [
    { period: "Jan", human: 4.5, ai: 1.4 },
    { period: "Feb", human: 4.1, ai: 1.2 },
    { period: "Mar", human: 3.8, ai: 1.2 },
  ],
};

const supportTopics = [
  { name: "Billing", count: 912, percentage: 28 },
  { name: "Technical", count: 716, percentage: 22 },
  { name: "Account", count: 618, percentage: 19 },
  { name: "Shipping", count: 488, percentage: 15 },
  { name: "Product", count: 325, percentage: 10 },
  { name: "Other", count: 195, percentage: 6 },
];

const aiAgents = [
  { name: "Nova", icon: Zap, capabilities: ["Chat Support", "Ticket Routing", "FAQ Resolution"], status: "Active", accuracy: "96%" },
  { name: "Orion", icon: Shield, capabilities: ["Fraud Detection", "Account Security", "Escalation"], status: "Active", accuracy: "94%" },
  { name: "Atlas", icon: Brain, capabilities: ["Knowledge Base", "Training", "Analytics"], status: "Active", accuracy: "92%" },
  { name: "Lyzr Agent", icon: Globe, capabilities: ["Multi-language", "Voice Support", "Integration"], status: "Active", accuracy: "95%" },
];

const sentimentData = {
  positive: 68,
  neutral: 22,
  negative: 10,
};

const channelCards = [
  {
    name: "Chat",
    icon: MessageCircle,
    total: "1,847",
    stats: [
      { label: "Avg Wait Time", value: "12s" },
      { label: "Resolution Rate", value: "96%" },
      { label: "CSAT", value: "4.9" },
      { label: "AI Handled", value: "72%" },
    ],
  },
  {
    name: "Voice",
    icon: Phone,
    total: "982",
    stats: [
      { label: "Avg Wait Time", value: "45s" },
      { label: "Resolution Rate", value: "91%" },
      { label: "CSAT", value: "4.7" },
      { label: "AI Handled", value: "38%" },
    ],
  },
  {
    name: "Email",
    icon: Mail,
    total: "424",
    stats: [
      { label: "Avg Response", value: "2.1h" },
      { label: "Resolution Rate", value: "89%" },
      { label: "CSAT", value: "4.5" },
      { label: "AI Handled", value: "55%" },
    ],
  },
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border) / 0.3)",
  borderRadius: "8px",
  fontSize: "12px",
};

function TrendBadge({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
      }`}
    >
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("7D");

  return (
    <div className="flex flex-col h-full" data-testid="page-analytics">
      <div className="px-6 py-4 glass-header mx-4 mt-4 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" data-testid="text-analytics-title">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Performance trends & AI usage insights
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-0.5" data-testid="range-toggle">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`button-range-${r.toLowerCase()}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-4 space-y-8">
          <section data-testid="section-agent-analytics">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2" data-testid="text-section-agent-analytics">
              <Bot className="w-4 h-4 text-primary" />
              Agent Analytics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="p-5" data-testid="card-ai-resolution">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">AI Resolution</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold" data-testid="text-ai-resolution-value">73%</span>
                  <TrendBadge value={5.1} />
                </div>
              </Card>
              <Card className="p-5" data-testid="card-avg-response">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Avg Response</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold" data-testid="text-avg-response-value">1.2s</span>
                  <TrendBadge value={-0.3} suffix="s" />
                </div>
              </Card>
              <Card className="p-5" data-testid="card-csat-score">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">CSAT Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold" data-testid="text-csat-score-value">4.8</span>
                  <TrendBadge value={2.3} />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "First Response Time", value: "32s", icon: Clock, trend: 18, trendDown: true },
                { label: "Resolution Rate", value: "94.2%", icon: CheckCircle, trend: 3.1 },
                { label: "Total Conversations", value: "3,253", icon: MessageSquare, trend: 12 },
                { label: "Customer Satisfaction", value: "4.8", icon: Star, trend: 5.2 },
              ].map((m) => (
                <Card key={m.label} className="p-4" data-testid={`card-metric-${m.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <m.icon className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-xl font-bold">{m.value}</span>
                    <TrendBadge value={m.trendDown ? -m.trend : m.trend} />
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Card className="p-4" data-testid="card-csat-trend">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  CSAT Score Trend
                  <Badge variant="secondary" className="text-xs ml-auto">{range}</Badge>
                </h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={csatTrendData[range]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                      <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[4, 5]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} name="CSAT Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-4" data-testid="card-response-time">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Response Time: Human vs AI
                  <Badge variant="secondary" className="text-xs ml-auto">{range}</Badge>
                </h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={responseTimeData[range]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                      <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" unit="s" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="human" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Human" />
                      <Bar dataKey="ai" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="AI" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="p-4" data-testid="card-support-topics">
                <h4 className="text-sm font-semibold mb-4">Top Support Topics</h4>
                <div className="space-y-3">
                  {supportTopics.map((topic) => (
                    <div key={topic.name} data-testid={`topic-${topic.name.toLowerCase()}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{topic.name}</span>
                        <span className="text-xs text-muted-foreground">{topic.count} ({topic.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${topic.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4" data-testid="card-ai-agents">
                <h4 className="text-sm font-semibold mb-4">AI Agent Capabilities</h4>
                <div className="space-y-3">
                  {aiAgents.map((agent) => (
                    <div key={agent.name} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30" data-testid={`agent-${agent.name.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <agent.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{agent.name}</span>
                          <Badge variant="secondary" className="text-[10px]">{agent.accuracy}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.capabilities.map((cap) => (
                            <span key={cap} className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4" data-testid="card-sentiment">
                <h4 className="text-sm font-semibold mb-4">Sentiment Analysis</h4>
                <div className="space-y-4">
                  {[
                    { label: "Positive", value: sentimentData.positive, icon: Smile, color: "bg-emerald-500" },
                    { label: "Neutral", value: sentimentData.neutral, icon: Meh, color: "bg-amber-500" },
                    { label: "Negative", value: sentimentData.negative, icon: Frown, color: "bg-red-500" },
                  ].map((s) => (
                    <div key={s.label} data-testid={`sentiment-${s.label.toLowerCase()}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <s.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{s.label}</span>
                        </div>
                        <span className="text-sm font-bold">{s.value}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${s.color} rounded-full transition-all`}
                          style={{ width: `${s.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          <section data-testid="section-channel-analytics">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2" data-testid="text-section-channel-analytics">
              <MessageSquare className="w-4 h-4 text-primary" />
              Channel Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {channelCards.map((ch) => (
                <Card key={ch.name} className="p-5" data-testid={`card-channel-${ch.name.toLowerCase()}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ch.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{ch.name}</p>
                      <p className="text-xs text-muted-foreground">{ch.total} conversations</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {ch.stats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between" data-testid={`stat-${ch.name.toLowerCase()}-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                        <span className="text-sm font-semibold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
