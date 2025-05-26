// components/ui/DataTable.tsx
import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { cn } from '@/lib/utils';

export interface TableColumn<T> {
  id: keyof T | string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right'; // Added align option
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  defaultAlign?: 'left' | 'center' | 'right'; // Added default alignment option
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  [key: string]: string;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  sortable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  onRowClick,
  actions,
  loading = false,
  emptyMessage = "No data available",
  className,
  defaultAlign = 'left', // Default to center alignment
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<FilterConfig>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Get value from row using accessor
  const getValue = (row: T, accessor: keyof T | ((row: T) => any)) => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    return row[accessor];
  };

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = getValue(row, column.accessor);
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => {
          const column = columns.find(col => col.id === key);
          if (column) {
            const cellValue = getValue(row, column.accessor);
            return cellValue?.toString().toLowerCase().includes(value.toLowerCase());
          }
          return true;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, filters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.id === sortConfig.key);
      if (!column) return 0;

      const aValue = getValue(a, column.accessor);
      const bValue = getValue(b, column.accessor);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });
  }, [filteredData, sortConfig, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (!sortable) return;

    setSortConfig(prevConfig => {
      if (prevConfig?.key === columnId) {
        if (prevConfig.direction === 'desc') {
          return null; // Remove sort
        }
        return { key: columnId, direction: 'desc' };
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  // Handle filter change
  const handleFilterChange = (columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Search and Controls - Fixed at top */}
      {(searchable || filterable) && (
        <div className="flex-shrink-0 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {searchable && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Container - Scrollable */}
      <div className="flex-1 overflow-y-scroll border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id as string}
                    className={cn(
                      "px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50  text-left",
                      
                      column.sortable && sortable && "cursor-pointer select-none hover:bg-gray-100",
                      column.width && `w-${column.width}`
                    )}
                    onClick={() => column.sortable && handleSort(column.id as string)}
                  >
                    <div className="text-left flex items-center justify-between">
                      <span>{column.header}</span>
                      {column.sortable && sortable && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            className={cn(
                              "h-3 w-3",
                              sortConfig?.key === column.id && sortConfig.direction === 'asc'
                                ? "text-blue-600"
                                : "text-gray-400"
                            )}
                          />
                          <ChevronDown 
                            className={cn(
                              "h-3 w-3 -mt-1",
                              sortConfig?.key === column.id && sortConfig.direction === 'desc'
                                ? "text-blue-600"
                                : "text-gray-400"
                            )}
                          />
                        </div>
                      )}
                    </div>
                    {/* Column Filter */}
                    {column.filterable && filterable && (
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          placeholder={`Filter ${column.header.toLowerCase()}...`}
                          value={filters[column.id as string] || ''}
                          onChange={(e) => handleFilterChange(column.id as string, e.target.value)}
                          className="text-xs h-8"
                        />
                      </div>
                    )}
                  </th>
                ))}
                {actions && (
                  <th className=" py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (actions ? 1 : 0)} 
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "hover:bg-gray-50",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => {
                      const value = getValue(row, column.accessor);
                      return (
                        <td 
                          key={column.id as string} 
                          className={cn(
                            "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                          )}
                        >
                          {column.render ? column.render(value, row) : value}
                        </td>
                      );
                    })}
                    {actions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div onClick={(e) => e.stopPropagation()}>
                          {actions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>

      {/* Pagination - Fixed at bottom */}
      {pagination && totalPages > 1 && (
        <div className="flex-shrink-0 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previously
              </Button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;