"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Plus,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStore } from "@/stores/project-store";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { PROJECTS_QUERY, ACTIVITIES_QUERY } from "@/lib/graphql/queries";
import { formatRelativeTime, priorityColors } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { currentOrganization, projects, setProjects } = useProjectStore();
  const { setCreateProjectOpen, setCreateTaskOpen } = useUIStore();

  const { loading: projectsLoading } = useQuery(PROJECTS_QUERY, {
    variables: { organizationId: currentOrganization?.id },
    skip: !currentOrganization?.id,
    onCompleted: (data) => setProjects(data.projects || []),
  });

  const { data: activitiesData, loading: activitiesLoading } = useQuery(ACTIVITIES_QUERY, {
    variables: { limit: 10 },
    skip: !currentOrganization?.id,
  });

  const stats = [
    {
      name: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      name: "Tasks Completed",
      value: 24,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
      name: "In Progress",
      value: 12,
      icon: Clock,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    },
    {
      name: "Overdue",
      value: 3,
      icon: AlertCircle,
      color: "text-red-600 bg-red-100 dark:bg-red-900/30",
    },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting()}, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setCreateTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button onClick={() => setCreateProjectOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Projects</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium">No projects yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first project to get started
                </p>
                <Button onClick={() => setCreateProjectOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {project.description || "No description"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (activitiesData?.activities?.length || 0) === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activitiesData?.activities?.slice(0, 8).map((activity: {
                  id: string;
                  action: string;
                  createdAt: string;
                  user: { name: string; avatar?: string };
                  task?: { title: string };
                  project?: { name: string };
                }) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar
                      src={activity.user?.avatar}
                      alt={activity.user?.name}
                      fallback={activity.user?.name}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user?.name}</span>{" "}
                        <span className="text-muted-foreground">
                          {activity.action.toLowerCase().replace(/_/g, " ")}
                        </span>
                        {activity.task && (
                          <span className="font-medium"> {activity.task.title}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => setCreateTaskOpen(true)}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted transition-colors text-left"
            >
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Create Task</h3>
                <p className="text-sm text-muted-foreground">
                  Add a new task to any project
                </p>
              </div>
            </button>
            <button
              onClick={() => setCreateProjectOpen(true)}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted transition-colors text-left"
            >
              <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">New Project</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new project
                </p>
              </div>
            </button>
            <Link
              href="/team"
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Invite Team</h3>
                <p className="text-sm text-muted-foreground">
                  Add members to your workspace
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
