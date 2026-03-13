import { useMemo } from "react";
import {
  Globe,
  Sparkles,
  Search,
  MessageSquare,
  Clock,
  Bot,
  TrendingUp,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

function getFirstName(): string {
  const role = localStorage.getItem("wingman_auth");
  if (role === "admin") return "Gokul";
  return "Priya";
}

const kpiCards = [
  {
    title: "Total Conversations",
    value: "1,847",
    change: "↑12.5%",
    icon: MessageSquare,
    color: "bg-blue-50 text-blue-500",
  },
  {
    title: "Avg. Resolution",
    value: "4.2m",
    change: "↑8.3%",
    icon: Clock,
    color: "bg-amber-50 text-amber-500",
  },
  {
    title: "AI Handled",
    value: "847",
    change: "↑15.2%",
    icon: Bot,
    color: "bg-violet-50 text-violet-500",
  },
];

const conversationVolumeData = [
  { time: "00:00", Chat: 40, Voice: 20, Email: 15 },
  { time: "03:00", Chat: 30, Voice: 15, Email: 12 },
  { time: "06:00", Chat: 35, Voice: 25, Email: 18 },
  { time: "09:00", Chat: 80, Voice: 55, Email: 40 },
  { time: "12:00", Chat: 95, Voice: 60, Email: 45 },
  { time: "15:00", Chat: 110, Voice: 70, Email: 50 },
  { time: "18:00", Chat: 85, Voice: 50, Email: 35 },
  { time: "21:00", Chat: 60, Voice: 35, Email: 25 },
  { time: "23:59", Chat: 45, Voice: 22, Email: 18 },
];

const channelMixData = [
  { name: "Chat", value: 45, color: "#6366f1" },
  { name: "Email", value: 30, color: "#f59e0b" },
  { name: "Voice", value: 25, color: "#10b981" },
];

const resolutionTrendData = [
  { day: "Mon", Resolved: 180, Pending: 30 },
  { day: "Tue", Resolved: 200, Pending: 25 },
  { day: "Wed", Resolved: 220, Pending: 35 },
  { day: "Thu", Resolved: 195, Pending: 28 },
  { day: "Fri", Resolved: 250, Pending: 20 },
  { day: "Sat", Resolved: 160, Pending: 15 },
  { day: "Sun", Resolved: 140, Pending: 12 },
];

const liveActivityData = [
  {
    id: "la-1",
    icon: CheckCircle2,
    description: "Ticket #4821 resolved by AI agent",
    time: "Just now",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
  },
  {
    id: "la-2",
    icon: Phone,
    description: "Incoming call routed to Sarah Chen",
    time: "2 min ago",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
  },
  {
    id: "la-3",
    icon: AlertCircle,
    description: "Ticket #4819 escalated to L2 support",
    time: "5 min ago",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
  },
  {
    id: "la-4",
    icon: UserPlus,
    description: "New chat session started — Michael R.",
    time: "8 min ago",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-50",
  },
  {
    id: "la-5",
    icon: Bot,
    description: "AI handled refund request automatically",
    time: "12 min ago",
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-50",
  },
  {
    id: "la-6",
    icon: Mail,
    description: "Email response sent to David Kim",
    time: "15 min ago",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50",
  },
];

export default function HomePage() {
  const firstName = useMemo(() => getFirstName(), []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col h-full overflow-auto" data-testid="page-home">
        <div className="px-4 py-3 space-y-3 flex-1 flex flex-col">

          <div className="flex items-center gap-2 px-3 py-2 glass-header rounded-lg" data-testid="section-welcome">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Globe className="w-3.5 h-3.5 text-primary" />
            </div>
            <h1 className="text-base font-semibold flex-1 min-w-0 truncate" data-testid="text-welcome-name">
              Welcome, {firstName}
            </h1>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{dateStr} · {timeStr}</span>
          </div>

          <Card className="px-3 py-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent" data-testid="card-ai-summary">
            <div className="flex items-center gap-2 text-sm flex-wrap sm:flex-nowrap sm:overflow-hidden sm:whitespace-nowrap">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">Today:</span>
              <span className="text-muted-foreground">Resolved <span className="text-primary font-semibold">1,300</span> convos</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground">L2 escalations: <span className="text-primary font-semibold">4</span></span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground">Saved <span className="text-primary font-semibold">24 hrs</span></span>
            </div>
          </Card>

          <div className="relative" data-testid="section-search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search insights by topic, channel, or outcome..."
              className="w-full pl-9 pr-3 py-1.5 rounded-md border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              data-testid="input-search-insights"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="section-kpi">
            {kpiCards.map((kpi) => (
              <Card
                key={kpi.title}
                className="p-3"
                data-testid={`card-kpi-${kpi.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${kpi.color}`}>
                    <kpi.icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-0.5 text-emerald-500">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="text-xs font-medium">{kpi.change}</span>
                  </div>
                </div>
                <p
                  className="text-xl font-bold"
                  data-testid={`text-kpi-value-${kpi.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {kpi.value}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.title}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
            <Card className="p-3 flex flex-col" data-testid="card-conversation-volume">
              <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                Conversation Volume
              </h3>
              <ResponsiveContainer width="100%" height={160} className="flex-1 min-h-0">
                <AreaChart data={conversationVolumeData}>
                  <defs>
                    <linearGradient id="colorChat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVoice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEmail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="Chat" stroke="#6366f1" fill="url(#colorChat)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Voice" stroke="#10b981" fill="url(#colorVoice)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Email" stroke="#f59e0b" fill="url(#colorEmail)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-3 flex flex-col" data-testid="card-channel-mix">
              <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                Channel Mix
              </h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={150}>
                  <PieChart>
                    <Pie
                      data={channelMixData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {channelMixData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {channelMixData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs">{item.name}</span>
                      <span className="text-xs font-semibold ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
            <Card className="p-3 flex flex-col" data-testid="card-resolution-trend">
              <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Resolution Trend
              </h3>
              <ResponsiveContainer width="100%" height={160} className="flex-1 min-h-0">
                <LineChart data={resolutionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="Resolved" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Pending" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-3 flex flex-col" data-testid="card-live-activity">
              <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                Live Activity
              </h3>
              <div className="space-y-2">
                {liveActivityData.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2"
                      data-testid={`row-activity-${item.id}`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${item.iconBg}`}>
                        <Icon className={`w-3 h-3 ${item.iconColor}`} />
                      </div>
                      <p className="text-xs flex-1 min-w-0 truncate">{item.description}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{item.time}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

        </div>
    </div>
  );
}
