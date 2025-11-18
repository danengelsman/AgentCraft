import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Power } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export type AgentStatus = "active" | "inactive" | "draft";

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  icon: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: (active: boolean) => void;
}

const statusConfig = {
  active: { label: "Active", color: "bg-green-500" },
  inactive: { label: "Inactive", color: "bg-gray-400" },
  draft: { label: "Draft", color: "bg-yellow-500" },
};

export function AgentCard({ id, name, description, status, icon, onEdit, onDelete, onToggleActive }: AgentCardProps) {
  const statusInfo = statusConfig[status];
  
  return (
    <Card className="hover-elevate overflow-visible" data-testid={`card-agent-${id}`}>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <img src={icon} alt={name} className="w-8 h-8 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CardTitle className="text-lg">{name}</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} data-testid={`status-indicator-${status}`} />
                <Badge variant="secondary" className="text-xs" data-testid={`badge-status-${status}`}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            data-testid={`button-edit-${id}`}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            data-testid={`button-delete-${id}`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <Power className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={status === "active"}
              onCheckedChange={onToggleActive}
              data-testid={`switch-active-${id}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
