import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
  onSelect?: () => void;
  disabled?: boolean;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
  ctaText = "Get Started",
  onSelect,
  disabled = false,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "hover-elevate overflow-visible",
        highlighted && "border-primary border-2",
        disabled && "opacity-75"
      )}
      data-testid={`card-pricing-${name.toLowerCase()}`}
    >
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-5xl font-bold" data-testid={`text-price-${name.toLowerCase()}`}>{price}</span>
          {price !== "Free" && <span className="text-muted-foreground">/month</span>}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3" data-testid={`feature-${index}`}>
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={highlighted ? "default" : "outline"}
          onClick={onSelect}
          disabled={disabled}
          data-testid={`button-select-${name.toLowerCase()}`}
        >
          {ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}
