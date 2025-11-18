import { PricingCard } from '../PricingCard';

export default function PricingCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <PricingCard
        name="Pro"
        price="$49"
        description="Perfect for growing businesses"
        features={[
          "Up to 10 active agents",
          "Unlimited messages",
          "HubSpot integration",
          "Advanced templates",
          "Priority support",
          "Custom branding"
        ]}
        highlighted={true}
        onSelect={() => console.log('Selected Pro plan')}
      />
    </div>
  );
}
