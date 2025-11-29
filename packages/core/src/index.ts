// Base Entities
export { BaseRecord } from './entities/BaseRecord';
export { StaticResource } from './entities/StaticResource';
export { AgentResource, type AgentStatus } from './entities/AgentResource';

// Concrete Entities
export { User, type UserRole } from './entities/User';
export { CreditTransaction } from './entities/CreditTransaction';
export { Artifact, type FileType } from './entities/Artifact';
export { Classroom } from './entities/Classroom';
export { StudentProfile } from './entities/StudentProfile';
export { LessonPlan } from './entities/LessonPlan';

// Hooks
export { useAgentResource, type UseAgentResourceResult, type AgentResourceAction } from './hooks/useAgentResource';
export { useStaticResource, type UseStaticResourceResult } from './hooks/useStaticResource';

// Decorators & Utilities
export { UIAction, getUIActions, type UIActionMetadata } from './shared/decorators';

// Backend
export { executeAgentFlow } from './backend/agent-engine';
