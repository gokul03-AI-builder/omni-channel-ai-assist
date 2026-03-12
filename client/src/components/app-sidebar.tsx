import { useLocation, Link } from "wouter";
import { Phone, MessageSquare, ThumbsUp, LogOut, Sun, Moon } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
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
      <SidebarFooter className="p-3 space-y-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleTheme}
          className="w-full justify-start gap-2 text-muted-foreground"
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
