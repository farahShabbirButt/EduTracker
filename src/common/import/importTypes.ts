import type { SheetRow } from './readSheet';

export type ImportStatus = 'new' | 'exists' | 'problem';

// One per sheet row, as checked by the server
export interface ImportRowResult {
  row: number;
  label: string;
  status: ImportStatus;
  messages: string[];
}

export interface ImportResult<T = unknown> {
  dryRun: boolean;
  counts: Record<ImportStatus, number>;
  rows: ImportRowResult[];
  created?: T[];
  // How many things the new rows make, when a thing spans rows (a test has a row per subject)
  toCreate?: number;
}

// What an import screen gives the panel: send the rows, as a preview or for real
export type ImportCheck<F extends string> = (
  rows: SheetRow<F>[],
  dryRun: boolean
) => Promise<
  | { ok: true; result: ImportResult; message: string }
  | { ok: false; message: string }
>;
