import { useState } from "react";
import {
  Shield,
  Users,
  Check,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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

export default function PermissionsPage() {
  const [agents, setAgents] = useState(initialAgents);

  const handleRoleChange = (id: string, newRole: "Admin" | "Supervisor" | "Agent") => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, role: newRole } : a)));
  };

  return (
    <div className="flex flex-col h-full" data-testid="page-permissions">
      <div className="px-6 py-4 glass-header">
        <h2 className="text-lg font-semibold">Permissions</h2>
        <p className="text-sm text-muted-foreground mt-0.5">User roles & access management</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-4 space-y-6">
          <Card className="p-4" data-testid="card-agent-table">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Agent Management
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/30">
                    <th className="text-left pb-2 font-medium">Agent</th>
                    <th className="text-left pb-2 font-medium">Email</th>
                    <th className="text-left pb-2 font-medium">Role</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id} className="border-b border-border/10 last:border-0" data-testid={`row-agent-${agent.id}`}>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                              {agent.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-xs text-muted-foreground">{agent.email}</td>
                      <td className="py-2.5">
                        <Select
                          value={agent.role}
                          onValueChange={(v) => handleRoleChange(agent.id, v as Agent["role"])}
                        >
                          <SelectTrigger
                            className="h-7 w-[130px] text-xs"
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
                      </td>
                      <td className="py-2.5">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${agent.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                          data-testid={`badge-status-${agent.id}`}
                        >
                          {agent.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4" data-testid="card-permissions-matrix">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Role Permissions Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/30">
                    <th className="text-left pb-2 font-medium">Capability</th>
                    <th className="text-center pb-2 font-medium">Admin</th>
                    <th className="text-center pb-2 font-medium">Supervisor</th>
                    <th className="text-center pb-2 font-medium">Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionsMatrix.map((row) => (
                    <tr key={row.capability} className="border-b border-border/10 last:border-0" data-testid={`row-perm-${row.capability.toLowerCase().replace(/[\s&()]/g, "-")}`}>
                      <td className="py-2 text-xs">{row.capability}</td>
                      <td className="py-2 text-center">
                        {row.admin ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-red-400/40 mx-auto" />
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {row.supervisor ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-red-400/40 mx-auto" />
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {row.agent ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-red-400/40 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
