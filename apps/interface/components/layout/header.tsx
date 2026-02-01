"use client";

import { usePathname } from "next/navigation";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/team": "Team",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const { setCommandPaletteOpen, setCreateTaskOpen, setCreateProjectOpen, activeView, setActiveView } = useUIStore();
  const { currentProject } = useProjectStore();

  const getTitle = () => {
    if (pathname.startsWith("/projects/") && currentProject) {
      return currentProject.name;
    }
    return pageTitles[pathname] || "Collab PM";
  };

  const isProjectPage = pathname.startsWith("/projects/") && currentProject;

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{getTitle()}</h1>
          
          {isProjectPage && (
            <div className="flex items-center gap-1 ml-4 bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveView("board")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeView === "board"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Board
              </button>
              <button
                onClick={() => setActiveView("list")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeView === "list"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setActiveView("calendar")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeView === "calendar"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Calendar
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
            <kbd className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Create new</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateTaskOpen(true)}>
                Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCreateProjectOpen(true)}>
                Project
              </DropdownMenuItem>
              <DropdownMenuItem>Board</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              3
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  );
}
