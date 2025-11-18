import { TemplateCard } from '../TemplateCard';
import faqIcon from '@assets/generated_images/FAQ_chatbot_template_icon_85fc1675.png';

export default function TemplateCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <TemplateCard
        title="Website FAQ Chatbot"
        description="Answer common customer questions instantly with an intelligent chatbot trained on your website content."
        icon={faqIcon}
        tier="free"
        onStart={() => console.log('Start building FAQ chatbot')}
      />
    </div>
  );
}
