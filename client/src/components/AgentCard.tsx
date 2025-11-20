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
    <Card className="hover-elevate overflow-visible shadow-sm" data-testid={`card-agent-${id}`}>
      <CardHeader className="p-6">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <img src={icon} alt={name} className="w-9 h-9 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <CardTitle className="text-xl font-semibold tracking-tight">{name}</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} data-testid={`status-indicator-${status}`} />
                <Badge variant="secondary" className="text-xs" data-testid={`badge-status-${status}`}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
            <CardDescription className="line-clamp-2 leading-relaxed">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={onEdit}
            data-testid={`button-edit-${id}`}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
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
