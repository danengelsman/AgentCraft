import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Building2, Target, MessageSquare, Calendar, Mail, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { OnboardingProgress, User } from "@shared/schema";

interface OnboardingWizardProps {
  open: boolean;
  initialProgress?: OnboardingProgress | null;
  onComplete: () => void;
  onClose?: () => void;
}

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: typeof MessageSquare;
  templateId: string;
}

const goalOptions: GoalOption[] = [
  {
    id: "customer-support",
    title: "Customer Support",
    description: "Answer customer questions instantly 24/7",
    icon: MessageSquare,
    templateId: "website-faq",
  },
  {
    id: "lead-generation",
    title: "Lead Generation",
    description: "Qualify and capture high-quality leads",
    icon: Users,
    templateId: "lead-qualification",
  },
  {
    id: "scheduling",
    title: "Appointment Scheduling",
    description: "Let customers book appointments automatically",
    icon: Calendar,
    templateId: "appointment-scheduler",
  },
  {
    id: "email-automation",
    title: "Email Automation",
    description: "Respond to emails with personalized replies",
    icon: Mail,
    templateId: "email-responder",
  },
];

const industries = [
  "Healthcare",
  "Real Estate",
  "Retail",
  "Professional Services",
  "Technology",
  "Education",
  "Hospitality",
  "Finance",
  "Other",
];

export function OnboardingWizard({ open, initialProgress, onComplete, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Hydrate from saved progress
  useEffect(() => {
    if (!initialProgress || !open) return;
    
    // Restore step
    if (initialProgress.currentStep) {
      setStep(initialProgress.currentStep);
    }
    
    // Restore wizard data (selected goal)
    if (initialProgress.wizardData && typeof initialProgress.wizardData === 'object') {
      const data = initialProgress.wizardData as any;
      if (data.selectedGoal) {
        const goal = goalOptions.find(g => g.id === data.selectedGoal);
        if (goal) setSelectedGoal(goal);
      }
      if (data.businessName) setBusinessName(data.businessName);
      if (data.industry) setIndustry(data.industry);
    }
  }, [initialProgress, open]);

  // Mutation to save progress between steps
  const saveProgressMutation = useMutation({
    mutationFn: async (data: {
      currentStep: number;
      wizardData: any;
      businessName?: string;
      industry?: string;
      goal?: string;
    }) => {
      const response = await apiRequest("PUT", "/api/onboarding/progress", data);
      return await response.json();
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (data: {
      templateId: string;
      businessName: string;
      industry: string;
      goal: string;
    }) => {
      const response = await apiRequest("POST", "/api/onboarding/complete", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/progress"] });
      
      // Reset wizard state
      setStep(1);
      setSelectedGoal(null);
      setBusinessName("");
      setIndustry("");
      
      toast({
        title: "Welcome to AgentCraft!",
        description: "Your first AI agent is ready. Let's test it out!",
      });
      onComplete();
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
      // Ensure queries refetch even on error
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
    },
  });

  const handleComplete = () => {
    if (!selectedGoal || !businessName || !industry) return;

    completeMutation.mutate({
      templateId: selectedGoal.templateId,
      businessName,
      industry,
      goal: selectedGoal.title,
    });
  };

  const handleNextStep = () => {
    if (step === 1 && selectedGoal) {
      // Save progress when moving from step 1 to step 2
      saveProgressMutation.mutate({
        currentStep: 2,
        wizardData: { selectedGoal: selectedGoal.id, templateId: selectedGoal.templateId },
      });
      setStep(2);
    } else if (step === 2 && businessName && industry) {
      // Save progress when moving from step 2 to step 3
      saveProgressMutation.mutate({
        currentStep: 3,
        wizardData: { 
          selectedGoal: selectedGoal?.id,
          templateId: selectedGoal?.templateId,
          businessName, 
          industry 
        },
        businessName,
        industry,
        goal: selectedGoal?.title,
      });
      setStep(3);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const progress = (step / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden" data-testid="dialog-onboarding-wizard">
        {/* Header with Progress */}
        <div className="px-8 pt-8 pb-6 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Quick Start</h2>
                <p className="text-sm text-muted-foreground">Create your first AI agent in under 60 seconds</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              Step {step} of 3
            </div>
          </div>
          <Progress value={progress} className="h-1" data-testid="progress-onboarding" />
        </div>

        {/* Step Content */}
        <div className="px-8 py-8 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">What would you like your AI agent to do?</h3>
                <p className="text-muted-foreground">Choose your primary goal. You can create more agents later.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {goalOptions.map((goal) => {
                  const Icon = goal.icon;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal)}
                      className={`p-6 rounded-lg border-2 text-left transition-all hover-elevate active-elevate-2 ${
                        selectedGoal?.id === goal.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      }`}
                      data-testid={`button-goal-${goal.id}`}
                    >
                      <Icon className={`w-8 h-8 mb-3 ${selectedGoal?.id === goal.id ? "text-primary" : "text-muted-foreground"}`} />
                      <h4 className="font-medium mb-1">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-xl font-semibold mb-2">Tell us about your business</h3>
                <p className="text-muted-foreground">This helps us personalize your AI agent's responses.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Business Name
                  </Label>
                  <Input
                    id="business-name"
                    placeholder="e.g., Acme Consulting"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-11"
                    data-testid="input-business-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">
                    <Target className="w-4 h-4 inline mr-2" />
                    Industry
                  </Label>
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    data-testid="select-industry"
                  >
                    <option value="">Select your industry...</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && selectedGoal && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to create your agent!</h3>
                <p className="text-muted-foreground">We'll set everything up for you in just a moment.</p>
              </div>

              <div className="p-6 rounded-lg bg-card border border-border space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 shrink-0">
                    {(() => {
                      const Icon = selectedGoal.icon;
                      return <Icon className="w-6 h-6 text-primary" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Your {selectedGoal.title} Agent</h4>
                    <p className="text-sm text-muted-foreground mb-3">{selectedGoal.description}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Business:</span>
                        <span className="font-medium">{businessName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="font-medium">{industry}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="px-8 py-6 border-t border-border/50 flex items-center justify-between bg-card/50">
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            data-testid="button-back"
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <Button
                onClick={handleNextStep}
                disabled={
                  (step === 1 && !selectedGoal) ||
                  (step === 2 && (!businessName || !industry)) ||
                  saveProgressMutation.isPending
                }
                data-testid="button-next"
              >
                {saveProgressMutation.isPending ? "Saving..." : "Continue"}
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={completeMutation.isPending}
                data-testid="button-create-agent"
              >
                {completeMutation.isPending ? "Creating..." : "Create My Agent"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
