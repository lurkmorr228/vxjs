import type { IBinder } from '../../src';
import {
  Application,
  ApplicationBuilder,
  EventBinding,
  EventHandler,
  Export,
  ExportBinding,
  LocalEventBinder,
  RemoteEventBinder,
} from '../../src';
import { BINDER_TAG } from '../../src/const';

describe('App', () => {
  const onMock = jest.spyOn(global, 'on' as never);
  const onNetMock = jest.spyOn(global, 'onNet' as never);
  const localExportMock = jest.spyOn(global, 'exports' as never);
  const remoteExportMock = jest.spyOn(global, 'remoteExports' as never);

  it('should run the app', () => {
    class Controller {
      @EventHandler('test', EventBinding.REMOTE)
      @EventHandler('test', EventBinding.LOCAL)
      private localEvent(): void {
        return null;
      }

      @EventHandler('test', EventBinding.REMOTE)
      private remoteEvent(): void {
        return null;
      }

      @Export('test', ExportBinding.REMOTE)
      @Export('test', ExportBinding.LOCAL)
      private localExport(): void {
        return null;
      }

      @Export('test', ExportBinding.REMOTE)
      private remoteExport(): void {
        return null;
      }
    }

    const builder = new ApplicationBuilder().addControllers(Controller);
    const app = builder.build();
    app.start();

    expect(app).toBeInstanceOf(Application);
    expect(onMock).toHaveBeenCalledTimes(1);
    expect(onNetMock).toHaveBeenCalledTimes(2);
    expect(remoteExportMock).toHaveBeenCalledTimes(2);
    expect(localExportMock).toHaveBeenCalledTimes(1);

    onMock.mockReset();
    onNetMock.mockReset();
    remoteExportMock.mockReset();
    localExportMock.mockReset();
  });

  it('should not run the app due to not specified controllers', () => {
    const builder = new ApplicationBuilder();
    const app = builder.build();

    expect(app).toBeInstanceOf(Application);
    expect(() => app.start()).toThrow('Cannot start the application. Controllers are not specified');
  });

  it('should run the app and override binder', () => {
    class BinderOverride implements IBinder {
      public bind = jest.fn();
    }

    class Controller {
      @EventHandler('test', EventBinding.REMOTE)
      @EventHandler('test', EventBinding.LOCAL)
      private localEvent(): void {
        return null;
      }
    }

    const builder = new ApplicationBuilder();
    builder.addControllers(Controller);
    builder.addBinder(BinderOverride, LocalEventBinder);
    const app = builder.build();
    app.start();

    const binder = app.getAll<IBinder>(BINDER_TAG).find((x) => x.constructor === BinderOverride) as BinderOverride;

    expect(binder).toBeDefined();
    expect(binder.bind).toHaveBeenCalledTimes(1);
    expect(onMock).toHaveBeenCalledTimes(0);
    expect(onNetMock).toHaveBeenCalledTimes(1);

    onMock.mockReset();
    onNetMock.mockReset();
  });

  it('should run the app and remove binder', () => {
    class Controller {
      @EventHandler('test', EventBinding.REMOTE)
      @EventHandler('test', EventBinding.LOCAL)
      private localEvent(): void {
        return null;
      }
    }

    const builder = new ApplicationBuilder();
    builder.addControllers(Controller);
    builder.removeBinder(RemoteEventBinder);
    const app = builder.build();
    app.start();

    expect(onMock).toHaveBeenCalledTimes(1);
    expect(onNetMock).toHaveBeenCalledTimes(0);
  });
});
