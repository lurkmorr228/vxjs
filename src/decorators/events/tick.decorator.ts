import { Reflector } from '../../common';

export const Tick =
  (interval = 0): MethodDecorator =>
  (target, propertyKey: string) => {
    interval = Math.max(0, interval);
    Reflector.decorateMethod(target, Tick, interval, propertyKey);
  };
