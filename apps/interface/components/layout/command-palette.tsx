"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLazyQuery } from "@apollo/client";
import {
  Search,
  FolderKanban,
  CheckSquare,
  Settings,
  Users,
  Plus,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/components/providers/theme-provider";
import { SEARCH_TASKS_QUERY } from "@/lib/graphql/queries";

interface CommandItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { commandPaletteOpen, setCommandPaletteOpen, setCreateProjectOpen, setCreateTaskOpen } = useUIStore();
  const { projects, currentOrganization } = useProjectStore();
  const { logout } = useAuthStore();
  
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [searchTasks, { data: searchData }] = useLazyQuery(SEARCH_TASKS_QUERY);

  const baseCommands: CommandItem[] = [
    {
      id: "dashboard",
      name: "Go to Dashboard",
      icon: <FolderKanban className="h-4 w-4" />,
      action: () => router.push("/dashboard"),
      category: "Navigation",
    },
    {
      id: "projects",
      name: "View Projects",
      icon: <FolderKanban className="h-4 w-4" />,
      action: () => router.push("/projects"),
      category: "Navigation",
    },
    {
      id: "team",
      name: "Team Members",
      icon: <Users className="h-4 w-4" />,
      action: () => router.push("/team"),
      category: "Navigation",
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push("/settings"),
      category: "Navigation",
    },
    {
      id: "new-project",
      name: "Create New Project",
      icon: <Plus className="h-4 w-4" />,
      action: () => setCreateProjectOpen(true),
      category: "Actions",
    },
    {
      id: "new-task",
      name: "Create New Task",
      icon: <Plus className="h-4 w-4" />,
      action: () => setCreateTaskOpen(true),
      category: "Actions",
    },
    {
      id: "toggle-theme",
      name: `Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`,
      icon: resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      action: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      category: "Preferences",
    },
    {
      id: "logout",
      name: "Log Out",
      icon: <LogOut className="h-4 w-4" />,
      action: () => {
        logout();
        router.push("/login");
      },
      category: "Account",
    },
  ];

  const projectCommands: CommandItem[] = projects.map((project) => ({
    id: `project-${project.id}`,
    name: project.name,
    icon: (
      <div
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: project.color }}
      />
    ),
    action: () => router.push(`/projects/${project.id}`),
    category: "Projects",
  }));

  const taskResults: CommandItem[] = (searchData?.searchTasks || []).map((task: { id: string; title: string; column: { board: { project: { name: string } } } }) => ({
    id: `task-${task.id}`,
    name: task.title,
    icon: <CheckSquare className="h-4 w-4" />,
    action: () => {
      // Open task detail
      useUIStore.getState().openTaskDetail(task.id);
    },
    category: "Tasks",
  }));

  const allCommands = [...baseCommands, ...projectCommands, ...taskResults];
  
  const filteredCommands = query
    ? allCommands.filter((cmd) =>
        cmd.name.toLowerCase().includes(query.toLowerCase())
      )
    : baseCommands;

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }

      if (!commandPaletteOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) =>
          i === 0 ? filteredCommands.length - 1 : i - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setCommandPaletteOpen(false);
        }
      }
    },
    [commandPaletteOpen, filteredCommands, selectedIndex, setCommandPaletteOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (query && currentOrganization) {
      const timeout = setTimeout(() => {
        searchTasks({
          variables: { query, organizationId: currentOrganization.id },
        });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [query, currentOrganization, searchTasks]);

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <div className="flex items-center gap-3 px-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="h-14 border-0 focus-visible:ring-0 px-0 text-base"
          />
        </div>
        
        <div className="max-h-[300px] overflow-y-auto py-2">
          {Object.entries(groupedCommands).map(([category, items]) => (
            <div key={category}>
              <p className="px-4 py-2 text-xs font-medium text-muted-foreground">
                {category}
              </p>
              {items.map((item, idx) => {
                const globalIndex = filteredCommands.indexOf(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      setCommandPaletteOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors",
                      selectedIndex === globalIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p>No results found for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground bg-muted/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded">↵</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background rounded">Esc</kbd>
            Close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
