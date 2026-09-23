// src/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s — data considered fresh
      gcTime: 5 * 60_000, // 5min — cache kept in memory
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
