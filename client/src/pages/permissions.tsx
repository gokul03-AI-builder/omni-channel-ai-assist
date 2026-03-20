import { useState, useMemo } from "react";
import {
  Search,
  Download,
  Link2,
  UserPlus,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Role = "Admin" | "Owner" | "Editor";

interface Person {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: Role;
  joinedDate: string;
  lastLoginAt: string;
  type: "collaborator" | "invitation";
}

const people: Person[] = [
  { id: "u-1", name: "Alex Morgan", email: "alex.morgan@verifone.com", initials: "AM", role: "Admin", joinedDate: "2025-01-15", lastLoginAt: "2026-03-13T09:15:00", type: "collaborator" },
  { id: "u-2", name: "Jordan Lee", email: "jordan.lee@verifone.com", initials: "JL", role: "Owner", joinedDate: "2024-11-03", lastLoginAt: "2026-03-12T16:42:00", type: "collaborator" },
  { id: "u-3", name: "Taylor Brooks", email: "taylor.brooks@verifone.com", initials: "TB", role: "Editor", joinedDate: "2025-02-20", lastLoginAt: "2026-03-11T11:08:00", type: "collaborator" },
  { id: "u-4", name: "Casey Patel", email: "casey.patel@verifone.com", initials: "CP", role: "Editor", joinedDate: "2025-03-01", lastLoginAt: "2026-03-13T08:30:00", type: "collaborator" },
  { id: "u-5", name: "Riley Nguyen", email: "riley.nguyen@verifone.com", initials: "RN", role: "Editor", joinedDate: "2025-01-28", lastLoginAt: "2026-03-10T14:55:00", type: "collaborator" },
  { id: "u-6", name: "Morgan Davis", email: "morgan.davis@verifone.com", initials: "MD", role: "Editor", joinedDate: "2024-12-10", lastLoginAt: "2026-03-09T10:22:00", type: "collaborator" },
  { id: "u-7", name: "Sam Torres", email: "sam.torres@verifone.com", initials: "ST", role: "Owner", joinedDate: "2024-10-05", lastLoginAt: "2026-03-12T19:37:00", type: "collaborator" },
  { id: "u-8", name: "Jamie Chen", email: "jamie.chen@verifone.com", initials: "JC", role: "Editor", joinedDate: "2025-03-05", lastLoginAt: "2026-03-08T15:10:00", type: "invitation" },
  { id: "u-9", name: "Avery Kim", email: "avery.kim@verifone.com", initials: "AK", role: "Admin", joinedDate: "2024-09-18", lastLoginAt: "2026-03-13T07:48:00", type: "collaborator" },
  { id: "u-10", name: "Dakota Reeves", email: "dakota.reeves@verifone.com", initials: "DR", role: "Editor", joinedDate: "2025-02-14", lastLoginAt: "2026-03-07T13:05:00", type: "invitation" },
  { id: "u-11", name: "Quinn Harper", email: "quinn.harper@verifone.com", initials: "QH", role: "Owner", joinedDate: "2024-08-22", lastLoginAt: "2026-03-12T22:14:00", type: "collaborator" },
];

const roleColors: Record<Role, { text: string; bg: string; border: string }> = {
  Admin: { text: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  Owner: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Editor: { text: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/30" },
};

type SortField = "name" | "role" | "joinedDate" | "lastLoginAt";
type SortDir = "asc" | "desc";

const ROWS_PER_PAGE = 8;

export default function PermissionsPage() {
  const [tab, setTab] = useState<"all" | "invitations" | "collaborators">("all");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [peopleState, setPeopleState] = useState(people);

  const handleRoleChange = (id: string, newRole: Role) => {
    setPeopleState((prev) => prev.map((p) => (p.id === id ? { ...p, role: newRole } : p)));
  };

  const filtered = useMemo(() => {
    let list = peopleState;
    if (tab === "invitations") list = list.filter((p) => p.type === "invitation");
    if (tab === "collaborators") list = list.filter((p) => p.type === "collaborator");
    if (roleFilter !== "all") list = list.filter((p) => p.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "role") cmp = a.role.localeCompare(b.role);
      else if (sortField === "joinedDate") cmp = a.joinedDate.localeCompare(b.joinedDate);
      else if (sortField === "lastLoginAt") cmp = a.lastLoginAt.localeCompare(b.lastLoginAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [peopleState, tab, roleFilter, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);
  const startIdx = filtered.length === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1;
  const endIdx = Math.min(safePage * ROWS_PER_PAGE, filtered.length);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="inline-flex flex-col ml-1 -space-y-1">
      <ChevronUp className={`w-3 h-3 ${sortField === field && sortDir === "asc" ? "text-primary" : "text-muted-foreground/40"}`} />
      <ChevronDown className={`w-3 h-3 ${sortField === field && sortDir === "desc" ? "text-primary" : "text-muted-foreground/40"}`} />
    </span>
  );

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDateTime = (d: string) => {
    const date = new Date(d);
    const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timePart = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${datePart} · ${timePart}`;
  };

  return (
    <div className="flex flex-col h-full" data-testid="page-permissions">
      <div className="px-6 py-4 glass-header mx-4 mt-4 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" data-testid="text-page-title">People</h2>
          <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-page-subtitle">
            {peopleState.length} agents in this workspace
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-4 space-y-4">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setPage(1); }}>
            <TabsList className="glass-panel" data-testid="tabs-people">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="invitations" data-testid="tab-invitations">Invitations</TabsTrigger>
              <TabsTrigger value="collaborators" data-testid="tab-collaborators">Collaborators</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 glass-panel border-border/30"
                data-testid="input-search"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v as typeof roleFilter); setPage(1); }}>
                <SelectTrigger className="w-[130px] h-9 text-xs glass-panel border-border/30" data-testid="select-role-filter">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="glass-panel border-border/30" data-testid="button-export">
                <Download className="w-4 h-4 mr-1.5" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="glass-panel border-border/30" data-testid="button-invite-link">
                <Link2 className="w-4 h-4 mr-1.5" />
                Invite link
              </Button>
              <Button size="sm" data-testid="button-invite-members">
                <UserPlus className="w-4 h-4 mr-1.5" />
                Invite members
              </Button>
            </div>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-people">
                <thead>
                  <tr className="glass-subtle border-b border-border/20">
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("name")} data-testid="th-name">
                      <span className="inline-flex items-center">Name <SortIcon field="name" /></span>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("role")} data-testid="th-role">
                      <span className="inline-flex items-center">Role <SortIcon field="role" /></span>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("joinedDate")} data-testid="th-joined">
                      <span className="inline-flex items-center">Joined date <SortIcon field="joinedDate" /></span>
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("lastLoginAt")} data-testid="th-last-login">
                      <span className="inline-flex items-center">Last logged in <SortIcon field="lastLoginAt" /></span>
                    </th>
                    <th className="w-12 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground" data-testid="text-no-results">
                        No people found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((person) => {
                      const rc = roleColors[person.role];
                      return (
                        <tr
                          key={person.id}
                          className="border-b border-border/10 last:border-0 hover:bg-primary/5 transition-colors"
                          data-testid={`row-person-${person.id}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 shrink-0">
                                <AvatarFallback className={`text-xs font-semibold ${rc.bg} ${rc.text}`}>
                                  {person.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate" data-testid={`text-name-${person.id}`}>{person.name}</p>
                                <p className="text-xs text-muted-foreground truncate" data-testid={`text-email-${person.id}`}>{person.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Select value={person.role} onValueChange={(v) => handleRoleChange(person.id, v as Role)}>
                              <SelectTrigger className={`h-7 w-[100px] text-xs ${rc.bg} ${rc.text} border ${rc.border}`} data-testid={`select-role-${person.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Owner">Owner</SelectItem>
                                <SelectItem value="Editor">Editor</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground" data-testid={`text-joined-${person.id}`}>
                            {formatDate(person.joinedDate)}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground" data-testid={`text-last-login-${person.id}`}>
                            {formatDateTime(person.lastLoginAt)}
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-actions-${person.id}`}>
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem data-testid={`menuitem-edit-${person.id}`}>Edit</DropdownMenuItem>
                                <DropdownMenuItem data-testid={`menuitem-remove-${person.id}`} className="text-red-400">Remove</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border/20 glass-subtle">
              <p className="text-xs text-muted-foreground" data-testid="text-showing-count">
                Showing {startIdx}–{endIdx} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage <= 1} onClick={() => setPage(1)} data-testid="button-page-first">
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} data-testid="button-page-prev">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-2" data-testid="text-page-info">
                  Page {safePage} of {totalPages}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} data-testid="button-page-next">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)} data-testid="button-page-last">
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
