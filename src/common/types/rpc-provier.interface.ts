import type { Fn } from './common';

export interface IRpcProvider {
  on: (name: string, handler: Fn) => void;
  off: (name: string) => void;
  emit: <T>(name: string, ...args: unknown[]) => void;
}
