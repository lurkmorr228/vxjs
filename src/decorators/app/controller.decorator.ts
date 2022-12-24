import { decorate, injectable } from 'inversify';

import { Reflector } from '../../common';

export const Controller = (): ClassDecorator => (target) => {
  decorate(injectable, target);
  Reflector.setMetadata(target as never, 'CONTROLLER', true);
};
