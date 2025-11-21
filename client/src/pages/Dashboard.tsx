import { StatCard } from "@/components/StatCard";
import { AgentCard } from "@/components/AgentCard";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bot, TrendingUp, Clock, Plus, Sparkles, Settings, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import faqIcon from "@assets/generated_images/FAQ_chatbot_template_icon_85fc1675.png";
import leadIcon from "@assets/generated_images/Lead_qualifier_template_icon_45379e5b.png";
import type { OnboardingProgress } from "@shared/schema";

interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  template: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);

  // Fetch onboarding progress
  const { data: onboardingProgress } = useQuery<OnboardingProgress | null>({
    queryKey: ['/api/onboarding/progress'],
  });

  // Determine if wizard should show: new users (null) or incomplete onboarding, and not manually dismissed
  const shouldShowOnboarding = !dismissedOnboarding && onboardingProgress !== undefined && (!onboardingProgress || !onboardingProgress.completedAt);

  // Fetch real agents
  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    enabled: !!onboardingProgress?.completedAt || !shouldShowOnboarding,
  });

  // Fetch dashboard analytics
  const { data: analytics } = useQuery<{
    conversationData: Array<{ day: string; conversations: number }>;
    responseTimeData: Array<{ hour: string; time: number }>;
    recentActivity: Array<{ id: string; agent: string; action: string; customer: string; time: string; status: string }>;
    totalConversations: number;
    avgResponseTime: number;
  }>({
    queryKey: ['/api/dashboard/analytics'],
    enabled: !!onboardingProgress?.completedAt || !shouldShowOnboarding,
  });

  // Helper function to format ISO timestamps as relative time
  const formatTimeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await apiRequest("PATCH", `/api/agents/${id}`, {
        status: active ? "active" : "inactive",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    },
  });

  // Map template IDs to icons
  const iconMap: Record<string, string> = {
    "website-faq": faqIcon,
    "lead-qualification": leadIcon,
    "appointment-scheduler": faqIcon,
    "email-responder": faqIcon,
    "social-media-manager": faqIcon,
    "customer-onboarding": faqIcon,
    "product-recommender": faqIcon,
    "sales-outreach": leadIcon,
    "meeting-summarizer": faqIcon,
    "review-responder": faqIcon,
    "feedback-collector": faqIcon,
    "invoice-reminder": faqIcon,
  };

  // Calculate stats from real agent data
  const activeAgents = agents.filter(a => a.status === "active").length;
  const totalAgents = agents.length;
  const totalConversations = analytics?.totalConversations || 0;
  const avgResponseTime = analytics?.avgResponseTime || 0;
  
  // Format response time for display
  const responseTimeDisplay = avgResponseTime > 0 
    ? avgResponseTime < 1 
      ? `${(avgResponseTime * 1000).toFixed(0)}ms`
      : `${avgResponseTime.toFixed(1)}s`
    : "N/A";

  const stats = [
    { title: "Total Agents", value: totalAgents.toString(), icon: Bot },
    { title: "Active Agents", value: activeAgents.toString(), icon: MessageSquare },
    { title: "Conversations", value: totalConversations.toString(), icon: TrendingUp },
    { title: "Response Time", value: responseTimeDisplay, icon: Clock },
  ];

  // Use real analytics data or fallback to empty state
  const conversationData = analytics?.conversationData || [
    { day: "Mon", conversations: 0 },
    { day: "Tue", conversations: 0 },
    { day: "Wed", conversations: 0 },
    { day: "Thu", conversations: 0 },
    { day: "Fri", conversations: 0 },
    { day: "Sat", conversations: 0 },
    { day: "Sun", conversations: 0 },
  ];

  const responseTimeData = analytics?.responseTimeData || [
    { hour: "12am", time: 0 },
    { hour: "4am", time: 0 },
    { hour: "8am", time: 0 },
    { hour: "12pm", time: 0 },
    { hour: "4pm", time: 0 },
    { hour: "8pm", time: 0 },
  ];

  const recentActivity = analytics?.recentActivity || [];

  const quickActions = [
    {
      title: "Create New Agent",
      description: "Build a custom automation agent",
      icon: Plus,
      action: () => setLocation('/templates'),
    },
    {
      title: "Browse Templates",
      description: "Explore pre-built solutions",
      icon: Sparkles,
      action: () => setLocation('/templates'),
    },
    {
      title: "Connect HubSpot",
      description: "Sync with your CRM",
      icon: ExternalLink,
      action: () => setLocation('/settings'),
    },
    {
      title: "Agent Settings",
      description: "Configure your agents",
      icon: Settings,
      action: () => setLocation('/settings'),
    },
  ];

  return (
    <div>
      {/* Onboarding Wizard for new users */}
      <OnboardingWizard 
        open={shouldShowOnboarding}
        initialProgress={onboardingProgress}
        onComplete={() => {
          setDismissedOnboarding(false);
          queryClient.invalidateQueries({ queryKey: ['/api/onboarding/progress'] });
          queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
        }}
        onClose={() => setDismissedOnboarding(true)}
      />

      <div className="mb-12 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-5xl font-semibold mb-3 tracking-tight">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome back! Here's an overview of your agent performance.
          </p>
        </div>
        <Button size="lg" onClick={() => setLocation('/templates')} data-testid="button-create-agent">
          <Plus className="mr-2 h-5 w-5" />
          Create Agent
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover-elevate cursor-pointer" onClick={action.action} data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Conversations This Week</CardTitle>
            <CardDescription>Daily conversation volume across all agents</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={conversationData}>
                <defs>
                  <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="conversations" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorConversations)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Trends</CardTitle>
            <CardDescription>Average response time throughout the day (seconds)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="time" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Your Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest interactions across your agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent activity yet. Start chatting with your agents to see activity here!</p>
                </div>
              )}
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30" data-testid={`activity-${activity.id}`}>
                  <div className="flex-shrink-0">
                    {activity.status === 'success' ? (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.agent}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{activity.customer}</span> • {formatTimeAgo(activity.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>Track your plan limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Messages</span>
                <span className="text-sm text-muted-foreground">2,847 / ∞</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Active Agents</span>
                <span className="text-sm text-muted-foreground">3 / 10</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Integrations</span>
                <span className="text-sm text-muted-foreground">1 / 5</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={() => setLocation('/pricing')} data-testid="button-view-plans">
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Your Agents */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-semibold tracking-tight">Your Agents</h2>
        <Button variant="outline" onClick={() => setLocation('/agents')} data-testid="button-view-all">
          View All
        </Button>
      </div>

      <div className="space-y-6">
        {isLoading && (
          <div className="text-muted-foreground">Loading agents...</div>
        )}
        {!isLoading && agents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No agents yet. Create your first agent to get started!</p>
            <Button className="mt-4" onClick={() => setLocation('/templates')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </div>
        )}
        {!isLoading && agents.slice(0, 3).map((agent) => (
          <AgentCard
            key={agent.id}
            id={agent.id}
            name={agent.name}
            description={agent.description}
            status={agent.status as "active" | "inactive" | "draft"}
            icon={iconMap[agent.template] || faqIcon}
            onEdit={() => setLocation(`/chat?agent=${agent.id}`)}
            onDelete={() => deleteMutation.mutate(agent.id)}
            onToggleActive={(active) => toggleStatusMutation.mutate({ id: agent.id, active })}
          />
        ))}
      </div>
    </div>
  );
}
