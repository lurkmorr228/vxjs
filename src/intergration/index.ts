import EventEmitter2 from 'eventemitter2';
import { decorate, inject, injectable, named } from 'inversify';

import { LOGGER_TAG, SCRIPT_EMITTER_TAG } from '../const';

export const Inject = inject;
export const Injectable = injectable;
export const InjectScriptEmitter = (): ParameterDecorator & PropertyDecorator => (target, prop) => {
  inject(SCRIPT_EMITTER_TAG)(target, prop);
};

export const InjectLogger =
  (context?: string): ParameterDecorator & PropertyDecorator =>
  (target: unknown, propertyKey: string, parameterIndex?: number): void => {
    inject(LOGGER_TAG)(target, propertyKey, parameterIndex);
    named(context ?? target.constructor.name)(target, propertyKey, parameterIndex);
  };

export class ScriptEmitter extends EventEmitter2 {
  public constructor() {
    super({});
  }
}

export const decorateInjectable = (target: unknown): void => {
  try {
    decorate(injectable(), target);
  } catch {
    //
  }
};
