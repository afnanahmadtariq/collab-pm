"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  MessageSquare,
  Paperclip,
  CheckSquare,
} from "lucide-react";
import { cn, formatDate, priorityColors } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Task } from "@/stores/board-store";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const priorityStyle = priorityColors[task.priority];

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 bg-background rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md",
        isDragging && "opacity-50 shadow-lg scale-105 rotate-2"
      )}
    >
      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map((tag) => (
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
          {task.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-muted-foreground">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h4 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Meta info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <Badge
            variant="secondary"
            className={cn("text-[10px] px-1.5 py-0", priorityStyle.bg, priorityStyle.text)}
          >
            {task.priority}
          </Badge>

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Stats and assignee */}
        <div className="flex items-center gap-2">
          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckSquare className="h-3 w-3" />
              <span>{task.subtasks.length}</span>
            </div>
          )}

          {/* Comments */}
          {task.commentsCount !== undefined && task.commentsCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{task.commentsCount}</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachmentsCount !== undefined && task.attachmentsCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              <span>{task.attachmentsCount}</span>
            </div>
          )}

          {/* Assignee */}
          {task.assignee && (
            <Avatar
              src={task.assignee.avatar}
              alt={task.assignee.name}
              fallback={task.assignee.name}
              size="xs"
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface SortableTaskCardProps extends TaskCardProps {}

export function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(isDragging && "opacity-50")}
    >
      <TaskCard task={task} isDragging={isDragging} onClick={onClick} />
    </div>
  );
}
