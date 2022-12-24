import type { CommandBinding, EventBinding, ExportBinding } from '../enums';

export interface EventMetadata {
  name: string;
  binding: EventBinding;
}

export interface ExportMetadata {
  name: string;
  binding: ExportBinding;
}

export interface CommandMetadata {
  name: string;
  binding: CommandBinding;
}
