# @collab-pm/api

Backend API for Collab-PM - a modern project management tool with real-time collaboration.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **API**: GraphQL (Apollo Server)
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Auth**: JWT

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (optional, for caching and real-time features)

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your database connection string.

4. Generate Prisma client:
   ```bash
   pnpm db:generate
   ```

5. Run database migrations:
   ```bash
   pnpm db:migrate
   ```

6. Start development server:
   ```bash
   pnpm dev
   ```

The GraphQL playground will be available at `http://localhost:4000/graphql`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:push` | Push schema changes (dev only) |
| `pnpm db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── graphql/
│   ├── schema.ts          # GraphQL type definitions
│   ├── context.ts         # Request context
│   └── resolvers/
│       └── index.ts       # GraphQL resolvers
├── lib/
│   ├── auth.ts            # JWT utilities
│   ├── prisma.ts          # Prisma client
│   └── redis.ts           # Redis client
├── socket/
│   └── index.ts           # Socket.IO handlers
└── index.ts               # App entry point
```

## API Documentation

### Authentication

All authenticated requests require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

### Example Queries

```graphql
# Get current user
query {
  me {
    id
    name
    email
  }
}

# Get organizations
query {
  organizations {
    id
    name
    projects {
      id
      name
    }
  }
}
```

### Example Mutations

```graphql
# Register
mutation {
  register(input: {
    email: "user@example.com"
    name: "John Doe"
    password: "securepassword"
  }) {
    token
    user {
      id
      name
    }
  }
}

# Create a task
mutation {
  createTask(input: {
    columnId: "column-id"
    title: "New Task"
    priority: HIGH
  }) {
    id
    title
  }
}
```

## Real-time Events

Connect via Socket.IO with authentication:

```javascript
const socket = io("http://localhost:4000", {
  auth: { token: "your-jwt-token" }
});

// Join a board for updates
socket.emit("join:board", boardId);

// Listen for task updates
socket.on("task:updated", (task) => {
  console.log("Task updated:", task);
});
```
