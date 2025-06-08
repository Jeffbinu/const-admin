import React, { useMemo, useState, useCallback, useEffect } from "react";
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
  GridColumnVisibilityModel,
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
  Popover,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Chip,
  InputAdornment,
  TextField,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Settings,
  X,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
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
              justifyContent: "flex-start", // Left align cells
              textAlign: "left",
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
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              justifyContent: "flex-start", // Left align headers
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

const FilterButton = styled(Button)(({ theme }) => ({
  minHeight: "40px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontWeight: 500,
  fontSize: "0.875rem",
  "&:hover": {
    backgroundColor: "#f9fafb",
    borderColor: "#9ca3af",
  },
  "&.active": {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
    color: "#2563eb",
  },
}));

const FilterPopoverContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  minWidth: "280px",
  maxWidth: "400px",
}));

// Interfaces
interface ColumnFilter {
  field: string;
  operator:
    | "contains"
    | "equals"
    | "startsWith"
    | "endsWith"
    | "isEmpty"
    | "isNotEmpty";
  value: string;
}

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

// Enhanced Custom Toolbar Component
interface CustomToolbarProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  onApplySearch: () => void;
  onSearchKeyPress: (event: React.KeyboardEvent) => void;
  columns: TableColumn<any>[];
  columnVisibility: GridColumnVisibilityModel;
  onColumnVisibilityChange: (model: GridColumnVisibilityModel) => void;
  columnFilters: ColumnFilter[];
  appliedColumnFilters: ColumnFilter[];
  onColumnFiltersChange: (filters: ColumnFilter[]) => void;
  onApplyFilters: () => void;
  onClearAll: () => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  showSearch?: boolean;
  showColumnFilters?: boolean;
  showColumnVisibility?: boolean;
}

function CustomToolbarWithSearch({
  searchText,
  onSearchChange,
  onApplySearch,
  onSearchKeyPress,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  columnFilters,
  appliedColumnFilters,
  onColumnFiltersChange,
  onApplyFilters,
  onClearAll,
  sortModel,
  onSortModelChange,
  showSearch = true,
  showColumnFilters = true,
  showColumnVisibility = true,
}: CustomToolbarProps) {
  const [filterAnchorEl, setFilterAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [columnAnchorEl, setColumnAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [activeFilters, setActiveFilters] =
    useState<ColumnFilter[]>(columnFilters);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleColumnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColumnAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setFilterAnchorEl(null);
  };

  const handleCloseColumn = () => {
    setColumnAnchorEl(null);
  };

  const handleAddFilter = () => {
    const newFilter: ColumnFilter = {
      field: (columns[0]?.id as string) || "",
      operator: "contains",
      value: "",
    };
    const updatedFilters = [...activeFilters, newFilter];
    setActiveFilters(updatedFilters);
    onColumnFiltersChange(updatedFilters);
  };

  const handleRemoveFilter = (index: number) => {
    const updatedFilters = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(updatedFilters);
    onColumnFiltersChange(updatedFilters);
  };

  const handleFilterChange = (
    index: number,
    field: keyof ColumnFilter,
    value: string
  ) => {
    const updatedFilters = activeFilters.map((filter, i) =>
      i === index ? { ...filter, [field]: value } : filter
    );
    setActiveFilters(updatedFilters);
    onColumnFiltersChange(updatedFilters);
  };

  const handleColumnVisibilityToggle = (columnId: string) => {
    const newVisibility = {
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId],
    };
    onColumnVisibilityChange(newVisibility);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    onColumnFiltersChange([]);
    onSearchChange("");
  };

  const activeFilterCount =
    activeFilters.filter((f) => f.value).length + (searchText ? 1 : 0);

  return (
    <Toolbar
      sx={{
        justifyContent: "space-between",
        paddingY: "16px !important",
        minHeight: "auto !important",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {/* Left side - Search */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flex: 1,
          minWidth: "200px",
        }}
      >
        {showSearch && (
          <SearchContainer>
            <SearchIconWrapper>
              <Search size={16} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search across all columns..."
              inputProps={{ "aria-label": "search" }}
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </SearchContainer>
        )}

        {/* Active filters indicator */}
        {activeFilterCount > 0 && (
          <Chip
            label={`${activeFilterCount} filter${
              activeFilterCount > 1 ? "s" : ""
            } active`}
            size="small"
            color="primary"
            variant="outlined"
            onDelete={clearAllFilters}
            deleteIcon={<X size={14} />}
          />
        )}
      </Box>

      {/* Right side - Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Column Filter Button */}
        {showColumnFilters && (
          <FilterButton
            onClick={handleFilterClick}
            startIcon={<Filter size={16} />}
            className={activeFilters.some((f) => f.value) ? "active" : ""}
          >
            Filters
          </FilterButton>
        )}

        {/* Column Visibility Button */}
        {showColumnVisibility && (
          <FilterButton
            onClick={handleColumnClick}
            startIcon={<Settings size={16} />}
          >
            Columns
          </FilterButton>
        )}
      </Box>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleCloseFilter}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <FilterPopoverContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Column Filters
            </Typography>
            <Button
              size="small"
              onClick={handleAddFilter}
              sx={{ fontSize: "0.75rem" }}
            >
              Add Filter
            </Button>
          </Box>

          {activeFilters.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 2, textAlign: "center" }}
            >
              No filters applied. Click "Add Filter" to get started.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {activeFilters.map((filter, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    p: 2,
                    border: "1px solid #e5e7eb",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Filter {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFilter(index)}
                      sx={{ width: 20, height: 20 }}
                    >
                      <X size={12} />
                    </IconButton>
                  </Box>

                  <FormControl size="small" fullWidth>
                    <Select
                      value={filter.field}
                      onChange={(e) =>
                        handleFilterChange(index, "field", e.target.value)
                      }
                    >
                      {columns.map((column) => (
                        <MenuItem
                          key={column.id as string}
                          value={column.id as string}
                        >
                          {column.header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <Select
                      value={filter.operator}
                      onChange={(e) =>
                        handleFilterChange(index, "operator", e.target.value)
                      }
                    >
                      <MenuItem value="contains">Contains</MenuItem>
                      <MenuItem value="equals">Equals</MenuItem>
                      <MenuItem value="startsWith">Starts with</MenuItem>
                      <MenuItem value="endsWith">Ends with</MenuItem>
                      <MenuItem value="isEmpty">Is empty</MenuItem>
                      <MenuItem value="isNotEmpty">Is not empty</MenuItem>
                    </Select>
                  </FormControl>

                  {!["isEmpty", "isNotEmpty"].includes(filter.operator) && (
                    <TextField
                      size="small"
                      placeholder="Filter value..."
                      value={filter.value}
                      onChange={(e) =>
                        handleFilterChange(index, "value", e.target.value)
                      }
                      fullWidth
                    />
                  )}
                </Box>
              ))}
            </Box>
          )}

          {activeFilters.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  size="small"
                  onClick={() => {
                    setActiveFilters([]);
                    onColumnFiltersChange([]);
                  }}
                  color="error"
                  variant="outlined"
                >
                  Clear All
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    onApplyFilters();
                    handleCloseFilter();
                  }}
                  variant="contained"
                >
                  Apply Filters
                </Button>
              </Box>
            </>
          )}
        </FilterPopoverContent>
      </Popover>

      {/* Column Visibility Popover */}
      <Popover
        open={Boolean(columnAnchorEl)}
        anchorEl={columnAnchorEl}
        onClose={handleCloseColumn}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <FilterPopoverContent>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Show/Hide Columns
          </Typography>

          <FormGroup>
            {columns.map((column) => {
              const columnId = column.id as string;
              const isVisible = columnVisibility[columnId] !== false;

              return (
                <FormControlLabel
                  key={columnId}
                  control={
                    <Checkbox
                      checked={isVisible}
                      onChange={() => handleColumnVisibilityToggle(columnId)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                      <Typography variant="body2">{column.header}</Typography>
                    </Box>
                  }
                />
              );
            })}
          </FormGroup>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              size="small"
              onClick={() => {
                const allVisible: GridColumnVisibilityModel = {};
                columns.forEach((col) => {
                  allVisible[col.id as string] = true;
                });
                onColumnVisibilityChange(allVisible);
              }}
              variant="outlined"
            >
              Show All
            </Button>
            <Button
              size="small"
              onClick={handleCloseColumn}
              variant="contained"
            >
              Done
            </Button>
          </Box>
        </FilterPopoverContent>
      </Popover>
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

// Updated interface definitions
export interface TableColumn<T> {
  id: keyof T | string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  hidden?: boolean;
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
  showActions?: boolean;
  enableColumnFilters?: boolean;
  enableColumnVisibility?: boolean;
  defaultSort?: { field: string; direction: "asc" | "desc" };
  stickyHeader?: boolean;
  maxHeight?: string;
  onSelectionChange?: (selectedRows: T[]) => void;
  selectable?: boolean;
}

// Utility function to apply filters
function applyColumnFilters<T>(
  data: T[],
  filters: ColumnFilter[],
  columns: TableColumn<T>[]
): T[] {
  if (!filters.length) return data;

  return data.filter((row) => {
    return filters.every((filter) => {
      if (
        !filter.value &&
        !["isEmpty", "isNotEmpty"].includes(filter.operator)
      ) {
        return true;
      }

      const column = columns.find((col) => col.id === filter.field);
      if (!column) return true;

      const value =
        typeof column.accessor === "function"
          ? column.accessor(row)
          : row[column.accessor];

      const stringValue = value?.toString().toLowerCase() || "";
      const filterValue = filter.value.toLowerCase();

      switch (filter.operator) {
        case "contains":
          return stringValue.includes(filterValue);
        case "equals":
          return stringValue === filterValue;
        case "startsWith":
          return stringValue.startsWith(filterValue);
        case "endsWith":
          return stringValue.endsWith(filterValue);
        case "isEmpty":
          return !stringValue || stringValue.trim() === "";
        case "isNotEmpty":
          return stringValue && stringValue.trim() !== "";
        default:
          return true;
      }
    });
  });
}

function DataTable<T extends Record<string, any>>({
  data = [],
  columns = [],
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
  showActions = true,
  enableColumnFilters = true,
  enableColumnVisibility = true,
  defaultSort,
  stickyHeader = false,
  maxHeight = "600px",
  onSelectionChange,
  selectable = false,
}: TableProps<T>) {
  const baseTheme = useTheme();
  const dataGridTheme = useMemo(
    () => createDataGridTheme(baseTheme),
    [baseTheme]
  );

  // State management
  const [searchText, setSearchText] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>(
    defaultSort
      ? [{ field: defaultSort.field, sort: defaultSort.direction }]
      : []
  );
  const [columnVisibility, setColumnVisibility] =
    useState<GridColumnVisibilityModel>(() => {
      const initialVisibility: GridColumnVisibilityModel = {};
      columns.forEach((column) => {
        initialVisibility[column.id as string] = !column.hidden;
      });
      return initialVisibility;
    });
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  // Pagination model state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSize,
  });

  // Memoized data processing
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply column filters
    if (columnFilters.length > 0) {
      result = applyColumnFilters(result, columnFilters, columns);
    }

    // Apply global search
    if (searchText) {
      result = result.filter((row) =>
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

    // Apply sorting
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      const column = columns.find((col) => col.id === field);

      if (column) {
        result.sort((a, b) => {
          const aValue =
            typeof column.accessor === "function"
              ? column.accessor(a)
              : a[column.accessor];
          const bValue =
            typeof column.accessor === "function"
              ? column.accessor(b)
              : b[column.accessor];

          // Handle null/undefined values
          if (aValue == null && bValue == null) return 0;
          if (aValue == null) return sort === "asc" ? -1 : 1;
          if (bValue == null) return sort === "asc" ? 1 : -1;

          // Convert to strings for comparison if not numbers
          const aStr =
            typeof aValue === "number"
              ? aValue
              : aValue.toString().toLowerCase();
          const bStr =
            typeof bValue === "number"
              ? bValue
              : bValue.toString().toLowerCase();

          if (aStr < bStr) return sort === "asc" ? -1 : 1;
          if (aStr > bStr) return sort === "asc" ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [data, searchText, columnFilters, sortModel, columns]);

  // Convert data to include unique IDs for MUI DataGrid
  const rows = useMemo(() => {
    return processedData.map((row, index) => ({
      ...row,
      _id: row.id || `row-${index}`,
    }));
  }, [processedData]);

  // Calculate pagination values
  const totalPages = Math.ceil((rows?.length || 0) / paginationModel.pageSize);
  const paginatedRows = useMemo(() => {
    if (!pagination || !rows || !Array.isArray(rows)) return rows || [];
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return rows.slice(start, end);
  }, [rows, paginationModel, pagination]);

  // Handle pagination changes
  const handlePageChange = useCallback((newPage: number) => {
    setPaginationModel((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPaginationModel({ page: 0, pageSize: newPageSize });
  }, []);

  // Handle sort model changes
  const handleSortModelChange = useCallback((model: GridSortModel) => {
    setSortModel(model);
  }, []);

  // Handle column visibility changes
  const handleColumnVisibilityChange = useCallback(
    (model: GridColumnVisibilityModel) => {
      setColumnVisibility(model);
    },
    []
  );

  // Handle column filter changes
  const handleColumnFiltersChange = useCallback((filters: ColumnFilter[]) => {
    setColumnFilters(filters);
    // Reset to first page when filters change
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  // Handle search changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);
    // Reset to first page when search changes
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  // Handle selection changes
  const handleSelectionModelChange = useCallback(
    (selectionModel: any) => {
      if (selectable && onSelectionChange) {
        const selected = rows.filter((row) => selectionModel.includes(row._id));
        setSelectedRows(selected);
        onSelectionChange(selected);
      }
    },
    [rows, selectable, onSelectionChange]
  );

  // Convert columns to MUI DataGrid format
  const muiColumns = useMemo((): GridColDef[] => {
    const convertedColumns: GridColDef[] = columns.map((column) => {
      const muiColumn: GridColDef = {
        field: column.id as string,
        headerName: column.header,
        sortable: column.sortable !== false && sortable,
        filterable: false, // We handle filtering manually
        headerAlign: "left", // Always left align headers
        align: "left", // Always left align cells
        flex: column.width ? 0 : 1,
        width: column.width ? parseInt(column.width) : undefined,
        minWidth: 120,
        hideable: false,
        disableColumnMenu: true,
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
                  justifyContent: "flex-start",
                  textAlign: "left",
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
                justifyContent: "flex-start",
                textAlign: "left",
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
  }, [columns, actions, sortable, showActions]);

  // Handle row click
  const handleRowClick = useCallback(
    (params: GridRowParams) => {
      if (onRowClick) {
        onRowClick(params.row);
      }
    },
    [onRowClick]
  );

  // Create slots object with proper types
  const slots: Partial<GridSlotsComponent> = {
    noRowsOverlay: () => <CustomNoRowsOverlay emptyMessage={emptyMessage} />,
    loadingOverlay: CustomLoadingOverlay,
  };

  // Reset page when data changes
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [data.length]);

  return (
    <ThemeProvider theme={dataGridTheme}>
      <CustomToolbarWithSearch
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onApplySearch={() => {}}
        onSearchKeyPress={() => {}}
        columns={columns}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        columnFilters={columnFilters}
        appliedColumnFilters={columnFilters}
        onColumnFiltersChange={handleColumnFiltersChange}
        onApplyFilters={() => {}}
        onClearAll={() => {
          setColumnFilters([]);
          setSearchText("");
        }}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        showSearch={searchable}
        showColumnFilters={enableColumnFilters}
        showColumnVisibility={enableColumnVisibility}
      />
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
            maxHeight: maxHeight,
          }}
        >
          <StyledDataGrid
            rows={paginatedRows}
            columns={muiColumns}
            getRowId={(row) => row._id}
            loading={loading}
            onRowClick={onRowClick ? handleRowClick : undefined}
            slots={slots}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            columnVisibilityModel={columnVisibility}
            onColumnVisibilityModelChange={handleColumnVisibilityChange}
            checkboxSelection={selectable}
            onRowSelectionModelChange={handleSelectionModelChange}
            disableRowSelectionOnClick={!selectable}
            disableColumnSelector
            disableDensitySelector
            disableColumnFilter
            getRowHeight={() => "auto"}
            hideFooter={true}
            sx={{
              flex: 1,
              border: "none",
              fontFamily: "inherit",
              "& .MuiDataGrid-columnHeaders": stickyHeader
                ? {
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }
                : {},
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
                justifyContent: "flex-start",
                textAlign: "left",
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
              "& .MuiDataGrid-columnHeaderTitleContainer": {
                justifyContent: "flex-start",
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

        {/* Selection Summary */}
        {selectable && selectedRows.length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "#eff6ff",
              border: "1px solid #dbeafe",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" color="primary">
              {selectedRows.length} row{selectedRows.length > 1 ? "s" : ""}{" "}
              selected
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setSelectedRows([]);
                if (onSelectionChange) onSelectionChange([]);
              }}
              variant="outlined"
              color="primary"
            >
              Clear Selection
            </Button>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default DataTable;
