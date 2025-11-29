import { Entity, Fields, BackendMethod } from 'remult';
import { BaseRecord } from './BaseRecord';
import type { Remult } from 'remult';
import type { CoreTool } from 'ai';
import { UIAction } from '../shared/decorators';
import { executeAgentFlow } from '../backend/agent-engine';

export type AgentStatus =
  | 'idle'
  | 'gathering_context'
  | 'generating'
  | 'compiling_artifacts'
  | 'completed'
  | 'failed';

@Entity('agent_resources', {
  allowApiCrud: 'authenticated',
})
export abstract class AgentResource extends BaseRecord {
  @Fields.string()
  parentResourceId!: string;

  @Fields.string()
  parentResourceType!: string;

  @Fields.string<AgentResource, AgentStatus>()
  status: AgentStatus = 'idle';

  @Fields.number()
  cost: number = 0;

  @Fields.json()
  metadata: Record<string, any> = {};

  @Fields.string({ allowNull: true })
  error?: string;

  // Abstract methods that subclasses must implement
  abstract resolveContext(remult: Remult): Promise<any>;
  abstract getSystemPrompt(context: any): string;
  abstract getTools(): Record<string, CoreTool>;
  abstract generateArtifacts(): Promise<Array<{ fileName: string; type: string; content: string }>>;

  @UIAction({
    label: 'Start Generator',
    icon: 'Sparkles',
    variant: 'primary',
    condition: (instance: AgentResource) => instance.status === 'idle' || instance.status === 'failed',
  })
  @BackendMethod({ allowed: true })
  async startAgent(): Promise<void> {
    await executeAgentFlow(this);
  }
}
