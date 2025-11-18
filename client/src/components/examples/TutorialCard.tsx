import { TutorialCard } from '../TutorialCard';

export default function TutorialCardExample() {
  return (
    <div className="p-6 max-w-md">
      <TutorialCard
        title="Setting Up Your HubSpot Integration"
        description="Learn how to connect AgentCraft to your HubSpot CRM and sync contact data automatically."
        duration="10 min"
        difficulty="beginner"
        category="Integrations"
        onStart={() => console.log('Start tutorial')}
      />
    </div>
  );
}
