import {
  Mic,
  BookOpen,
  MessageSquare,
  Brain,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
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
} from "recharts";

interface AIService {
  id: string;
  name: string;
  icon: typeof Mic;
  status: "Operational" | "Degraded" | "Down";
  uptime: number;
  avgResponseTime: string;
  lastChecked: string;
  description: string;
}

const aiServices: AIService[] = [
  {
    id: "svc-transcription",
    name: "Live Transcription",
    icon: Mic,
    status: "Operational",
    uptime: 99.97,
    avgResponseTime: "45ms",
    lastChecked: "2026-03-13 10:45:00",
    description: "Real-time speech-to-text conversion for active calls",
  },
  {
    id: "svc-kb-assist",
    name: "KB Assist",
    icon: BookOpen,
    status: "Operational",
    uptime: 99.92,
    avgResponseTime: "120ms",
    lastChecked: "2026-03-13 10:45:00",
    description: "Knowledge base article retrieval and suggestion engine",
  },
  {
    id: "svc-chat-assist",
    name: "Chat Assist",
    icon: MessageSquare,
    status: "Degraded",
    uptime: 98.4,
    avgResponseTime: "340ms",
    lastChecked: "2026-03-13 10:44:30",
    description: "AI-powered chat response generation and suggestions",
  },
  {
    id: "svc-sentiment",
    name: "Sentiment Analysis",
    icon: Brain,
    status: "Operational",
    uptime: 99.88,
    avgResponseTime: "85ms",
    lastChecked: "2026-03-13 10:45:00",
    description: "Real-time customer sentiment tracking during interactions",
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

const statusConfig = {
  Operational: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2, dotColor: "bg-emerald-400" },
  Degraded: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: AlertTriangle, dotColor: "bg-yellow-400" },
  Down: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: XCircle, dotColor: "bg-red-400" },
};

export default function AIStatusPage() {
  return (
    <div className="flex flex-col h-full" data-testid="page-ai-status">
      <div className="px-6 py-4 glass-header">
        <h2 className="text-lg font-semibold">AI Status</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          AI service health & performance monitoring
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiServices.map((service) => {
              const config = statusConfig[service.status];
              const StatusIcon = config.icon;
              return (
                <Card
                  key={service.id}
                  className="p-4"
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
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
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
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                      <p
                        className="text-lg font-bold mt-0.5"
                        data-testid={`text-response-${service.id}`}
                      >
                        {service.avgResponseTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Checked</p>
                      <p className="text-xs font-medium mt-1" data-testid={`text-last-checked-${service.id}`}>
                        {service.lastChecked.split(" ")[1]}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-4" data-testid="card-health-timeline">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              System Health Timeline (Today)
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
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Transcription"
                  />
                  <Line
                    type="monotone"
                    dataKey="kb"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="KB Assist"
                  />
                  <Line
                    type="monotone"
                    dataKey="chat"
                    stroke="#eab308"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Chat Assist"
                  />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Sentiment"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
