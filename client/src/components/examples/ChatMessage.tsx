import { ChatMessage } from '../ChatMessage';

export default function ChatMessageExample() {
  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <ChatMessage
        role="user"
        content="What are your business hours?"
        timestamp="2:30 PM"
      />
      <ChatMessage
        role="agent"
        content="We're open Monday through Friday from 9 AM to 6 PM EST. On weekends, we operate from 10 AM to 4 PM. Is there anything specific I can help you with?"
        timestamp="2:30 PM"
      />
    </div>
  );
}
