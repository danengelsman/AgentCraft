import { PricingCard } from "@/components/PricingCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionData {
  subscriptionTier: 'free' | 'pro';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export default function Subscription() {
  const { toast } = useToast();

  // Fetch user subscription status
  const { data: subscription, isLoading } = useQuery<SubscriptionData>({
    queryKey: ['/api/stripe/subscription'],
  });

  const handleUpgrade = async (priceId: string) => {
    try {
      const response = await apiRequest('POST', '/api/stripe/checkout', { priceId });
      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const currentPlan = subscription?.subscriptionTier || 'free';
  const usageStats = {
    messages: {
      used: currentPlan === 'pro' ? 5000 : 47,
      total: currentPlan === 'pro' ? 999999 : 100,
      percentage: currentPlan === 'pro' ? 100 : 47,
    },
    agents: {
      used: 1,
      total: currentPlan === 'pro' ? 10 : 1,
      percentage: currentPlan === 'pro' ? 10 : 100,
    },
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
                <CardDescription>You're on the {currentPlan === 'pro' ? 'Pro' : 'Free'} plan</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {currentPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Messages Used</span>
                <span className="text-sm text-muted-foreground">
                  {usageStats.messages.used} / {usageStats.messages.total === 999999 ? '∞' : usageStats.messages.total}
                </span>
              </div>
              <Progress value={Math.min(usageStats.messages.percentage, 100)} data-testid="progress-messages" />
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
          ctaText={currentPlan === "free" ? "Current Plan" : "Downgrade"}
          onSelect={() => {
            if (currentPlan !== "free") {
              toast({
                title: "Contact Support",
                description: "To downgrade, please contact our support team.",
              });
            }
          }}
          disabled={currentPlan === "free"}
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
          ctaText={currentPlan === "pro" ? "Current Plan" : "Upgrade to Pro"}
          onSelect={() => {
            if (currentPlan !== "pro") {
              handleUpgrade("price_1ABC"); // This will be replaced with actual Stripe price ID
            }
          }}
          disabled={currentPlan === "pro"}
        />
      </div>
    </div>
  );
}
