"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  X,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Paperclip,
  CheckSquare,
  Clock,
  MoreHorizontal,
  Flag,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { cn, formatRelativeTime, priorityColors, getInitials } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/stores/ui-store";
import { useBoardStore, Task } from "@/stores/board-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  TASK_QUERY,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
  CREATE_COMMENT_MUTATION,
} from "@/lib/graphql/queries";

export function TaskDetailModal() {
  const { taskDetailId, closeTaskDetail } = useUIStore();
  const { currentBoard, updateTask, removeTask } = useBoardStore();
  const { user } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");

  // Find task from local state first
  const localTask = currentBoard?.columns
    .flatMap((c) => c.tasks)
    .find((t) => t.id === taskDetailId);

  // Query for full task details
  const { loading, data } = useQuery(TASK_QUERY, {
    variables: { id: taskDetailId },
    skip: !taskDetailId,
  });

  const task = data?.task || localTask;

  const [updateTaskMutation] = useMutation(UPDATE_TASK_MUTATION);
  const [deleteTaskMutation] = useMutation(DELETE_TASK_MUTATION);
  const [createComment] = useMutation(CREATE_COMMENT_MUTATION);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
    }
  }, [task]);

  const handleSave = async () => {
    if (!taskDetailId) return;
    
    try {
      await updateTaskMutation({
        variables: {
          id: taskDetailId,
          input: { title, description },
        },
      });
      updateTask(taskDetailId, { title, description });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDelete = async () => {
    if (!taskDetailId) return;
    
    try {
      await deleteTaskMutation({ variables: { id: taskDetailId } });
      removeTask(taskDetailId);
      closeTaskDetail();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !taskDetailId) return;
    
    try {
      await createComment({
        variables: {
          input: {
            taskId: taskDetailId,
            content: newComment.trim(),
          },
        },
      });
      setNewComment("");
      // Refetch task to get updated comments
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  type PriorityKey = keyof typeof priorityColors;
  const priorityStyle = task && task.priority in priorityColors 
    ? priorityColors[task.priority as PriorityKey] 
    : null;

  if (!taskDetailId) return null;

  return (
    <Dialog open={!!taskDetailId} onOpenChange={() => closeTaskDetail()}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <DialogHeader className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="sr-only">Task Details</DialogTitle>
                <div className="flex items-center gap-2">
                  {task?.tags?.map((tag: { id: string; name: string; color: string }) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 text-xs rounded-full"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        Edit task
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => closeTaskDetail()}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Title */}
                {isEditing ? (
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-semibold"
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-xl font-semibold cursor-pointer hover:bg-muted rounded px-2 py-1 -mx-2 -my-1"
                    onClick={() => setIsEditing(true)}
                  >
                    {task?.title || "Loading..."}
                  </h2>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Description
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a description..."
                      rows={4}
                    />
                  ) : (
                    <div
                      className="text-sm cursor-pointer hover:bg-muted rounded px-3 py-2 -mx-3 min-h-[80px]"
                      onClick={() => setIsEditing(true)}
                    >
                      {task?.description || (
                        <span className="text-muted-foreground">
                          Add a description...
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setTitle(task?.title || "");
                        setDescription(task?.description || "");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                <Separator />

                {/* Subtasks */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Subtasks
                    </label>
                    {task?.subtasks && task.subtasks.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {task.subtasks.filter((s: { completed: boolean }) => s.completed).length} / {task.subtasks.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {task?.subtasks?.map((subtask: { id: string; title: string; completed: boolean }) => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted"
                      >
                        <Checkbox checked={subtask.completed} />
                        <span
                          className={cn(
                            "flex-1 text-sm",
                            subtask.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add a subtask..."
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newSubtask.trim()) {
                          // Add subtask logic
                          setNewSubtask("");
                        }
                      }}
                    />
                    <Button size="icon" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Comments */}
                <div className="space-y-4">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments
                  </label>

                  <div className="space-y-4">
                    {data?.task?.comments?.map((comment: {
                      id: string;
                      content: string;
                      createdAt: string;
                      author: { id: string; name: string; avatar?: string };
                    }) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          fallback={comment.author.name}
                          size="sm"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {comment.author.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-3">
                    <Avatar
                      src={user?.avatar}
                      alt={user?.name || ""}
                      fallback={user?.name || "U"}
                      size="sm"
                    />
                    <div className="flex-1 flex gap-2">
                      <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="w-64 border-l bg-muted/30 p-4 space-y-6">
            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-3 w-3" />
                Assignee
              </label>
              {task?.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    fallback={task.assignee.name}
                    size="sm"
                  />
                  <span className="text-sm">{task.assignee.name}</span>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-3 w-3 mr-2" />
                  Add assignee
                </Button>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Due Date
              </label>
              {task?.dueDate ? (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-3 w-3 mr-2" />
                  Add due date
                </Button>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Flag className="h-3 w-3" />
                Priority
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    {priorityStyle && (
                      <Badge
                        variant="secondary"
                        className={cn("mr-2", priorityStyle.bg, priorityStyle.text)}
                      >
                        {task?.priority}
                      </Badge>
                    )}
                    {!priorityStyle && "Set priority"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(["URGENT", "HIGH", "MEDIUM", "LOW"] as const).map((p) => {
                    const style = priorityColors[p];
                    return (
                      <DropdownMenuItem key={p}>
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

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="h-3 w-3" />
                Tags
              </label>
              <div className="flex flex-wrap gap-1">
                {task?.tags?.map((tag: { id: string; name: string; color: string }) => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 text-xs rounded-full"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-3 w-3 mr-2" />
                Add tag
              </Button>
            </div>

            {/* Activity */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Activity
              </label>
              <div className="text-xs text-muted-foreground space-y-1">
                {task?.createdAt && (
                  <p>Created {formatRelativeTime(task.createdAt)}</p>
                )}
                {task?.updatedAt && (
                  <p>Updated {formatRelativeTime(task.updatedAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
