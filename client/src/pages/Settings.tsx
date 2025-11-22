import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  // Fetch current user data
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/user'],
  });

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setBusinessName(user.businessName || "");
      setIndustry(user.industry || "");
      setEmailNotifications(Boolean(user.emailNotifications));
      setWeeklyReports(Boolean(user.weeklyReports));
    }
  }, [user]);

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string; businessName?: string; industry?: string }) => {
      return await apiRequest('PUT', '/api/user/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Notifications update mutation
  const notificationsMutation = useMutation({
    mutationFn: async (data: { emailNotifications: boolean; weeklyReports: boolean }) => {
      return await apiRequest('PUT', '/api/user/notifications', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update notifications",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    profileMutation.mutate({
      firstName,
      lastName,
      businessName,
      industry,
    });
  };

  const handleNotificationChange = (field: 'email' | 'weekly', value: boolean) => {
    if (field === 'email') {
      setEmailNotifications(value);
      notificationsMutation.mutate({
        emailNotifications: value,
        weeklyReports,
      });
    } else {
      setWeeklyReports(value);
      notificationsMutation.mutate({
        emailNotifications,
        weeklyReports: value,
      });
    }
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  data-testid="input-first-name" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  data-testid="input-last-name" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={user?.email || ""} 
                disabled 
                className="bg-muted"
                data-testid="input-email" 
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input 
                id="businessName" 
                placeholder="Acme Inc." 
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={isLoading}
                data-testid="input-business-name" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input 
                id="industry" 
                placeholder="Technology" 
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isLoading}
                data-testid="input-industry" 
              />
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={profileMutation.isPending || isLoading}
              data-testid="button-save-profile"
            >
              {profileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
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
                onCheckedChange={(value) => handleNotificationChange('email', value)}
                disabled={notificationsMutation.isPending || isLoading}
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
                onCheckedChange={(value) => handleNotificationChange('weekly', value)}
                disabled={notificationsMutation.isPending || isLoading}
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
