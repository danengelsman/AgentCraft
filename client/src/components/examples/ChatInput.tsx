import { ChatInput } from '../ChatInput';

export default function ChatInputExample() {
  return (
    <div className="h-[200px] flex items-end">
      <div className="w-full">
        <ChatInput
          onSend={(message) => console.log('Sent:', message)}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
}
