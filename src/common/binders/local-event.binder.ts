import { EventHandler } from '../../decorators';
import { EventBinding } from '../enums';
import { Reflector } from '../reflector';
import type { EventMetadata, IBinder } from '../types';

export class LocalEventBinder implements IBinder {
  public bind(target: unknown): void {
    Reflector.getDecoratedMethods<unknown, EventMetadata>(target, EventHandler).forEach(({ method, decorators }) => {
      decorators.filter((x) => x.binding === EventBinding.LOCAL).forEach((x) => global.on(x.name, method));
    });
  }
}
