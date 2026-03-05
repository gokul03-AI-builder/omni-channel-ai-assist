import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/lib/theme-provider";
import NotFound from "@/pages/not-found";
import CallsPage from "@/pages/calls";
import ChatsPage from "@/pages/chats";
import FeedbackPage from "@/pages/feedback";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CallsPage} />
      <Route path="/chats" component={ChatsPage} />
      <Route path="/feedback" component={FeedbackPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "14rem",
  "--sidebar-width-icon": "3rem",
};

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full relative">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-mint-50 dark:bg-mint-50 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-mint-50 dark:bg-mint-50 blur-3xl" />
                <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-mint-50 dark:bg-mint-50 blur-3xl opacity-50" />
              </div>
              <AppSidebar />
              <main className="flex-1 h-full relative z-10">
                <Router />
              </main>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
