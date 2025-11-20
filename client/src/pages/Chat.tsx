import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
}

export default function Chat() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const agentIdFromUrl = searchParams.get('agent');
  const { toast } = useToast();
  
  const [selectedAgent, setSelectedAgent] = useState(agentIdFromUrl || "");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Fetch all agents
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });

  // Fetch all conversations
  const { data: allConversations = [] } = useQuery<any[]>({
    queryKey: ['/api/conversations'],
  });

  // Filter conversations for selected agent
  const conversations = allConversations.filter(c => c.agentId === selectedAgent);

  // Load most recent conversation when agent is selected
  useEffect(() => {
    if (selectedAgent && conversations.length > 0 && !conversationId) {
      const latestConversation = conversations[0]; // Conversations are ordered by updatedAt desc
      setConversationId(latestConversation.id);
    }
  }, [selectedAgent, conversations, conversationId]);

  // Fetch messages for current conversation
  const { data: historyMessages = [] } = useQuery<Message[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });

  // Update messages when history is loaded
  useEffect(() => {
    if (historyMessages.length > 0) {
      setMessages(historyMessages);
    }
  }, [historyMessages]);

  // Update selectedAgent when URL changes
  useEffect(() => {
    if (agentIdFromUrl && agentIdFromUrl !== selectedAgent) {
      setSelectedAgent(agentIdFromUrl);
      setConversationId(null);
      setMessages([]);
      setInputValue("");
    }
  }, [agentIdFromUrl]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedAgent) throw new Error("No agent selected");

      const res = await apiRequest("POST", `/api/agents/${selectedAgent}/chat`, {
        message: content,
        conversationId: conversationId || undefined,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Update conversation ID if this is first message
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Add the assistant's response to messages
      setMessages(prev => [...prev, data.message]);

      // Invalidate conversations query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: () => {
      // Error handling is now done in handleSendMessage which removes the optimistic message
      // and we can show a toast or alert to the user
    },
  });

  const handleSendMessage = (content: string) => {
    if (!selectedAgent) return;

    const tempId = Date.now().toString();
    
    // Add user message immediately (optimistic update)
    const userMessage: Message = {
      id: tempId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Clear input
    setInputValue("");

    // Send to API
    sendMessageMutation.mutate(content, {
      onError: (error: Error) => {
        // Remove the optimistic user message on error
        setMessages(prev => prev.filter(m => m.id !== tempId));
        
        // Show error toast
        toast({
          title: "Failed to send message",
          description: error.message,
          variant: "destructive",
        });
        
        // Restore the input so user can retry
        setInputValue(content);
      },
    });
  };

  const handleAgentChange = (agentId: string) => {
    setSelectedAgent(agentId);
    setConversationId(null);
    setMessages([]);
    setInputValue("");
    setLocation(`/chat?agent=${agentId}`);
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
          <Select value={selectedAgent} onValueChange={handleAgentChange}>
            <SelectTrigger data-testid="select-agent">
              <SelectValue placeholder="Select an agent to chat with" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Test your agent in real-time
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && selectedAgent && (
            <div className="text-center text-muted-foreground mt-8">
              <p className="text-lg font-medium mb-2">Start a conversation</p>
              <p>Send a message to begin chatting with your agent</p>
            </div>
          )}
          {messages.length === 0 && !selectedAgent && (
            <div className="text-center text-muted-foreground mt-8">
              <p className="text-lg font-medium mb-2">Select an agent</p>
              <p>Choose an agent from the dropdown to start chatting</p>
            </div>
          )}
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              role={message.role === "assistant" ? "agent" : message.role}
              content={message.content}
              timestamp={new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
          ))}
          {sendMessageMutation.isPending && (
            <div className="text-muted-foreground text-sm mt-4">
              Agent is typing...
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatInput 
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage} 
        placeholder={selectedAgent ? "Type your message..." : "Select an agent first..."}
        disabled={!selectedAgent || sendMessageMutation.isPending}
      />
    </div>
  );
}
