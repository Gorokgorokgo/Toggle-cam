export type Column = {
  id: string;
  value: string;
  children: Column[];
};

export type RowHeader = {
  id: string;
  value: string;
  children?: RowHeader[];
};

export type DataCell = {
  value: string;
  parentColIds: string[];
  parentRowId: string;
};

export type TableData = {
  table: {
    columns: Column[];
    rowHeaders: RowHeader[];
    data: DataCell[];
  };
};
