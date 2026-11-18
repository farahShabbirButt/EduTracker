// Turns an .xlsx or .csv file into rows keyed by field, for the imports. The file
// is read in the browser; the server checks every row. The libraries load only when
// a file is read, so they stay out of the main bundle.

export interface ImportColumn<F extends string = string> {
  field: F;
  label: string;
  // Other headings that mean the same column
  aliases?: string[];
  required?: boolean;
  // Shown in the template's example row
  example?: string;
}

export interface SheetRow<F extends string = string> {
  // The row number in the sheet (1 is the first row)
  row: number;
  values: Partial<Record<F, string>>;
}

export interface MatchedSheet<F extends string = string> {
  rows: SheetRow<F>[];
  // Headings in the file that no column uses
  ignored: string[];
  // Labels of required columns the file doesn't have
  missing: string[];
  // Labels of the columns found
  found: string[];
}

export interface OpenedFile {
  sheetNames: string[];
  grid: (sheet: string) => string[][];
}

export class SheetReadError extends Error {}

// The file libraries load on first use. If EduTracker was updated after this page opened,
// last version's files are gone, so the load fails; reloading picks up the new version.
const load = async <T>(loader: () => Promise<T>): Promise<T> => {
  try {
    return await loader();
  } catch {
    throw new SheetReadError(
      navigator.onLine
        ? 'Part of EduTracker could not load, perhaps because it was updated since this page opened. Reload the page and try again'
        : 'You seem to be offline. Check the internet connection and try again'
    );
  }
};

// Headings are matched without caring about case, spaces or punctuation
const headingKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const pad = (n: number) => String(n).padStart(2, '0');

// Excel keeps types; the server wants text. A date cell comes back at UTC midnight.
const cellText = (cell: unknown): string => {
  if (cell === null || cell === undefined) return '';
  if (cell instanceof Date) {
    return Number.isNaN(cell.getTime())
      ? ''
      : `${cell.getUTCFullYear()}-${pad(cell.getUTCMonth() + 1)}-${pad(cell.getUTCDate())}`;
  }
  if (typeof cell === 'number') {
    return Number.isInteger(cell)
      ? cell.toLocaleString('en-US', { useGrouping: false })
      : String(cell);
  }
  return String(cell).trim().replace(/\s+/g, ' ');
};

export async function openSheetFile(file: File): Promise<OpenedFile> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.csv')) {
    const { default: Papa } = await load(() => import('papaparse'));
    const text = await file.text();
    const parsed = Papa.parse<string[]>(text.replace(/^\uFEFF/, ''), {
      skipEmptyLines: false,
    });
    const grid = parsed.data.map((row) => row.map(cellText));
    return { sheetNames: ['Sheet 1'], grid: () => grid };
  }

  if (name.endsWith('.xlsx')) {
    const { default: readExcelFile } = await load(
      () => import('read-excel-file/browser')
    );
    let sheets;
    try {
      sheets = await readExcelFile(file);
    } catch {
      throw new SheetReadError(
        "This file couldn't be read. Save it again from Excel as .xlsx, or as .csv, and try again"
      );
    }
    const grids = new Map(
      sheets.map((s) => [s.sheet, s.data.map((row) => row.map(cellText))])
    );
    return {
      sheetNames: sheets.map((s) => s.sheet),
      grid: (sheet) => grids.get(sheet) ?? [],
    };
  }

  if (name.endsWith('.xls')) {
    throw new SheetReadError(
      'Old .xls files are not supported. In Excel choose Save As, then Excel Workbook (.xlsx) or CSV'
    );
  }
  throw new SheetReadError('Choose an Excel (.xlsx) or CSV (.csv) file');
}

// The heading row is the first of the top 10 rows that has every required
// heading, because school sheets often start with a title.
export function matchColumns<F extends string>(
  grid: string[][],
  columns: ImportColumn<F>[]
): MatchedSheet<F> {
  const keysOf = (column: ImportColumn<F>) =>
    [column.label, ...(column.aliases ?? [])].map(headingKey);

  // Each field takes the heading that matches best: its own label first, then its
  // aliases in order. So in "Name | Class" the class import takes Class, not Name.
  const mapRow = (row: string[]) => {
    const map = new Map<F, number>();
    const taken = new Set<number>();
    for (const column of columns) {
      let best = -1;
      let bestRank = Infinity;
      row.forEach((heading, index) => {
        const rank = keysOf(column).indexOf(headingKey(heading));
        if (rank !== -1 && rank < bestRank && !taken.has(index)) {
          best = index;
          bestRank = rank;
        }
      });
      if (best !== -1) {
        map.set(column.field, best);
        taken.add(best);
      }
    }
    return map;
  };

  const required = columns.filter((c) => c.required);
  let headingIndex = -1;
  let best = new Map<F, number>();
  for (let i = 0; i < Math.min(grid.length, 10); i++) {
    const map = mapRow(grid[i]);
    if (required.every((c) => map.has(c.field)) && map.size > 0) {
      headingIndex = i;
      best = map;
      break;
    }
    if (map.size > best.size) best = map;
  }

  const found = columns.filter((c) => best.has(c.field)).map((c) => c.label);
  if (headingIndex === -1) {
    return {
      rows: [],
      ignored: [],
      found,
      missing: required.filter((c) => !best.has(c.field)).map((c) => c.label),
    };
  }

  const used = new Set(best.values());
  const ignored = grid[headingIndex].filter(
    (heading, index) => heading && !used.has(index)
  );

  const rows: SheetRow<F>[] = [];
  grid.slice(headingIndex + 1).forEach((cells, offset) => {
    const values: Partial<Record<F, string>> = {};
    best.forEach((index, field) => {
      const value = cells[index] ?? '';
      if (value) values[field] = value;
    });
    // Empty rows are skipped
    if (Object.keys(values).length > 0) {
      rows.push({ row: headingIndex + offset + 2, values });
    }
  });

  return { rows, ignored, found, missing: [] };
}

// A template with the right headings and one example row
export async function downloadTemplate(
  columns: ImportColumn[],
  fileName: string
) {
  const { default: writeExcelFile } = await load(
    () => import('write-excel-file/browser')
  );
  await writeExcelFile([
    columns.map((c) => ({ value: c.label, fontWeight: 'bold' as const })),
    columns.map((c) => ({ value: c.example ?? '', type: String })),
  ]).toFile(fileName);
}
