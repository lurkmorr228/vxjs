import type { IBinder } from '../../src';
import {
  ApplicationBuilder,
  ChatCommandBinder,
  Command,
  CommandBinding,
  ConsoleCommandBinder,
  EventBinding,
  EventHandler,
  Export,
  ExportBinding,
  ScriptEmitter,
} from '../../src';
import { BINDER_TAG, SCRIPT_EMITTER_TAG } from '../../src/const';

describe('Decorators', () => {
  const on = jest.spyOn(global, 'on' as never);
  const onNet = jest.spyOn(global, 'onNet' as never);
  const exports = jest.spyOn(global, 'exports' as never);
  const remoteExport = jest.spyOn(global, 'remoteExports' as never);

  it('should register local events', () => {
    class Controller {
      @EventHandler('test')
      private testEvent1(): void {
        return null;
      }

      @EventHandler('test2')
      private testEvent2(): void {
        return null;
      }
    }

    new ApplicationBuilder().addControllers(Controller).build().start();

    expect(on).toHaveBeenCalledTimes(2);
  });

  it('should register net events', () => {
    class Controller {
      @EventHandler('test', EventBinding.REMOTE)
      private testEvent1(): void {
        return null;
      }

      @EventHandler('test2', EventBinding.REMOTE)
      private testEvent2(): void {
        return null;
      }
    }

    new ApplicationBuilder().addControllers(Controller).build().start();

    expect(onNet).toHaveBeenCalledTimes(2);
  });

  it('should register script events', () => {
    class Controller {
      @EventHandler('test', EventBinding.SCRIPT)
      private testEvent1(): void {
        return null;
      }

      @EventHandler('test2', EventBinding.SCRIPT)
      private testEvent2(): void {
        return null;
      }
    }
    class Emitter extends ScriptEmitter {
      public override on = jest.fn();
    }
    const emitter = new ApplicationBuilder()
      .setScriptEmitter(Emitter)
      .addControllers(Controller)
      .build()
      .start()
      .get<Emitter>(SCRIPT_EMITTER_TAG);

    expect(emitter.on).toHaveBeenCalledTimes(2);
  });

  it('should register local export', () => {
    class Controller {
      @Export('test', ExportBinding.LOCAL)
      private testEvent1(): void {
        return null;
      }

      @Export('test2', ExportBinding.LOCAL)
      private testEvent2(): void {
        return null;
      }
    }

    new ApplicationBuilder().addControllers(Controller).build().start();

    expect(exports).toHaveBeenCalledTimes(2);
  });

  it('should register remote export', () => {
    class Controller {
      @Export('test', ExportBinding.REMOTE)
      private testEvent1(): void {
        return null;
      }

      @Export('test2', ExportBinding.REMOTE)
      private testEvent2(): void {
        return null;
      }
    }

    new ApplicationBuilder().addControllers(Controller).build().start();

    expect(remoteExport).toHaveBeenCalledTimes(2);
  });

  it('should register commands', () => {
    class Controller {
      @Command('test', CommandBinding.CHAT)
      private testEvent1(): void {
        return null;
      }

      @Command('test2', CommandBinding.CONSOLE)
      private testEvent2(): void {
        return null;
      }
    }

    class ConsoleBinder implements IBinder {
      public bind = jest.fn().mockImplementation(ConsoleCommandBinder.prototype.bind.bind(null));
    }
    class ChatBinder implements IBinder {
      public bind = jest.fn().mockImplementation(ChatCommandBinder.prototype.bind.bind(null));
    }
    const mock = jest.spyOn(global, 'RegisterCommand' as never);

    const app = new ApplicationBuilder()
      .addBinder(ConsoleBinder, ConsoleCommandBinder)
      .addBinder(ChatBinder, ChatCommandBinder)
      .addControllers(Controller)
      .build()
      .start();

    const consoleBinder = app.getAll<IBinder>(BINDER_TAG).find((x) => x.constructor === ConsoleBinder);
    const chatBinder = app.getAll<IBinder>(BINDER_TAG).find((x) => x.constructor === ChatBinder);

    expect(consoleBinder.bind).toHaveBeenCalledTimes(1);
    expect(chatBinder.bind).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledTimes(2);
  });
});