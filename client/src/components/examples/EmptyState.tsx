import { EmptyState } from '../EmptyState';
import emptyImage from '@assets/generated_images/Empty_state_no_agents_512ad97b.png';

export default function EmptyStateExample() {
  return (
    <div className="p-6">
      <EmptyState
        image={emptyImage}
        title="No agents yet"
        description="Get started by creating your first AI agent using one of our solution templates."
        actionLabel="Create Your First Agent"
        onAction={() => console.log('Create agent clicked')}
      />
    </div>
  );
}
