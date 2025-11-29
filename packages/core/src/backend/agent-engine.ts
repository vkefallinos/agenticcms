import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { remult, repo } from 'remult';
import type { AgentResource } from '../entities/AgentResource';
import { User } from '../entities/User';
import { CreditTransaction } from '../entities/CreditTransaction';
import { Artifact } from '../entities/Artifact';
import { ForbiddenError } from 'remult';

export async function executeAgentFlow(agentInstance: AgentResource): Promise<void> {
  const currentRemult = remult;

  // 1. Auth & Quota Guard
  if (!currentRemult.user) {
    throw new ForbiddenError('Authentication required');
  }

  const userRepo = repo(User);
  const user = await userRepo.findId(currentRemult.user.id);

  if (!user) {
    throw new ForbiddenError('User not found');
  }

  if (user.credits < 10) {
    throw new ForbiddenError('Insufficient credits. Minimum 10 credits required.');
  }

  try {
    // 2. Context Phase
    agentInstance.status = 'gathering_context';
    await repo(agentInstance.constructor as any).save(agentInstance);

    const context = await agentInstance.resolveContext(currentRemult);

    // 3. Generation Phase
    agentInstance.status = 'generating';
    await repo(agentInstance.constructor as any).save(agentInstance);

    const systemPrompt = agentInstance.getSystemPrompt(context);
    const tools = agentInstance.getTools();

    const result = await generateText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      prompt: 'Generate the requested content based on the context provided.',
      tools,
      maxSteps: 10,
      onStepFinish: async (step) => {
        // Save after each step to trigger real-time updates
        await repo(agentInstance.constructor as any).save(agentInstance);
      },
    });

    // 4. Billing Phase
    const tokensUsed = result.usage.totalTokens;
    const costPerToken = 0.00001; // $0.01 per 1000 tokens
    const totalCost = Math.ceil(tokensUsed * costPerToken);

    agentInstance.cost = totalCost;
    agentInstance.metadata = {
      model: 'gpt-4-turbo',
      tokensUsed,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
    };

    // Atomic credit deduction
    user.credits -= totalCost;
    await userRepo.save(user);

    // Create credit transaction
    const transactionRepo = repo(CreditTransaction);
    await transactionRepo.insert({
      userId: user.id,
      amount: -totalCost,
      balanceAfter: user.credits,
      description: `Agent execution: ${agentInstance.constructor.name}`,
    });

    // 5. Artifact Phase
    agentInstance.status = 'compiling_artifacts';
    await repo(agentInstance.constructor as any).save(agentInstance);

    const artifacts = await agentInstance.generateArtifacts();
    const artifactRepo = repo(Artifact);

    for (const artifact of artifacts) {
      await artifactRepo.insert({
        parentId: agentInstance.id,
        fileName: artifact.fileName,
        fileType: artifact.type as any,
        url: `/mock-storage/${agentInstance.id}/${artifact.fileName}`,
        content: artifact.content,
      });
    }

    // 6. Completion
    agentInstance.status = 'completed';
    await repo(agentInstance.constructor as any).save(agentInstance);
  } catch (error) {
    agentInstance.status = 'failed';
    agentInstance.error = error instanceof Error ? error.message : String(error);
    await repo(agentInstance.constructor as any).save(agentInstance);
    throw error;
  }
}
