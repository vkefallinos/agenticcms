# CLAUDE.md - Guide for AI Assistants

**Last Updated:** November 29, 2025
**Project:** AgenticCMS - Code-First Headless CMS with AI Agent Integration
**Status:** ✅ Core Architecture Complete, Builds Successfully

## 🎯 Quick Context

You are working on **AgenticCMS**, a TypeScript monorepo that implements a headless CMS where:
- **TypeScript classes** are the single source of truth for DB schema, API, and AI behavior
- The core library exports **headless React hooks** (logic, not UI components)
- AI agents generate content using **GPT-4** with real-time updates via **Remult live queries**

## 📁 Project Structure

```
agenticcms/
├── packages/core/          # Shared business logic (THE BRAIN)
│   ├── src/entities/       # 8 entity classes (User, Classroom, LessonPlan, etc.)
│   ├── src/hooks/          # 2 headless React hooks
│   ├── src/backend/        # AI agent execution engine
│   └── src/shared/         # @UIAction decorator system
├── apps/api/               # Fastify + Remult server (port 3001)
├── apps/web/               # Next.js 14 reference app (port 3000)
├── iteration_1.md          # Complete documentation of what's been built
├── todo.json               # Structured task list (48 tasks)
└── README.md               # User-facing documentation
```

## 🏗️ Core Architecture Patterns

### 1. Entity Inheritance Chain

**ALL entities follow this hierarchy:**

```
IdEntity (Remult)
  └── BaseRecord (id, createdAt, updatedAt)
      ├── StaticResource (ownerId, organizationId)
      │   └── Classroom, StudentProfile, etc.
      │
      └── AgentResource (status, cost, metadata, error)
          └── LessonPlan, QuizGenerator, etc.
```

**Key Rule:** When creating new entities, ALWAYS extend from `StaticResource` OR `AgentResource`, never from `BaseRecord` directly.

### 2. The AgentResource Pattern (Template Method)

**Every AI-powered entity must implement 4 abstract methods:**

```typescript
abstract resolveContext(remult: Remult): Promise<any>
  // What data does the AI need? Fetch parent resources, user prefs, etc.

abstract getSystemPrompt(context: any): string
  // How should the AI behave? Return the system prompt.

abstract getTools(): Record<string, CoreTool>
  // What can the AI do? Return Vercel AI SDK tools.
  // CRITICAL: Each tool's execute() must call repo(ThisEntity).save(this)

abstract generateArtifacts(): Promise<Array<{fileName, type, content}>>
  // What files to create? Generate HTML, PDF, JSON, etc.
```

**The `startAgent()` method is already implemented in base class and handles:**
- Auth & credit checking (minimum 10 credits)
- Status updates (idle → gathering_context → generating → compiling_artifacts → completed)
- Real-time saves (triggers live queries on frontend)
- Billing (token counting, atomic credit deduction)
- Error handling (sets status to 'failed')

### 3. Headless Hooks Pattern

**The core library exports hooks that return DATA + ACTIONS, not JSX:**

```typescript
// For AI-powered entities
const { record, isLoading, artifacts, actions } = useAgentResource(LessonPlan, id);
// actions.startAgent.execute() - calls backend method
// actions.startAgent.canExecute - boolean from @UIAction condition
// actions.startAgent.metadata - { label, icon, variant }

// For static entities
const { items, isLoading, create, update, delete } = useStaticResource(Classroom);
```

**Why headless?** Consumers can build any UI they want. We provide business logic only.

### 4. @UIAction Decorator System

**Backend methods can declare UI metadata:**

```typescript
@UIAction({
  label: 'Start Generator',
  icon: 'Sparkles',           // Lucide icon name
  variant: 'primary',
  condition: (instance) => instance.status === 'idle'
})
@BackendMethod({ allowed: true })
async startAgent() { ... }
```

**This metadata is auto-discovered by `useAgentResource` and transformed into executable actions.**

## 🚨 Critical Constraints

### Security (MUST follow)

1. **User.credits field:**
   - Has `allowApiUpdate: false` - CANNOT be modified via API
   - Only backend code can change it
   - Always use atomic updates with transaction logging

2. **CreditTransaction:**
   - Has `allowApiCrud: false` - append-only ledger
   - Never delete or update transactions

3. **Passwords:**
   - Currently stored in PLAIN TEXT (⚠️ CRITICAL TODO)
   - User.password has `includeInApi: false`

4. **Authentication:**
   - Currently simple session-based (in-memory, not production-ready)
   - Sessions via `x-session-id` header

### TypeScript Build Requirements

1. **packages/core/tsconfig.json must have:**
   ```json
   "lib": ["ES2020", "DOM"],  // DOM needed for console, etc.
   "experimentalDecorators": true,
   "emitDecoratorMetadata": true
   ```

2. **Remult Live Query API:**
   ```typescript
   // ✅ CORRECT (as of Remult 0.26)
   repository.liveQuery({...}).subscribe({
     next: (info) => setItems(info.items)  // info.items, not just info
   })

   // ❌ WRONG
   next: (items) => setItems(items)  // Type error
   ```

3. **Module imports in apps/api:**
   - Use `.js` extensions: `import { foo } from './auth.js'`
   - Due to `"type": "module"` in package.json

4. **Entity registration:**
   - Import concrete classes only, not abstract ones
   - Filter exports: `[User, Classroom, LessonPlan]` not `Object.values(entities)`

## 📝 Common Tasks

### Adding a New Static Entity

```typescript
// 1. Create entity in packages/core/src/entities/
import { Entity, Fields } from 'remult';
import { StaticResource } from './StaticResource';

@Entity('students')
export class Student extends StaticResource {
  @Fields.string()
  name!: string;

  @Fields.number()
  age!: number;
}

// 2. Export in packages/core/src/index.ts
export { Student } from './entities/Student';

// 3. Register in apps/api/src/server.ts
import { Student } from '@agenticcms/core';
const api = remultFastify({
  entities: [User, ..., Student],
});

// 4. Use in frontend with hook
const { items, create } = useStaticResource(Student);
```

### Adding a New AI Agent Entity

```typescript
// 1. Create entity extending AgentResource
@Entity('quiz_generators')
export class QuizGenerator extends AgentResource {
  @Fields.string()
  difficulty!: string;

  @Fields.json()
  questions: any[] = [];

  async resolveContext(remult: Remult) {
    const lesson = await repo(LessonPlan).findId(this.parentResourceId);
    return { lessonContent: lesson.content };
  }

  getSystemPrompt(context: any) {
    return `Generate quiz questions based on: ${context.lessonContent}`;
  }

  getTools() {
    return {
      addQuestion: {
        description: 'Add a quiz question',
        parameters: z.object({
          question: z.string(),
          answer: z.string()
        }),
        execute: async ({ question, answer }) => {
          this.questions.push({ question, answer });
          await repo(QuizGenerator).save(this); // ⚠️ CRITICAL - must save!
          return 'Question added';
        }
      }
    };
  }

  async generateArtifacts() {
    return [{
      fileName: 'quiz.json',
      type: 'json',
      content: JSON.stringify(this.questions, null, 2)
    }];
  }
}

// 2-4. Same as static entity (export, register, use)
```

### Debugging Real-time Updates

If live queries aren't working:

1. **Check WebSocket connection** in browser DevTools → Network → WS
2. **Verify entity saves** - every mutation must call `repo(Entity).save(instance)`
3. **Check subscription** - `subscribe()` returns cleanup function, call it in useEffect cleanup
4. **Remult API response format** - `info.items` not just `items`

### Running the Project

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode (all apps)
pnpm dev

# Individual apps
cd apps/api && pnpm dev    # Port 3001
cd apps/web && pnpm dev    # Port 3000
```

**Environment Variables Required:**

- `apps/api/.env`: `DATABASE_URL`, `OPENAI_API_KEY`, `FRONTEND_URL`
- `apps/web/.env.local`: `NEXT_PUBLIC_API_URL`

(See `.env.example` files)

## 🐛 Known Issues & Gotchas

### Build Failures

1. **"Cannot find 'console'"**
   → Add `"DOM"` to `lib` array in tsconfig.json

2. **"remult-fastify not found"**
   → This package doesn't exist, use `remult/remult-fastify` import instead

3. **"Type 'T[]' not assignable to 'T'"**
   → Remult's `insert()` can return array, handle both: `Array.isArray(result) ? result[0] : result`

4. **"Failed to fetch fonts.googleapis.com"**
   → Network isolation issue, remove `next/font/google` imports, use Tailwind fonts

5. **Turbo "pipeline field instead of tasks"**
   → Turbo v2 changed `pipeline` → `tasks` in turbo.json

### Runtime Issues

1. **Session not persisting**
   - Currently in-memory sessions, lost on server restart
   - Use localStorage on client to store sessionId

2. **Credits not updating**
   - Check that `allowApiUpdate: false` is set
   - Only modify via backend methods

3. **AI generation not starting**
   - Verify `OPENAI_API_KEY` is set
   - Check user has >= 10 credits
   - Look for errors in agent status/error fields

## 📚 Key Files to Read

**Before making changes, read these in order:**

1. **iteration_1.md** - Complete documentation of current iteration
2. **todo.json** - Task list (critical tasks marked CRIT-001, etc.)
3. **README.md** - User-facing setup guide
4. **packages/core/src/entities/AgentResource.ts** - Agent base class
5. **packages/core/src/backend/agent-engine.ts** - Agent execution flow
6. **packages/core/src/entities/LessonPlan.ts** - Reference AI agent implementation

## 🎯 Current Priorities (from todo.json)

**Critical (must do before production):**
- CRIT-002: Password hashing (bcrypt/argon2)
- CRIT-001: JWT authentication
- IMPR-006: Fix session management in remult.ts

**High Value (for MVP):**
- FEAT-001: Role-based access control
- TEST-001: Set up Vitest
- TEST-002: Entity unit tests

## 💡 Tips for Working with This Codebase

1. **Follow the patterns** - Don't reinvent. Copy LessonPlan when making new agents.

2. **Read before writing** - Check iteration_1.md for architectural decisions.

3. **Type safety first** - Use strict TypeScript, avoid `any` where possible.

4. **Test locally** - Run `pnpm build` before committing.

5. **Update documentation** - If you make significant changes, update iteration_1.md and todo.json.

6. **Respect the inheritance chain** - Never bypass StaticResource/AgentResource.

7. **Real-time is key** - Every mutation must trigger live query updates via `save()`.

8. **Credits are sacred** - Never expose credit manipulation to API.

## 🔗 External References

- **Remult Docs:** https://remult.dev
- **Vercel AI SDK:** https://sdk.vercel.ai/docs
- **Next.js 14:** https://nextjs.org/docs
- **Fastify:** https://fastify.dev
- **Zod:** https://zod.dev

## 📞 Getting Help

1. Check **iteration_1.md** for "Known Limitations"
2. Search **todo.json** for related tasks
3. Review **README.md** for setup issues
4. Check this file (CLAUDE.md) for common patterns

---

**Remember:** This is a Code-First architecture. The TypeScript classes ARE the schema. Don't fight the abstractions - extend them properly and everything will work beautifully. ✨
