import { useEffect, useMemo, useState } from "react";
import SampleData from "../data/sample.jsonl?raw";
import type { TableData } from "../types";
import { parseJsonl } from "../utils";

const useData = (pageSize = 1) => {
  const [data, setData] = useState<TableData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const parsedData = parseJsonl(SampleData);
    setData(parsedData);
  }, []);

  const totalPages = useMemo(
    () => Math.ceil(data.length / pageSize),
    [data, pageSize]
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, currentPage, pageSize]);

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return {
    data: paginatedData,
    total: data.length,
    page: currentPage,
    totalPages,
    nextPage,
    prevPage,
  };
};

export default useData;
