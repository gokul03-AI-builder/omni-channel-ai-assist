import { useLocation, Link } from "wouter";
import { Phone, MessageSquare, ThumbsUp, LogOut, PanelLeftClose, PanelLeftOpen, Sun, Moon, Home, BarChart3, FileText, Shield, Bot } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme-provider";
import verifoneLogo from "@assets/verifone_1773393343272.png";

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { title: "Home", url: "/", icon: Home },
      { title: "Feedback", url: "/feedback", icon: ThumbsUp },
    ],
  },
  {
    label: "CHANNELS",
    items: [
      { title: "Calls", url: "/calls", icon: Phone },
      { title: "Chats", url: "/chats", icon: MessageSquare },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Reports", url: "/reports", icon: FileText },
    ],
  },
];

const adminGroup = {
  label: "SYSTEM",
  items: [
    { title: "AI Status", url: "/ai-status", icon: Bot },
    { title: "Permissions", url: "/permissions", icon: Shield },
  ],
};

export function AppSidebar({ onLogout }: { onLogout: () => void }) {
  const [location] = useLocation();
  const { toggleSidebar, open } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const storedEmail = localStorage.getItem("wingman_email") || "";
  const authRole = localStorage.getItem("wingman_auth");
  const isAdmin = authRole === "admin";
  const displayRole = isAdmin ? "Admin" : "Support Agent";
  const emailPrefix = storedEmail.split("@")[0] || "";
  const initials = emailPrefix.length >= 2
    ? (emailPrefix[0] + emailPrefix[1]).toUpperCase()
    : emailPrefix.toUpperCase() || (isAdmin ? "AD" : "AG");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <div className="rounded-lg overflow-hidden shrink-0">
              <img
                src={verifoneLogo}
                alt="Verifone"
                className="h-8 w-auto object-contain dark:invert dark:brightness-100"
                data-testid="img-logo"
              />
            </div>
            <span className="text-sm font-semibold tracking-tight" data-testid="text-wingman-title">Verifone's Wingman</span>
          </div>
          <div className="hidden w-full group-data-[collapsible=icon]:flex items-center justify-center">
            <span className="text-sm font-bold text-primary" data-testid="img-logo-collapsed">V</span>
          </div>
          <p className="text-xs text-muted-foreground pl-0.5 group-data-[collapsible=icon]:hidden">AI-Powered Agent Assist</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {[...navGroups, ...(isAdmin ? [adminGroup] : [])].map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium px-3 group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        data-active={isActive}
                        className={
                          isActive
                            ? "!bg-primary/20 text-primary font-semibold border border-primary/30 shadow-[0_0_10px_-3px_hsl(var(--primary)/0.25)]"
                            : "hover:bg-primary/8 hover:text-primary/90"
                        }
                      >
                        <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                          <item.icon className={isActive ? "text-primary" : "opacity-50"} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-border/10 p-3 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-3">
        <div className="flex flex-col items-center gap-2 group-data-[state=expanded]:flex-row group-data-[state=expanded]:gap-2.5">
          <button
            onClick={toggleSidebar}
            className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            data-testid="button-toggle-sidebar"
          >
            {open ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none" data-testid="button-profile-dropdown">
                <Avatar className="h-8 w-8 shrink-0 border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]" data-testid="text-sidebar-initials">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 glass-panel border-border/30" data-testid="dropdown-profile-menu">
              <div className="px-3 py-2">
                <p className="text-sm font-semibold truncate" data-testid="text-sidebar-email">{storedEmail}</p>
                <p className="text-xs text-muted-foreground" data-testid="text-sidebar-role">{displayRole}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer gap-2" data-testid="button-theme-toggle">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer gap-2 text-red-400 focus:text-red-400"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
