import { AgentCard } from "@/components/AgentCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import faqIcon from "@assets/generated_images/FAQ_chatbot_template_icon_85fc1675.png";
import leadIcon from "@assets/generated_images/Lead_qualifier_template_icon_45379e5b.png";
import schedulerIcon from "@assets/generated_images/Scheduler_template_icon_dab45b38.png";
import emptyImage from "@assets/generated_images/Empty_state_no_agents_512ad97b.png";

export default function Agents() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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
    {
      id: "4",
      name: "Appointment Scheduler",
      description: "Helps customers book appointments and manage calendars",
      status: "draft" as const,
      icon: schedulerIcon,
    },
  ];

  const hasAgents = agents.length > 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Agents</h1>
          <p className="text-muted-foreground">
            Manage all your AI agents in one place
          </p>
        </div>
        <Button onClick={() => setLocation('/templates')} data-testid="button-create-new-agent">
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {hasAgents ? (
        <>
          <div className="mb-6 flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-agents"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
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
        </>
      ) : (
        <EmptyState
          image={emptyImage}
          title="No agents yet"
          description="Get started by creating your first AI agent using one of our solution templates."
          actionLabel="Create Your First Agent"
          onAction={() => setLocation('/templates')}
        />
      )}
    </div>
  );
}
