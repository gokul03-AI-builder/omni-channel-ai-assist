import { useState } from "react";
import {
  Phone,
  Bot,
  Users,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const volumeData7D = [
  { day: "Mon", calls: 42, chats: 28 },
  { day: "Tue", calls: 55, chats: 34 },
  { day: "Wed", calls: 48, chats: 31 },
  { day: "Thu", calls: 62, chats: 40 },
  { day: "Fri", calls: 58, chats: 38 },
  { day: "Sat", calls: 25, chats: 18 },
  { day: "Sun", calls: 18, chats: 12 },
];

const volumeData30D = [
  { day: "W1", calls: 280, chats: 190 },
  { day: "W2", calls: 310, chats: 215 },
  { day: "W3", calls: 295, chats: 200 },
  { day: "W4", calls: 335, chats: 240 },
];

const volumeData90D = [
  { day: "Jan", calls: 1120, chats: 760 },
  { day: "Feb", calls: 1180, chats: 810 },
  { day: "Mar", calls: 1284, chats: 856 },
];

const aiUsageData = [
  { name: "Accepted", value: 62, color: "hsl(var(--primary))" },
  { name: "Viewed", value: 18, color: "hsl(var(--primary) / 0.5)" },
  { name: "Ignored", value: 20, color: "hsl(var(--muted))" },
];

const agentPerformance = [
  { name: "Alex M.", calls: 142, chats: 98, csat: 4.8 },
  { name: "Jordan L.", calls: 128, chats: 112, csat: 4.7 },
  { name: "Taylor B.", calls: 119, chats: 87, csat: 4.6 },
  { name: "Casey P.", calls: 105, chats: 76, csat: 4.5 },
  { name: "Riley N.", calls: 98, chats: 91, csat: 4.4 },
];

const ranges = ["7D", "30D", "90D"] as const;
type Range = (typeof ranges)[number];
const volumeDataMap: Record<Range, typeof volumeData7D> = {
  "7D": volumeData7D,
  "30D": volumeData30D,
  "90D": volumeData90D,
};

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("7D");
  const data = volumeDataMap[range];

  return (
    <div className="flex flex-col h-full" data-testid="page-analytics">
      <div className="px-6 py-4 glass-header flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Performance trends & AI usage insights
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-0.5">
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
        <div className="px-6 py-4 space-y-6">
          <Card className="p-4" data-testid="card-volume-chart">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Call & Chat Volume
              <Badge variant="secondary" className="text-xs ml-auto">
                {range}
              </Badge>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border) / 0.3)"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border) / 0.3)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    name="Calls"
                  />
                  <Line
                    type="monotone"
                    dataKey="chats"
                    stroke="hsl(var(--primary) / 0.5)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--primary) / 0.5)" }}
                    name="Chats"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4" data-testid="card-ai-usage">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                AI Suggestion Usage
              </h3>
              <div className="h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aiUsageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                    >
                      {aiUsageData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border) / 0.3)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                {aiUsageData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {d.name} ({d.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4" data-testid="card-agent-performance">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Agent Performance
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentPerformance}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border) / 0.3)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border) / 0.3)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="calls"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      name="Calls"
                    />
                    <Bar
                      dataKey="chats"
                      fill="hsl(var(--primary) / 0.5)"
                      radius={[4, 4, 0, 0]}
                      name="Chats"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
