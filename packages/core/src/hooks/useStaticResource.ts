import { useState, useEffect } from 'react';
import { repo } from 'remult';
import type { StaticResource } from '../entities/StaticResource';

export interface UseStaticResourceResult<T extends StaticResource> {
  items: T[];
  isLoading: boolean;
  create: (data: Partial<T>) => Promise<T>;
  update: (item: T) => Promise<T>;
  delete: (item: T) => Promise<void>;
}

export function useStaticResource<T extends StaticResource>(
  EntityClass: new () => T,
  where?: any
): UseStaticResourceResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const repository = repo(EntityClass);

    const unsubscribe = repository.liveQuery({
      where: where || {},
    }).subscribe({
      next: (data) => {
        setItems(data);
        setIsLoading(false);
      },
      error: (error) => {
        console.error('Error in live query:', error);
        setIsLoading(false);
      },
    });

    return () => unsubscribe();
  }, [EntityClass, where]);

  const create = async (data: Partial<T>): Promise<T> => {
    const repository = repo(EntityClass);
    return await repository.insert(data as any);
  };

  const update = async (item: T): Promise<T> => {
    const repository = repo(EntityClass);
    return await repository.save(item);
  };

  const deleteItem = async (item: T): Promise<void> => {
    const repository = repo(EntityClass);
    await repository.delete(item);
  };

  return {
    items,
    isLoading,
    create,
    update,
    delete: deleteItem,
  };
}
