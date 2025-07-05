import type { Column, DataCell, RowHeader } from "./types";



export function getPaymentLeafIds(paymentTree: Column, nodeId: string): string[] {
  if (paymentTree.id === nodeId) {
    return getLeafColumns([paymentTree]).map((c) => c.id);
  }
  if (!paymentTree.children) return [];
  for (const child of paymentTree.children) {
    const found = getPaymentLeafIds(child, nodeId);
    if (found.length) return found;
  }
  return [];
}

export function pivotAndSummarizeColumns(columns: Column[]): Column[] {
  const paymentTree = columns[0];         // "결제수단"
  const categoryTree = columns[1];        // "구매 카테고리"

  const categoryGroup = (prefix: string): Column => ({
    id: `${prefix}_${categoryTree.id}`,
    value: categoryTree.value,
    children: getLeafColumns(categoryTree.children).map((c) => ({
      ...c,
      id: `${prefix}_${c.id}`,  // 고유 ID 생성
    })),
  });

  const makeTotalColumn = (prefix: string): Column => ({
    id: `${prefix}_cat_total`,
    value: "합계",
    children: [],
  });

  const decorateLeaf = (leaf: Column): Column => ({
    id: leaf.id,
    value: leaf.value,
    children: [categoryGroup(leaf.id), makeTotalColumn(leaf.id)],
  });

  const decorateRecursive = (col: Column): Column => {
    if (!col.children || col.children.length === 0) {
      return decorateLeaf(col);
    }
    return {
      ...col,
      children: col.children.map(decorateRecursive),
    };
  };

  const decoratedPayment = decorateRecursive(paymentTree);

  return [
    decoratedPayment,
    {
      id: `${paymentTree.id}_total`,
      value: "결제수단 합계",
      children: [],
    },
  ];
}

export function getLeafRowsCount(rows: RowHeader[]): Record<string, number> {
  const result: Record<string, number> = {};
  function dfs(item: RowHeader): number {
    if (!item.children || item.children.length === 0) {
      result[item.id] = 1;
      return 1;
    }
    const sum = item.children.map(dfs).reduce((a, b) => a + b, 0);
    result[item.id] = sum;
    return sum;
  }
  rows.forEach(dfs);
  return result;
}

export function getMaxDepth(columns: Column[]): number {
  if (!columns.length) return 0;
  return (
    1 +
    Math.max(
      ...columns.map((col) =>
        col.children && col.children.length > 0
          ? getMaxDepth(col.children)
          : 0
      )
    )
  );
}

export function createCellMatrix(
  columns: Column[],
  rowHeaders: RowHeader[],
  data: DataCell[]
): (string | null)[][] {
  const colLeaves = getLeafColumns(columns);
  const rowLeaves = getLeafRows(rowHeaders);

  // 컬럼 ID → 순서(인덱스) 맵
  const colIdToIndex = new Map(colLeaves.map((col, i) => [col.id, i]));
  const rowIdToIndex = new Map(rowLeaves.map((row, i) => [row.id, i]));

  const matrix = Array.from({ length: rowLeaves.length }, () =>
    Array(colLeaves.length).fill(null)
  );

  for (const cell of data) {
    const rowIdx = rowIdToIndex.get(cell.parentRowId);
    if (rowIdx === undefined) continue;

    // 1) parentColIds → 인덱스 배열
    const idxs = cell.parentColIds
      .map((id) => colIdToIndex.get(id))
      .filter((i): i is number => i !== undefined);

    if (idxs.length === 0) continue;

    // 2) 정렬
    idxs.sort((a, b) => a - b);

    // 3) 첫 번째(가장 왼쪽) 인덱스 선택
    const colIdx = idxs[0];
    matrix[rowIdx][colIdx] = cell.value;
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

export function parseJsonl(raw: string) {
  return raw
    .split("\n") // 줄 단위로 쪼갬
    .filter((line) => line.trim().length > 0) // 빈 줄 제거
    .map((line) => JSON.parse(line)); // 각 줄을 JSON으로 변환
}
