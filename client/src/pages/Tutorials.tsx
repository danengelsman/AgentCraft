import { TutorialCard } from "@/components/TutorialCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Tutorials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const { toast } = useToast();

  // todo: remove mock functionality
  const tutorials = [
    {
      title: "Setting Up Your HubSpot Integration",
      description: "Learn how to connect AgentCraft to your HubSpot CRM and sync contact data automatically.",
      duration: "10 min",
      difficulty: "beginner" as const,
      category: "Integrations",
    },
    {
      title: "Creating Your First FAQ Chatbot",
      description: "Step-by-step guide to building a website FAQ chatbot from the template.",
      duration: "15 min",
      difficulty: "beginner" as const,
      category: "Getting Started",
    },
    {
      title: "Advanced Lead Qualification Rules",
      description: "Configure custom qualification criteria and scoring for your lead agent.",
      duration: "20 min",
      difficulty: "intermediate" as const,
      category: "Lead Management",
    },
    {
      title: "Customizing Agent Responses",
      description: "Fine-tune your agent's personality and response style to match your brand.",
      duration: "12 min",
      difficulty: "beginner" as const,
      category: "Customization",
    },
    {
      title: "Appointment Scheduler Setup",
      description: "Configure calendar integration and booking rules for your scheduling agent.",
      duration: "18 min",
      difficulty: "intermediate" as const,
      category: "Scheduling",
    },
    {
      title: "Monitoring Agent Performance",
      description: "Learn how to track metrics and optimize your agent's effectiveness.",
      duration: "15 min",
      difficulty: "beginner" as const,
      category: "Analytics",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tutorials</h1>
        <p className="text-muted-foreground">
          Learn how to get the most out of AgentCraft with our step-by-step guides
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All Tutorials</TabsTrigger>
          <TabsTrigger value="getting-started" data-testid="tab-getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
        </TabsList>

        <div className="mt-6 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-tutorials"
            />
          </div>
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-difficulty">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <TutorialCard
                key={tutorial.title}
                {...tutorial}
                onStart={() => {
                  toast({
                    title: "Tutorial Starting",
                    description: `Loading "${tutorial.title}"...`,
                  });
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
