import useData from "./hooks/useData";
import Navbar from "./navbar";
import TableImplementation from "./table";

const TableComponent = () => {
  const { data, page, totalPages, nextPage, prevPage } = useData();
  const currentTable = data[0]?.table;

  if (!currentTable) {
    // data가 비어 있을 땐 TableImplementation을 렌더링하지 않고 대기
    return <p>로딩 중...</p>;
  }

  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <TableImplementation data={currentTable} />
      <Navbar
        nextPage={nextPage}
        prevPage={prevPage}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
};

export default TableComponent;
