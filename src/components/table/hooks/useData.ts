import { useEffect, useMemo, useState } from "react";
import SampleData from "../data/sample.jsonl?raw";
import type { DataCell, TableData } from "../types";
import {
  getLeafColumns,
  getLeafRows,
  parseJsonl,
  pivotAndSummarizeColumns,
} from "../utils";

export default function useData(pageSize = 1) {
  const [tables, setTables] = useState<TableData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // 1) JSONL 파싱
    const parsed = parseJsonl(SampleData) as TableData[];

    // 2) 각 테이블에 대해 피벗 & 데이터 변환
    const enhanced = parsed.map(({ table }) => {
      const { columns: origCols, rowHeaders, data: origCells } = table;

      // 2-1) 컬럼 피벗 (결제수단 × 구매 카테고리 + 합계 컬럼 생성)
      const newColumns = pivotAndSummarizeColumns(origCols);

      // 2-2) 원본 Leaf ID 리스트
      const paymentLeafIds = getLeafColumns([origCols[0]]).map((c) => c.id);
      const categoryLeafIds = getLeafColumns([origCols[1]]).map((c) => c.id);

      // 2-3) 셀 변환: 결제수단 Leaf가 없으면 “결제수단 합계” 컬럼에만 매핑
      const transformedCells: DataCell[] = origCells.flatMap((cell) => {
        // • 카테고리 Leaf 찾기
        const rawCat = cell.parentColIds.find((id) =>
          categoryLeafIds.includes(id)
        );
        if (!rawCat) return []; // 카테고리가 없으면 skip

        // 결제수단 Leaf 찾기
        const rawPayLeaf = cell.parentColIds.find((id) =>
          paymentLeafIds.includes(id)
        );

        if (!rawPayLeaf) {
          // 결제수단 정보가 하나도 없으면 전체 합계 컬럼에만 매핑
          return [
            {
              ...cell,
              parentColIds: [`${origCols[0].id}_total`], // “결제수단 합계” ID
            },
          ];
        }

        // Leaf 결제수단인 경우: “payLeafId_categoryLeafId” 형태로 매핑
        return [
          {
            ...cell,
            parentColIds: [`${rawPayLeaf}_${rawCat}`],
          },
        ];
      });

      // 결제수단별 카테고리 합계(식품+의류)
      const categoryTotalCells: DataCell[] = getLeafRows(rowHeaders).flatMap(
        (rowLeaf) =>
          paymentLeafIds.map((payLeafId) => {
            const sum = transformedCells
              .filter(
                (c) =>
                  c.parentRowId === rowLeaf.id &&
                  c.parentColIds[0].startsWith(`${payLeafId}_`)
              )
              .reduce((acc, cur) => acc + Number(cur.value), 0);
            return {
              parentRowId: rowLeaf.id,
              parentColIds: [`${payLeafId}_cat_total`],
              value: sum.toString(),
            };
          })
      );

      // 전체 결제수단 합계
      const overallTotalCells: DataCell[] = getLeafRows(rowHeaders).map(
        (rowLeaf) => {
          const sum = transformedCells
            .filter((c) => c.parentRowId === rowLeaf.id)
            .reduce((acc, cur) => acc + Number(cur.value), 0);
          return {
            parentRowId: rowLeaf.id,
            parentColIds: [`${origCols[0].id}_total`],
            value: sum.toString(),
          };
        }
      );

      // 총합 컬럼 이름 변경
      const totalColumnId = `${origCols[0].id}_total`;
      const totalColumnName = `${origCols[0].value} 합계`;
      newColumns[newColumns.length - 1] = {
        ...newColumns[newColumns.length - 1],
        id: totalColumnId,
        value: totalColumnName,
      };

      // 2-5) 변환된 테이블 반환
      return {
        table: {
          columns: newColumns,
          rowHeaders,
          data: [
            ...transformedCells,
            ...categoryTotalCells,
            ...overallTotalCells,
          ],
        },
      };
    });

    setTables(enhanced);
  }, []);

  // 3) 페이징 로직
  const totalPages = useMemo(
    () => Math.ceil(tables.length / pageSize),
    [tables, pageSize]
  );
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tables.slice(start, start + pageSize);
  }, [tables, currentPage, pageSize]);

  // 4) 훅 반환 값
  return {
    data: paginated,
    total: tables.length,
    page: currentPage,
    totalPages,
    nextPage: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setCurrentPage((p) => Math.max(p - 1, 1)),
  };
}
