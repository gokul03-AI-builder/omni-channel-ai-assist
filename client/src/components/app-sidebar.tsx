import { useLocation, Link } from "wouter";
import { Phone, MessageSquare, ThumbsUp, LogOut, Sun, Moon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
import verifoneLogo from "@assets/Screenshot_2026-03-05_at_5.50.17_PM_1772713220675.png";

const navItems = [
  { title: "Calls", url: "/", icon: Phone },
  { title: "Chats", url: "/chats", icon: MessageSquare },
  { title: "Feedback", url: "/feedback", icon: ThumbsUp },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="rounded-lg overflow-hidden bg-slate-900 flex-1">
              <img
                src={verifoneLogo}
                alt="Verifone"
                className="h-12 w-full object-cover"
                data-testid="img-logo"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="shrink-0 focus:outline-none" data-testid="button-profile-dropdown">
                  <Avatar className="h-9 w-9 cursor-pointer border border-primary/20 hover:border-primary/40 transition-colors">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      AM
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-panel border-border/30" data-testid="dropdown-profile-menu">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold" data-testid="text-agent-name">Alex Morgan</p>
                  <p className="text-xs text-muted-foreground">Support Agent</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer gap-2" data-testid="button-theme-toggle">
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2 text-red-400 focus:text-red-400" data-testid="button-logout">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
    </Sidebar>
  );
}
