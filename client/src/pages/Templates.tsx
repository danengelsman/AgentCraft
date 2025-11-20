import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { z } from "zod";
import faqIcon from "@assets/generated_images/FAQ_chatbot_template_icon_85fc1675.png";
import leadIcon from "@assets/generated_images/Lead_qualifier_template_icon_45379e5b.png";
import schedulerIcon from "@assets/generated_images/Scheduler_template_icon_dab45b38.png";

const createAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
});

type CreateAgentForm = z.infer<typeof createAgentSchema>;

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch templates from API
  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
  });

  const form = useForm<CreateAgentForm>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: CreateAgentForm) => {
      if (!selectedTemplate) throw new Error("No template selected");

      const res = await apiRequest("POST", "/api/agents", {
        name: data.name,
        description: data.description,
        template: selectedTemplate.id,
        status: "active",
      });
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agent Created!",
        description: "Your agent has been successfully created and is ready to use.",
      });
      setIsDialogOpen(false);
      form.reset();
      setLocation('/agents');
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "There was an error creating your agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartTemplate = (template: Template) => {
    setSelectedTemplate(template);
    form.setValue("name", template.name);
    form.setValue("description", template.description);
    setIsDialogOpen(true);
  };

  const onSubmit = (data: CreateAgentForm) => {
    createAgentMutation.mutate(data);
  };

  // Map template IDs to icons
  const iconMap: Record<string, string> = {
    "website-faq": faqIcon,
    "lead-qualification": leadIcon,
    "appointment-scheduler": schedulerIcon,
    "email-responder": faqIcon,
    "social-media-manager": faqIcon,
    "customer-onboarding": faqIcon,
    "product-recommender": faqIcon,
    "sales-outreach": leadIcon,
    "meeting-summarizer": faqIcon,
    "review-responder": faqIcon,
    "feedback-collector": faqIcon,
    "invoice-reminder": schedulerIcon,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Solution Templates</h1>
        <p className="text-muted-foreground">
          Pre-built automation templates designed for common small business needs. Just customize and deploy.
        </p>
      </div>

      <div className="mb-8 flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-templates"
          />
        </div>
        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-tier">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="support">Customer Support</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            title={template.name}
            description={template.description}
            icon={iconMap[template.id] || faqIcon}
            tier="free"
            onStart={() => handleStartTemplate(template)}
          />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-create-agent">
          <DialogHeader>
            <DialogTitle>Create Agent from Template</DialogTitle>
            <DialogDescription>
              Customize your agent based on the {selectedTemplate?.name} template.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Customer Support Bot" {...field} data-testid="input-agent-name" />
                    </FormControl>
                    <FormDescription>
                      Give your agent a memorable name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Helps customers with common questions about our products and services..."
                        className="min-h-[100px]"
                        {...field}
                        data-testid="textarea-agent-description"
                      />
                    </FormControl>
                    <FormDescription>
                      Describe what this agent will do for your business
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAgentMutation.isPending}
                  data-testid="button-create-agent"
                >
                  {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
