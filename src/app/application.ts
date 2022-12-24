import { interfaces } from 'inversify';
import Container = interfaces.Container;
import type { IBinder, ILogger } from '../common';
import { BINDER_TAG, CONTROLLER_TAG, LOGGER_TAG } from '../const';

export class Application {
  private readonly _logger: ILogger;
  private constructor(private readonly _container: Container) {
    this._logger = this._container.getNamed(LOGGER_TAG, 'Application');
  }

  public get<T>(key: unknown): T {
    return this._container.get<T>(key as never);
  }

  public getAll<T>(key: unknown): T[] {
    return this._container.getAll<T>(key as never);
  }

  public start(): this {
    const binders = this._container.getAll<IBinder>(BINDER_TAG);
    const controllers = this.getControllers();
    if (controllers.length === 0) {
      throw new Error('Cannot start the application. Controllers are not specified');
    }

    controllers.forEach((controller) => {
      binders.forEach((binder) => {
        binder.bind(controller);
      });
    });

    return this;
  }

  private getControllers(): unknown[] {
    try {
      return this._container.getAll(CONTROLLER_TAG);
    } catch {
      return [];
    }
  }
}
