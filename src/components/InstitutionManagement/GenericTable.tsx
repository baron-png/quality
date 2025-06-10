import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActionButtons } from './ActionButtons';

interface GenericTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
  }[];
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  extraProps?: Record<string, any>;
}

export function GenericTable<T>({
  data =[],
  columns,
  onEdit,
  onDelete,
  extraProps = {},
}: GenericTableProps<T>) {
    const safeData = Array.isArray(data) ? data : [];
      const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: columns[0]?.key || '',
    direction: 'asc',
  });

  const sortedData = [...safeData].sort((a: any, b: any) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    if (typeof aValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    return sortConfig.direction === 'asc'
      ? aValue - bValue
      : bValue - aValue;
  });
 

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-100 transition-colors">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={`font-semibold text-gray-700 ${
                  col.sortable ? 'cursor-pointer hover:text-cyan-600' : ''
                }`}
                onClick={() => col.sortable && handleSort(col.key)}
                aria-sort={
                  sortConfig.key === col.key
                    ? sortConfig.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                <div className="flex items-center">
                  {col.label}
                  {sortConfig.key === col.key && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
            <TableHead className="font-semibold text-gray-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            sortedData.map((item: any, index: number) => (
              <TableRow
                key={item.id || index}
                className="hover:bg-gray-50 transition-colors"
                aria-label={`Row ${index + 1}`}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className="text-gray-600">
                    {col.render ? col.render(item) : item[col.key] || 'N/A'}
                  </TableCell>
                ))}
                <TableCell>
                  <ActionButtons
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item.id || '')}
                    disableEdit={extraProps?.disableEdit?.(item)}
                    disableDelete={extraProps?.disableDelete?.(item)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="text-center text-gray-500 py-6"
              >
                No {extraProps.entityName || 'items'} found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}