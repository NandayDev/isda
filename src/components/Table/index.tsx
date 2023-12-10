import {
  chakra,
  Table,
  TableProps,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowData,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ReactElement, useState } from "react";

interface DataTableProps<T> extends TableProps {
  data: T[];
  columns: ColumnDef<T, any>[];
}

const DataTable = <TData extends RowData>({
  columns,
  data,
  ...rest
}: DataTableProps<TData>): ReactElement | undefined => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Table
      bg={useColorModeValue("white", "black")}
      borderRadius={"xl"}
      {...rest}
    >
      <Thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const meta: any = header.column.columnDef.meta;
              return (
                <Th
                  key={header.id}
                  textAlign={"center"}
                  onClick={header.column.getToggleSortingHandler()}
                  isNumeric={meta?.isNumeric}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}

                  {header.column.getIsSorted() && (
                    <chakra.span pl="4">
                      {header.column.getIsSorted() === "desc" ? (
                        <TriangleDownIcon aria-label="sorted descending" />
                      ) : (
                        <TriangleUpIcon aria-label="sorted ascending" />
                      )}
                    </chakra.span>
                  )}
                </Th>
              );
            })}
          </Tr>
        ))}
      </Thead>
      <Tbody>
        {table.getRowModel().rows.map((row) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              const meta: any = cell.column.columnDef.meta;
              return (
                <Td key={cell.id} isNumeric={meta?.isNumeric}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              );
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default DataTable;
