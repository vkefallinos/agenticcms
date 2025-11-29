import { useState, useEffect, useCallback } from 'react';
import { repo } from 'remult';
import type { AgentResource } from '../entities/AgentResource';
import type { Artifact } from '../entities/Artifact';
import { getUIActions, type UIActionMetadata } from '../shared/decorators';

export interface AgentResourceAction {
  execute: () => Promise<void>;
  canExecute: boolean;
  isLoading: boolean;
  metadata: UIActionMetadata;
}

export interface UseAgentResourceResult<T extends AgentResource> {
  record: T | undefined;
  isLoading: boolean;
  artifacts: Artifact[];
  actions: Record<string, AgentResourceAction>;
}

export function useAgentResource<T extends AgentResource>(
  EntityClass: new () => T,
  id: string
): UseAgentResourceResult<T> {
  const [record, setRecord] = useState<T | undefined>();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingStates, setActionLoadingStates] = useState<Record<string, boolean>>({});

  // Live query for the agent resource
  useEffect(() => {
    const repository = repo(EntityClass);

    const unsubscribe = repository.liveQuery({
      where: { id } as any,
    }).subscribe({
      next: (items) => {
        setRecord(items[0]);
        setIsLoading(false);
      },
      error: (error) => {
        console.error('Error in live query:', error);
        setIsLoading(false);
      },
    });

    return () => unsubscribe();
  }, [EntityClass, id]);

  // Load artifacts when status is completed
  useEffect(() => {
    if (record?.status === 'completed') {
      const artifactRepo = repo(Artifact);
      artifactRepo
        .find({
          where: { parentId: id },
        })
        .then(setArtifacts)
        .catch(console.error);
    }
  }, [record?.status, id]);

  // Build actions from @UIAction metadata
  const actions: Record<string, AgentResourceAction> = {};
  const uiActions = getUIActions(EntityClass);

  Object.entries(uiActions).forEach(([methodName, metadata]) => {
    const canExecute = metadata.condition ? metadata.condition(record) : true;
    const isActionLoading = actionLoadingStates[methodName] || false;

    actions[methodName] = {
      execute: useCallback(async () => {
        if (!record) return;

        setActionLoadingStates((prev) => ({ ...prev, [methodName]: true }));
        try {
          // Call the backend method
          await (record as any)[methodName]();
        } catch (error) {
          console.error(`Error executing action ${methodName}:`, error);
          throw error;
        } finally {
          setActionLoadingStates((prev) => ({ ...prev, [methodName]: false }));
        }
      }, [record, methodName]),
      canExecute: canExecute && !isActionLoading,
      isLoading: isActionLoading,
      metadata,
    };
  });

  return {
    record,
    isLoading,
    artifacts,
    actions,
  };
}
