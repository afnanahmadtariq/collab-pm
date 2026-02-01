import { gql } from "@apollo/client";

// ============================================
// User & Auth
// ============================================

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      avatar
      memberships {
        id
        role
        organization {
          id
          name
          slug
          logo
        }
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        avatar
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        avatar
      }
    }
  }
`;

// ============================================
// Organizations
// ============================================

export const ORGANIZATIONS_QUERY = gql`
  query Organizations {
    organizations {
      id
      name
      slug
      logo
      members {
        id
        role
        user {
          id
          name
          email
          avatar
        }
      }
    }
  }
`;

export const ORGANIZATION_QUERY = gql`
  query Organization($id: ID!) {
    organization(id: $id) {
      id
      name
      slug
      logo
      members {
        id
        role
        user {
          id
          name
          email
          avatar
        }
      }
      projects {
        id
        name
        description
        color
      }
    }
  }
`;

export const CREATE_ORGANIZATION_MUTATION = gql`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      id
      name
      slug
      logo
    }
  }
`;

// ============================================
// Projects
// ============================================

export const PROJECTS_QUERY = gql`
  query Projects($organizationId: ID!) {
    projects(organizationId: $organizationId) {
      id
      name
      description
      color
      boards {
        id
        name
      }
    }
  }
`;

export const PROJECT_QUERY = gql`
  query Project($id: ID!) {
    project(id: $id) {
      id
      name
      description
      color
      boards {
        id
        name
        position
        columns {
          id
          name
          position
          color
          tasks {
            id
            title
            description
            position
            priority
            dueDate
            assignee {
              id
              name
              avatar
            }
            creator {
              id
              name
              avatar
            }
            subtasks {
              id
              title
            }
            tags {
              id
              name
              color
            }
            comments {
              id
            }
            attachments {
              id
            }
          }
        }
      }
    }
  }
`;

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      color
      boards {
        id
        name
        columns {
          id
          name
          position
          color
        }
      }
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      description
      color
    }
  }
`;

export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

// ============================================
// Board
// ============================================

export const BOARD_QUERY = gql`
  query Board($id: ID!) {
    board(id: $id) {
      id
      name
      position
      columns {
        id
        name
        position
        color
        tasks {
          id
          title
          description
          position
          priority
          dueDate
          assignee {
            id
            name
            avatar
          }
          creator {
            id
            name
            avatar
          }
          subtasks {
            id
            title
          }
          tags {
            id
            name
            color
          }
          comments {
            id
          }
          attachments {
            id
          }
        }
      }
    }
  }
`;

// ============================================
// Tasks
// ============================================

export const TASK_QUERY = gql`
  query Task($id: ID!) {
    task(id: $id) {
      id
      title
      description
      position
      priority
      dueDate
      createdAt
      updatedAt
      column {
        id
        name
        color
        board {
          id
          name
          project {
            id
            name
          }
        }
      }
      assignee {
        id
        name
        email
        avatar
      }
      creator {
        id
        name
        avatar
      }
      subtasks {
        id
        title
        description
        priority
      }
      tags {
        id
        name
        color
      }
      comments {
        id
        content
        createdAt
        author {
          id
          name
          avatar
        }
      }
      attachments {
        id
        name
        url
        size
        mimeType
        createdAt
      }
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      position
      priority
      dueDate
      columnId
      assignee {
        id
        name
        avatar
      }
      creator {
        id
        name
        avatar
      }
    }
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      description
      priority
      dueDate
    }
  }
`;

export const MOVE_TASK_MUTATION = gql`
  mutation MoveTask($id: ID!, $columnId: ID!, $position: Int!) {
    moveTask(id: $id, columnId: $columnId, position: $position) {
      id
      columnId
      position
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

// ============================================
// Comments
// ============================================

export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      createdAt
      author {
        id
        name
        avatar
      }
    }
  }
`;

// ============================================
// Notifications
// ============================================

export const NOTIFICATIONS_QUERY = gql`
  query Notifications {
    notifications {
      id
      title
      message
      read
      createdAt
    }
    unreadNotificationsCount
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

// ============================================
// Activity
// ============================================

export const ACTIVITIES_QUERY = gql`
  query Activities($projectId: ID, $limit: Int) {
    activities(projectId: $projectId, limit: $limit) {
      id
      action
      metadata
      createdAt
      user {
        id
        name
        avatar
      }
      project {
        id
        name
      }
      task {
        id
        title
      }
    }
  }
`;

// ============================================
// Search
// ============================================

export const SEARCH_TASKS_QUERY = gql`
  query SearchTasks($query: String!, $organizationId: ID!) {
    searchTasks(query: $query, organizationId: $organizationId) {
      id
      title
      description
      priority
      column {
        id
        name
        board {
          id
          project {
            id
            name
          }
        }
      }
    }
  }
`;
