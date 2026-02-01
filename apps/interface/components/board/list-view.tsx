"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Calendar,
  User,
  MoreHorizontal,
} from "lucide-react";
import { cn, formatDate, priorityColors } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBoardStore, Column } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";

export function ListView() {
  const { currentBoard } = useBoardStore();
  const { openTaskDetail } = useUIStore();
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(
    new Set(currentBoard?.columns.map((c) => c.id) || [])
  );

  const toggleColumn = (columnId: string) => {
    setExpandedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p>No board available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
        <div className="col-span-5">Task</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2">Due Date</div>
        <div className="col-span-1">Assignee</div>
      </div>

      {/* Columns */}
      {currentBoard.columns.map((column) => (
        <div key={column.id} className="space-y-1">
          {/* Column Header */}
          <button
            onClick={() => toggleColumn(column.id)}
            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-muted rounded-lg transition-colors"
          >
            {expandedColumns.has(column.id) ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <span className="font-medium">{column.name}</span>
            <span className="text-sm text-muted-foreground">
              ({column.tasks.length})
            </span>
          </button>

          {/* Tasks */}
          {expandedColumns.has(column.id) && (
            <div className="space-y-1 ml-6">
              {column.tasks.map((task) => {
                const priorityStyle = priorityColors[task.priority];
                
                return (
                  <div
                    key={task.id}
                    onClick={() => openTaskDetail(task.id)}
                    className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-muted rounded-lg cursor-pointer transition-colors group"
                  >
                    {/* Task Title */}
                    <div className="col-span-5 flex items-center gap-3">
                      <CheckSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium truncate">{task.title}</span>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {task.subtasks.length} subtasks
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: `${column.color}20`,
                          color: column.color,
                        }}
                      >
                        {column.name}
                      </Badge>
                    </div>

                    {/* Priority */}
                    <div className="col-span-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          priorityStyle.bg,
                          priorityStyle.text
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    {/* Due Date */}
                    <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                      {task.dueDate ? (
                        <>
                          <Calendar className="h-4 w-4" />
                          {formatDate(task.dueDate)}
                        </>
                      ) : (
                        <span className="text-muted-foreground/50">No date</span>
                      )}
                    </div>

                    {/* Assignee */}
                    <div className="col-span-1 flex items-center justify-between">
                      {task.assignee ? (
                        <Avatar
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          fallback={task.assignee.name}
                          size="sm"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Move</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
              
              {column.tasks.length === 0 && (
                <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                  No tasks in this column
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
