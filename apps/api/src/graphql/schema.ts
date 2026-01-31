export const typeDefs = `#graphql
  scalar DateTime
  scalar JSON

  # ============================================
  # User & Authentication
  # ============================================

  type User {
    id: ID!
    email: String!
    name: String!
    avatar: String
    createdAt: DateTime!
    updatedAt: DateTime!
    memberships: [OrganizationMember!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # ============================================
  # Organizations & Teams
  # ============================================

  type Organization {
    id: ID!
    name: String!
    slug: String!
    logo: String
    createdAt: DateTime!
    updatedAt: DateTime!
    members: [OrganizationMember!]!
    projects: [Project!]!
  }

  type OrganizationMember {
    id: ID!
    role: Role!
    joinedAt: DateTime!
    user: User!
    organization: Organization!
  }

  enum Role {
    ADMIN
    EDITOR
    VIEWER
  }

  # ============================================
  # Projects & Boards
  # ============================================

  type Project {
    id: ID!
    name: String!
    description: String
    color: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    organization: Organization!
    boards: [Board!]!
  }

  type Board {
    id: ID!
    name: String!
    position: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    project: Project!
    columns: [Column!]!
  }

  type Column {
    id: ID!
    name: String!
    position: Int!
    color: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    board: Board!
    tasks: [Task!]!
  }

  # ============================================
  # Tasks
  # ============================================

  type Task {
    id: ID!
    title: String!
    description: String
    position: Int!
    priority: Priority!
    dueDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    column: Column!
    assignee: User
    creator: User!
    parent: Task
    subtasks: [Task!]!
    tags: [Tag!]!
    comments: [Comment!]!
    attachments: [Attachment!]!
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  type Tag {
    id: ID!
    name: String!
    color: String!
  }

  # ============================================
  # Comments & Attachments
  # ============================================

  type Comment {
    id: ID!
    content: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    author: User!
    task: Task!
  }

  type Attachment {
    id: ID!
    name: String!
    url: String!
    size: Int!
    mimeType: String!
    version: Int!
    createdAt: DateTime!
  }

  # ============================================
  # Activity & Notifications
  # ============================================

  type Activity {
    id: ID!
    action: ActivityType!
    metadata: JSON
    createdAt: DateTime!
    user: User!
    project: Project
    task: Task
  }

  enum ActivityType {
    TASK_CREATED
    TASK_UPDATED
    TASK_MOVED
    TASK_DELETED
    COMMENT_ADDED
    MEMBER_INVITED
    MEMBER_REMOVED
    PROJECT_CREATED
    PROJECT_UPDATED
  }

  type Notification {
    id: ID!
    title: String!
    message: String!
    read: Boolean!
    createdAt: DateTime!
  }

  # ============================================
  # Queries
  # ============================================

  type Query {
    # User
    me: User
    user(id: ID!): User

    # Organizations
    organizations: [Organization!]!
    organization(id: ID!): Organization
    organizationBySlug(slug: String!): Organization

    # Projects
    projects(organizationId: ID!): [Project!]!
    project(id: ID!): Project

    # Boards
    board(id: ID!): Board

    # Tasks
    task(id: ID!): Task
    searchTasks(query: String!, organizationId: ID!): [Task!]!

    # Notifications
    notifications: [Notification!]!
    unreadNotificationsCount: Int!

    # Activity
    activities(projectId: ID, limit: Int): [Activity!]!
  }

  # ============================================
  # Mutations
  # ============================================

  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Organizations
    createOrganization(input: CreateOrganizationInput!): Organization!
    updateOrganization(id: ID!, input: UpdateOrganizationInput!): Organization!
    deleteOrganization(id: ID!): Boolean!
    inviteMember(organizationId: ID!, email: String!, role: Role!): OrganizationMember!
    removeMember(organizationId: ID!, userId: ID!): Boolean!
    updateMemberRole(organizationId: ID!, userId: ID!, role: Role!): OrganizationMember!

    # Projects
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!

    # Boards
    createBoard(input: CreateBoardInput!): Board!
    updateBoard(id: ID!, input: UpdateBoardInput!): Board!
    deleteBoard(id: ID!): Boolean!

    # Columns
    createColumn(input: CreateColumnInput!): Column!
    updateColumn(id: ID!, input: UpdateColumnInput!): Column!
    deleteColumn(id: ID!): Boolean!
    moveColumn(id: ID!, position: Int!): Column!

    # Tasks
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    moveTask(id: ID!, columnId: ID!, position: Int!): Task!
    assignTask(id: ID!, assigneeId: ID): Task!

    # Comments
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: ID!, content: String!): Comment!
    deleteComment(id: ID!): Boolean!

    # Notifications
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead: Boolean!
  }

  # ============================================
  # Inputs
  # ============================================

  input RegisterInput {
    email: String!
    name: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateOrganizationInput {
    name: String!
    slug: String!
  }

  input UpdateOrganizationInput {
    name: String
    logo: String
  }

  input CreateProjectInput {
    organizationId: ID!
    name: String!
    description: String
    color: String
  }

  input UpdateProjectInput {
    name: String
    description: String
    color: String
  }

  input CreateBoardInput {
    projectId: ID!
    name: String!
  }

  input UpdateBoardInput {
    name: String
    position: Int
  }

  input CreateColumnInput {
    boardId: ID!
    name: String!
    color: String
  }

  input UpdateColumnInput {
    name: String
    color: String
  }

  input CreateTaskInput {
    columnId: ID!
    title: String!
    description: String
    priority: Priority
    dueDate: DateTime
    assigneeId: ID
    parentId: ID
    tagIds: [ID!]
  }

  input UpdateTaskInput {
    title: String
    description: String
    priority: Priority
    dueDate: DateTime
    tagIds: [ID!]
  }

  input CreateCommentInput {
    taskId: ID!
    content: String!
  }

  # ============================================
  # Subscriptions
  # ============================================

  type Subscription {
    taskUpdated(boardId: ID!): Task!
    taskMoved(boardId: ID!): Task!
    commentAdded(taskId: ID!): Comment!
    notificationReceived: Notification!
    userPresence(organizationId: ID!): UserPresence!
  }

  type UserPresence {
    userId: ID!
    user: User!
    status: PresenceStatus!
    lastSeen: DateTime!
  }

  enum PresenceStatus {
    ONLINE
    AWAY
    OFFLINE
  }
`;
