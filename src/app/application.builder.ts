import { Container } from 'inversify';

import type { IBinder, ILoggerFactory, TypeOf } from '../common';
import {
  ChatCommandBinder,
  ConsoleCommandBinder,
  LocalEventBinder,
  LocalExportBinder,
  LoggerFactory,
  RemoteEventBinder,
  RemoteExportBinder,
  ScriptEventBinder,
} from '../common';
import { BINDER_TAG, CONTROLLER_TAG, LOGGER_TAG, SCRIPT_EMITTER_TAG } from '../const';
import { decorateInjectable, ScriptEmitter } from '../intergration';
import { Application } from './application';

type DefType = string | symbol;

export class ApplicationBuilder {
  private readonly _container: Container = new Container({
    autoBindInjectable: true,
    skipBaseClassChecks: true,
    defaultScope: 'Singleton',
  });

  private readonly _bindersLookup: Map<TypeOf<IBinder>, TypeOf<IBinder>> = new Map<TypeOf<IBinder>, TypeOf<IBinder>>();
  private _loggerFactory: ILoggerFactory = new LoggerFactory();
  private _emitterType: TypeOf<ScriptEmitter> = ScriptEmitter;

  public constructor() {
    this.addBinder(ScriptEventBinder);
    this.addBinder(LocalEventBinder);
    this.addBinder(RemoteEventBinder);
    this.addBinder(RemoteExportBinder);
    this.addBinder(LocalExportBinder);
    this.addBinder(ConsoleCommandBinder);
    this.addBinder(ChatCommandBinder);
  }

  public addBinder(binder: TypeOf<IBinder>, replace: TypeOf<IBinder> = binder): ApplicationBuilder {
    if (binder) {
      this._bindersLookup.set(replace, binder);
    }

    return this;
  }

  public removeBinder(binder: TypeOf<IBinder>): ApplicationBuilder {
    this._bindersLookup.delete(binder);
    return this;
  }

  public overrideLoggingFactory(factory: ILoggerFactory): ApplicationBuilder {
    this._loggerFactory = factory;
    return this;
  }

  public addService<TImplementation>(def: string | symbol, impl: TypeOf<TImplementation>): ApplicationBuilder {
    decorateInjectable(impl);
    this._container
      .bind(def)
      .to(impl as never)
      .inSingletonScope();

    return this;
  }

  public addServiceImpl<TImplementation>(def: string | symbol, impl: TImplementation): ApplicationBuilder {
    this._container.bind(def).toConstantValue(impl as never);

    return this;
  }

  public overriderService<TImplementation>(def: DefType, impl: TypeOf<TImplementation>): ApplicationBuilder {
    this._container.rebind(def).to(impl).inSingletonScope();
    return this;
  }

  public overriderServiceImpl<TImplementation>(def: DefType, impl: TImplementation): ApplicationBuilder {
    this._container.rebind(def).toConstantValue(impl as never);
    return this;
  }

  public setScriptEmitter(emitter: TypeOf<ScriptEmitter>): ApplicationBuilder {
    this._emitterType = emitter;
    return this;
  }

  public addControllers(...controllers: TypeOf<unknown>[]): ApplicationBuilder {
    controllers.forEach((controller) => {
      decorateInjectable(controller);
      this._container
        .bind(CONTROLLER_TAG)
        .to(controller as never)
        .inSingletonScope();
    });

    return this;
  }

  public build(): Application {
    if (this._emitterType) {
      decorateInjectable(this._emitterType);
      this._container.bind(SCRIPT_EMITTER_TAG).to(this._emitterType).inSingletonScope();
    } else {
      throw new Error(`Script emitter is not specified`);
    }
    this._container.bind(LOGGER_TAG).toDynamicValue((context) => {
      return this._loggerFactory.createLogger(context.currentRequest.target.getNamedTag().value);
    });

    for (const binder of this._bindersLookup.values()) {
      decorateInjectable(binder);
      this._container.bind(BINDER_TAG).to(binder).inSingletonScope();
    }
    return Reflect.construct(Application, [this._container]);
  }
}
