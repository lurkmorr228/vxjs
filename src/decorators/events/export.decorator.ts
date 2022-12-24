import { ExportBinding, Reflector } from '../../common';

export const Export =
  (name?: string, binding = ExportBinding.LOCAL): MethodDecorator =>
  (target, propertyKey: string) => {
    name ??= propertyKey;
    Reflector.decorateMethod(target, Export, { name, binding }, propertyKey);
  };
