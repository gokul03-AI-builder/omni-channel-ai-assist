import { useState } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/lib/theme-provider";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CallsPage from "@/pages/calls";
import ChatsPage from "@/pages/chats";
import CallHistoryPage from "@/pages/call-history";
import ChatHistoryPage from "@/pages/chat-history";
import FeedbackPage from "@/pages/feedback";
import AnalyticsPage from "@/pages/analytics";
import ReportsPage from "@/pages/reports";
import PermissionsPage from "@/pages/permissions";
import AIStatusPage from "@/pages/ai-status";
import LoginPage from "@/pages/login";

function AuthenticatedRouter() {
  const authRole = localStorage.getItem("wingman_auth");
  const isAdmin = authRole === "admin";

  return (
    <Switch>
      <Route path="/">
        <HomePage />
      </Route>
      <Route path="/calls" component={CallsPage} />
      <Route path="/calls/history" component={CallHistoryPage} />
      <Route path="/chats" component={ChatsPage} />
      <Route path="/chats/history" component={ChatHistoryPage} />
      <Route path="/feedback" component={FeedbackPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/reports" component={ReportsPage} />
      {isAdmin && <Route path="/permissions" component={PermissionsPage} />}
      {isAdmin && <Route path="/ai-status" component={AIStatusPage} />}
      <Route path="/login">
        <Redirect to="/" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "15rem",
  "--sidebar-width-icon": "4rem",
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("wingman_auth")
  );

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem("wingman_auth");
    localStorage.removeItem("wingman_email");
    localStorage.removeItem("wingman_region");
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
                <AppSidebar onLogout={handleLogout} />
                <main className="flex-1 h-full">
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
