import { describe, it, expect, beforeEach } from 'vitest';
import { Entity } from 'remult';
import { AgentResource, type AgentStatus } from './AgentResource';
import type { Remult } from 'remult';
import type { CoreTool } from 'ai';
import { z } from 'zod';

// Create a concrete test class for testing AgentResource
@Entity('test_agent_resources')
class TestAgentResource extends AgentResource {
  testField: string = '';

  async resolveContext(remult: Remult): Promise<any> {
    return { testContext: 'test data' };
  }

  getSystemPrompt(context: any): string {
    return 'Test system prompt';
  }

  getTools(): Record<string, CoreTool> {
    return {
      testTool: {
        description: 'A test tool',
        parameters: z.object({
          value: z.string(),
        }),
        execute: async ({ value }) => {
          this.testField = value;
          return `Set to ${value}`;
        },
      },
    };
  }

  async generateArtifacts(): Promise<Array<{ fileName: string; type: string; content: string }>> {
    return [
      {
        fileName: 'test.html',
        type: 'html',
        content: '<html><body>Test</body></html>',
      },
    ];
  }
}

describe('AgentResource Entity', () => {
  let resource: TestAgentResource;

  beforeEach(() => {
    resource = new TestAgentResource();
  });

  describe('Basic Properties', () => {
    it('should create an agent resource instance', () => {
      expect(resource).toBeInstanceOf(AgentResource);
      expect(resource).toBeInstanceOf(TestAgentResource);
    });

    it('should have default idle status', () => {
      expect(resource.status).toBe('idle');
    });

    it('should have default zero cost', () => {
      expect(resource.cost).toBe(0);
    });

    it('should have default empty metadata', () => {
      expect(resource.metadata).toEqual({});
    });

    it('should allow setting parent resource ID', () => {
      resource.parentResourceId = 'classroom-123';
      expect(resource.parentResourceId).toBe('classroom-123');
    });

    it('should allow setting parent resource type', () => {
      resource.parentResourceType = 'Classroom';
      expect(resource.parentResourceType).toBe('Classroom');
    });
  });

  describe('Status Transitions', () => {
    it('should allow setting status to gathering_context', () => {
      resource.status = 'gathering_context';
      expect(resource.status).toBe('gathering_context');
    });

    it('should allow setting status to generating', () => {
      resource.status = 'generating';
      expect(resource.status).toBe('generating');
    });

    it('should allow setting status to compiling_artifacts', () => {
      resource.status = 'compiling_artifacts';
      expect(resource.status).toBe('compiling_artifacts');
    });

    it('should allow setting status to completed', () => {
      resource.status = 'completed';
      expect(resource.status).toBe('completed');
    });

    it('should allow setting status to failed', () => {
      resource.status = 'failed';
      expect(resource.status).toBe('failed');
    });

    it('should track a typical status flow', () => {
      const statuses: AgentStatus[] = [];

      resource.status = 'idle';
      statuses.push(resource.status);

      resource.status = 'gathering_context';
      statuses.push(resource.status);

      resource.status = 'generating';
      statuses.push(resource.status);

      resource.status = 'compiling_artifacts';
      statuses.push(resource.status);

      resource.status = 'completed';
      statuses.push(resource.status);

      expect(statuses).toEqual([
        'idle',
        'gathering_context',
        'generating',
        'compiling_artifacts',
        'completed',
      ]);
    });
  });

  describe('Cost Tracking', () => {
    it('should allow setting cost', () => {
      resource.cost = 15.5;
      expect(resource.cost).toBe(15.5);
    });

    it('should support decimal costs', () => {
      resource.cost = 0.00123;
      expect(resource.cost).toBe(0.00123);
    });

    it('should support large costs', () => {
      resource.cost = 10000;
      expect(resource.cost).toBe(10000);
    });
  });

  describe('Metadata', () => {
    it('should allow setting metadata', () => {
      resource.metadata = { tokensUsed: 1500, model: 'gpt-4' };
      expect(resource.metadata.tokensUsed).toBe(1500);
      expect(resource.metadata.model).toBe('gpt-4');
    });

    it('should support nested metadata', () => {
      resource.metadata = {
        generation: {
          tokensUsed: 1500,
          promptTokens: 100,
          completionTokens: 1400,
        },
      };
      expect(resource.metadata.generation.tokensUsed).toBe(1500);
      expect(resource.metadata.generation.promptTokens).toBe(100);
    });

    it('should allow adding metadata incrementally', () => {
      resource.metadata.step1 = 'complete';
      resource.metadata.step2 = 'in progress';

      expect(resource.metadata.step1).toBe('complete');
      expect(resource.metadata.step2).toBe('in progress');
    });
  });

  describe('Error Handling', () => {
    it('should allow setting error message', () => {
      resource.error = 'Insufficient credits';
      expect(resource.error).toBe('Insufficient credits');
    });

    it('should have undefined error by default', () => {
      expect(resource.error).toBeUndefined();
    });

    it('should represent a failed state', () => {
      resource.status = 'failed';
      resource.error = 'AI service unavailable';

      expect(resource.status).toBe('failed');
      expect(resource.error).toBe('AI service unavailable');
    });
  });

  describe('Abstract Methods Implementation', () => {
    it('should implement resolveContext', async () => {
      const context = await resource.resolveContext({} as Remult);
      expect(context).toEqual({ testContext: 'test data' });
    });

    it('should implement getSystemPrompt', () => {
      const prompt = resource.getSystemPrompt({});
      expect(prompt).toBe('Test system prompt');
    });

    it('should implement getTools', () => {
      const tools = resource.getTools();
      expect(tools).toHaveProperty('testTool');
      expect(tools.testTool).toBeDefined();
    });

    it('should implement generateArtifacts', async () => {
      const artifacts = await resource.generateArtifacts();
      expect(artifacts).toHaveLength(1);
      expect(artifacts[0].fileName).toBe('test.html');
      expect(artifacts[0].type).toBe('html');
      expect(artifacts[0].content).toContain('<html>');
    });
  });

  describe('Inheritance from BaseRecord', () => {
    it('should inherit id from BaseRecord', () => {
      resource.id = 'agent-123';
      expect(resource.id).toBe('agent-123');
    });

    it('should inherit timestamp fields from BaseRecord', () => {
      const now = new Date();
      resource.createdAt = now;
      resource.updatedAt = now;

      expect(resource.createdAt).toBe(now);
      expect(resource.updatedAt).toBe(now);
    });
  });

  describe('Complete Agent Resource Creation', () => {
    it('should create a complete agent resource with all properties', () => {
      const now = new Date();
      const completeResource = new TestAgentResource();

      completeResource.id = 'agent-999';
      completeResource.parentResourceId = 'classroom-999';
      completeResource.parentResourceType = 'Classroom';
      completeResource.status = 'completed';
      completeResource.cost = 25.5;
      completeResource.metadata = {
        tokensUsed: 2000,
        model: 'gpt-4-turbo',
        duration: 15000,
      };
      completeResource.createdAt = now;
      completeResource.updatedAt = now;

      expect(completeResource.id).toBe('agent-999');
      expect(completeResource.parentResourceId).toBe('classroom-999');
      expect(completeResource.parentResourceType).toBe('Classroom');
      expect(completeResource.status).toBe('completed');
      expect(completeResource.cost).toBe(25.5);
      expect(completeResource.metadata.tokensUsed).toBe(2000);
      expect(completeResource.createdAt).toBe(now);
      expect(completeResource.updatedAt).toBe(now);
    });
  });
});
