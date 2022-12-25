import EventEmitter2 from 'eventemitter2';
import { decorate, inject, injectable, named } from 'inversify';

import type { Fn, IScriptEventProvider } from '../common';
import { LOGGER_TAG, RPC_PROVIDER_TAG, SCRIPT_EMITTER_TAG } from '../const';

export const Inject = inject;
export const Injectable = injectable;
export const InjectScriptEmitter = (): ParameterDecorator & PropertyDecorator => (target, prop) => {
  inject(SCRIPT_EMITTER_TAG)(target, prop);
};
export const InjectRpcProvider = (): ParameterDecorator & PropertyDecorator => (target, prop) => {
  inject(RPC_PROVIDER_TAG)(target, prop);
};

export const InjectLogger =
  (context?: string): ParameterDecorator & PropertyDecorator =>
  (target: unknown, propertyKey: string, parameterIndex?: number): void => {
    inject(LOGGER_TAG)(target, propertyKey, parameterIndex);
    named(context ?? target.constructor.name)(target, propertyKey, parameterIndex);
  };

export class ScriptEmitter implements IScriptEventProvider {
  private readonly _eventEmitter = new EventEmitter2();

  public on(name: string, handler: Fn): void {
    this._eventEmitter.on(name, handler);
  }

  public off(name: string, handler: Fn): void {
    this._eventEmitter.off(name, handler);
  }
}

export const decorateInjectable = (target: unknown): void => {
  try {
    decorate(injectable(), target);
  } catch {
    //
  }
};
