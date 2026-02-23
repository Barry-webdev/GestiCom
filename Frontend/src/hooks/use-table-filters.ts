import { useState, useMemo } from "react";

interface UseTableFiltersProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  initialPageSize?: number;
}

export function useTableFilters<T>({
  data,
  searchFields,
  initialPageSize = 10,
}: UseTableFiltersProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filtrer les données
  const filteredData = useMemo(() => {
    let result = [...data];

    // Recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Filtres additionnels
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => {
          const itemValue = item[key as keyof T];
          return itemValue === value;
        });
      }
    });

    return result;
  }, [data, searchQuery, filters, searchFields]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Réinitialiser la page lors du changement de recherche/filtres
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({});
    setCurrentPage(1);
  };

  return {
    // Données
    filteredData,
    paginatedData,
    totalItems: filteredData.length,
    
    // Recherche
    searchQuery,
    setSearchQuery: handleSearchChange,
    
    // Filtres
    filters,
    setFilter: handleFilterChange,
    resetFilters,
    
    // Pagination
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage: handlePageChange,
    setPageSize: handlePageSizeChange,
  };
}
