import { Tick } from '../../decorators';
import { Reflector } from '../reflector';
import type { IBinder } from '../types';

export class TickBinder implements IBinder {
  public bind(target: unknown): void {
    Reflector.getDecoratedMethods<unknown, number>(target, Tick).forEach(({ method, decorators }) => {
      decorators.forEach((x) => {
        if (x <= 0) {
          global.onTick(method);
        } else {
          global.setInterval(method, x);
        }
      });
    });
  }
}
