import React, { useMemo, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
  GridSlotsComponent,
  GridSortModel,
  GridFilterModel,
  GridPaginationModel,
  GridToolbarProps,
  GridLogicOperator,
} from "@mui/x-data-grid";
import {
  Box,
  Paper,
  Typography,
  Toolbar,
  InputBase,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  styled,
  createTheme,
  ThemeProvider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Create a custom theme for the DataGrid compatible with MUI v7
const createDataGridTheme = (baseTheme: any) =>
  createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode: "light",
      primary: {
        main: "#2563eb", // Blue-600
      },
      background: {
        default: "#ffffff",
        paper: "#ffffff",
      },
      text: {
        primary: "#111827", // Gray-900
        secondary: "#6b7280", // Gray-500
      },
    },
    components: {
      ...baseTheme.components,
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: "1px solid #e5e7eb", // Gray-200
            borderRadius: "8px",
            fontFamily: "inherit",
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f3f4f6", // Gray-100
              fontSize: "0.875rem", // text-sm
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              lineHeight: "1.5",
              whiteSpace: "normal",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f9fafb", // Gray-50
              borderBottom: "1px solid #e5e7eb", // Gray-200
              fontSize: "0.75rem", // text-xs
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#374151", // Gray-700
            },
            "& .MuiDataGrid-columnHeader": {
              padding: "12px 16px",
              "&:focus": {
                outline: "none",
              },
              "&:focus-within": {
                outline: "none",
              },
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            },
            "& .MuiDataGrid-row": {
              minHeight: "60px !important",
              "&:hover": {
                backgroundColor: "#f9fafb", // Gray-50
              },
              "&.Mui-selected": {
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "#f9fafb",
                },
              },
            },
            "& .MuiDataGrid-footerContainer": {
              display: "none", // Hide default footer to use custom pagination
            },
            "& .MuiDataGrid-toolbarContainer": {
              padding: "16px",
              borderBottom: "1px solid #e5e7eb", // Gray-200
              backgroundColor: "#ffffff",
            },
            "& .MuiDataGrid-overlay": {
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: "#ffffff",
            },
            "& .MuiDataGrid-main": {
              backgroundColor: "#ffffff",
            },
          },
        },
      },
    },
  });

// Styled components
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-cell--textLeft": {
    justifyContent: "flex-start",
    textAlign: "left",
  },
  "& .MuiDataGrid-cell--textCenter": {
    justifyContent: "center",
    textAlign: "center",
  },
  "& .MuiDataGrid-cell--textRight": {
    justifyContent: "flex-end",
    textAlign: "right",
  },
  "& .MuiDataGrid-columnHeader--alignLeft .MuiDataGrid-columnHeaderTitleContainer":
    {
      justifyContent: "flex-start",
    },
  "& .MuiDataGrid-columnHeader--alignCenter .MuiDataGrid-columnHeaderTitleContainer":
    {
      justifyContent: "center",
    },
  "& .MuiDataGrid-columnHeader--alignRight .MuiDataGrid-columnHeaderTitleContainer":
    {
      justifyContent: "flex-end",
    },
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  color: theme.palette.text.secondary,
  height: "300px",
}));

const EmptyStateIcon = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  marginBottom: theme.spacing(2),
  borderRadius: "50%",
  backgroundColor: "#f3f4f6", // Gray-100
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

// Custom Pagination Component
const PaginationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  borderTop: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  minHeight: "64px",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: theme.spacing(1),
  },
}));

const PaginationInfo = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: "#6b7280",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    justifyContent: "center",
  },
}));

const PaginationControls = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    justifyContent: "center",
    flexWrap: "wrap",
  },
}));

const PageButton = styled(Button)(({ theme }) => ({
  minWidth: "36px",
  height: "36px",
  padding: 0,
  fontSize: "0.875rem",
  fontWeight: 500,
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#374151",
  "&:hover": {
    backgroundColor: "#f9fafb",
    borderColor: "#9ca3af",
  },
  "&.active": {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "#1d4ed8",
    },
  },
  "&:disabled": {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    color: "#9ca3af",
    cursor: "not-allowed",
  },
}));

const PageSizeSelector = styled(FormControl)(({ theme }) => ({
  minWidth: "80px",
  "& .MuiSelect-select": {
    fontSize: "0.875rem",
    padding: "8px 12px",
    paddingRight: "32px !important",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    "& fieldset": {
      borderColor: "#d1d5db",
    },
    "&:hover fieldset": {
      borderColor: "#9ca3af",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#2563eb",
    },
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
  border: "1px solid #d1d5db",
  "&:hover": {
    borderColor: "#9ca3af",
  },
  "&:focus-within": {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
  },
  marginLeft: 0,
  width: "100%",
  maxWidth: "300px",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9ca3af",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    fontSize: "0.875rem",
    width: "100%",
    "&::placeholder": {
      color: "#9ca3af",
      opacity: 1,
    },
  },
}));

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions: number[];
}

function CustomPagination({
  currentPage,
  totalPages,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
}: CustomPaginationProps) {
  const startRow = currentPage * pageSize + 1;
  const endRow = Math.min((currentPage + 1) * pageSize, totalRows);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination logic
      if (currentPage < 2) {
        // Near the beginning
        pages.push(0, 1, 2, "...", totalPages - 1);
      } else if (currentPage > totalPages - 3) {
        // Near the end
        pages.push(0, "...", totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        // In the middle
        pages.push(
          0,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages - 1
        );
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <PaginationContainer>
      {/* Left side - Row info and page size selector */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}
      >
        <PaginationInfo>
          Showing <strong>{startRow}</strong> to <strong>{endRow}</strong> of{" "}
          <strong>{totalRows}</strong> results
        </PaginationInfo>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontSize: "0.875rem", color: "#6b7280" }}
          >
            Show:
          </Typography>
          <PageSizeSelector size="small">
            <Select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              variant="outlined"
            >
              {pageSizeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </PageSizeSelector>
        </Box>
      </Box>

      {/* Right side - Navigation controls */}
      <PaginationControls>
        {/* First page button */}
        <IconButton
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          size="small"
          sx={{
            width: "36px",
            height: "36px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            backgroundColor: "#ffffff",
            "&:hover": {
              backgroundColor: "#f9fafb",
            },
            "&:disabled": {
              backgroundColor: "#f9fafb",
              borderColor: "#e5e7eb",
              color: "#9ca3af",
            },
          }}
        >
          <ChevronsLeft size={16} />
        </IconButton>

        {/* Previous page button */}
        <IconButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          size="small"
          sx={{
            width: "36px",
            height: "36px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            backgroundColor: "#ffffff",
            "&:hover": {
              backgroundColor: "#f9fafb",
            },
            "&:disabled": {
              backgroundColor: "#f9fafb",
              borderColor: "#e5e7eb",
              color: "#9ca3af",
            },
          }}
        >
          <ChevronLeft size={16} />
        </IconButton>

        {/* Page number buttons */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <Typography
                variant="body2"
                sx={{
                  px: 1,
                  py: 0.5,
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                  display: { xs: "none", sm: "block" },
                }}
              >
                ...
              </Typography>
            ) : (
              <PageButton
                onClick={() => onPageChange(page as number)}
                className={currentPage === page ? "active" : ""}
                sx={{ display: { xs: "none", sm: "flex" } }}
              >
                {(page as number) + 1}
              </PageButton>
            )}
          </React.Fragment>
        ))}

        {/* Mobile page indicator */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            alignItems: "center",
            px: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontSize: "0.875rem", color: "#6b7280" }}
          >
            Page {currentPage + 1} of {totalPages}
          </Typography>
        </Box>

        {/* Next page button */}
        <IconButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          size="small"
          sx={{
            width: "36px",
            height: "36px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            backgroundColor: "#ffffff",
            "&:hover": {
              backgroundColor: "#f9fafb",
            },
            "&:disabled": {
              backgroundColor: "#f9fafb",
              borderColor: "#e5e7eb",
              color: "#9ca3af",
            },
          }}
        >
          <ChevronRight size={16} />
        </IconButton>

        {/* Last page button */}
        <IconButton
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          size="small"
          sx={{
            width: "36px",
            height: "36px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            backgroundColor: "#ffffff",
            "&:hover": {
              backgroundColor: "#f9fafb",
            },
            "&:disabled": {
              backgroundColor: "#f9fafb",
              borderColor: "#e5e7eb",
              color: "#9ca3af",
            },
          }}
        >
          <ChevronsRight size={16} />
        </IconButton>
      </PaginationControls>
    </PaginationContainer>
  );
}

// Custom toolbar component using new Toolbar instead of deprecated GridToolbarContainer
function CustomToolbarWithSearch({
  searchText,
  onSearchChange,
}: {
  searchText: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <Toolbar
      sx={{
        justifyContent: "space-between",
        padding: "16px !important",
        minHeight: "auto !important",
      }}
    >
      <SearchContainer>
        <SearchIconWrapper>
          <Search size={16} />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search..."
          inputProps={{ "aria-label": "search" }}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </SearchContainer>
    </Toolbar>
  );
}

// Custom empty state component
function CustomNoRowsOverlay({ emptyMessage }: { emptyMessage: string }) {
  return (
    <EmptyStateContainer>
      <EmptyStateIcon>
        <Search size={32} color="#9ca3af" />
      </EmptyStateIcon>
      <Typography variant="body2" fontWeight="medium" color="text.secondary">
        {emptyMessage}
      </Typography>
    </EmptyStateContainer>
  );
}

// Custom loading overlay
function CustomLoadingOverlay() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "300px",
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          border: "2px solid #e5e7eb",
          borderTop: "2px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        }}
      />
    </Box>
  );
}

// Updated interface definitions to match the template components better
export interface TableColumn<T> {
  id: keyof T | string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
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
  showActions?: boolean; // Add this to control actions column visibility
}

function DataTable<T extends Record<string, any>>({
  data = [], // Add default empty array
  columns = [], // Add default empty array
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
  showActions = true, // Default to true for backward compatibility
}: TableProps<T>) {
  const baseTheme = useTheme();
  const dataGridTheme = useMemo(
    () => createDataGridTheme(baseTheme),
    [baseTheme]
  );

  // Search state
  const [searchText, setSearchText] = useState("");

  // Convert data to include unique IDs for MUI DataGrid
  const rows = useMemo(() => {
    let processedData = data.map((row, index) => ({
      ...row,
      _id: row.id || `row-${index}`, // Use existing ID or generate one
    }));

    // Apply search filter
    if (searchText) {
      processedData = processedData.filter((row) =>
        columns.some((column) => {
          const value =
            typeof column.accessor === "function"
              ? column.accessor(row)
              : row[column.accessor];
          return value
            ?.toString()
            .toLowerCase()
            .includes(searchText.toLowerCase());
        })
      );
    }

    return processedData;
  }, [data, searchText, columns]);

  // Pagination model state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSize,
  });

  // Calculate pagination values
  const totalPages = Math.ceil((rows?.length || 0) / paginationModel.pageSize);
  const paginatedRows = useMemo(() => {
    if (!pagination || !rows || !Array.isArray(rows)) return rows || [];
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return rows.slice(start, end);
  }, [rows, paginationModel, pagination]);

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    setPaginationModel((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPaginationModel({ page: 0, pageSize: newPageSize });
  };

  // Convert columns to MUI DataGrid format
  const muiColumns = useMemo((): GridColDef[] => {
    const convertedColumns: GridColDef[] = columns.map((column) => {
      const muiColumn: GridColDef = {
        field: column.id as string,
        headerName: column.header,
        sortable: column.sortable !== false && sortable,
        filterable: column.filterable !== false && filterable,
        headerAlign: column.align || "center",
        align: column.align || "center",
        flex: column.width ? 0 : 1,
        width: column.width ? parseInt(column.width) : undefined,
        minWidth: 120,
        hideable: false,
        disableColumnMenu: !filterable,
      };

      // Handle custom accessor or render function
      if (typeof column.accessor === "function" || column.render) {
        muiColumn.renderCell = (params: GridRenderCellParams) => {
          const value =
            typeof column.accessor === "function"
              ? column.accessor(params.row)
              : params.row[column.accessor];

          if (column.render) {
            return (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    column.align === "left"
                      ? "flex-start"
                      : column.align === "right"
                      ? "flex-end"
                      : "center",
                  textAlign: column.align || "center",
                  padding: "8px 0",
                  minHeight: "60px",
                }}
              >
                {column.render(value, params.row)}
              </Box>
            );
          }

          return (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  column.align === "left"
                    ? "flex-start"
                    : column.align === "right"
                    ? "flex-end"
                    : "center",
                textAlign: column.align || "center",
                padding: "8px 0",
                minHeight: "60px",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "normal",
              }}
            >
              {value}
            </Box>
          );
        };

        // For sorting with custom accessor
        if (typeof column.accessor === "function") {
          muiColumn.valueGetter = (value: any, row: any) => {
            return (column.accessor as Function)(row);
          };
        }
      }

      return muiColumn;
    });

    // Add actions column if provided and showActions is true
    if (actions && showActions) {
      convertedColumns.push({
        field: "actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        headerAlign: "center",
        align: "center",
        width: 120,
        minWidth: 120,
        flex: 0,
        hideable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams) => (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60px",
            }}
          >
            {actions(params.row)}
          </Box>
        ),
      });
    }

    return convertedColumns;
  }, [columns, actions, sortable, filterable, showActions]);

  // Handle row click
  const handleRowClick = (params: GridRowParams) => {
    if (onRowClick) {
      onRowClick(params.row);
    }
  };

  // Create slots object with proper types
  const slots: Partial<GridSlotsComponent> = {
    noRowsOverlay: () => <CustomNoRowsOverlay emptyMessage={emptyMessage} />,
    loadingOverlay: CustomLoadingOverlay,
  };

  if (searchable) {
    slots.toolbar = () => (
      <CustomToolbarWithSearch
        searchText={searchText}
        onSearchChange={setSearchText}
      />
    );
  }

  return (
    <ThemeProvider theme={dataGridTheme}>
      <Box className={cn("h-full flex flex-col", className)}>
        {/* Main Table Container */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "#ffffff",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <StyledDataGrid
            rows={paginatedRows}
            columns={muiColumns}
            getRowId={(row) => row._id}
            loading={loading}
            onRowClick={onRowClick ? handleRowClick : undefined}
            slots={slots}
            disableRowSelectionOnClick
            disableColumnSelector
            disableDensitySelector
            disableColumnFilter={!filterable}
            getRowHeight={() => "auto"}
            hideFooter={true} // Hide default footer completely
            sx={{
              flex: 1,
              border: "none",
              fontFamily: "inherit",
              "& .MuiDataGrid-row": {
                cursor: onRowClick ? "pointer" : "default",
                "&:last-child .MuiDataGrid-cell": {
                  borderBottom: "none",
                },
              },
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
                lineHeight: "1.5",
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                padding: "12px 16px",
              },
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-cell:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeader:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeader:focus-within": {
                outline: "none",
              },
            }}
          />

          {/* Custom Pagination */}
          {pagination && totalPages > 1 && (
            <CustomPagination
              currentPage={paginationModel.page}
              totalPages={totalPages}
              pageSize={paginationModel.pageSize}
              totalRows={rows.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[5, 10, 25, 50, 100]}
            />
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default DataTable;
