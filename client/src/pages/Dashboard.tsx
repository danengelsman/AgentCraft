import { StatCard } from "@/components/StatCard";
import { AgentCard } from "@/components/AgentCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bot, TrendingUp, Clock, Plus, Sparkles, Settings, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import faqIcon from "@assets/generated_images/FAQ_chatbot_template_icon_85fc1675.png";
import leadIcon from "@assets/generated_images/Lead_qualifier_template_icon_45379e5b.png";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // todo: remove mock functionality
  const stats = [
    { title: "Total Messages", value: "2,847", icon: MessageSquare, trend: { value: "+12% from last month", isPositive: true } },
    { title: "Active Agents", value: "3", icon: Bot },
    { title: "Success Rate", value: "94%", icon: TrendingUp, trend: { value: "+5% from last month", isPositive: true } },
    { title: "Avg Response Time", value: "1.2s", icon: Clock },
  ];

  // todo: remove mock functionality
  const agents = [
    {
      id: "1",
      name: "Customer Support Bot",
      description: "Handles common customer inquiries and routes complex issues to human agents",
      status: "active" as const,
      icon: faqIcon,
    },
    {
      id: "2",
      name: "Lead Qualifier",
      description: "Qualifies incoming leads from the website and syncs to HubSpot",
      status: "active" as const,
      icon: leadIcon,
    },
    {
      id: "3",
      name: "FAQ Assistant",
      description: "Answers frequently asked questions about products and services",
      status: "inactive" as const,
      icon: faqIcon,
    },
  ];

  // todo: remove mock functionality
  const conversationData = [
    { day: "Mon", conversations: 45 },
    { day: "Tue", conversations: 52 },
    { day: "Wed", conversations: 48 },
    { day: "Thu", conversations: 61 },
    { day: "Fri", conversations: 55 },
    { day: "Sat", conversations: 38 },
    { day: "Sun", conversations: 42 },
  ];

  // todo: remove mock functionality
  const responseTimeData = [
    { hour: "12am", time: 1.4 },
    { hour: "4am", time: 1.1 },
    { hour: "8am", time: 1.8 },
    { hour: "12pm", time: 2.1 },
    { hour: "4pm", time: 1.5 },
    { hour: "8pm", time: 1.2 },
  ];

  // todo: remove mock functionality
  const recentActivity = [
    {
      id: "1",
      agent: "Customer Support Bot",
      action: "Resolved customer inquiry",
      customer: "Sarah Johnson",
      time: "2 minutes ago",
      status: "success" as const,
    },
    {
      id: "2",
      agent: "Lead Qualifier",
      action: "Qualified new lead",
      customer: "Michael Chen",
      time: "15 minutes ago",
      status: "success" as const,
    },
    {
      id: "3",
      agent: "Customer Support Bot",
      action: "Escalated to human agent",
      customer: "Emily Rodriguez",
      time: "32 minutes ago",
      status: "warning" as const,
    },
    {
      id: "4",
      agent: "Lead Qualifier",
      action: "Lead added to HubSpot",
      customer: "David Park",
      time: "1 hour ago",
      status: "success" as const,
    },
    {
      id: "5",
      agent: "FAQ Assistant",
      action: "Answered product question",
      customer: "Lisa Martinez",
      time: "2 hours ago",
      status: "success" as const,
    },
  ];

  // todo: remove mock functionality
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
              {recentActivity.map((activity) => (
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
                      <span className="font-medium text-foreground">{activity.customer}</span> • {activity.time}
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
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            {...agent}
            onEdit={() => console.log('Edit agent:', agent.id)}
            onDelete={() => console.log('Delete agent:', agent.id)}
            onToggleActive={(active) => console.log('Toggle agent:', agent.id, active)}
          />
        ))}
      </div>
    </div>
  );
}
