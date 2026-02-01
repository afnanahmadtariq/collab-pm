"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortableTaskCard } from "./task-card";
import { Column, Task } from "@/stores/board-store";
import { useBoardStore } from "@/stores/board-store";
import { useAuthStore } from "@/stores/auth-store";
import { CREATE_TASK_MUTATION } from "@/lib/graphql/queries";

interface KanbanColumnProps {
  column: Column;
  onTaskClick: (taskId: string) => void;
}

export function KanbanColumn({ column, onTaskClick }: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const { addTask } = useBoardStore();
  const { user } = useAuthStore();

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const [createTask, { loading }] = useMutation(CREATE_TASK_MUTATION, {
    onCompleted: (data) => {
      addTask(column.id, {
        ...data.createTask,
        columnId: column.id,
        subtasks: [],
        tags: [],
        commentsCount: 0,
        attachmentsCount: 0,
      });
      setNewTaskTitle("");
      setIsAdding(false);
    },
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    createTask({
      variables: {
        input: {
          columnId: column.id,
          title: newTaskTitle.trim(),
        },
      },
    });
  };

  const taskIds = column.tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-80 flex-shrink-0 flex flex-col bg-muted/30 rounded-xl max-h-full",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold">{column.name}</h3>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Change color</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task.id)}
            />
          ))}
        </SortableContext>

        {/* Add Task Form */}
        {isAdding && (
          <div className="p-3 bg-background rounded-lg border shadow-sm space-y-2 animate-scale-in">
            <Input
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewTaskTitle("");
                }
              }}
              autoFocus
              disabled={loading}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || loading}
              >
                Add Task
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskTitle("");
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Button (when not adding) */}
      {!isAdding && (
        <div className="p-2 pt-0">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add task
          </Button>
        </div>
      )}
    </div>
  );
}
