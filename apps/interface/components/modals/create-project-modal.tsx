"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  Palette,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { CREATE_PROJECT_MUTATION } from "@/lib/graphql/queries";

const PROJECT_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

export function CreateProjectModal() {
  const { createProjectOpen, setCreateProjectOpen } = useUIStore();
  const { currentOrganization, addProject } = useProjectStore();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);

  const [createProject, { loading }] = useMutation(CREATE_PROJECT_MUTATION, {
    onCompleted: (data) => {
      addProject(data.createProject);
      handleClose();
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
    },
  });

  const handleClose = () => {
    setName("");
    setDescription("");
    setColor(PROJECT_COLORS[0]);
    setCreateProjectOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentOrganization) return;

    createProject({
      variables: {
        input: {
          organizationId: currentOrganization.id,
          name: name.trim(),
          description: description.trim() || null,
          color,
        },
      },
    });
  };

  return (
    <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
            <DialogDescription>
              Start a new project to organize your tasks and collaborate with your team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Project Preview */}
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: color }}
              >
                {name ? name[0].toUpperCase() : "P"}
              </div>
              <div>
                <p className="font-medium">{name || "Project name"}</p>
                <p className="text-sm text-muted-foreground">
                  {description || "No description"}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project name</Label>
              <Input
                id="name"
                placeholder="e.g., Marketing Campaign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Project color
              </Label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      color === c && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
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
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
