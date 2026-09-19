import type { Dataset, DatasetColumn } from "@/types/dataset";

/**
 * Build a minimal dataset fixture for unit tests.
 */
export function makeDataset(
  columns: Array<Pick<DatasetColumn, "id" | "name"> & { inferredType?: DatasetColumn["inferredType"] }>,
  rows: Dataset["rows"],
  overrides: Partial<Dataset> = {},
): Dataset {
  const fullColumns: DatasetColumn[] = columns.map((c, index) => ({
    id: c.id,
    name: c.name,
    index,
    inferredType: c.inferredType ?? "string",
  }));

  return {
    id: "ds_test",
    name: "test.csv",
    sourceType: "csv",
    columns: fullColumns,
    rows,
    metadata: {
      fileName: "test.csv",
      fileSizeBytes: 100,
      sourceType: "csv",
      importedAt: "2024-01-01T00:00:00.000Z",
      hasHeader: true,
    },
    ...overrides,
  };
}