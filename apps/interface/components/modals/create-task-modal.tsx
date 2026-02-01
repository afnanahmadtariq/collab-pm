"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  Calendar,
  Flag,
  Loader2,
  User,
} from "lucide-react";
import { cn, priorityColors } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/stores/ui-store";
import { useBoardStore } from "@/stores/board-store";
import { CREATE_TASK_MUTATION } from "@/lib/graphql/queries";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export function CreateTaskModal() {
  const { createTaskOpen, setCreateTaskOpen, createTaskColumnId } = useUIStore();
  const { addTask } = useBoardStore();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  const [createTask, { loading }] = useMutation(CREATE_TASK_MUTATION, {
    onCompleted: (data) => {
      if (createTaskColumnId) {
        addTask(createTaskColumnId, {
          ...data.createTask,
          columnId: createTaskColumnId,
          subtasks: [],
          tags: [],
          commentsCount: 0,
          attachmentsCount: 0,
        });
      }
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setCreateTaskOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !createTaskColumnId) return;

    createTask({
      variables: {
        input: {
          columnId: createTaskColumnId,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          dueDate: dueDate || null,
        },
      },
    });
  };

  const priorityStyle = priorityColors[priority];

  return (
    <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new task</DialogTitle>
            <DialogDescription>
              Add a new task to your board. You can add more details after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Task title</Label>
              <Input
                id="title"
                placeholder="e.g., Design landing page mockup"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add more details about this task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Priority
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      type="button"
                    >
                      <Badge
                        variant="secondary"
                        className={cn("mr-2", priorityStyle.bg, priorityStyle.text)}
                      >
                        {priority}
                      </Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((p) => {
                      const style = priorityColors[p];
                      return (
                        <DropdownMenuItem
                          key={p}
                          onClick={() => setPriority(p)}
                        >
                          <Badge
                            variant="secondary"
                            className={cn("mr-2", style.bg, style.text)}
                          >
                            {p}
                          </Badge>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due date
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
