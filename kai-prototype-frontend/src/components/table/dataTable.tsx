import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DataTableProps = {
  columns: string[];
  children: React.ReactNode;
};

export function DataTable({ columns, children }: DataTableProps) {
  return (
    <div className="px-5">
      <div className="overflow-x-auto border rounded-lg">
        <Table className="min-w-full text-sm ">
          <TableHeader className="bg-gray-200">
            <TableRow className="border-b hover:bg-gray-50 [&>td]:py-3">
              {columns.map((item) => (
                <TableHead className="font-medium text-gray-900 py-2">
                  {item}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          {children}
        </Table>
      </div>
    </div>
  );
}
