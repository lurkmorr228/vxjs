import { Command } from '../../decorators';
import { CommandBinding } from '../enums';
import { Reflector } from '../reflector';
import type { CommandMetadata, IBinder } from '../types';

export class ChatCommandBinder implements IBinder {
  public bind(target: unknown): void {
    Reflector.getDecoratedMethods<unknown, CommandMetadata>(target, Command).forEach(({ method, decorators }) => {
      decorators
        .filter((x) => x.binding === CommandBinding.CHAT)
        .forEach((x) =>
          global.RegisterCommand(x.name, (source, args) => {
            if (source < 1) {
              return;
            }
            return method(source, ...args);
          }),
        );
    });
  }
}
