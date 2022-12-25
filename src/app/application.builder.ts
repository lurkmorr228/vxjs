import { Container } from 'inversify';

import type { IBinder, ILoggerFactory, IRpcProvider, IScriptEventProvider, TypeOf } from '../common';
import { LoggerFactory, RpcProvider } from '../common';
import * as binders from '../common/binders';
import { BINDER_TAG, CONTROLLER_TAG, LOGGER_TAG, RPC_PROVIDER_TAG, SCRIPT_EMITTER_TAG } from '../const';
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
  private _emitterType: TypeOf<IScriptEventProvider> = ScriptEmitter;
  private _rpcType: TypeOf<IRpcProvider> = RpcProvider;

  public constructor() {
    Object.values(binders).forEach((x: TypeOf<IBinder>) => {
      this.addBinder(x);
    });
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

  public setScriptEventProvider(emitter: TypeOf<IScriptEventProvider>): ApplicationBuilder {
    this._emitterType = emitter;
    return this;
  }

  public setRpcProvider(rpc: TypeOf<IRpcProvider>): ApplicationBuilder {
    this._rpcType = rpc;
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

    if (this._rpcType) {
      decorateInjectable(this._rpcType);
      this._container.bind(RPC_PROVIDER_TAG).to(this._rpcType).inSingletonScope();
    } else {
      throw new Error(`Rpc provider is not specified`);
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
