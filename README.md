# AgenticCMS - Headless CMS with AI Agent Integration

A "Code-First" Headless CMS where TypeScript classes serve as the single source of truth for Database Schema, REST API endpoints, and AI Agent behavior.

## 🏗️ Architecture

This is a monorepo containing:

- **packages/core** - Shared business logic, entities, and headless React hooks
- **apps/api** - Fastify backend server with Remult and AI integration
- **apps/web** - Next.js frontend application (School App reference implementation)

## 🚀 Key Features

- **Headless Architecture**: Core library exports React Hooks (logic), not UI components
- **AI-Powered Content Generation**: LessonPlan entity uses GPT-4 to generate educational content
- **Real-time Updates**: Live queries synchronize data between backend and frontend
- **Credit System**: Immutable user credits with transaction ledger
- **Code-First**: Single TypeScript class definition creates DB schema + API + UI actions

## 📋 Tech Stack

- **Package Manager**: pnpm
- **Language**: TypeScript 5.0+ (Strict Mode)
- **Backend**: Fastify v4 + Remult v4 (Isomorphic ORM)
- **AI Engine**: Vercel AI SDK v3 + OpenAI GPT-4
- **Database**: PostgreSQL
- **Frontend**: Next.js v14 (App Router) + Tailwind CSS
- **Icons**: Lucide React

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

#### API Server (apps/api/.env)

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/agenticcms
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-openai-api-key
```

#### Web App (apps/web/.env.local)

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Set Up Database

Create a PostgreSQL database:

```bash
createdb agenticcms
```

The database schema will be automatically created by Remult when you start the API server.

### 4. Start Development Servers

Start all services:

```bash
pnpm dev
```

Or start individually:

```bash
# API Server (port 3001)
cd apps/api
pnpm dev

# Web App (port 3000)
cd apps/web
pnpm dev
```

## 📖 Usage Guide

### 1. Register a New User

1. Navigate to http://localhost:3000
2. Click "Register"
3. Fill in your details (new users get 100 free credits)
4. You'll be automatically logged in

### 2. Create a Classroom

1. From the Teacher Dashboard, click "New Classroom"
2. Enter classroom details (name, grade level, subject)
3. Click "Create"

### 3. Generate a Lesson Plan

1. Open a classroom
2. Click "New Lesson Plan"
3. Enter a topic (e.g., "Introduction to Fractions")
4. Click "Create"
5. On the lesson page, click "Start Generator"
6. Watch as the AI generates:
   - Lesson title
   - Learning objectives
   - Content sections (Introduction, Main Content, Activities, Assessment)
   - Duration estimate
   - Downloadable HTML artifact

## 🏛️ Core Architecture Concepts

### Entity Inheritance Chain

```
IdEntity (Remult)
  └── BaseRecord (id, createdAt, updatedAt)
      ├── StaticResource (ownerId, organizationId)
      │   └── Classroom (name, gradeLevel, subject)
      │
      └── AgentResource (status, cost, metadata)
          └── LessonPlan (topic, title, content, objectives)
```

### The Agent Flow

When you call `startAgent()` on an `AgentResource`:

1. **Auth & Quota Guard**: Verifies user has sufficient credits (minimum 10)
2. **Context Phase**: Calls `resolveContext()` to fetch parent resource data
3. **Generation Phase**:
   - Constructs system prompt via `getSystemPrompt()`
   - Executes AI with tools from `getTools()`
   - Each tool call saves the entity, triggering real-time UI updates
4. **Billing Phase**:
   - Calculates cost based on token usage
   - Atomically deducts credits from user
   - Creates immutable `CreditTransaction` record
5. **Artifact Phase**: Calls `generateArtifacts()` to create downloadable files
6. **Completion**: Sets status to 'completed'

### Headless Hooks

The `useAgentResource` hook provides:

- **Live Query**: Real-time entity updates
- **Artifacts**: Auto-loads when status is 'completed'
- **Actions**: Auto-generates UI actions from `@UIAction` decorators
  - `execute()` - Calls the backend method
  - `canExecute` - Evaluates the condition function
  - `isLoading` - Tracks execution state
  - `metadata` - Label, icon, variant

## 🎓 Example: Creating a Custom AgentResource

```typescript
import { Entity, Fields } from 'remult';
import { AgentResource } from '@agenticcms/core';
import { z } from 'zod';

@Entity('story_generator')
export class StoryGenerator extends AgentResource {
  @Fields.string()
  genre!: string;

  @Fields.string()
  storyText: string = '';

  async resolveContext(remult: Remult) {
    return { genre: this.genre };
  }

  getSystemPrompt(context: any) {
    return `You are a creative writer. Write a ${context.genre} story.`;
  }

  getTools() {
    return {
      writeText: {
        description: 'Write story text',
        parameters: z.object({
          text: z.string(),
        }),
        execute: async ({ text }) => {
          this.storyText += text;
          await repo(StoryGenerator).save(this);
          return 'Text added';
        },
      },
    };
  }

  async generateArtifacts() {
    return [
      {
        fileName: 'story.txt',
        type: 'text',
        content: this.storyText,
      },
    ];
  }
}
```

## 🔒 Security Features

- **Immutable Credits**: `User.credits` has `allowApiUpdate: false`
- **Append-Only Ledger**: `CreditTransaction` has `allowApiCrud: false`
- **Password Hiding**: User password has `includeInApi: false`
- **Authentication**: All CRUD operations require `'authenticated'`

## 📚 Project Structure

```
agenticcms/
├── apps/
│   ├── api/                 # Fastify server
│   │   └── src/
│   │       ├── server.ts    # Main server setup
│   │       ├── auth.ts      # Authentication middleware
│   │       └── routes.ts    # Custom API routes
│   │
│   └── web/                 # Next.js app
│       └── src/
│           ├── app/         # App Router pages
│           ├── components/  # UI components
│           └── lib/         # Utilities
│
├── packages/
│   └── core/                # Shared library
│       └── src/
│           ├── entities/    # Data models
│           ├── hooks/       # React hooks
│           ├── backend/     # Agent engine
│           └── shared/      # Decorators
│
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # pnpm workspace definition
└── turbo.json              # Turborepo pipeline
```

## 🧪 Testing the Agent Flow

1. Ensure you have OpenAI API credits
2. Create a classroom and lesson plan
3. Monitor the console to see:
   - Context resolution
   - AI tool calls (setTitle, addSection, addObjective)
   - Real-time status updates
   - Credit deduction
   - Artifact generation

## 🔧 Development Tips

- **Hot Reload**: Both API and web apps support hot reload
- **Type Safety**: Shared entities ensure type safety across frontend/backend
- **Live Queries**: Use Chrome DevTools Network tab to see WebSocket updates
- **Database Inspection**: Use `psql` or a GUI tool to inspect the auto-generated schema

## 📝 Future Enhancements

- [ ] JWT-based authentication
- [ ] Password hashing (bcrypt/argon2)
- [ ] File upload to S3/cloud storage
- [ ] Multi-tenant support
- [ ] Role-based access control
- [ ] Stripe integration for credit purchases
- [ ] PDF artifact generation
- [ ] Collaborative editing

## 🤝 Contributing

This is a reference implementation demonstrating the AgenticCMS architecture. Feel free to extend it with additional entities and agent behaviors.

## 📄 License

MIT
