import { CommandBinding, Reflector } from '../../common';

export const Command =
  (name: string, binding = CommandBinding.CHAT): MethodDecorator =>
  (target, propertyKey: string) => {
    name ??= propertyKey;
    Reflector.decorateMethod(target, Command, { name, binding }, propertyKey);
  };
