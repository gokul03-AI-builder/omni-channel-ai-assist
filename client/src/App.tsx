import { useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider, useTheme } from "@/lib/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Sun, Moon } from "lucide-react";
import NotFound from "@/pages/not-found";
import CallsPage from "@/pages/calls";
import ChatsPage from "@/pages/chats";
import FeedbackPage from "@/pages/feedback";
import LoginPage from "@/pages/login";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={CallsPage} />
      <Route path="/chats" component={ChatsPage} />
      <Route path="/feedback" component={FeedbackPage} />
      <Route path="/login">
        <Redirect to="/" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "14rem",
  "--sidebar-width-icon": "3rem",
};

function ProfileAvatar({ onLogout }: { onLogout: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const authRole = localStorage.getItem("wingman_auth");
  const isAdmin = authRole === "admin";
  const displayName = isAdmin ? "Gokul Nair" : "Alex Morgan";
  const displayRole = isAdmin ? "Admin" : "Support Agent";
  const initials = isAdmin ? "GN" : "AM";

  return (
    <div className="absolute top-4 right-4 z-20">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="shrink-0 focus:outline-none" data-testid="button-profile-dropdown">
            <Avatar className="h-9 w-9 cursor-pointer border border-primary/20 hover:border-primary/40 transition-colors">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass-panel border-border/30" data-testid="dropdown-profile-menu">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold" data-testid="text-agent-name">{displayName}</p>
            <p className="text-xs text-muted-foreground">{displayRole}</p>
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
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("wingman_auth")
  );

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem("wingman_auth");
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
      {!isAuthenticated ? (
        <>
          <Switch>
            <Route path="/login">
              <LoginPage onLogin={handleLogin} />
            </Route>
            <Route>
              <Redirect to="/login" />
            </Route>
          </Switch>
          <Toaster />
        </>
      ) : (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <SidebarProvider style={sidebarStyle as React.CSSProperties}>
              <div className="flex h-screen w-full relative">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-mint-100/40 dark:bg-primary/[0.07] blur-3xl" />
                  <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-mint-100/40 dark:bg-primary/[0.05] blur-3xl" />
                  <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-mint-100/30 dark:bg-primary/[0.04] blur-3xl" />
                </div>
                <AppSidebar />
                <main className="flex-1 h-full relative z-10">
                  <ProfileAvatar onLogout={handleLogout} />
                  <AuthenticatedRouter />
                </main>
              </div>
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      )}
    </ThemeProvider>
  );
}

export default App;
