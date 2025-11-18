import { OnboardingTour } from '../OnboardingTour';

const tourSteps = [
  {
    title: "Welcome to AgentCraft!",
    description: "Let's take a quick tour to help you get started with creating your first AI agent.",
  },
  {
    title: "Choose a Template",
    description: "Start by selecting a solution template that matches your business needs. We have templates for FAQ chatbots, lead qualification, and more.",
  },
  {
    title: "Customize Your Agent",
    description: "Use our guided builder to configure your agent's behavior, responses, and integrations without any coding.",
  },
  {
    title: "Test and Deploy",
    description: "Chat with your agent to test it, then activate it to start automating your business workflows.",
  },
];

export default function OnboardingTourExample() {
  return (
    <OnboardingTour
      steps={tourSteps}
      onComplete={() => console.log('Tour completed')}
      onSkip={() => console.log('Tour skipped')}
    />
  );
}
