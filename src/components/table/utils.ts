import type { Column, DataCell, RowHeader } from "./types";

export function createCellMatrix(
  columns: Column[],
  rowHeaders: RowHeader[],
  data: DataCell[]
): (string | null)[][] {
  const colLeaves = getLeafColumns(columns);
  const rowLeaves = getLeafRows(rowHeaders);

  const colIdToIndex = new Map(colLeaves.map((col, i) => [col.id, i]));
  const rowIdToIndex = new Map(rowLeaves.map((row, i) => [row.id, i]));

  const matrix = Array.from({ length: rowLeaves.length }, () =>
    Array(colLeaves.length).fill(null)
  );

  for (const cell of data) {
    const rowIdx = rowIdToIndex.get(cell.parentRowId);
    const colIndexes = cell.parentColIds.map((id) => colIdToIndex.get(id));

    const colIdx = colIndexes.find((idx) => idx !== undefined);
    if (rowIdx !== undefined && colIdx !== undefined) {
      matrix[rowIdx][colIdx] = cell.value;
    }
  }

  return matrix;
}

export function getLeafColumns(columns: Column[]): Column[] {
  const leaves: Column[] = [];
  const walk = (cols: Column[]) => {
    for (const col of cols) {
      if (!col.children || col.children.length === 0) {
        leaves.push(col);
      } else {
        walk(col.children);
      }
    }
  };
  walk(columns);
  return leaves;
}

export function getLeafRows(rows: RowHeader[]): RowHeader[] {
  const leaves: RowHeader[] = [];
  const walk = (items: RowHeader[]) => {
    for (const item of items) {
      if (!item.children || item.children.length === 0) {
        leaves.push(item);
      } else {
        walk(item.children);
      }
    }
  };
  walk(rows);
  return leaves;
}

export function flattenRowHeaders(
  rows: RowHeader[],
  parentPath: RowHeader[] = [],
  result: RowHeader[][] = []
): RowHeader[][] {
  for (const row of rows) {
    const path = [...parentPath, row];
    if (row.children && row.children.length > 0) {
      flattenRowHeaders(row.children, path, result);
    } else {
      result.push(path);
    }
  }
  return result;
}

export function flattenColumns(
  columns: Column[],
  depth = 0,
  result: Column[][] = []
): Column[][] {
  result[depth] = result[depth] || [];
  for (const col of columns) {
    result[depth].push(col);
    if (col.children && col.children.length > 0) {
      flattenColumns(col.children, depth + 1, result);
    }
  }
  return result;
}

export function parseJsonl(raw: string) {
  return raw
    .split("\n") // 줄 단위로 쪼갬
    .filter((line) => line.trim().length > 0) // 빈 줄 제거
    .map((line) => JSON.parse(line)); // 각 줄을 JSON으로 변환
}
