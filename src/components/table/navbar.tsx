import React from "react";

interface NavbarProps {
  nextPage: () => void;
  prevPage: () => void;
  page: number;
  totalPages: number;
}

const NavBarButton = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) => {
  return (
    <button
      className="flex items-center justify-center px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Navbar: React.FC<NavbarProps> = ({
  nextPage,
  prevPage,
  page,
  totalPages,
}) => {
  return (
    <div className="flex p-4">
      <div className="flex gap-2 h-7 w-fit">
        <NavBarButton onClick={prevPage} disabled={page <= 1}>
          Prev
        </NavBarButton>
        <div className="flex items-center justify-center px-4 w-24">
          {page} of {totalPages}
        </div>
        <NavBarButton onClick={nextPage} disabled={page >= totalPages}>
          Next
        </NavBarButton>
      </div>
    </div>
  );
};

export default Navbar;
