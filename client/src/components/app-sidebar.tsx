import { useLocation, Link } from "wouter";
import { Phone, MessageSquare, ThumbsUp, LogOut, Sun, Moon, Home, BarChart3, FileText, Shield, Activity, History, ChevronRight, ChevronLeft, Mail, Brain, Star } from "lucide-react";
import { useState, useEffect } from "react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme-provider";
import verifoneLogo from "@assets/verifone_1773393343272.png";

interface NavItem {
  title: string;
  url: string;
  icon: typeof Home;
  comingSoon?: boolean;
  children?: { title: string; url: string; icon: typeof Home }[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      { title: "Home", url: "/", icon: Home },
      {
        title: "Feedback",
        url: "/feedback",
        icon: ThumbsUp,
        children: [
          { title: "RL Approval", url: "/feedback/rl-approval", icon: Brain },
          { title: "Customer Feedback", url: "/feedback/customer", icon: Star },
          { title: "KB Feedback", url: "/feedback/kb", icon: ThumbsUp },
        ],
      },
    ],
  },
  {
    label: "CHANNELS",
    items: [
      {
        title: "Calls",
        url: "/calls",
        icon: Phone,
        children: [
          { title: "History", url: "/calls/history", icon: History },
        ],
      },
      {
        title: "Chats",
        url: "/chats",
        icon: MessageSquare,
        children: [
          { title: "History", url: "/chats/history", icon: History },
        ],
      },
      { title: "Email", url: "/email", icon: Mail, comingSoon: true },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { title: "Analytics", url: "/analytics", icon: BarChart3, comingSoon: true },
      { title: "Reports", url: "/reports", icon: FileText, comingSoon: true },
    ],
  },
];

const adminGroup: NavGroup = {
  label: "SYSTEM",
  items: [
    { title: "Permissions", url: "/permissions", icon: Shield, comingSoon: true },
  ],
};

export function AppSidebar({ onLogout }: { onLogout: () => void }) {
  const [location] = useLocation();
  const { toggleSidebar, open } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    Calls: location.startsWith("/calls"),
    Chats: location.startsWith("/chats"),
    Feedback: location.startsWith("/feedback"),
  });

  useEffect(() => {
    setExpandedItems((prev) => ({
      ...prev,
      Calls: location.startsWith("/calls") ? true : prev.Calls,
      Chats: location.startsWith("/chats") ? true : prev.Chats,
      Feedback: location.startsWith("/feedback") ? true : prev.Feedback,
    }));
  }, [location]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };
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
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedItems[item.title] || false;
                  const isChildActive = hasChildren && item.children!.some((c) => location === c.url);

                  if (item.comingSoon) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground/50 cursor-default select-none group-data-[collapsible=icon]:justify-center" data-testid={`nav-coming-soon-${item.title.toLowerCase()}`}>
                          <item.icon className="w-4 h-4 shrink-0 opacity-40" />
                          <span className="flex-1 text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                          <span className="text-[10px] italic text-muted-foreground/40 group-data-[collapsible=icon]:hidden">Coming soon</span>
                        </div>
                      </SidebarMenuItem>
                    );
                  }

                  const menuButton = hasChildren ? (
                    <div className="flex items-center">
                      <SidebarMenuButton
                        asChild
                        data-active={isActive}
                        className={`flex-1 ${
                          isActive
                            ? "!bg-primary/20 text-primary font-semibold border border-primary/30 shadow-[0_0_10px_-3px_hsl(var(--primary)/0.25)]"
                            : isChildActive
                              ? "text-primary/80"
                              : "hover:bg-primary/8 hover:text-primary/90"
                        }`}
                      >
                        <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                          <item.icon className={isActive || isChildActive ? "text-primary" : "opacity-50"} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleExpanded(item.title);
                        }}
                        className="p-1 rounded hover:bg-muted/30 transition-colors shrink-0 group-data-[collapsible=icon]:hidden"
                        data-testid={`button-expand-${item.title.toLowerCase()}`}
                        aria-label={`Expand ${item.title}`}
                      >
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    </div>
                  ) : (
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
                  );

                  return (
                    <SidebarMenuItem key={item.title}>
                      {hasChildren && !open ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {menuButton}
                          </TooltipTrigger>
                          <TooltipContent side="right" align="start" className="glass-panel border-border/30 p-1">
                            <div className="flex flex-col gap-0.5 min-w-[120px]">
                              <Link
                                href={item.url}
                                className="text-xs px-2.5 py-1.5 rounded hover:bg-primary/10 hover:text-primary transition-colors"
                                data-testid={`link-tooltip-${item.title.toLowerCase()}`}
                              >
                                {item.title}
                              </Link>
                              {item.children!.map((child) => (
                                <Link
                                  key={child.url}
                                  href={child.url}
                                  className={`text-xs px-2.5 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                                    location === child.url
                                      ? "bg-primary/15 text-primary font-medium"
                                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                  }`}
                                  data-testid={`link-tooltip-${item.title.toLowerCase()}-${child.title.toLowerCase()}`}
                                >
                                  <child.icon className="w-3 h-3" />
                                  {child.title}
                                </Link>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        menuButton
                      )}
                      {hasChildren && isExpanded && open && (
                        <SidebarMenuSub>
                          {item.children!.map((child) => {
                            const isSubActive = location === child.url;
                            return (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  data-active={isSubActive}
                                  className={
                                    isSubActive
                                      ? "!bg-primary/15 text-primary font-medium text-xs"
                                      : "text-muted-foreground hover:text-primary/80 text-xs"
                                  }
                                >
                                  <Link href={child.url} data-testid={`link-nav-${item.title.toLowerCase()}-${child.title.toLowerCase()}`}>
                                    <child.icon className={`w-3 h-3 ${isSubActive ? "text-primary" : "opacity-50"}`} />
                                    <span className="text-xs">{child.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* AI Status mini-widget — hidden in icon-only collapsed mode */}
        <div className="px-3 pb-2 mt-auto group-data-[collapsible=icon]:hidden" data-testid="widget-ai-status">
          <div className="glass-panel rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold">AI Status</span>
              </div>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Active agents</span>
                <span className="text-[10px] font-medium" data-testid="text-ai-status-agents">4 online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Handling now</span>
                <span className="text-[10px] font-medium" data-testid="text-ai-status-handling">23 conversations</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Avg response</span>
                <span className="text-[10px] font-medium text-primary" data-testid="text-ai-status-response">1.2s</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/10 p-3 group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-3">
        <div className="flex flex-col items-center gap-2 group-data-[state=expanded]:flex-row group-data-[state=expanded]:gap-2.5">
          <button
            onClick={toggleSidebar}
            className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            data-testid="button-toggle-sidebar"
          >
            {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
