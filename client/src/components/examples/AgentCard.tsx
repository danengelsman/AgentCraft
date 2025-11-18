import { AgentCard } from '../AgentCard';
import faqIcon from '@assets/generated_images/FAQ_chatbot_template_icon_85fc1675.png';

export default function AgentCardExample() {
  return (
    <div className="p-6">
      <AgentCard
        id="agent-1"
        name="Customer Support Bot"
        description="Handles common customer inquiries and routes complex issues to human agents"
        status="active"
        icon={faqIcon}
        onEdit={() => console.log('Edit agent')}
        onDelete={() => console.log('Delete agent')}
        onToggleActive={(active) => console.log('Toggle active:', active)}
      />
    </div>
  );
}
