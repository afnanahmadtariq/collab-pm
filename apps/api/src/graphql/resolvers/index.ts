import { GraphQLError } from "graphql";
import { DateTimeResolver, JSONResolver } from "graphql-scalars";
import { Context } from "../context.js";
import { hashPassword, verifyPassword, generateToken } from "../../lib/auth.js";

// Helper to require authentication
function requireAuth(user: Context["user"]) {
  if (!user) {
    throw new GraphQLError("You must be logged in", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return user;
}

export const resolvers = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,

  Query: {
    me: async (_: unknown, __: unknown, { prisma, user }: Context) => {
      if (!user) return null;
      return prisma.user.findUnique({ where: { id: user.userId } });
    },

    user: async (_: unknown, { id }: { id: string }, { prisma }: Context) => {
      return prisma.user.findUnique({ where: { id } });
    },

    organizations: async (_: unknown, __: unknown, { prisma, user }: Context) => {
      const authUser = requireAuth(user);
      return prisma.organization.findMany({
        where: {
          members: { some: { userId: authUser.userId } },
        },
      });
    },

    organization: async (_: unknown, { id }: { id: string }, { prisma }: Context) => {
      return prisma.organization.findUnique({ where: { id } });
    },

    organizationBySlug: async (_: unknown, { slug }: { slug: string }, { prisma }: Context) => {
      return prisma.organization.findUnique({ where: { slug } });
    },

    projects: async (_: unknown, { organizationId }: { organizationId: string }, { prisma }: Context) => {
      return prisma.project.findMany({ where: { organizationId } });
    },

    project: async (_: unknown, { id }: { id: string }, { prisma }: Context) => {
      return prisma.project.findUnique({ where: { id } });
    },

    board: async (_: unknown, { id }: { id: string }, { prisma }: Context) => {
      return prisma.board.findUnique({ where: { id } });
    },

    task: async (_: unknown, { id }: { id: string }, { prisma }: Context) => {
      return prisma.task.findUnique({ where: { id } });
    },

    searchTasks: async (
      _: unknown,
      { query, organizationId }: { query: string; organizationId: string },
      { prisma }: Context
    ) => {
      return prisma.task.findMany({
        where: {
          column: {
            board: {
              project: { organizationId },
            },
          },
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 20,
      });
    },

    notifications: async (_: unknown, __: unknown, { prisma, user }: Context) => {
      const authUser = requireAuth(user);
      return prisma.notification.findMany({
        where: { userId: authUser.userId },
        orderBy: { createdAt: "desc" },
      });
    },

    unreadNotificationsCount: async (_: unknown, __: unknown, { prisma, user }: Context) => {
      const authUser = requireAuth(user);
      return prisma.notification.count({
        where: { userId: authUser.userId, read: false },
      });
    },

    activities: async (
      _: unknown,
      { projectId, limit = 50 }: { projectId?: string; limit?: number },
      { prisma }: Context
    ) => {
      return prisma.activity.findMany({
        where: projectId ? { projectId } : {},
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      { input }: { input: { email: string; name: string; password: string } },
      { prisma }: Context
    ) => {
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throw new GraphQLError("Email already in use", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: hashedPassword,
        },
      });

      const token = generateToken({ userId: user.id, email: user.email });
      return { token, user };
    },

    login: async (
      _: unknown,
      { input }: { input: { email: string; password: string } },
      { prisma }: Context
    ) => {
      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (!user) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const valid = await verifyPassword(input.password, user.password);
      if (!valid) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const token = generateToken({ userId: user.id, email: user.email });
      return { token, user };
    },

    createOrganization: async (
      _: unknown,
      { input }: { input: { name: string; slug: string } },
      { prisma, user }: Context
    ) => {
      const authUser = requireAuth(user);
      
      return prisma.organization.create({
        data: {
          name: input.name,
          slug: input.slug,
          members: {
            create: {
              userId: authUser.userId,
              role: "ADMIN",
            },
          },
        },
      });
    },

    createProject: async (
      _: unknown,
      { input }: { input: { organizationId: string; name: string; description?: string; color?: string } },
      { prisma, user }: Context
    ) => {
      requireAuth(user);
      
      return prisma.project.create({
        data: {
          organizationId: input.organizationId,
          name: input.name,
          description: input.description,
          color: input.color || "#6366f1",
          boards: {
            create: {
              name: "Main Board",
              columns: {
                create: [
                  { name: "To Do", position: 0, color: "#6b7280" },
                  { name: "In Progress", position: 1, color: "#3b82f6" },
                  { name: "Review", position: 2, color: "#f59e0b" },
                  { name: "Done", position: 3, color: "#10b981" },
                ],
              },
            },
          },
        },
      });
    },

    createTask: async (
      _: unknown,
      { input }: { input: { columnId: string; title: string; description?: string; priority?: string; dueDate?: Date; assigneeId?: string; parentId?: string } },
      { prisma, user }: Context
    ) => {
      const authUser = requireAuth(user);
      
      const lastTask = await prisma.task.findFirst({
        where: { columnId: input.columnId },
        orderBy: { position: "desc" },
      });

      return prisma.task.create({
        data: {
          columnId: input.columnId,
          title: input.title,
          description: input.description,
          priority: (input.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT") || "MEDIUM",
          dueDate: input.dueDate,
          assigneeId: input.assigneeId,
          creatorId: authUser.userId,
          parentId: input.parentId,
          position: (lastTask?.position ?? -1) + 1,
        },
      });
    },

    moveTask: async (
      _: unknown,
      { id, columnId, position }: { id: string; columnId: string; position: number },
      { prisma }: Context
    ) => {
      return prisma.task.update({
        where: { id },
        data: { columnId, position },
      });
    },

    createComment: async (
      _: unknown,
      { input }: { input: { taskId: string; content: string } },
      { prisma, user }: Context
    ) => {
      const authUser = requireAuth(user);
      
      return prisma.comment.create({
        data: {
          taskId: input.taskId,
          content: input.content,
          authorId: authUser.userId,
        },
      });
    },

    markNotificationRead: async (
      _: unknown,
      { id }: { id: string },
      { prisma, user }: Context
    ) => {
      requireAuth(user);
      return prisma.notification.update({
        where: { id },
        data: { read: true },
      });
    },

    markAllNotificationsRead: async (_: unknown, __: unknown, { prisma, user }: Context) => {
      const authUser = requireAuth(user);
      await prisma.notification.updateMany({
        where: { userId: authUser.userId, read: false },
        data: { read: true },
      });
      return true;
    },

    // Placeholder mutations - implement as needed
    updateOrganization: async () => { throw new GraphQLError("Not implemented"); },
    deleteOrganization: async () => { throw new GraphQLError("Not implemented"); },
    inviteMember: async () => { throw new GraphQLError("Not implemented"); },
    removeMember: async () => { throw new GraphQLError("Not implemented"); },
    updateMemberRole: async () => { throw new GraphQLError("Not implemented"); },
    updateProject: async () => { throw new GraphQLError("Not implemented"); },
    deleteProject: async () => { throw new GraphQLError("Not implemented"); },
    createBoard: async () => { throw new GraphQLError("Not implemented"); },
    updateBoard: async () => { throw new GraphQLError("Not implemented"); },
    deleteBoard: async () => { throw new GraphQLError("Not implemented"); },
    createColumn: async () => { throw new GraphQLError("Not implemented"); },
    updateColumn: async () => { throw new GraphQLError("Not implemented"); },
    deleteColumn: async () => { throw new GraphQLError("Not implemented"); },
    moveColumn: async () => { throw new GraphQLError("Not implemented"); },
    updateTask: async () => { throw new GraphQLError("Not implemented"); },
    deleteTask: async () => { throw new GraphQLError("Not implemented"); },
    assignTask: async () => { throw new GraphQLError("Not implemented"); },
    updateComment: async () => { throw new GraphQLError("Not implemented"); },
    deleteComment: async () => { throw new GraphQLError("Not implemented"); },
  },

  // Field Resolvers
  User: {
    memberships: (parent: { id: string }, _: unknown, { prisma }: Context) => {
      return prisma.organizationMember.findMany({ where: { userId: parent.id } });
    },
  },

  Organization: {
    members: (parent: { id: string }, _: unknown, { prisma }: Context) => {
      return prisma.organizationMember.findMany({ where: { organizationId: parent.id } });
    },
    projects: (parent: { id: string }, _: unknown, { prisma }: Context) => {
      return prisma.project.findMany({ where: { organizationId: parent.id } });
    },
  },

  OrganizationMember: {
    user: (parent: { userId: string }, _: unknown, { prisma }: Context) => {
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
    organization: (parent: { organizationId: string }, _: unknown, { prisma }: Context) => {
      return prisma.organization.findUnique({ where: { id: parent.organizationId } });
    },
  },

  Project: {
    organization: (parent: { organizationId: string }, _: unknown, { prisma }: Context) => {
      return prisma.organization.findUnique({ where: { id: parent.organizationId } });
    },
    boards: (parent: { id: string }, _: unknown, { prisma }: Context) => {
      return prisma.board.findMany({ where: { projectId: parent.id }, orderBy: { position: "asc" } });
    },
  },

  Board: {
    project: (parent: { projectId: string }, _: unknown, { prisma }: Context) => {
      return prisma.project.findUnique({ where: { id: parent.projectId } });
    },
    columns: (parent: { id: string }, _: unknown, { prisma }: Context) => {
      return prisma.column.findMany({ where: { boardId: parent.id }, orderBy: { position: "asc" } });
    },
  },

  Column: {
    board: (parent: { boardId: string }, _: unknown, { prisma }: Context) => {
      return prisma.board.findUnique({ where: { id: parent.boardId } });
    },
    tasks: (parent: { id: string }, _: unknown, { prisma }: Context) => {
      return prisma.task.findMany({ where: { columnId: parent.id }, orderBy: { position: "asc" } });
    },
  },

  Task: {
    column: (parent: { columnId: string }, _: unknown, { prisma }: Context) => {
      return prisma.column.findUnique({ where: { id: parent.columnId } });
    },
    assignee: (parent: { assigneeId: string | null }, _: unknown, { prisma }: Context) => {
      return parent.assigneeId ? prisma.user.findUnique({ where: { id: parent.assigneeId } }) : null;
    },
    creator: (parent: { creatorId: string }, _: unknown, { prisma }: Context) => {
      return prisma.user.findUnique({ where: { id: parent.creatorId } });
    },
    parent: (parent: { parentId: string | null }, _: unknown, { prisma }: Context) => {
      return parent.parentId ? prisma.task.findUnique({ where: { id: parent.parentId } }) : null;
    },
    subtasks: (parent: { id: string }, _: unknown, { prisma }: Context) => {
      return prisma.task.findMany({ where: { parentId: parent.id } });
    },
    tags: async (parent: { id: string }, _: unknown, { prisma }: Context) => {
      const taskTags = await prisma.taskTag.findMany({
        where: { taskId: parent.id },
        include: { tag: true },
      });
      return taskTags.map((tt) => tt.tag);
    },
    comments: (parent: { id: string }, _: unknown, { prisma }: Context) => {
      return prisma.comment.findMany({ where: { taskId: parent.id }, orderBy: { createdAt: "asc" } });
    },
    attachments: (parent: { id: string }, _: unknown, { prisma }: Context) => {
      return prisma.attachment.findMany({ where: { taskId: parent.id } });
    },
  },

  Comment: {
    author: (parent: { authorId: string }, _: unknown, { prisma }: Context) => {
      return prisma.user.findUnique({ where: { id: parent.authorId } });
    },
    task: (parent: { taskId: string }, _: unknown, { prisma }: Context) => {
      return prisma.task.findUnique({ where: { id: parent.taskId } });
    },
  },

  Activity: {
    user: (parent: { userId: string }, _: unknown, { prisma }: Context) => {
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
    project: (parent: { projectId: string | null }, _: unknown, { prisma }: Context) => {
      return parent.projectId ? prisma.project.findUnique({ where: { id: parent.projectId } }) : null;
    },
    task: (parent: { taskId: string | null }, _: unknown, { prisma }: Context) => {
      return parent.taskId ? prisma.task.findUnique({ where: { id: parent.taskId } }) : null;
    },
  },
};
