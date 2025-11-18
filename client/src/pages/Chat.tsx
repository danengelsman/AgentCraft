import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const [selectedAgent, setSelectedAgent] = useState("1");

  // todo: remove mock functionality
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "agent",
      content: "Hello! I'm your Customer Support Bot. How can I help you today?",
      timestamp: "2:30 PM",
    },
    {
      id: "2",
      role: "user",
      content: "What are your business hours?",
      timestamp: "2:31 PM",
    },
    {
      id: "3",
      role: "agent",
      content: "We're open Monday through Friday from 9 AM to 6 PM EST. On weekends, we operate from 10 AM to 4 PM. Is there anything specific I can help you with?",
      timestamp: "2:31 PM",
    },
    {
      id: "4",
      role: "user",
      content: "Do you offer international shipping?",
      timestamp: "2:32 PM",
    },
    {
      id: "5",
      role: "agent",
      content: "Yes, we do offer international shipping to over 50 countries! Shipping times and costs vary by destination. Would you like me to check the shipping options for your specific location?",
      timestamp: "2:32 PM",
    },
  ]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    
    // todo: remove mock functionality - Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "Thank you for your message. I'm processing your request and will respond shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, agentResponse]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b p-4 flex items-center gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/agents')}
          data-testid="button-back-to-agents"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-[200px]">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger data-testid="select-agent">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Customer Support Bot</SelectItem>
              <SelectItem value="2">Lead Qualifier</SelectItem>
              <SelectItem value="3">FAQ Assistant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Test your agent in real-time
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))}
        </div>
      </ScrollArea>

      <ChatInput onSend={handleSendMessage} placeholder="Type your test message..." />
    </div>
  );
}
