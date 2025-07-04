import type { Column, DataCell, RowHeader } from "./types";
import { createCellMatrix, flattenColumns, flattenRowHeaders } from "./utils";
/* 
const TableHeader = () => {
  return <h2 className="text-2xl font-bold">Table</h2>;
};
 */
const renderRows = (
  rowHeaders: RowHeader[],
  columns: Column[],
  data: DataCell[]
) => {
  const rowPaths = flattenRowHeaders(rowHeaders);
  const cellMatrix = createCellMatrix(columns, rowHeaders, data);

  return rowPaths.map((path, rowIndex) => (
    <tr key={rowIndex}>
      {path.map((row, depth) => (
        <td
          key={depth}
          className="border px-2 py-1 text-sm text-left bg-gray-50"
        >
          {row.value}
        </td>
      ))}
      {cellMatrix[rowIndex].map((value, colIndex) => (
        <td
          key={`cell-${rowIndex}-${colIndex}`}
          className="border px-2 py-1 text-sm text-center"
        >
          {value ?? "-"}
        </td>
      ))}
    </tr>
  ));
};

const renderColumnHeaders = (columns: Column[]) => {
  const levels = flattenColumns(columns);

  return (
    <thead>
      {levels.map((cols, rowIndex) => (
        <tr key={rowIndex}>
          {cols.map((col) => (
            <th
              key={col.id}
              className="border px-2 py-1 text-sm text-center bg-gray-100"
            >
              {col.value}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
};

const TableImplementation = ({
  data,
}: {
  data: {
    columns: Column[];
    rowHeaders: RowHeader[];
    data: DataCell[];
  };
}) => {
  if (!data.columns || !data.rowHeaders) return <p>로딩 중...</p>;

  return (
    <div className="w-full overflow-x-auto">
      <table className="table-auto border-collapse border w-full">
        {renderColumnHeaders(data.columns)}
        <tbody>{renderRows(data.rowHeaders, data.columns, data.data)}</tbody>
      </table>
    </div>
  );
};
export default TableImplementation;
