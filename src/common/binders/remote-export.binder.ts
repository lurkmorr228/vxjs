import { Export } from '../../decorators';
import { InjectRpcProvider } from '../../intergration';
import { ExportBinding } from '../enums';
import { Reflector } from '../reflector';
import type { ExportMetadata, IBinder } from '../types';
import { IRpcProvider } from '../types';

export class RemoteExportBinder implements IBinder {
  @InjectRpcProvider()
  private readonly _rpc: IRpcProvider;

  public bind(target: unknown): void {
    Reflector.getDecoratedMethods<unknown, ExportMetadata>(target, Export).forEach(({ method, decorators }) => {
      decorators
        .filter((x) => x.binding === ExportBinding.REMOTE)
        .forEach((x) => {
          this._rpc.on(x.name, method);
        });
    });
  }
}
