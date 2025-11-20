import { AgentCard } from "@/components/AgentCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Copy } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import faqIcon from "@assets/generated_images/FAQ_chatbot_template_icon_85fc1675.png";
import leadIcon from "@assets/generated_images/Lead_qualifier_template_icon_45379e5b.png";
import schedulerIcon from "@assets/generated_images/Scheduler_template_icon_dab45b38.png";
import emailIcon from "@assets/stock_images/email_automation_cus_8833c327.jpg";
import reviewIcon from "@assets/stock_images/customer_reviews_fee_bc6ce8ea.jpg";
import emptyImage from "@assets/generated_images/Empty_state_no_agents_512ad97b.png";

interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  template: string;
  icon?: string;
}

export default function Agents() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  // Fetch real agents from API
  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agent Deleted",
        description: "The agent has been removed from your collection.",
      });
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

  // Clone example agent (creates a new agent from template)
  const cloneMutation = useMutation({
    mutationFn: async (template: { name: string; description: string; templateId: string }) => {
      const res = await apiRequest("POST", "/api/agents", {
        name: template.name,
        description: template.description,
        template: template.templateId,
        status: "active",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agent Cloned Successfully",
        description: "The example agent has been added to your collection.",
      });
    },
  });

  const handleCloneAgent = (title: string, description: string, templateId: string) => {
    cloneMutation.mutate({ name: title, description, templateId });
  };

  // Map template IDs to icons
  const iconMap: Record<string, string> = {
    "website-faq": faqIcon,
    "lead-qualification": leadIcon,
    "appointment-scheduler": schedulerIcon,
    "email-responder": emailIcon,
    "social-media-manager": faqIcon,
    "customer-onboarding": faqIcon,
    "product-recommender": faqIcon,
    "sales-outreach": leadIcon,
    "meeting-summarizer": faqIcon,
    "review-responder": reviewIcon,
    "feedback-collector": faqIcon,
    "invoice-reminder": schedulerIcon,
  };

  // Example agents users can clone
  const exampleAgents = [
    {
      id: "example-1",
      title: "E-commerce Support Agent",
      description: "Handles order status, returns, and product questions for online stores.",
      icon: faqIcon,
      metrics: "94% resolution rate • 2.1s avg response",
      templateId: "website-faq",
    },
    {
      id: "example-2",
      title: "Real Estate Lead Bot",
      description: "Qualifies property inquiries, schedules showings, and syncs leads to CRM.",
      icon: leadIcon,
      metrics: "30% higher conversion • 15hrs saved/week",
      templateId: "lead-qualification",
    },
    {
      id: "example-3",
      title: "Healthcare Appointment Manager",
      description: "Schedules appointments, sends reminders, and handles rescheduling for medical practices.",
      icon: schedulerIcon,
      metrics: "40% fewer no-shows • HIPAA compliant",
      templateId: "appointment-scheduler",
    },
    {
      id: "example-4",
      title: "SaaS Onboarding Assistant",
      description: "Guides new users through product setup with personalized tutorials and answers technical questions.",
      icon: emailIcon,
      metrics: "25% faster onboarding • 90% satisfaction",
      templateId: "customer-onboarding",
    },
    {
      id: "example-5",
      title: "Restaurant Review Manager",
      description: "Monitors and responds to reviews on Google, Yelp, and social media with branded responses.",
      icon: reviewIcon,
      metrics: "5-star rating boost • 100% review coverage",
      templateId: "review-responder",
    },
  ];

  const hasAgents = agents && agents.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading agents...</div>
      </div>
    );
  }

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

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Your Agents</h2>
            <div className="space-y-4">
              {agents.map((agent) => (
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

          {/* Example Agents */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Example Agents</h2>
              <p className="text-muted-foreground">
                Clone these pre-built agents and customize them for your business
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {exampleAgents.map((example) => (
                <Card key={example.id} className="hover-elevate" data-testid={`example-agent-${example.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img src={example.icon} alt={example.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{example.title}</h3>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleCloneAgent(example.title, example.description, example.templateId)}
                            disabled={cloneMutation.isPending}
                            data-testid={`button-clone-${example.id}`}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            {cloneMutation.isPending ? "Cloning..." : "Clone"}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{example.description}</p>
                        <div className="text-xs text-primary font-medium">{example.metrics}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
