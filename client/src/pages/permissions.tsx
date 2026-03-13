import { useState } from "react";
import {
  Shield,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Agent {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "Admin" | "Supervisor" | "Agent";
  status: "Active" | "Inactive";
}

const initialAgents: Agent[] = [
  { id: "u-1", name: "Alex Morgan", email: "alex.morgan@verifone.com", initials: "AM", role: "Admin", status: "Active" },
  { id: "u-2", name: "Jordan Lee", email: "jordan.lee@verifone.com", initials: "JL", role: "Supervisor", status: "Active" },
  { id: "u-3", name: "Taylor Brooks", email: "taylor.brooks@verifone.com", initials: "TB", role: "Agent", status: "Active" },
  { id: "u-4", name: "Casey Patel", email: "casey.patel@verifone.com", initials: "CP", role: "Agent", status: "Active" },
  { id: "u-5", name: "Riley Nguyen", email: "riley.nguyen@verifone.com", initials: "RN", role: "Agent", status: "Active" },
  { id: "u-6", name: "Morgan Davis", email: "morgan.davis@verifone.com", initials: "MD", role: "Agent", status: "Inactive" },
  { id: "u-7", name: "Sam Torres", email: "sam.torres@verifone.com", initials: "ST", role: "Supervisor", status: "Active" },
];

const permissionsMatrix = [
  { capability: "View Dashboard & Analytics", admin: true, supervisor: true, agent: true },
  { capability: "Handle Calls & Chats", admin: true, supervisor: true, agent: true },
  { capability: "View Reports", admin: true, supervisor: true, agent: false },
  { capability: "Export Reports (CSV)", admin: true, supervisor: true, agent: false },
  { capability: "Manage Agent Roles", admin: true, supervisor: false, agent: false },
  { capability: "View AI Status & Health", admin: true, supervisor: false, agent: false },
  { capability: "Configure AI Services", admin: true, supervisor: false, agent: false },
  { capability: "View Permissions Matrix", admin: true, supervisor: false, agent: false },
  { capability: "Access Knowledge Base Admin", admin: true, supervisor: true, agent: false },
  { capability: "Escalate Tickets", admin: true, supervisor: true, agent: true },
];

const roleColors: Record<string, { text: string; bg: string; border: string }> = {
  Admin: { text: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  Supervisor: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Agent: { text: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/30" },
};

export default function PermissionsPage() {
  const [agents, setAgents] = useState(initialAgents);

  const handleRoleChange = (id: string, newRole: "Admin" | "Supervisor" | "Agent") => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, role: newRole } : a)));
  };

  const adminCount = agents.filter((a) => a.role === "Admin").length;
  const supervisorCount = agents.filter((a) => a.role === "Supervisor").length;
  const agentCount = agents.filter((a) => a.role === "Agent").length;

  return (
    <div className="flex flex-col h-full" data-testid="page-permissions">
      <div className="px-6 py-4 glass-header">
        <h1 className="text-2xl font-bold tracking-tight">Permissions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">User roles & access management</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-6 max-w-[1200px] mx-auto">

          <div>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 border-b border-primary/20 pb-2" data-testid="text-section-agents">
              <Users className="w-4 h-4 text-primary" />
              Agent Management
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="card-agent-table">
              {agents.map((agent) => {
                const rc = roleColors[agent.role];
                return (
                  <div
                    key={agent.id}
                    className="glass-panel rounded-xl p-4 flex flex-col gap-3"
                    data-testid={`row-agent-${agent.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className={`text-sm font-semibold ${rc.bg} ${rc.text}`}>
                          {agent.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] shrink-0 ${
                          agent.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                        data-testid={`badge-status-${agent.id}`}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <Select
                      value={agent.role}
                      onValueChange={(v) => handleRoleChange(agent.id, v as Agent["role"])}
                    >
                      <SelectTrigger
                        className={`h-8 text-xs ${rc.bg} ${rc.text} border ${rc.border}`}
                        data-testid={`select-role-${agent.id}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Agent">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 border-b border-primary/20 pb-2">
              <Shield className="w-4 h-4 text-primary" />
              Role Permissions Matrix
            </h2>
            <div className="glass-panel rounded-xl overflow-hidden" data-testid="card-permissions-matrix">
              <table className="w-full text-sm">
                <thead>
                  <tr className="glass-subtle">
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">Capability</th>
                    <th className="text-center px-4 py-3">
                      <Badge className={`text-[10px] ${roleColors.Admin.bg} ${roleColors.Admin.text} border ${roleColors.Admin.border}`}>
                        Admin ({adminCount})
                      </Badge>
                    </th>
                    <th className="text-center px-4 py-3">
                      <Badge className={`text-[10px] ${roleColors.Supervisor.bg} ${roleColors.Supervisor.text} border ${roleColors.Supervisor.border}`}>
                        Supervisor ({supervisorCount})
                      </Badge>
                    </th>
                    <th className="text-center px-4 py-3">
                      <Badge className={`text-[10px] ${roleColors.Agent.bg} ${roleColors.Agent.text} border ${roleColors.Agent.border}`}>
                        Agent ({agentCount})
                      </Badge>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permissionsMatrix.map((row) => (
                    <tr
                      key={row.capability}
                      className="glass-subtle border-b border-border/10 last:border-0 hover:bg-primary/5 transition-colors"
                      data-testid={`row-perm-${row.capability.toLowerCase().replace(/[\s&()]/g, "-")}`}
                    >
                      <td className="px-4 py-2.5 text-xs">{row.capability}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block w-3 h-3 rounded-full ${row.admin ? "bg-primary shadow-[0_0_6px_rgba(110,255,210,0.3)]" : "border-2 border-muted-foreground/20"}`} />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block w-3 h-3 rounded-full ${row.supervisor ? "bg-primary shadow-[0_0_6px_rgba(110,255,210,0.3)]" : "border-2 border-muted-foreground/20"}`} />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block w-3 h-3 rounded-full ${row.agent ? "bg-primary shadow-[0_0_6px_rgba(110,255,210,0.3)]" : "border-2 border-muted-foreground/20"}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
