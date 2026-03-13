import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  UserCheck,
  Star,
  Clock,
  Download,
  Plus,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof BarChart3;
  iconColor: string;
  iconBg: string;
  frequency: string;
  format: string;
  lastGenerated: string;
}

interface RecentReport {
  id: string;
  name: string;
  type: string;
  status: "Completed" | "Processing";
  generated: string;
  format: string;
}

const templates: ReportTemplate[] = [
  {
    id: "t-1",
    name: "Daily Support Summary",
    description: "Overview of all support interactions, resolution rates, and agent performance",
    icon: BarChart3,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    frequency: "daily",
    format: "PDF",
    lastGenerated: "Today, 6:00 AM",
  },
  {
    id: "t-2",
    name: "Weekly Channel Performance",
    description: "Cross-channel metrics comparison with trend analysis",
    icon: TrendingUp,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    frequency: "weekly",
    format: "CSV",
    lastGenerated: "Mar 10, 2026",
  },
  {
    id: "t-3",
    name: "Agent Performance Report",
    description: "Individual agent metrics, CSAT scores, and resolution efficiency",
    icon: UserCheck,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    frequency: "monthly",
    format: "PDF",
    lastGenerated: "Mar 1, 2026",
  },
  {
    id: "t-4",
    name: "Customer Satisfaction Report",
    description: "CSAT trends, NPS scores, and customer feedback analysis",
    icon: Star,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    frequency: "monthly",
    format: "PDF",
    lastGenerated: "Mar 1, 2026",
  },
];

const recentReports: RecentReport[] = [
  { id: "r-1", name: "Daily Support Summary", type: "daily", status: "Completed", generated: "Mar 13, 2026 06:00", format: "PDF" },
  { id: "r-2", name: "Daily Support Summary", type: "daily", status: "Completed", generated: "Mar 12, 2026 06:00", format: "PDF" },
  { id: "r-3", name: "Weekly Channel Performance", type: "weekly", status: "Completed", generated: "Mar 10, 2026 00:00", format: "CSV" },
  { id: "r-4", name: "Agent Performance Report", type: "monthly", status: "Processing", generated: "Mar 13, 2026 09:15", format: "PDF" },
  { id: "r-5", name: "Daily Support Summary", type: "daily", status: "Completed", generated: "Mar 11, 2026 06:00", format: "PDF" },
  { id: "r-6", name: "Customer Satisfaction Report", type: "monthly", status: "Completed", generated: "Mar 1, 2026 00:00", format: "PDF" },
  { id: "r-7", name: "Weekly Channel Performance", type: "weekly", status: "Completed", generated: "Mar 3, 2026 00:00", format: "CSV" },
];

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
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredReports = typeFilter === "all"
    ? recentReports
    : recentReports.filter((r) => r.type === typeFilter);

  const handleTemplateClick = (template: ReportTemplate) => {
    toast({
      title: `Generating ${template.name}...`,
      description: `${template.format} report will be ready shortly.`,
    });
  };

  const handleDownload = (report: RecentReport) => {
    exportCsv(
      ["Report", "Type", "Status", "Generated", "Format"],
      [[report.name, report.type, report.status, report.generated, report.format]],
      `${report.name.toLowerCase().replace(/\s+/g, "-")}.csv`
    );
  };

  return (
    <div className="flex flex-col h-full" data-testid="page-reports">
      <div className="px-6 py-4 glass-header">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Generate, schedule, and download support reports</p>
          </div>
          <Button className="gap-2" data-testid="button-create-report">
            <Plus className="w-4 h-4" /> Custom Report
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-6 max-w-[1200px] mx-auto">

          <div>
            <h2 className="text-sm font-semibold mb-3" data-testid="text-section-templates">Report Templates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    className="glass-panel rounded-xl p-4 cursor-pointer hover-elevate transition-all"
                    onClick={() => handleTemplateClick(template)}
                    data-testid={`card-template-${template.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${template.iconBg}`}>
                        <Icon className={`w-[18px] h-[18px] ${template.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium" data-testid={`text-template-name-${template.id}`}>{template.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-[9px]">{template.frequency}</Badge>
                          <Badge variant="outline" className="text-[9px]">{template.format}</Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground" data-testid={`text-template-last-generated-${template.id}`}>Last generated: {template.lastGenerated}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden" data-testid="card-recent-reports">
            <div className="flex items-center justify-between gap-2 px-6 py-4">
              <h3 className="text-sm font-medium">Recent Reports</h3>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs" data-testid="select-report-filter">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="px-6 pb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/30">
                    <th className="text-left pb-2 font-medium">Report Name</th>
                    <th className="text-left pb-2 font-medium">Type</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                    <th className="text-left pb-2 font-medium">Generated</th>
                    <th className="text-left pb-2 font-medium">Format</th>
                    <th className="text-right pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-border/10 last:border-0 hover:bg-primary/5 transition-colors"
                      data-testid={`row-report-${report.id}`}
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium">{report.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <Badge variant="secondary" className="text-[10px] capitalize">{report.type}</Badge>
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${
                            report.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          }`}
                          data-testid={`badge-status-${report.id}`}
                        >
                          {report.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-xs text-muted-foreground">{report.generated}</td>
                      <td className="py-2.5">
                        <Badge variant="outline" className="text-[10px]">{report.format}</Badge>
                      </td>
                      <td className="py-2.5 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => handleDownload(report)}
                          disabled={report.status === "Processing"}
                          data-testid={`button-download-${report.id}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No reports match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
