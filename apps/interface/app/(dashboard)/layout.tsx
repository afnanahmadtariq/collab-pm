"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { ME_QUERY, ORGANIZATIONS_QUERY } from "@/lib/graphql/queries";
import { useAuthStore } from "@/stores/auth-store";
import { useProjectStore } from "@/stores/project-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/layout/command-palette";
import { TaskDetailModal } from "@/components/board/task-detail-modal";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, setUser, setLoading, logout } = useAuthStore();
  const { setOrganizations, setCurrentOrganization } = useProjectStore();
  const [isReady, setIsReady] = useState(false);

  const { loading: meLoading, error: meError } = useQuery(ME_QUERY, {
    skip: !isAuthenticated,
    onCompleted: (data) => {
      if (data.me) {
        setUser(data.me);
        setLoading(false);
      } else {
        logout();
        router.push("/login");
      }
    },
    onError: () => {
      logout();
      router.push("/login");
    },
  });

  const { loading: orgsLoading } = useQuery(ORGANIZATIONS_QUERY, {
    skip: !isAuthenticated,
    onCompleted: (data) => {
      if (data.organizations) {
        setOrganizations(data.organizations);
        if (data.organizations.length > 0 && !useProjectStore.getState().currentOrganization) {
          setCurrentOrganization(data.organizations[0]);
        }
      }
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      router.push("/login");
    } else {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady || meLoading || orgsLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="pt-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b px-6 flex items-center">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (meError) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <CommandPalette />
      <TaskDetailModal />
      <CreateProjectModal />
      <CreateTaskModal />
    </div>
  );
}
