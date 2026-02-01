"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@apollo/client";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { useBoardStore, Task, Column } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
import { MOVE_TASK_MUTATION } from "@/lib/graphql/queries";

export function KanbanBoard() {
  const { currentBoard, moveTask, setDraggedTask } = useBoardStore();
  const { openTaskDetail } = useUIStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [moveTaskMutation] = useMutation(MOVE_TASK_MUTATION);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = currentBoard?.columns || [];
  const columnIds = columns.map((c) => c.id);

  const findColumnByTaskId = useCallback(
    (taskId: string) => {
      return columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );
    },
    [columns]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    // Check if it's a task
    const column = findColumnByTaskId(activeId);
    if (column) {
      const task = column.tasks.find((t) => t.id === activeId);
      if (task) {
        setActiveTask(task);
        setDraggedTask(task);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByTaskId(activeId);
    const overColumn = findColumnByTaskId(overId) || columns.find((c) => c.id === overId);

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return;

    // Moving task to different column
    const activeTask = activeColumn.tasks.find((t) => t.id === activeId);
    if (activeTask) {
      moveTask(activeId, activeColumn.id, overColumn.id, overColumn.tasks.length);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumn(null);
    setDraggedTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByTaskId(activeId);
    if (!activeColumn) return;

    const overColumn = findColumnByTaskId(overId) || columns.find((c) => c.id === overId);
    if (!overColumn) return;

    const activeIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
    const overIndex = overColumn.tasks.findIndex((t) => t.id === overId);

    const newPosition = overIndex >= 0 ? overIndex : overColumn.tasks.length;

    // Update local state and sync with server
    try {
      await moveTaskMutation({
        variables: {
          id: activeId,
          columnId: overColumn.id,
          position: newPosition,
        },
      });
    } catch (error) {
      console.error("Failed to move task:", error);
    }
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
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className="flex gap-4 p-6 h-full min-h-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onTaskClick={openTaskDetail}
                />
              ))}
            </SortableContext>

            <DragOverlay>
              {activeTask && (
                <TaskCard task={activeTask} isDragging />
              )}
            </DragOverlay>
          </DndContext>

          {/* Add Column Button */}
          <div className="w-80 flex-shrink-0">
            <Button
              variant="outline"
              className="w-full h-12 border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
