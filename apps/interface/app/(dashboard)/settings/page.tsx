"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Palette,
  Shield,
  Building2,
  CreditCard,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { useProjectStore } from "@/stores/project-store";

type SettingsSection = "profile" | "notifications" | "appearance" | "security" | "organization" | "billing";

const settingsSections = [
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
  { id: "appearance" as const, label: "Appearance", icon: Palette },
  { id: "security" as const, label: "Security", icon: Shield },
  { id: "organization" as const, label: "Organization", icon: Building2 },
  { id: "billing" as const, label: "Billing", icon: CreditCard },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { currentOrganization } = useProjectStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">
                Manage your personal information
              </p>
            </div>
            <Separator />
            
            <div className="flex items-center gap-6">
              <Avatar
                src={user?.avatar}
                alt={user?.name || ""}
                fallback={user?.name || "U"}
                size="xl"
              />
              <Button variant="outline">Change avatar</Button>
            </div>

            <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" defaultValue={user?.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">
                  Contact support to change your email
                </p>
              </div>
            </div>

            <Button>Save changes</Button>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Configure how you receive notifications
              </p>
            </div>
            <Separator />

            <div className="space-y-4">
              <NotificationSetting
                title="Task assignments"
                description="Get notified when you're assigned to a task"
                defaultChecked
              />
              <NotificationSetting
                title="Comments"
                description="Get notified when someone comments on your tasks"
                defaultChecked
              />
              <NotificationSetting
                title="Mentions"
                description="Get notified when someone mentions you"
                defaultChecked
              />
              <NotificationSetting
                title="Due date reminders"
                description="Get reminded about upcoming due dates"
                defaultChecked
              />
              <NotificationSetting
                title="Weekly digest"
                description="Receive a weekly summary of your projects"
              />
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Customize how Collab PM looks
              </p>
            </div>
            <Separator />

            <div className="space-y-4">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-4 max-w-md">
                <ThemeOption
                  icon={Sun}
                  label="Light"
                  active={theme === "light"}
                  onClick={() => setTheme("light")}
                />
                <ThemeOption
                  icon={Moon}
                  label="Dark"
                  active={theme === "dark"}
                  onClick={() => setTheme("dark")}
                />
                <ThemeOption
                  icon={Monitor}
                  label="System"
                  active={theme === "system"}
                  onClick={() => setTheme("system")}
                />
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Security</h2>
              <p className="text-sm text-muted-foreground">
                Manage your account security
              </p>
            </div>
            <Separator />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New password</Label>
                  <Input id="new" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <Input id="confirm" type="password" />
                </div>
                <Button>Update password</Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
                <CardDescription>
                  Irreversible actions for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">Delete account</Button>
              </CardContent>
            </Card>
          </div>
        );

      case "organization":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Organization</h2>
              <p className="text-sm text-muted-foreground">
                Manage your organization settings
              </p>
            </div>
            <Separator />

            <div className="grid gap-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization name</Label>
                <Input id="org-name" defaultValue={currentOrganization?.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">URL slug</Label>
                <Input id="org-slug" defaultValue={currentOrganization?.slug || ""} />
              </div>
            </div>

            <Button>Save changes</Button>
          </div>
        );

      case "billing":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Billing</h2>
              <p className="text-sm text-muted-foreground">
                Manage your subscription and billing
              </p>
            </div>
            <Separator />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Free Plan</p>
                    <p className="text-sm text-muted-foreground">
                      Up to 5 team members
                    </p>
                  </div>
                  <Button>Upgrade</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full animate-fade-in">
      {/* Sidebar */}
      <div className="w-64 border-r p-4 space-y-1">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {section.label}
              </div>
              <ChevronRight className={cn("h-4 w-4", !isActive && "opacity-0")} />
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl">{renderContent()}</div>
      </div>
    </div>
  );
}

function NotificationSetting({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}

function ThemeOption({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 border rounded-lg transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
