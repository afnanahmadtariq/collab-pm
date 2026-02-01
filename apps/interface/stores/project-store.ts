"use client";

import { create } from "zustand";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  organizationId: string;
}

interface ProjectState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;

  // Actions
  setCurrentOrganization: (org: Organization | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentOrganization: null,
  organizations: [],
  currentProject: null,
  projects: [],
  isLoading: false,

  setCurrentOrganization: (currentOrganization) => set({ currentOrganization }),

  setOrganizations: (organizations) => set({ organizations }),

  setCurrentProject: (currentProject) => set({ currentProject }),

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject:
        state.currentProject?.id === id ? null : state.currentProject,
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));
