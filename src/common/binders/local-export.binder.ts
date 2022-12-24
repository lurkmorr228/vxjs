import { Export } from '../../decorators';
import { ExportBinding } from '../enums';
import { Reflector } from '../reflector';
import type { ExportMetadata, IBinder } from '../types';

export class LocalExportBinder implements IBinder {
  public bind(target: unknown): void {
    Reflector.getDecoratedMethods<unknown, ExportMetadata>(target, Export).forEach(({ method, decorators }) => {
      decorators.filter((x) => x.binding === ExportBinding.LOCAL).forEach((x) => global.exports(x.name, method));
    });
  }
}
