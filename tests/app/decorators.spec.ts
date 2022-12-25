import type { IBinder, IRpcProvider, IScriptEventProvider } from '../../src';
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
} from '../../src';
import { BINDER_TAG, RPC_PROVIDER_TAG, SCRIPT_EMITTER_TAG } from '../../src/const';

describe('Decorators', () => {
  const on = jest.spyOn(global, 'on' as never);
  const onNet = jest.spyOn(global, 'onNet' as never);
  const exports = jest.spyOn(global, 'exports' as never);

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

    expect(on).toHaveBeenCalledTimes(3);
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

    expect(onNet).toHaveBeenCalledTimes(6);

    onNet.mockReset();
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
    class Emitter implements IScriptEventProvider {
      public on = jest.fn();
      public off = jest.fn();
    }
    const emitter = new ApplicationBuilder()
      .setScriptEventProvider(Emitter)
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

    exports.mockReset();
  });

  it('should register remote export', () => {
    class RpcProvider implements IRpcProvider {
      public on = jest.fn();
      public emit = jest.fn();
      public off = jest.fn();
    }
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

    const app = new ApplicationBuilder().setRpcProvider(RpcProvider).addControllers(Controller).build().start();
    const provider = app.get<RpcProvider>(RPC_PROVIDER_TAG);

    expect(provider.on).toHaveBeenCalledTimes(2);
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
