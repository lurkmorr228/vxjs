import type { Fn } from './common';

export interface IScriptEventProvider {
  on: (name: string, handler: Fn) => void;
  off: (name: string, handler: Fn) => void;
}
