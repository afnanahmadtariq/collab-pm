"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { PROJECT_QUERY } from "@/lib/graphql/queries";
import { useProjectStore } from "@/stores/project-store";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
import { KanbanBoard } from "@/components/board/kanban-board";
import { ListView } from "@/components/board/list-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const { setCurrentProject } = useProjectStore();
  const { setCurrentBoard, setLoading } = useBoardStore();
  const { activeView } = useUIStore();

  const { loading, error, data } = useQuery(PROJECT_QUERY, {
    variables: { id: projectId },
    skip: !projectId,
  });

  useEffect(() => {
    if (data?.project) {
      setCurrentProject(data.project);
      if (data.project.boards?.[0]) {
        setCurrentBoard({
          ...data.project.boards[0],
          columns: data.project.boards[0].columns.map((col: { tasks?: { comments?: unknown[]; attachments?: unknown[] }[] }) => ({
            ...col,
            tasks: col.tasks?.map((task: { comments?: unknown[]; attachments?: unknown[] }) => ({
              ...task,
              commentsCount: task.comments?.length || 0,
              attachmentsCount: task.attachments?.length || 0,
            })) || [],
          })),
        });
      }
    }
    setLoading(loading);
  }, [data, loading, setCurrentProject, setCurrentBoard, setLoading]);

  if (loading) {
    return (
      <div className="h-full p-6">
        <div className="flex gap-4 h-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-80 flex-shrink-0 space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Error loading project
          </h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data?.project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground">
            The project you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full animate-fade-in">
      {activeView === "board" && <KanbanBoard />}
      {activeView === "list" && <ListView />}
      {activeView === "calendar" && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Calendar View</p>
            <p className="text-sm">Coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}
