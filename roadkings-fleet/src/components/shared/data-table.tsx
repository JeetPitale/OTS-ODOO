"use client";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo } from "react";

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
}

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchKey,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    if (!search || !searchKey) return data;
    return data.filter((row) =>
      String(row[searchKey]).toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search, searchKey]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = String(a[sortKey]);
      const bVal = String(b[sortKey]);
      return sortDir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-lg"
          />
        </div>
      )}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col) => (
                <TableHead
                  key={String(col.accessorKey)}
                  className={`text-xs uppercase tracking-wide font-semibold text-muted-foreground ${
                    col.sortable ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.accessorKey)}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.accessorKey && (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col) => (
                    <TableCell key={String(col.accessorKey)} className="py-3">
                      {col.cell ? col.cell(row) : String(row[col.accessorKey])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
