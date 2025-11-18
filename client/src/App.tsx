import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Agents from "@/pages/Agents";
import Templates from "@/pages/Templates";
import Chat from "@/pages/Chat";
import Tutorials from "@/pages/Tutorials";
import Subscription from "@/pages/Subscription";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b gap-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard">
        {() => (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/agents">
        {() => (
          <DashboardLayout>
            <Agents />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/templates">
        {() => (
          <DashboardLayout>
            <Templates />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/chat">
        {() => (
          <DashboardLayout>
            <Chat />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/tutorials">
        {() => (
          <DashboardLayout>
            <Tutorials />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/subscription">
        {() => (
          <DashboardLayout>
            <Subscription />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
