import 'reflect-metadata';

export interface UIActionMetadata {
  label: string;
  icon: string; // Lucide icon name
  variant: 'primary' | 'secondary';
  condition?: (instance: any) => boolean;
}

const UI_ACTION_METADATA_KEY = 'uiAction';

export function UIAction(metadata: UIActionMetadata) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const existingActions = Reflect.getMetadata(UI_ACTION_METADATA_KEY, target.constructor) || {};
    existingActions[propertyKey] = metadata;
    Reflect.defineMetadata(UI_ACTION_METADATA_KEY, existingActions, target.constructor);
    return descriptor;
  };
}

export function getUIActions(targetClass: any): Record<string, UIActionMetadata> {
  return Reflect.getMetadata(UI_ACTION_METADATA_KEY, targetClass) || {};
}
