"use client";

import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  taskDetailId: string | null;
  createProjectOpen: boolean;
  createTaskOpen: boolean;
  createTaskColumnId: string | null;
  activeView: "board" | "list" | "calendar";
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  setCreateProjectOpen: (open: boolean) => void;
  setCreateTaskOpen: (open: boolean, columnId?: string) => void;
  setActiveView: (view: "board" | "list" | "calendar") => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  taskDetailId: null,
  createProjectOpen: false,
  createTaskOpen: false,
  createTaskColumnId: null,
  activeView: "board",

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

  openTaskDetail: (taskId) =>
    set({ taskDetailId: taskId }),

  closeTaskDetail: () =>
    set({ taskDetailId: null }),

  setCreateProjectOpen: (createProjectOpen) => set({ createProjectOpen }),

  setCreateTaskOpen: (createTaskOpen, columnId) => 
    set({ createTaskOpen, createTaskColumnId: columnId || null }),

  setActiveView: (activeView) => set({ activeView }),
}));
