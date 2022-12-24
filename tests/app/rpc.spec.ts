import EventEmitter from 'events';

import type { Fn } from '../../src';
import { Rpc } from '../../src';

describe('RPC', () => {
  const RESOURCE_NAME = 'resoure_name';
  const prefix = `vx::${RESOURCE_NAME}::rpc`;
  const request = `${prefix}::request`;
  const reply = `${prefix}::reply`;
  const emitNet = jest.spyOn(global, 'emitNet' as any);
  const onNet = jest.spyOn(global, 'onNet' as any);

  it('should fire an rpc event and get result (SERVER)', async () => {
    let sendReply: Fn;
    onNet.mockImplementation((eventName: string, handler: Fn) => {
      // eslint-disable-next-line jest/no-conditional-in-test
      if (eventName === reply) {
        sendReply = handler;
      }
    });

    emitNet.mockImplementation((event: string, source: string, name: string, id: number, args: number[]): void => {
      expect(source).toBe('1');
      expect(args).toHaveLength(2);
      expect(args).toEqual([2, 3]);
      expect(id).toBe(Number.MIN_SAFE_INTEGER);
      expect(name).toBe('test');

      sendReply(id, args[0] + args[1]);
    });

    const rpc = new Rpc(RESOURCE_NAME, true);
    const ret = await rpc.emit<number>('test', 1, 2, 3);

    expect(ret).toBe(2 + 3);
  });

  it('should fire an rpc event and get result (CLIENT)', async () => {
    let sendReply: Fn;
    onNet.mockImplementation((eventName: string, handler: Fn) => {
      // eslint-disable-next-line jest/no-conditional-in-test
      if (eventName === reply) {
        sendReply = handler;
      }
    });

    emitNet.mockImplementation((event: string, name: string, id: number, args: number[]): void => {
      expect(args).toHaveLength(3);
      expect(args).toEqual([1, 2, 3]);
      expect(id).toBe(Number.MIN_SAFE_INTEGER);
      expect(name).toBe('test');

      sendReply(id, args[0] + args[1] + args[2]);
    });

    const rpc = new Rpc(RESOURCE_NAME, false);
    const ret = await rpc.emit<number>('test', 1, 2, 3);

    expect(ret).toBe(1 + 2 + 3);

    onNet.mockReset();
    emitNet.mockReset();
  });

  it('should react to incoming request (SERVER)', () => {
    const emitter = new EventEmitter();
    onNet.mockImplementation(emitter.on.bind(emitter));
    emitNet.mockImplementation(emitter.emit.bind(emitter));
    const id = 2;
    const args = [1, 2];

    const rpc = new Rpc(RESOURCE_NAME, true);
    rpc.on('test', (source: string, ...passArgs: number[]) => {
      expect(source).toBe(global.source.toString());
      expect(args).toEqual(passArgs);

      return passArgs.reduce((acc, x) => acc + x, 0);
    });

    emitter.on(reply, (source: string, reqId: number, ret: number) => {
      expect(source).toBe(global.source.toString());
      expect(reqId).toBe(id);
      expect(ret).toBe(args.reduce((acc, x) => acc + x, 0));
    });
    emitter.emit(request, 'test', id, args);

    onNet.mockReset();
    emitNet.mockReset();
  });

  it('should react to incoming request (CLIENT)', () => {
    const emitter = new EventEmitter();
    onNet.mockImplementation(emitter.on.bind(emitter));
    emitNet.mockImplementation(emitter.emit.bind(emitter));
    const id = 2;
    const args = [1, 2];

    const rpc = new Rpc(RESOURCE_NAME, false);
    rpc.on('test', (...passArgs: number[]) => {
      expect(args).toEqual(passArgs);

      return passArgs.reduce((acc, x) => acc + x, 0);
    });

    emitter.on(reply, (reqId: number, ret: number) => {
      expect(reqId).toBe(id);
      expect(ret).toBe(args.reduce((acc, x) => acc + x, 0));
    });
    emitter.emit(request, 'test', id, args);

    onNet.mockReset();
    emitNet.mockReset();
  });
});
