import { useState } from 'react';

type QueryFilterValue = string | number | boolean | undefined;

export function useListFilters<T extends object>() {
  const [filters, setFilters] = useState<T>({} as T);

  const updateFilter = (key: string, value: QueryFilterValue) => {
    setFilters((current) => {
      const next = { ...current } as Record<string, QueryFilterValue>;
      if (value === undefined || value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next as T;
    });
  };

  const resetFilters = () => setFilters({} as T);
  const replaceFilters = (next: Record<string, unknown>) => setFilters(next as T);

  return { filters, updateFilter, resetFilters, replaceFilters };
}
