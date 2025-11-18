import { TemplateCard } from "@/components/TemplateCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import faqIcon from "@assets/generated_images/FAQ_chatbot_template_icon_85fc1675.png";
import leadIcon from "@assets/generated_images/Lead_qualifier_template_icon_45379e5b.png";
import schedulerIcon from "@assets/generated_images/Scheduler_template_icon_dab45b38.png";

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState("all");

  // todo: remove mock functionality
  const templates = [
    {
      title: "Website FAQ Chatbot",
      description: "Answer common customer questions instantly with an intelligent chatbot trained on your website content.",
      icon: faqIcon,
      tier: "free" as const,
    },
    {
      title: "Lead Qualification Agent",
      description: "Automatically qualify leads in HubSpot by asking the right questions and scoring prospects.",
      icon: leadIcon,
      tier: "pro" as const,
    },
    {
      title: "Appointment Scheduler",
      description: "Let customers book appointments directly through chat with calendar integration.",
      icon: schedulerIcon,
      tier: "pro" as const,
    },
    {
      title: "Product Recommendation Bot",
      description: "Help customers find the right products by understanding their needs and preferences.",
      icon: faqIcon,
      tier: "pro" as const,
    },
    {
      title: "Order Status Tracker",
      description: "Provide real-time order status updates and shipping information to customers.",
      icon: faqIcon,
      tier: "free" as const,
    },
    {
      title: "Feedback Collector",
      description: "Gather customer feedback and satisfaction scores through conversational surveys.",
      icon: faqIcon,
      tier: "free" as const,
    },
  ];

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
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.title}
            {...template}
            onStart={() => console.log('Start building:', template.title)}
          />
        ))}
      </div>
    </div>
  );
}
