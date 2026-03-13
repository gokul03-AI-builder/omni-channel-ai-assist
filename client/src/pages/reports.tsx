import { useState } from "react";
import {
  Phone,
  MessageSquare,
  Star,
  Download,
  ArrowUpDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface CallReport {
  id: string;
  date: string;
  agent: string;
  customer: string;
  topic: string;
  duration: string;
  status: string;
  priority: string;
}

interface ChatReport {
  id: string;
  date: string;
  agent: string;
  customer: string;
  topic: string;
  messages: number;
  status: string;
  aiAssisted: boolean;
}

interface CSATReport {
  id: string;
  date: string;
  agent: string;
  customer: string;
  rating: number;
  comment: string;
  channel: string;
}

const callReports: CallReport[] = [
  { id: "CR-001", date: "2026-03-13", agent: "Alex Morgan", customer: "Sarah Chen", topic: "P400 Contactless Failure", duration: "8m 42s", status: "Resolved", priority: "High" },
  { id: "CR-002", date: "2026-03-13", agent: "Jordan Lee", customer: "Michael Rodriguez", topic: "V240m Wi-Fi Setup", duration: "12m 15s", status: "Resolved", priority: "Medium" },
  { id: "CR-003", date: "2026-03-12", agent: "Taylor Brooks", customer: "Emma Thompson", topic: "e285 Batch Processing", duration: "18m 33s", status: "Escalated", priority: "High" },
  { id: "CR-004", date: "2026-03-12", agent: "Casey Patel", customer: "David Kim", topic: "VX520 Display Issue", duration: "6m 20s", status: "Resolved", priority: "Low" },
  { id: "CR-005", date: "2026-03-11", agent: "Riley Nguyen", customer: "Lisa Park", topic: "P400 Firmware Update", duration: "5m 48s", status: "Resolved", priority: "Medium" },
  { id: "CR-006", date: "2026-03-11", agent: "Alex Morgan", customer: "Robert Chen", topic: "Terminal Network Config", duration: "14m 02s", status: "Pending", priority: "Medium" },
  { id: "CR-007", date: "2026-03-10", agent: "Jordan Lee", customer: "Maria Santos", topic: "Card Reader Malfunction", duration: "22m 10s", status: "Resolved", priority: "Urgent" },
  { id: "CR-008", date: "2026-03-10", agent: "Taylor Brooks", customer: "James Wilson", topic: "Receipt Printer Error", duration: "9m 55s", status: "Resolved", priority: "Low" },
];

const chatReports: ChatReport[] = [
  { id: "CH-001", date: "2026-03-13", agent: "Alex Morgan", customer: "Sarah Chen", topic: "Account Settings Help", messages: 12, status: "Resolved", aiAssisted: true },
  { id: "CH-002", date: "2026-03-13", agent: "Casey Patel", customer: "Michael Rodriguez", topic: "Transaction History Query", messages: 8, status: "Resolved", aiAssisted: true },
  { id: "CH-003", date: "2026-03-12", agent: "Riley Nguyen", customer: "Emma Thompson", topic: "Device Setup Guide", messages: 15, status: "Resolved", aiAssisted: false },
  { id: "CH-004", date: "2026-03-12", agent: "Jordan Lee", customer: "David Kim", topic: "Billing Inquiry", messages: 6, status: "Resolved", aiAssisted: true },
  { id: "CH-005", date: "2026-03-11", agent: "Taylor Brooks", customer: "Lisa Park", topic: "Software Update Help", messages: 10, status: "Pending", aiAssisted: true },
  { id: "CH-006", date: "2026-03-11", agent: "Alex Morgan", customer: "Robert Chen", topic: "Integration Support", messages: 18, status: "Escalated", aiAssisted: false },
];

const csatReports: CSATReport[] = [
  { id: "CS-001", date: "2026-03-13", agent: "Alex Morgan", customer: "Sarah Chen", rating: 5, comment: "Excellent service, very knowledgeable about P400 terminals.", channel: "Call" },
  { id: "CS-002", date: "2026-03-13", agent: "Jordan Lee", customer: "Michael Rodriguez", rating: 4, comment: "Good support, resolved my Wi-Fi issue.", channel: "Call" },
  { id: "CS-003", date: "2026-03-12", agent: "Casey Patel", customer: "David Kim", rating: 5, comment: "Quick and professional chat support.", channel: "Chat" },
  { id: "CS-004", date: "2026-03-12", agent: "Taylor Brooks", customer: "Emma Thompson", rating: 3, comment: "Issue took longer than expected to resolve.", channel: "Call" },
  { id: "CS-005", date: "2026-03-11", agent: "Riley Nguyen", customer: "Lisa Park", rating: 4, comment: "Helpful firmware update assistance.", channel: "Call" },
  { id: "CS-006", date: "2026-03-11", agent: "Alex Morgan", customer: "Robert Chen", rating: 5, comment: "AI suggestions were spot-on.", channel: "Chat" },
  { id: "CS-007", date: "2026-03-10", agent: "Jordan Lee", customer: "Maria Santos", rating: 3, comment: "Had to call back twice before issue was resolved.", channel: "Call" },
];

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Escalated: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  return (
    <Badge variant="secondary" className={`text-xs ${colorMap[status] || ""}`}>
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colorMap: Record<string, string> = {
    Urgent: "text-red-400",
    High: "text-orange-400",
    Medium: "text-yellow-400",
    Low: "text-muted-foreground",
  };
  return <span className={`text-xs font-medium ${colorMap[priority] || ""}`}>{priority}</span>;
}

function exportCsv(headers: string[], rows: string[][], filename: string) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [callFilter, setCallFilter] = useState("");
  const [chatFilter, setChatFilter] = useState("");
  const [csatFilter, setCsatFilter] = useState("");
  const [callSort, setCallSort] = useState<{ key: keyof CallReport; asc: boolean }>({ key: "date", asc: false });
  const [chatSort, setChatSort] = useState<{ key: keyof ChatReport; asc: boolean }>({ key: "date", asc: false });
  const [csatSort, setCsatSort] = useState<{ key: keyof CSATReport; asc: boolean }>({ key: "date", asc: false });

  function sortData<T>(data: T[], key: keyof T, asc: boolean): T[] {
    return [...data].sort((a, b) => {
      const va = String(a[key]);
      const vb = String(b[key]);
      return asc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  function toggleSort<T>(current: { key: keyof T; asc: boolean }, key: keyof T): { key: keyof T; asc: boolean } {
    return current.key === key ? { key, asc: !current.asc } : { key, asc: true };
  }

  const filteredCalls = sortData(
    callReports.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(callFilter.toLowerCase()))),
    callSort.key,
    callSort.asc
  );
  const filteredChats = sortData(
    chatReports.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(chatFilter.toLowerCase()))),
    chatSort.key,
    chatSort.asc
  );
  const filteredCsat = sortData(
    csatReports.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(csatFilter.toLowerCase()))),
    csatSort.key,
    csatSort.asc
  );

  const SortButton = ({ label, onClick, testId }: { label: string; onClick: () => void; testId: string }) => (
    <button onClick={onClick} className="flex items-center gap-1 hover:text-foreground transition-colors" data-testid={testId}>
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="flex flex-col h-full" data-testid="page-reports">
      <div className="px-6 py-4 glass-header">
        <h2 className="text-lg font-semibold">Reports</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Call, chat, and CSAT report data</p>
      </div>

      <div className="flex-1 min-h-0 px-6 py-4">
        <Tabs defaultValue="calls" className="flex flex-col h-full">
          <TabsList className="glass-subtle mb-3 shrink-0 w-fit">
            <TabsTrigger value="calls" className="text-xs gap-1.5" data-testid="tab-call-reports">
              <Phone className="w-3.5 h-3.5" /> Call Reports
            </TabsTrigger>
            <TabsTrigger value="chats" className="text-xs gap-1.5" data-testid="tab-chat-reports">
              <MessageSquare className="w-3.5 h-3.5" /> Chat Reports
            </TabsTrigger>
            <TabsTrigger value="csat" className="text-xs gap-1.5" data-testid="tab-csat-reports">
              <Star className="w-3.5 h-3.5" /> CSAT Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calls" className="flex-1 min-h-0 mt-0">
            <Card className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <Input
                  placeholder="Filter call reports..."
                  value={callFilter}
                  onChange={(e) => setCallFilter(e.target.value)}
                  className="max-w-xs h-8 text-xs"
                  data-testid="input-filter-calls"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => exportCsv(
                    ["ID", "Date", "Agent", "Customer", "Topic", "Duration", "Status", "Priority"],
                    filteredCalls.map((r) => [r.id, r.date, r.agent, r.customer, r.topic, r.duration, r.status, r.priority]),
                    "call-reports.csv"
                  )}
                  data-testid="button-export-calls"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border/30">
                      <th className="text-left pb-2 font-medium"><SortButton label="Date" onClick={() => setCallSort(toggleSort(callSort, "date"))} testId="button-sort-calls-date" /></th>
                      <th className="text-left pb-2 font-medium"><SortButton label="Agent" onClick={() => setCallSort(toggleSort(callSort, "agent"))} testId="button-sort-calls-agent" /></th>
                      <th className="text-left pb-2 font-medium"><SortButton label="Customer" onClick={() => setCallSort(toggleSort(callSort, "customer"))} testId="button-sort-calls-customer" /></th>
                      <th className="text-left pb-2 font-medium">Topic</th>
                      <th className="text-left pb-2 font-medium">Duration</th>
                      <th className="text-left pb-2 font-medium"><SortButton label="Status" onClick={() => setCallSort(toggleSort(callSort, "status"))} testId="button-sort-calls-status" /></th>
                      <th className="text-left pb-2 font-medium">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCalls.map((r) => (
                      <tr key={r.id} className="border-b border-border/10 last:border-0" data-testid={`row-call-${r.id}`}>
                        <td className="py-2 text-xs">{r.date}</td>
                        <td className="py-2 text-xs">{r.agent}</td>
                        <td className="py-2 text-xs">{r.customer}</td>
                        <td className="py-2 text-xs text-muted-foreground">{r.topic}</td>
                        <td className="py-2 text-xs font-mono">{r.duration}</td>
                        <td className="py-2"><StatusBadge status={r.status} /></td>
                        <td className="py-2"><PriorityBadge priority={r.priority} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="chats" className="flex-1 min-h-0 mt-0">
            <Card className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <Input
                  placeholder="Filter chat reports..."
                  value={chatFilter}
                  onChange={(e) => setChatFilter(e.target.value)}
                  className="max-w-xs h-8 text-xs"
                  data-testid="input-filter-chats"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => exportCsv(
                    ["ID", "Date", "Agent", "Customer", "Topic", "Messages", "Status", "AI Assisted"],
                    filteredChats.map((r) => [r.id, r.date, r.agent, r.customer, r.topic, String(r.messages), r.status, r.aiAssisted ? "Yes" : "No"]),
                    "chat-reports.csv"
                  )}
                  data-testid="button-export-chats"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border/30">
                      <th className="text-left pb-2 font-medium"><SortButton label="Date" onClick={() => setChatSort(toggleSort(chatSort, "date"))} testId="button-sort-chats-date" /></th>
                      <th className="text-left pb-2 font-medium"><SortButton label="Agent" onClick={() => setChatSort(toggleSort(chatSort, "agent"))} testId="button-sort-chats-agent" /></th>
                      <th className="text-left pb-2 font-medium"><SortButton label="Customer" onClick={() => setChatSort(toggleSort(chatSort, "customer"))} testId="button-sort-chats-customer" /></th>
                      <th className="text-left pb-2 font-medium">Topic</th>
                      <th className="text-left pb-2 font-medium">Messages</th>
                      <th className="text-left pb-2 font-medium"><SortButton label="Status" onClick={() => setChatSort(toggleSort(chatSort, "status"))} testId="button-sort-chats-status" /></th>
                      <th className="text-left pb-2 font-medium">AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChats.map((r) => (
                      <tr key={r.id} className="border-b border-border/10 last:border-0" data-testid={`row-chat-${r.id}`}>
                        <td className="py-2 text-xs">{r.date}</td>
                        <td className="py-2 text-xs">{r.agent}</td>
                        <td className="py-2 text-xs">{r.customer}</td>
                        <td className="py-2 text-xs text-muted-foreground">{r.topic}</td>
                        <td className="py-2 text-xs font-mono">{r.messages}</td>
                        <td className="py-2"><StatusBadge status={r.status} /></td>
                        <td className="py-2">
                          {r.aiAssisted ? (
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">AI</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="csat" className="flex-1 min-h-0 mt-0">
            <Card className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <Input
                  placeholder="Filter CSAT reports..."
                  value={csatFilter}
                  onChange={(e) => setCsatFilter(e.target.value)}
                  className="max-w-xs h-8 text-xs"
                  data-testid="input-filter-csat"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => exportCsv(
                    ["ID", "Date", "Agent", "Customer", "Rating", "Comment", "Channel"],
                    filteredCsat.map((r) => [r.id, r.date, r.agent, r.customer, String(r.rating), r.comment, r.channel]),
                    "csat-reports.csv"
                  )}
                  data-testid="button-export-csat"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border/30">
                      <th className="text-left pb-2 font-medium"><SortButton label="Date" onClick={() => setCsatSort(toggleSort(csatSort, "date"))} testId="button-sort-csat-date" /></th>
                      <th className="text-left pb-2 font-medium"><SortButton label="Agent" onClick={() => setCsatSort(toggleSort(csatSort, "agent"))} testId="button-sort-csat-agent" /></th>
                      <th className="text-left pb-2 font-medium"><SortButton label="Customer" onClick={() => setCsatSort(toggleSort(csatSort, "customer"))} testId="button-sort-csat-customer" /></th>
                      <th className="text-left pb-2 font-medium"><SortButton label="Rating" onClick={() => setCsatSort(toggleSort(csatSort, "rating"))} testId="button-sort-csat-rating" /></th>
                      <th className="text-left pb-2 font-medium">Comment</th>
                      <th className="text-left pb-2 font-medium">Channel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCsat.map((r) => (
                      <tr key={r.id} className="border-b border-border/10 last:border-0" data-testid={`row-csat-${r.id}`}>
                        <td className="py-2 text-xs">{r.date}</td>
                        <td className="py-2 text-xs">{r.agent}</td>
                        <td className="py-2 text-xs">{r.customer}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted/60"}`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="py-2 text-xs text-muted-foreground max-w-[200px] truncate">{r.comment}</td>
                        <td className="py-2">
                          <Badge variant="secondary" className="text-xs">{r.channel}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
