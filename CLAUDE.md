# CLAUDE.md - Guide for AI Assistants

**Last Updated:** November 29, 2025 (Iteration 3)
**Project:** AgenticCMS - Code-First Headless CMS with AI Agent Integration
**Status:** ✅ MVP Complete! Core Architecture + Security + Testing Complete, All 192 Tests Passing

## ⚠️ CRITICAL: MUST DO IN EVERY ITERATION

**READ THIS FIRST BEFORE DOING ANY WORK!**

When completing an iteration, you MUST do ALL of the following:

### 1. 📝 Create iteration_X.md File
- Document what was built with code examples
- **Document what went WRONG (mistakes section)**
- Document lessons learned
- Include build/test status

### 2. ✅ Update todo.json
- **REMOVE completed tasks from their categories**
- Add `completedInIterationX` array
- Update version number (increment by 0.1)
- Update milestone progress percentages

### 3. 📚 Update CLAUDE.md
- Update "Last Updated" date and iteration number
- Update status line
- Add new patterns/gotchas discovered
- Update statistics (files, tests, etc.)

### 4. 🔨 ALWAYS Build & Test Incrementally
- **Test after EACH file creation:** `pnpm test`
- **Build after EACH feature:** `pnpm build`
- **Full build at end:** `pnpm build` from root
- **Never** write all code first, then test

### 5. 🧪 Write Tests for New Code IMMEDIATELY
- Create .test.ts file right after creating entity/function
- Run tests before moving to next feature
- Fix failures immediately, don't batch them

### 6. 💾 Commit and Push
- Create descriptive commit messages
- Push to the correct branch (starts with `claude/`)
- Never push to main/master

## 📖 Mistakes from Previous Iterations (LEARN FROM THESE!)

### Iteration 3 Mistakes:

1. **❌ Didn't Test Incrementally**
   - Wrote all code first, then tried to build
   - Result: Multiple errors to fix
   - **Fix:** Test after each file

2. **❌ Missing Dependency**
   - Forgot `reflect-metadata` for decorators
   - Result: Runtime errors
   - **Fix:** Check dependencies BEFORE writing code

3. **❌ Wrong Type Assumptions**
   - Assumed fields exist without checking types
   - Result: TypeScript errors
   - **Fix:** Check type definitions first

4. **❌ Didn't Update Docs Until End**
   - Waited to create iteration file
   - Result: Had to remember everything
   - **Fix:** Update docs as you go

## 🎯 Quick Context

You are working on **AgenticCMS**, a TypeScript monorepo that implements a headless CMS where:
- **TypeScript classes** are the single source of truth for DB schema, API, and AI behavior
- The core library exports **headless React hooks** (logic, not UI components)
- AI agents generate content using **GPT-4** with real-time updates via **Remult live queries**

## 📁 Project Structure

```
agenticcms/
├── packages/core/          # Shared business logic (THE BRAIN)
│   ├── src/entities/       # 9 entity classes (User, Classroom, StudentProfile, LessonPlan, etc.)
│   ├── src/hooks/          # 2 headless React hooks
│   ├── src/backend/        # AI agent execution engine
│   └── src/shared/         # @UIAction decorator system
├── apps/api/               # Fastify + Remult server (port 3001)
├── apps/web/               # Next.js 14 reference app (port 3000)
├── iteration_1.md          # Iteration 1 documentation (architecture setup)
├── iteration_2.md          # Iteration 2 documentation (security improvements)
├── iteration_3.md          # Iteration 3 documentation (testing & error handling)
├── todo.json               # Structured task list (38 remaining tasks, 10 completed)
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
   - ✅ **SECURED (Iteration 2)**: Hashed with bcrypt (salt rounds: 10)
   - User.password has `includeInApi: false`
   - Never store plain text passwords
   - Use `bcrypt.hash()` on registration, `bcrypt.compare()` on login

4. **Authentication:**
   - ✅ **SECURED (Iteration 2)**: JWT-based stateless authentication
   - Tokens expire after 7 days
   - Client sends `Authorization: Bearer <token>` header
   - Backend verifies JWT signature on every request
   - JWT_SECRET must be set in production (min 32 chars)

5. **Environment Variables:**
   - ✅ **VALIDATED (Iteration 2)**: Zod schema validates on server startup
   - Required: `DATABASE_URL`, `OPENAI_API_KEY`, `JWT_SECRET` (production only)
   - Server fails fast with clear errors if validation fails

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

- `apps/api/.env`: `DATABASE_URL`, `OPENAI_API_KEY`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`, `NODE_ENV`
- `apps/web/.env.local`: `NEXT_PUBLIC_API_URL`

**Note:** JWT_SECRET must be min 32 characters in production. In development, it auto-generates with a warning.

(See `.env.example` files)

**Running Tests:**
```bash
# Run all tests
pnpm test

# Run tests in watch mode
cd packages/core && pnpm test:watch

# Run tests with UI
cd packages/core && pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

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

1. **JWT Token Issues**
   - ✅ **FIXED (Iteration 2)**: Now using JWT tokens stored in localStorage
   - Tokens persist across page refreshes and server restarts
   - If auth fails, check that JWT_SECRET is set and consistent
   - Tokens expire after 7 days - users need to re-login

2. **Credits not updating**
   - Check that `allowApiUpdate: false` is set
   - Only modify via backend methods
   - Verify user ID is correctly extracted from JWT token

3. **AI generation not starting**
   - Verify `OPENAI_API_KEY` is set and valid
   - Check user has >= 10 credits
   - Look for errors in agent status/error fields
   - Check JWT token is being sent in Authorization header

4. **Environment validation errors**
   - Server now validates env vars on startup (Iteration 2)
   - If server fails to start, check error messages for missing variables
   - Ensure JWT_SECRET is set in production

## 📚 Key Files to Read

**Before making changes, read these in order:**

1. **iteration_2.md** - Latest iteration (security & infrastructure improvements)
2. **iteration_1.md** - Initial iteration (architecture setup)
3. **todo.json** - Task list (43 remaining tasks, 5 completed in iteration 2)
4. **README.md** - User-facing setup guide
5. **apps/api/src/env.ts** - Environment validation (NEW in iteration 2)
6. **apps/api/src/auth.ts** - JWT authentication (UPDATED in iteration 2)
7. **packages/core/src/entities/AgentResource.ts** - Agent base class
8. **packages/core/src/backend/agent-engine.ts** - Agent execution flow
9. **packages/core/src/entities/LessonPlan.ts** - Reference AI agent implementation

## 🎯 Current Priorities (from todo.json)

**✅ Completed in Iteration 3:**
- ✅ CRIT-004: Comprehensive error handling
- ✅ TEST-002: Write unit tests for all entities (192 tests!)
- ✅ FEAT-003: StudentProfile entity

**✅ MVP Milestone - COMPLETE! 🎉**
All 7 MVP tasks done! Ready for beta testing.

**Critical (must do before production):**
- CRIT-003: Database migrations support
- CRIT-005: Rate limiting and API security

**High Value (for Production):**
- FEAT-001: Role-based access control (unblocked by JWT)
- FEAT-002: Multi-tenant support
- TEST-003: Integration tests for agent flow
- TEST-005: API endpoint tests
- DEV-001: Docker configuration
- DEV-002: CI/CD pipeline

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
