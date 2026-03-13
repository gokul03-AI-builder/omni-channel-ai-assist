import {
  Phone,
  MessageSquare,
  CheckCircle2,
  Star,
  Bot,
  Clock,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const kpiCards = [
  {
    title: "Total Calls Handled",
    value: "1,284",
    change: "+12%",
    trend: "up" as const,
    icon: Phone,
    subtitle: "This month",
  },
  {
    title: "Chat Sessions",
    value: "856",
    change: "+8%",
    trend: "up" as const,
    icon: MessageSquare,
    subtitle: "This month",
  },
  {
    title: "Resolution Rate",
    value: "94.2%",
    change: "+2.1%",
    trend: "up" as const,
    icon: CheckCircle2,
    subtitle: "First contact",
  },
  {
    title: "CSAT Score",
    value: "4.6",
    change: "+0.3",
    trend: "up" as const,
    icon: Star,
    subtitle: "Out of 5.0",
  },
  {
    title: "AI Assist Usage",
    value: "78%",
    change: "+15%",
    trend: "up" as const,
    icon: Bot,
    subtitle: "Of all interactions",
  },
  {
    title: "Avg Handle Time",
    value: "4m 32s",
    change: "-18s",
    trend: "down" as const,
    icon: Clock,
    subtitle: "Per interaction",
  },
];

const recentActivity = [
  {
    id: "act-1",
    action: "Call resolved",
    detail: "Sarah Chen — P400 Contactless Payment Failure",
    time: "2 min ago",
    type: "call" as const,
  },
  {
    id: "act-2",
    action: "Chat completed",
    detail: "Michael Rodriguez — V240m Wi-Fi Setup",
    time: "8 min ago",
    type: "chat" as const,
  },
  {
    id: "act-3",
    action: "AI suggestion accepted",
    detail: "KB-2847: NFC Antenna Reset Procedure",
    time: "12 min ago",
    type: "ai" as const,
  },
  {
    id: "act-4",
    action: "Ticket escalated",
    detail: "Emma Thompson — e285 Batch Processing Error",
    time: "25 min ago",
    type: "ticket" as const,
  },
  {
    id: "act-5",
    action: "CSAT received",
    detail: "David Kim rated support 5/5",
    time: "34 min ago",
    type: "feedback" as const,
  },
  {
    id: "act-6",
    action: "Firmware push completed",
    detail: "V240m v3.9.0 — Urban Style Boutique",
    time: "1 hr ago",
    type: "system" as const,
  },
  {
    id: "act-7",
    action: "Call resolved",
    detail: "David Kim — VX520 Display Calibration",
    time: "1.5 hr ago",
    type: "call" as const,
  },
];

const topAgents = [
  {
    id: "ag-1",
    name: "Alex Morgan",
    initials: "AM",
    callsHandled: 142,
    chatsSolved: 98,
    csat: 4.8,
    resolution: 97,
  },
  {
    id: "ag-2",
    name: "Jordan Lee",
    initials: "JL",
    callsHandled: 128,
    chatsSolved: 112,
    csat: 4.7,
    resolution: 95,
  },
  {
    id: "ag-3",
    name: "Taylor Brooks",
    initials: "TB",
    callsHandled: 119,
    chatsSolved: 87,
    csat: 4.6,
    resolution: 93,
  },
  {
    id: "ag-4",
    name: "Casey Patel",
    initials: "CP",
    callsHandled: 105,
    chatsSolved: 76,
    csat: 4.5,
    resolution: 92,
  },
  {
    id: "ag-5",
    name: "Riley Nguyen",
    initials: "RN",
    callsHandled: 98,
    chatsSolved: 91,
    csat: 4.4,
    resolution: 90,
  },
];

const activityIcons: Record<string, typeof Phone> = {
  call: Phone,
  chat: MessageSquare,
  ai: Bot,
  ticket: Activity,
  feedback: Star,
  system: TrendingUp,
};

export default function HomePage() {
  return (
    <div className="flex flex-col h-full" data-testid="page-home">
      <div className="px-6 py-4 glass-header">
        <h2 className="text-lg font-semibold">Home</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Dashboard overview & key metrics
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {kpiCards.map((kpi) => (
              <Card
                key={kpi.title}
                className="p-4"
                data-testid={`card-kpi-${kpi.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg glass-bubble-primary flex items-center justify-center">
                    <kpi.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="text-xs font-medium text-emerald-400">
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <p
                    className="text-2xl font-bold"
                    data-testid={`text-kpi-value-${kpi.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {kpi.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {kpi.title}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {kpi.subtitle}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4" data-testid="card-recent-activity">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.map((item) => {
                  const Icon = activityIcons[item.type] || Activity;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3"
                      data-testid={`row-activity-${item.id}`}
                    >
                      <div className="w-8 h-8 rounded-lg glass-bubble-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.detail}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4" data-testid="card-top-agents">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Top Agents
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border/30">
                      <th className="text-left pb-2 font-medium">Agent</th>
                      <th className="text-right pb-2 font-medium">Calls</th>
                      <th className="text-right pb-2 font-medium">Chats</th>
                      <th className="text-right pb-2 font-medium">CSAT</th>
                      <th className="text-right pb-2 font-medium">Res. %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAgents.map((agent, idx) => (
                      <tr
                        key={agent.id}
                        className="border-b border-border/10 last:border-0"
                        data-testid={`row-agent-${agent.id}`}
                      >
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                {agent.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-sm">
                                {agent.name}
                              </span>
                              {idx === 0 && (
                                <Badge
                                  variant="secondary"
                                  className="ml-1.5 text-[10px] px-1 py-0 h-4"
                                >
                                  Top
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-2 font-mono text-xs">
                          {agent.callsHandled}
                        </td>
                        <td className="text-right py-2 font-mono text-xs">
                          {agent.chatsSolved}
                        </td>
                        <td className="text-right py-2">
                          <span className="font-mono text-xs">
                            {agent.csat}
                          </span>
                        </td>
                        <td className="text-right py-2">
                          <span className="font-mono text-xs">
                            {agent.resolution}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
