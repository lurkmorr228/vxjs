import { EventBinding, Reflector } from '../../common';

export const EventHandler =
  (name?: string, binding = EventBinding.LOCAL): MethodDecorator =>
  (target, propertyKey: string) => {
    name ??= propertyKey;
    Reflector.decorateMethod(target, EventHandler, { name, binding }, propertyKey);
  };
