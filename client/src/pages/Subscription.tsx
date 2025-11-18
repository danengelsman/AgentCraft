import { PricingCard } from "@/components/PricingCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

export default function Subscription() {
  // todo: remove mock functionality
  const currentPlan: "free" | "pro" = "free";
  const usageStats = {
    messages: { used: 47, total: 100, percentage: 47 },
    agents: { used: 1, total: 1, percentage: 100 },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your plan and billing
        </p>
      </div>

      <div className="mb-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>You're on the Free plan</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                Free Plan
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Messages Used</span>
                <span className="text-sm text-muted-foreground">
                  {usageStats.messages.used} / {usageStats.messages.total}
                </span>
              </div>
              <Progress value={usageStats.messages.percentage} data-testid="progress-messages" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Active Agents</span>
                <span className="text-sm text-muted-foreground">
                  {usageStats.agents.used} / {usageStats.agents.total}
                </span>
              </div>
              <Progress value={usageStats.agents.percentage} data-testid="progress-agents" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PricingCard
          name="Free"
          price="Free"
          description="Perfect for testing the waters"
          features={[
            "1 basic agent",
            "100 messages per month",
            "Basic templates",
            "Community support",
          ]}
          highlighted={currentPlan === "free"}
          ctaText="Current Plan"
          onSelect={() => console.log('Already on Free plan')}
        />

        <PricingCard
          name="Pro"
          price="$49"
          description="For growing businesses"
          features={[
            "Up to 10 active agents",
            "Unlimited messages",
            "HubSpot integration",
            "Advanced templates",
            "Priority support",
            "Custom branding",
          ]}
          highlighted={currentPlan === "pro"}
          ctaText="Upgrade to Pro"
          onSelect={() => console.log('Upgrade to Pro')}
        />
      </div>
    </div>
  );
}
