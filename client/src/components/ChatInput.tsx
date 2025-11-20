import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ 
  value = "", 
  onChange, 
  onSend, 
  placeholder = "Type your message...", 
  disabled = false 
}: ChatInputProps) {
  const handleSend = () => {
    if (value.trim()) {
      onSend?.(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-2 items-end max-w-4xl mx-auto">
        <Textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="resize-none min-h-[60px] max-h-[200px]"
          disabled={disabled}
          data-testid="input-chat-message"
        />
        <Button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          size="icon"
          className="h-[60px] w-[60px] flex-shrink-0"
          data-testid="button-send-message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
