import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingTour({ steps, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" data-testid="onboarding-tour">
      <Card className="max-w-sm w-full">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleSkip}
            data-testid="button-skip-tour"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
                data-testid={`tour-indicator-${index}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleSkip} data-testid="button-skip">
              Skip
            </Button>
            <Button size="sm" onClick={handleNext} data-testid="button-next">
              {currentStep < steps.length - 1 ? "Next" : "Finish"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
