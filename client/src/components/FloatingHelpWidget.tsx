import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FloatingHelpWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // TODO: Connect to chat system or help endpoint
    console.log("Help query submitted:", query);
    setQuery("");
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  // Handle Escape key to close widget
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isExpanded]);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover-elevate active-elevate-2 flex items-center justify-center group"
        aria-label="Open help widget"
        aria-expanded="false"
        data-testid="button-open-help-widget"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div 
      className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px]"
      role="dialog"
      aria-label="Help widget"
    >
      <Card className="border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Ask anything</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close help widget"
            aria-expanded="true"
            data-testid="button-close-help-widget"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Get help with AgentCraft, learn about features, or ask questions about creating your AI agents.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ask AgentCraft"
              className="flex-1 bg-background/50"
              data-testid="input-help-query"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!query.trim()}
              data-testid="button-submit-help-query"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
