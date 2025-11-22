import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: "Settings Saved",
      description: "Your profile information has been updated successfully.",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and business details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" defaultValue="John Doe" data-testid="input-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" defaultValue="john@example.com" data-testid="input-email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" placeholder="Acme Inc." defaultValue="Acme Inc." data-testid="input-company" />
            </div>
            <Button onClick={handleSaveProfile} data-testid="button-save-profile">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for agent activity
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                data-testid="switch-email-notifications"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Get a weekly summary of agent performance
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={weeklyReports}
                onCheckedChange={setWeeklyReports}
                data-testid="switch-weekly-reports"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Connect AgentCraft with your favorite tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="hubspot-key">HubSpot CRM</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Sync leads and contacts with your HubSpot account
              </p>
              <div className="flex gap-2">
                <Input
                  id="hubspot-key"
                  type="password"
                  placeholder="Enter your HubSpot API key"
                  className="font-mono"
                  data-testid="input-hubspot-key"
                />
                <Button variant="outline" data-testid="button-save-hubspot-key">Save</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="calendly-key">Calendly</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Enable appointment scheduling with Calendly integration
              </p>
              <div className="flex gap-2">
                <Input
                  id="calendly-key"
                  type="password"
                  placeholder="Enter your Calendly API key"
                  className="font-mono"
                  data-testid="input-calendly-key"
                />
                <Button variant="outline" data-testid="button-save-calendly-key">Save</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="slack-webhook">Slack</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Send agent notifications to your Slack workspace
              </p>
              <div className="flex gap-2">
                <Input
                  id="slack-webhook"
                  type="password"
                  placeholder="Enter your Slack webhook URL"
                  className="font-mono"
                  data-testid="input-slack-webhook"
                />
                <Button variant="outline" data-testid="button-save-slack-webhook">Save</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="gmail-oauth">Gmail</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Connect Gmail for email automation agents
              </p>
              <Button variant="outline" className="w-full" data-testid="button-connect-gmail">
                Connect Gmail Account
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="stripe-key">Stripe</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Process payments and send invoice reminders
              </p>
              <div className="flex gap-2">
                <Input
                  id="stripe-key"
                  type="password"
                  placeholder="Enter your Stripe API key"
                  className="font-mono"
                  data-testid="input-stripe-key"
                />
                <Button variant="outline" data-testid="button-save-stripe-key">Save</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="zapier-webhook">Zapier</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Trigger Zapier workflows from your agents
              </p>
              <div className="flex gap-2">
                <Input
                  id="zapier-webhook"
                  type="password"
                  placeholder="Enter your Zapier webhook URL"
                  className="font-mono"
                  data-testid="input-zapier-webhook"
                />
                <Button variant="outline" data-testid="button-save-zapier-webhook">Save</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" data-testid="button-delete-account">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
