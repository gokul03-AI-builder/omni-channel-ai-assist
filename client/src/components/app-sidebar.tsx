import { useLocation, Link } from "wouter";
import { Phone, MessageSquare, ThumbsUp, LogOut, PanelLeftClose } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import verifoneLogo from "@assets/Screenshot_2026-03-05_at_5.50.17_PM_1772713220675.png";

const navItems = [
  { title: "Calls", url: "/", icon: Phone },
  { title: "Chats", url: "/chats", icon: MessageSquare },
  { title: "Feedback", url: "/feedback", icon: ThumbsUp },
];

export function AppSidebar({ onLogout }: { onLogout: () => void }) {
  const [location] = useLocation();
  const { toggleSidebar } = useSidebar();
  const storedEmail = localStorage.getItem("wingman_email") || "";
  const authRole = localStorage.getItem("wingman_auth");
  const isAdmin = authRole === "admin";
  const displayRole = isAdmin ? "Admin" : "Support Agent";
  const emailPrefix = storedEmail.split("@")[0] || "";
  const initials = emailPrefix.length >= 2
    ? (emailPrefix[0] + emailPrefix[1]).toUpperCase()
    : emailPrefix.toUpperCase() || (isAdmin ? "AD" : "AG");

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="space-y-1">
          <div className="rounded-lg overflow-hidden bg-slate-900">
            <img
              src={verifoneLogo}
              alt="Verifone"
              className="h-12 w-full object-cover"
              data-testid="img-logo"
            />
          </div>
          <p className="text-xs text-muted-foreground pl-0.5">Agent Console</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={
                        isActive
                          ? "bg-primary/10 text-primary font-medium border border-primary/15"
                          : ""
                      }
                    >
                      <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase()}`}>
                        <item.icon className={isActive ? "text-primary" : "opacity-60"} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-border/20 glass-subtle">
        <div className="flex items-center gap-2.5 mb-2">
          <button
            onClick={toggleSidebar}
            className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            data-testid="button-toggle-sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
          <Avatar className="h-8 w-8 shrink-0 border border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]" data-testid="text-sidebar-initials">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate" data-testid="text-sidebar-email">{storedEmail}</p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal border-border/30" data-testid="text-sidebar-role">{displayRole}</Badge>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
          data-testid="button-sidebar-logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
