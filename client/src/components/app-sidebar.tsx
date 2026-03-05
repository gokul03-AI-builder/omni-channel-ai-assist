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
import verifoneLogo from "@assets/verifone_logo_1772712551074.png";

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
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 mint-glow-sm p-1.5">
            <img
              src={verifoneLogo}
              alt="Verifone"
              className="h-full w-full object-contain dark:invert"
              data-testid="img-logo"
            />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight" data-testid="text-app-title">Verifone Assist</h1>
            <p className="text-xs text-muted-foreground">Agent Console</p>
          </div>
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
          variant="destructive"
          className="w-full justify-start gap-2"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
