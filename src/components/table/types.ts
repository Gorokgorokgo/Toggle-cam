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

export type TableData = {
  table: {
    columns: Column[];
    rowHeaders: RowHeader[];
    data: DataCell[];
  };
};

export type DataCell = {
  value: string;
  parentColIds: string[];
  parentRowId: string;
  paymentLeafId?: string; 
};
