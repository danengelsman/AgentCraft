import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface TemplateCardProps {
  title: string;
  description: string;
  icon: string;
  tier: "free" | "pro";
  onStart?: () => void;
}

export function TemplateCard({ title, description, icon, tier, onStart }: TemplateCardProps) {
  return (
    <Card className="hover-elevate overflow-visible shadow-sm" data-testid={`card-template-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="gap-6 p-8">
        <div className="flex items-start justify-between gap-3">
          <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <img src={icon} alt={title} className="w-9 h-9 object-contain" />
          </div>
          <Badge variant={tier === "free" ? "secondary" : "default"} data-testid={`badge-tier-${tier}`}>
            {tier === "free" ? "Free" : "Pro"}
          </Badge>
        </div>
        <div>
          <CardTitle className="text-xl mb-3 font-semibold tracking-tight">{title}</CardTitle>
          <CardDescription className="leading-relaxed">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="p-8 pt-0">
        <Button 
          className="w-full" 
          size="lg"
          onClick={onStart}
          data-testid={`button-start-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          Start Building
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
