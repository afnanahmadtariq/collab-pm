"use client";

import { create } from "zustand";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
  columnId: string;
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    avatar?: string | null;
  } | null;
  creatorId: string;
  creator: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  subtasks?: Task[];
  tags?: { id: string; name: string; color: string }[];
  commentsCount?: number;
  attachmentsCount?: number;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  color: string;
  boardId: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  name: string;
  position: number;
  projectId: string;
  columns: Column[];
}

interface BoardState {
  currentBoard: Board | null;
  boards: Board[];
  isLoading: boolean;
  draggedTask: Task | null;

  // Actions
  setCurrentBoard: (board: Board | null) => void;
  setBoards: (boards: Board[]) => void;
  setLoading: (loading: boolean) => void;
  setDraggedTask: (task: Task | null) => void;
  
  // Task operations
  addTask: (columnId: string, task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, newPosition: number) => void;
  
  // Column operations
  addColumn: (column: Column) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  removeColumn: (columnId: string) => void;
  reorderColumns: (columnIds: string[]) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  currentBoard: null,
  boards: [],
  isLoading: false,
  draggedTask: null,

  setCurrentBoard: (currentBoard) => set({ currentBoard }),

  setBoards: (boards) => set({ boards }),

  setLoading: (isLoading) => set({ isLoading }),

  setDraggedTask: (draggedTask) => set({ draggedTask }),

  addTask: (columnId, task) =>
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map((col) =>
            col.id === columnId
              ? { ...col, tasks: [...col.tasks, task] }
              : col
          ),
        },
      };
    }),

  updateTask: (taskId, updates) =>
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          })),
        },
      };
    }),

  removeTask: (taskId) =>
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map((col) => ({
            ...col,
            tasks: col.tasks.filter((task) => task.id !== taskId),
          })),
        },
      };
    }),

  moveTask: (taskId, sourceColumnId, targetColumnId, newPosition) =>
    set((state) => {
      if (!state.currentBoard) return state;

      let movedTask: Task | undefined;
      
      // Find and remove task from source column
      const columnsAfterRemoval = state.currentBoard.columns.map((col) => {
        if (col.id === sourceColumnId) {
          const task = col.tasks.find((t) => t.id === taskId);
          if (task) movedTask = task;
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          };
        }
        return col;
      });

      if (!movedTask) return state;

      // Add task to target column at new position
      const columnsAfterAdd = columnsAfterRemoval.map((col) => {
        if (col.id === targetColumnId) {
          const newTasks = [...col.tasks];
          movedTask!.columnId = targetColumnId;
          movedTask!.position = newPosition;
          newTasks.splice(newPosition, 0, movedTask!);
          // Update positions
          return {
            ...col,
            tasks: newTasks.map((t, i) => ({ ...t, position: i })),
          };
        }
        return col;
      });

      return {
        currentBoard: {
          ...state.currentBoard,
          columns: columnsAfterAdd,
        },
      };
    }),

  addColumn: (column) =>
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          columns: [...state.currentBoard.columns, column],
        },
      };
    }),

  updateColumn: (columnId, updates) =>
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.map((col) =>
            col.id === columnId ? { ...col, ...updates } : col
          ),
        },
      };
    }),

  removeColumn: (columnId) =>
    set((state) => {
      if (!state.currentBoard) return state;
      return {
        currentBoard: {
          ...state.currentBoard,
          columns: state.currentBoard.columns.filter((col) => col.id !== columnId),
        },
      };
    }),

  reorderColumns: (columnIds) =>
    set((state) => {
      if (!state.currentBoard) return state;
      const columnMap = new Map(state.currentBoard.columns.map((c) => [c.id, c]));
      return {
        currentBoard: {
          ...state.currentBoard,
          columns: columnIds
            .map((id, index) => {
              const col = columnMap.get(id);
              return col ? { ...col, position: index } : null;
            })
            .filter((col): col is Column => col !== null),
        },
      };
    }),
}));
