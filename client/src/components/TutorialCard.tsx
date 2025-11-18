import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";

interface TutorialCardProps {
  title: string;
  description: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  onStart?: () => void;
}

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-700 dark:text-green-400",
  intermediate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  advanced: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function TutorialCard({
  title,
  description,
  duration,
  difficulty,
  category,
  onStart,
}: TutorialCardProps) {
  return (
    <Card className="hover-elevate overflow-visible" data-testid={`card-tutorial-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          <Badge className={difficultyColors[difficulty]} data-testid={`badge-difficulty-${difficulty}`}>
            {difficulty}
          </Badge>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span data-testid="text-duration">{duration}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onStart} data-testid="button-start-tutorial">
          Start
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
