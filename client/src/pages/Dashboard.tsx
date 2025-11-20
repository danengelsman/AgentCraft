import { StatCard } from "@/components/StatCard";
import { AgentCard } from "@/components/AgentCard";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, TrendingUp, Clock, Plus } from "lucide-react";
import { useLocation } from "wouter";
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

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
