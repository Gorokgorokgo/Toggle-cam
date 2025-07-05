import { useMemo } from "react";
import type { TableData } from "./types";
import { createCellMatrix, flattenColumns, flattenRowHeaders, getLeafColumns, getLeafRowsCount, getMaxDepth } from "./utils";

type TableShape = TableData["table"];
type TableProps = { data: TableShape };

const TableImplementation: React.FC<TableProps> = ({ data }) => {
  // TableData 구조가 { table: { columns, rowHeaders, data } } 이므로,
  // table 프로퍼티를 통해 실제 컬럼, 행 헤더, 셀 데이터를 꺼냅니다.
  const { columns, rowHeaders, data: cells } = data;

  // 다단계 열 헤더 구조와 depth
  const headerLevels = useMemo(() => flattenColumns(columns), [columns]);
  const headerRowCount = headerLevels.length;

  // 행 헤더의 최대 depth만큼 왼쪽에 빈 셀을 만들기 위함
  const rowPaths = useMemo(() => {
    const root = rowHeaders.find((r) => r.id === "ROOT");
    return root?.children ? flattenRowHeaders(root.children) : [];
  }, [rowHeaders]);

  const rowHeaderDepth = useMemo(
    () => Math.max(...rowPaths.map((path) => path.length), 0),
    [rowPaths]
  );

  // 병합용 계산
  const maxDepth = useMemo(() => getMaxDepth(columns), [columns]);
  const cellMatrix = useMemo(
    () => createCellMatrix(columns, rowHeaders, cells),
    [columns, rowHeaders, cells]
  );
  const rowSpans = useMemo(() => getLeafRowsCount(rowHeaders), [rowHeaders]);


  return (
    <div className="w-full overflow-x-auto">
      <table className="table-auto border-collapse border w-full">
        <thead>
          {headerLevels.map((cols, depth) => (
            <tr key={depth}>
              {/* 행 헤더 칼럼 수만큼 첫 행에 빈 칸 추가 */}
              {depth === 0 && (
                <th
                  colSpan={rowHeaderDepth}
                  rowSpan={headerRowCount}
                  className="border px-2 py-1 bg-gray-100"
                />
              )}

              {/* 다단계 열 헤더 렌더 */}
              {cols.map((col) => {
                const colSpan = getLeafColumns([col]).length;
                const rowSpan = col.children?.length ? 1 : maxDepth - depth;
                return (
                  <th
                    key={col.id}
                    colSpan={colSpan}
                    rowSpan={rowSpan}
                    className="border px-2 py-1 text-sm text-center bg-gray-100"
                  >
                    {col.value}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rowPaths.map((path, rowIndex) => (
            <tr key={rowIndex}>
              {/* 다단계 행 헤더 렌더 및 세로 병합 */}
              {path.map((row, depth) => {
                const prev = rowPaths[rowIndex - 1]?.[depth];
                if (prev?.id === row.id) return null;

                const isLeafRowGroup = path.length === 1; // e.g. 금월
                if (isLeafRowGroup) {
                  // 단독 노드일 경우: 가로 병합
                  return (
                    <td
                      key={row.id}
                      colSpan={rowHeaderDepth}
                      rowSpan={1}
                      className="border px-2 py-1 text-sm text-center bg-gray-50"
                    >
                      {row.value}
                    </td>
                  );
                }

                // 일반 다단계 병합 (예: 누적 → 3개월/6개월)
                return (
                  <td
                    key={row.id}
                    rowSpan={rowSpans[row.id]}
                    className="border px-2 py-1 text-sm text-left bg-gray-50"
                  >
                    {row.value}
                  </td>
                );
              })}

              {/* 데이터 셀 */}
              {cellMatrix[rowIndex].map((value, colIndex) => (
                <td
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="border px-2 py-1 text-sm text-center"
                >
                  {value ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableImplementation;
