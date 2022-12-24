import type { Fn, IRpcProvider } from '../types';

interface Deferred {
  resolve: (v: unknown) => unknown;
  reject: (reason?: string) => void;
}

export class Rpc implements IRpcProvider {
  private _handlers: Record<string, Fn> = {};
  private readonly _prefix;
  private readonly _request;
  private readonly _reply;

  private readonly _emit: <T>(name: string, args: unknown[]) => Promise<T>;

  public constructor(resourceName: string, private readonly isServer: boolean) {
    this._prefix = `vx::${resourceName.toLowerCase()}::rpc`;
    this._request = `${this._prefix}::request`;
    this._reply = `${this._prefix}::reply`;
    this._emit = ((): (<T>(name: string, args: unknown[]) => Promise<T>) => {
      if (this.isServer) {
        class PlayerStorage {
          public nextId: number = Number.MIN_SAFE_INTEGER;
          public promises: Record<string, Deferred> = {};
        }
        const storage: Record<string, PlayerStorage> = {};

        global.on('playerDropped', () => {
          const source = global.source;
          const playerStorage = storage[source];
          if (!playerStorage) {
            return;
          }
          delete storage[source];
          const reason = `Player ${source} dropped`;
          Object.values(playerStorage.promises).forEach((promise) => {
            promise.reject(reason);
          });
        });

        global.onNet(this._reply, (id: number, ret: unknown) => {
          const source = global.source.toString();
          const promises = storage[source]?.promises;
          if (!promises?.[id]) {
            return;
          }
          const promise = promises[id];
          delete promises[id];
          promise.resolve(ret);
        });

        global.onNet(this._request, async (name: string, id: number, args: unknown[]) => {
          const source = global.source.toString();
          const handler = this._handlers[name];
          if (!handler) {
            global.emitNet(this._reply, source, id, null);
            throw new Error(`RPC handler ${name} is not specified`);
          }
          // eslint-disable-next-line fp/no-let
          let ret;
          try {
            ret = await handler(source, ...args);
          } catch (e) {
            console.error(`error while calling rpc handler ${name}`, e);
            ret = null;
          }
          global.emitNet(this._reply, source, id, ret);
        });

        return <T>(name: string, args: unknown[]): Promise<T> => {
          return new Promise<T>((resolve, reject) => {
            const source = args.shift().toString();
            if (!source) {
              reject(`Source is not specified. Expected [string || number], received ${source}`);
            }
            if (!storage[source]) {
              storage[source] = new PlayerStorage();
            }
            const playerStorage = storage[source];

            const id = playerStorage.nextId++;
            playerStorage.promises[id] = { resolve, reject };
            global.emitNet(this._request, source, name, id, args);
          });
        };
      }

      const storage: Record<string, (v: unknown) => unknown> = {};
      // eslint-disable-next-line fp/no-let
      let idx = Number.MIN_SAFE_INTEGER;

      global.onNet(this._reply, (id: number, ret: unknown) => {
        if (!storage[id]) {
          return;
        }
        const promise = storage[id];
        delete storage[id];
        promise(ret);
      });

      global.onNet(this._request, async (name: string, id: number, args: unknown[]) => {
        const handler = this._handlers[name];
        if (!handler) {
          global.emitNet(this._reply, id, null);
          throw new Error(`RPC handler ${name} is not specified`);
        }
        // eslint-disable-next-line fp/no-let
        let ret;
        try {
          ret = await handler(...args);
        } catch {
          ret = null;
        }
        global.emitNet(this._reply, id, ret);
      });
      return <T>(name: string, args: unknown[]): Promise<T> => {
        return new Promise<T>((resolve) => {
          const id = idx++;
          storage[id] = resolve;
          global.emitNet(this._request, name, id, args);
        });
      };
    })();
  }

  public on(event: string, handler: Fn): void {
    this._handlers[event] = handler;
  }

  public off(event: string): void {
    delete this._handlers[event];
  }

  public emit<T>(name: string, ...args: unknown[]): Promise<T> {
    return this._emit(name, args);
  }
}

export class RpcProvider extends Rpc implements IRpcProvider {
  public constructor() {
    super(global.GetCurrentResourceName(), global.IsDuplicityVersion());
  }
}
