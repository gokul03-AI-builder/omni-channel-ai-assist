import { useState, useEffect, useCallback } from "react";
import {
  Mic,
  BookOpen,
  MessageSquare,
  Brain,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Info,
  AlertOctagon,
  Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

type ServiceStatus = "Operational" | "Degraded" | "Down";

interface AIService {
  id: string;
  name: string;
  icon: typeof Mic;
  status: ServiceStatus;
  uptime: number;
  avgResponseTime: number;
  lastChecked: Date;
  description: string;
  chartKey: string;
  requestRate: number;
}

interface Incident {
  id: string;
  serviceId: string;
  serviceName: string;
  severity: "Critical" | "Warning" | "Info";
  description: string;
  timestamp: Date;
}

const initialServices: AIService[] = [
  {
    id: "svc-transcription",
    name: "Live Transcription",
    icon: Mic,
    status: "Operational",
    uptime: 99.97,
    avgResponseTime: 45,
    lastChecked: new Date(),
    description: "Real-time speech-to-text conversion for active calls",
    chartKey: "transcription",
    requestRate: 1243,
  },
  {
    id: "svc-kb-assist",
    name: "KB Assist",
    icon: BookOpen,
    status: "Operational",
    uptime: 99.92,
    avgResponseTime: 120,
    lastChecked: new Date(),
    description: "Knowledge base article retrieval and suggestion engine",
    chartKey: "kb",
    requestRate: 876,
  },
  {
    id: "svc-chat-assist",
    name: "Chat Assist",
    icon: MessageSquare,
    status: "Degraded",
    uptime: 98.4,
    avgResponseTime: 340,
    lastChecked: new Date(),
    description: "AI-powered chat response generation and suggestions",
    chartKey: "chat",
    requestRate: 2105,
  },
  {
    id: "svc-sentiment",
    name: "Sentiment Analysis",
    icon: Brain,
    status: "Operational",
    uptime: 99.88,
    avgResponseTime: 85,
    lastChecked: new Date(),
    description: "Real-time customer sentiment tracking during interactions",
    chartKey: "sentiment",
    requestRate: 1587,
  },
];

const healthTimeline = [
  { time: "06:00", transcription: 99.9, kb: 99.9, chat: 99.8, sentiment: 99.9 },
  { time: "07:00", transcription: 99.9, kb: 99.9, chat: 99.5, sentiment: 99.9 },
  { time: "08:00", transcription: 100, kb: 99.8, chat: 98.2, sentiment: 100 },
  { time: "09:00", transcription: 100, kb: 99.9, chat: 97.5, sentiment: 99.9 },
  { time: "10:00", transcription: 99.9, kb: 100, chat: 98.0, sentiment: 99.8 },
  { time: "11:00", transcription: 100, kb: 99.9, chat: 98.8, sentiment: 100 },
  { time: "12:00", transcription: 99.9, kb: 99.9, chat: 99.0, sentiment: 99.9 },
  { time: "13:00", transcription: 100, kb: 100, chat: 98.5, sentiment: 100 },
  { time: "14:00", transcription: 100, kb: 99.9, chat: 97.8, sentiment: 99.9 },
  { time: "15:00", transcription: 99.9, kb: 99.8, chat: 98.4, sentiment: 99.9 },
];

const sparklineData: Record<string, { day: string; value: number }[]> = {
  "svc-transcription": [
    { day: "Mon", value: 99.9 }, { day: "Tue", value: 100 }, { day: "Wed", value: 99.8 },
    { day: "Thu", value: 100 }, { day: "Fri", value: 99.9 }, { day: "Sat", value: 100 }, { day: "Sun", value: 99.97 },
  ],
  "svc-kb-assist": [
    { day: "Mon", value: 99.8 }, { day: "Tue", value: 99.9 }, { day: "Wed", value: 100 },
    { day: "Thu", value: 99.7 }, { day: "Fri", value: 99.9 }, { day: "Sat", value: 100 }, { day: "Sun", value: 99.92 },
  ],
  "svc-chat-assist": [
    { day: "Mon", value: 99.2 }, { day: "Tue", value: 98.8 }, { day: "Wed", value: 97.5 },
    { day: "Thu", value: 98.1 }, { day: "Fri", value: 98.6 }, { day: "Sat", value: 99.0 }, { day: "Sun", value: 98.4 },
  ],
  "svc-sentiment": [
    { day: "Mon", value: 99.9 }, { day: "Tue", value: 100 }, { day: "Wed", value: 99.9 },
    { day: "Thu", value: 99.8 }, { day: "Fri", value: 100 }, { day: "Sat", value: 99.9 }, { day: "Sun", value: 99.88 },
  ],
};

const serviceIncidents: Record<string, Incident[]> = {
  "svc-transcription": [
    { id: "inc-t1", serviceId: "svc-transcription", serviceName: "Live Transcription", severity: "Info", description: "Routine maintenance completed", timestamp: new Date(Date.now() - 86400000 * 2) },
    { id: "inc-t2", serviceId: "svc-transcription", serviceName: "Live Transcription", severity: "Warning", description: "Elevated latency detected in EU region", timestamp: new Date(Date.now() - 86400000 * 5) },
  ],
  "svc-kb-assist": [
    { id: "inc-k1", serviceId: "svc-kb-assist", serviceName: "KB Assist", severity: "Info", description: "Index rebuilt successfully", timestamp: new Date(Date.now() - 86400000 * 1) },
    { id: "inc-k2", serviceId: "svc-kb-assist", serviceName: "KB Assist", severity: "Warning", description: "Search latency spike during reindexing", timestamp: new Date(Date.now() - 86400000 * 3) },
  ],
  "svc-chat-assist": [
    { id: "inc-c1", serviceId: "svc-chat-assist", serviceName: "Chat Assist", severity: "Critical", description: "Response time exceeded SLA threshold", timestamp: new Date(Date.now() - 3600000 * 2) },
    { id: "inc-c2", serviceId: "svc-chat-assist", serviceName: "Chat Assist", severity: "Warning", description: "Degraded performance on model inference", timestamp: new Date(Date.now() - 86400000 * 1) },
    { id: "inc-c3", serviceId: "svc-chat-assist", serviceName: "Chat Assist", severity: "Critical", description: "Partial outage affecting 15% of requests", timestamp: new Date(Date.now() - 86400000 * 3) },
  ],
  "svc-sentiment": [
    { id: "inc-s1", serviceId: "svc-sentiment", serviceName: "Sentiment Analysis", severity: "Info", description: "Model v2.4 deployed successfully", timestamp: new Date(Date.now() - 86400000 * 4) },
    { id: "inc-s2", serviceId: "svc-sentiment", serviceName: "Sentiment Analysis", severity: "Warning", description: "Brief accuracy dip during model transition", timestamp: new Date(Date.now() - 86400000 * 4) },
  ],
};

const allIncidents: Incident[] = [
  { id: "inc-g1", serviceId: "svc-chat-assist", serviceName: "Chat Assist", severity: "Critical", description: "Response time exceeded SLA threshold — auto-scaling triggered", timestamp: new Date(Date.now() - 3600000 * 2) },
  { id: "inc-g2", serviceId: "svc-transcription", serviceName: "Live Transcription", severity: "Warning", description: "Elevated latency in APAC region for 12 minutes", timestamp: new Date(Date.now() - 86400000 * 1) },
  { id: "inc-g3", serviceId: "svc-chat-assist", serviceName: "Chat Assist", severity: "Critical", description: "Partial outage affecting 15% of chat requests", timestamp: new Date(Date.now() - 86400000 * 2) },
  { id: "inc-g4", serviceId: "svc-kb-assist", serviceName: "KB Assist", severity: "Info", description: "Scheduled maintenance — knowledge base reindex completed", timestamp: new Date(Date.now() - 86400000 * 3) },
  { id: "inc-g5", serviceId: "svc-sentiment", serviceName: "Sentiment Analysis", severity: "Warning", description: "Brief accuracy dip during model v2.4 rollout", timestamp: new Date(Date.now() - 86400000 * 4) },
];

const statusConfig = {
  Operational: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2, dotColor: "bg-emerald-400", pulseColor: "bg-emerald-400/40", bannerColor: "text-emerald-500" },
  Degraded: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: AlertTriangle, dotColor: "bg-yellow-400", pulseColor: "bg-yellow-400/40", bannerColor: "text-yellow-500" },
  Down: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: XCircle, dotColor: "bg-red-400", pulseColor: "bg-red-400/40", bannerColor: "text-red-500" },
};

const severityConfig = {
  Critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: AlertOctagon },
  Warning: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: AlertTriangle },
  Info: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Info },
};

const chartLineColors: Record<string, string> = {
  transcription: "hsl(var(--primary))",
  kb: "#22c55e",
  chat: "#eab308",
  sentiment: "#8b5cf6",
};

const filterTabs: { label: string; value: ServiceStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Operational", value: "Operational" },
  { label: "Degraded", value: "Degraded" },
  { label: "Down", value: "Down" },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function StatusBanner({ services }: { services: AIService[] }) {
  const degradedCount = services.filter((s) => s.status === "Degraded").length;
  const downCount = services.filter((s) => s.status === "Down").length;
  const allOperational = degradedCount === 0 && downCount === 0;

  let bannerText: string;
  let bannerColor: string;
  let BannerIcon: typeof CheckCircle2;

  if (downCount > 0) {
    bannerText = `${downCount} Service${downCount > 1 ? "s" : ""} Down`;
    bannerColor = "text-red-500 border-red-500/20 bg-red-500/5";
    BannerIcon = XCircle;
  } else if (degradedCount > 0) {
    bannerText = `${degradedCount} Service${degradedCount > 1 ? "s" : ""} Degraded`;
    bannerColor = "text-yellow-500 border-yellow-500/20 bg-yellow-500/5";
    BannerIcon = AlertTriangle;
  } else {
    bannerText = "All Systems Operational";
    bannerColor = "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    BannerIcon = CheckCircle2;
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bannerColor} transition-all duration-500`}
      data-testid="banner-system-status"
    >
      <BannerIcon className="w-5 h-5" />
      <span className="text-sm font-semibold" data-testid="text-system-status">{bannerText}</span>
      {!allOperational && (
        <span className="text-xs opacity-70 ml-auto">
          {services.filter((s) => s.status === "Operational").length} of {services.length} services healthy
        </span>
      )}
    </div>
  );
}

function PulsingDot({ status }: { status: ServiceStatus }) {
  const config = statusConfig[status];
  const animationClass = status === "Degraded"
    ? "animate-[flicker_1.5s_ease-in-out_infinite]"
    : status === "Down"
      ? "animate-[pulse_1s_ease-in-out_infinite]"
      : "animate-[pulse_2s_ease-in-out_infinite]";

  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`absolute inset-0 rounded-full ${config.pulseColor} ${animationClass}`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dotColor}`} />
    </span>
  );
}

function UptimeBar({ value, serviceId }: { value: number; serviceId: string }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const barColor = value >= 99.5 ? "bg-emerald-500" : value >= 98 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden mt-1">
      <div
        className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
        data-testid={`bar-uptime-${serviceId}`}
      />
    </div>
  );
}

export default function AIStatusPage() {
  const [services, setServices] = useState<AIService[]>(initialServices);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filter, setFilter] = useState<ServiceStatus | "All">("All");
  const [incidentsOpen, setIncidentsOpen] = useState(true);

  const tickServices = useCallback(() => {
    setServices((prev) =>
      prev.map((svc) => ({
        ...svc,
        avgResponseTime: Math.max(10, svc.avgResponseTime + (Math.random() - 0.5) * 20),
        lastChecked: new Date(),
      }))
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(tickServices, 5000);
    return () => clearInterval(interval);
  }, [tickServices]);

  const isVisible = (service: AIService) => filter === "All" || service.status === filter;

  useEffect(() => {
    if (expandedCard && !services.find((s) => s.id === expandedCard && isVisible(s))) {
      setExpandedCard(null);
    }
  }, [filter, expandedCard, services]);

  const handleCardClick = (serviceId: string) => {
    setExpandedCard((prev) => (prev === serviceId ? null : serviceId));
  };

  const selectedChartKey = expandedCard
    ? services.find((s) => s.id === expandedCard)?.chartKey ?? null
    : null;

  return (
    <div className="flex flex-col h-full" data-testid="page-ai-status">
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          25% { opacity: 0.4; transform: scale(1.6); }
          50% { opacity: 0.8; transform: scale(1.2); }
          75% { opacity: 0.3; transform: scale(1.8); }
        }
      `}</style>

      <div className="px-6 py-4 glass-header mx-4 mt-4 rounded-2xl">
        <h2 className="text-lg font-semibold">AI Status</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          AI service health & performance monitoring
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-4 space-y-6">
          <StatusBanner services={services} />

          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-0.5 w-fit" data-testid="filter-tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`button-filter-${tab.value.toLowerCase()}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => {
              const config = statusConfig[service.status];
              const isExpanded = expandedCard === service.id;
              const incidents = serviceIncidents[service.id] || [];
              const visible = isVisible(service);

              return (
                <Card
                  key={service.id}
                  className={`transition-all duration-300 ${
                    visible
                      ? "p-4 opacity-100 scale-100 cursor-pointer hover:shadow-lg"
                      : "opacity-0 scale-95 h-0 overflow-hidden p-0 border-0 m-0 pointer-events-none"
                  } ${isExpanded ? "ring-1 ring-primary/30" : ""}`}
                  onClick={() => visible && handleCardClick(service.id)}
                  data-testid={`card-service-${service.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg glass-bubble-primary flex items-center justify-center">
                        <service.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{service.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${config.bg} ${config.color} flex items-center gap-1.5`}
                      data-testid={`badge-status-${service.id}`}
                    >
                      <PulsingDot status={service.status} />
                      {service.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Uptime</p>
                      <p
                        className="text-lg font-bold mt-0.5"
                        data-testid={`text-uptime-${service.id}`}
                      >
                        {service.uptime}%
                      </p>
                      <UptimeBar value={service.uptime} serviceId={service.id} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                      <p
                        className="text-lg font-bold mt-0.5 transition-all duration-500"
                        data-testid={`text-response-${service.id}`}
                      >
                        {Math.round(service.avgResponseTime)}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Checked</p>
                      <p className="text-xs font-medium mt-1" data-testid={`text-last-checked-${service.id}`}>
                        {formatTime(service.lastChecked)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="border-t border-border/30 pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">7-Day Uptime</h5>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Zap className="w-3 h-3" />
                          <span data-testid={`text-request-rate-${service.id}`}>{service.requestRate.toLocaleString()} req/min</span>
                        </div>
                      </div>

                      <div className="h-20" data-testid={`chart-sparkline-${service.id}`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sparklineData[service.id]}>
                            <defs>
                              <linearGradient id={`sparkGrad-${service.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="hsl(var(--primary))"
                              fill={`url(#sparkGrad-${service.id})`}
                              strokeWidth={1.5}
                            />
                            <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis domain={[96, 100.5]} hide />
                            <Tooltip
                              contentStyle={{
                                background: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border) / 0.3)",
                                borderRadius: "6px",
                                fontSize: "11px",
                              }}
                              formatter={(value: number) => [`${value}%`, "Uptime"]}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent Incidents</h5>
                        {incidents.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No recent incidents</p>
                        ) : (
                          <div className="space-y-2">
                            {incidents.map((inc) => {
                              const sev = severityConfig[inc.severity];
                              return (
                                <div key={inc.id} className="flex items-start gap-2 text-xs" data-testid={`incident-${inc.id}`}>
                                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${sev.bg} ${sev.color} shrink-0`}>
                                    {inc.severity}
                                  </Badge>
                                  <span className="flex-1 text-muted-foreground">{inc.description}</span>
                                  <span className="text-muted-foreground/60 shrink-0">{formatRelativeTime(inc.timestamp)}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {services.filter((s) => isVisible(s)).length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm" data-testid="text-no-services">
              No services match the selected filter.
            </div>
          )}

          <Card className="p-4" data-testid="card-health-timeline">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              System Health Timeline (Today)
              {selectedChartKey && (
                <Badge variant="secondary" className="text-xs ml-auto" data-testid="badge-chart-filter">
                  Showing: {services.find((s) => s.chartKey === selectedChartKey)?.name}
                </Badge>
              )}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthTimeline}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border) / 0.3)"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    domain={[96, 100.5]}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border) / 0.3)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value}%`, undefined]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="transcription"
                    stroke={chartLineColors.transcription}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Transcription"
                    strokeOpacity={selectedChartKey && selectedChartKey !== "transcription" ? 0.15 : 1}
                  />
                  <Line
                    type="monotone"
                    dataKey="kb"
                    stroke={chartLineColors.kb}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="KB Assist"
                    strokeOpacity={selectedChartKey && selectedChartKey !== "kb" ? 0.15 : 1}
                  />
                  <Line
                    type="monotone"
                    dataKey="chat"
                    stroke={chartLineColors.chat}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Chat Assist"
                    strokeOpacity={selectedChartKey && selectedChartKey !== "chat" ? 0.15 : 1}
                  />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke={chartLineColors.sentiment}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Sentiment"
                    strokeOpacity={selectedChartKey && selectedChartKey !== "sentiment" ? 0.15 : 1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4" data-testid="card-incidents">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setIncidentsOpen((prev) => !prev)}
              data-testid="button-toggle-incidents"
            >
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Recent Incidents
                <Badge variant="secondary" className="text-xs">{allIncidents.length}</Badge>
              </h3>
              {incidentsOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                incidentsOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-3">
                {allIncidents.map((inc) => {
                  const sev = severityConfig[inc.severity];
                  const SevIcon = sev.icon;
                  return (
                    <div
                      key={inc.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/10"
                      data-testid={`incident-row-${inc.id}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sev.bg}`}>
                        <SevIcon className={`w-4 h-4 ${sev.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${sev.bg} ${sev.color}`}>
                            {inc.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{inc.serviceName}</span>
                        </div>
                        <p className="text-sm">{inc.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(inc.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}