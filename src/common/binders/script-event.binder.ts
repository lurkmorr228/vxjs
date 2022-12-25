import { EventHandler } from '../../decorators';
import { InjectScriptEmitter } from '../../intergration';
import { EventBinding } from '../enums';
import { Reflector } from '../reflector';
import type { EventMetadata, IBinder } from '../types';
import { IScriptEventProvider } from '../types';

export class ScriptEventBinder implements IBinder {
  @InjectScriptEmitter()
  private readonly _eventEmitter: IScriptEventProvider;

  public bind(target: unknown): void {
    Reflector.getDecoratedMethods<unknown, EventMetadata>(target, EventHandler).forEach(({ method, decorators }) => {
      decorators.filter((x) => x.binding === EventBinding.SCRIPT).forEach((x) => this._eventEmitter.on(x.name, method));
    });
  }
}
