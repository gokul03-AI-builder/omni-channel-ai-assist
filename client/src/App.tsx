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
            <div className="flex h-screen w-full">
              <AppSidebar />
              <main className="flex-1 h-full">
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
