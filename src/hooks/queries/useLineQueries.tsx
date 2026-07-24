// src/hooks/queries/useLineQueries.tsx
import { useQuery } from "@tanstack/react-query";
import lineService from "../../services/lineService";

export const lineKeys = {
  all: ["lines"] as const,
  lists: () => [...lineKeys.all, "list"] as const,
};

export const useLines = () => {
  return useQuery({
    queryKey: lineKeys.lists(),
    queryFn: () => lineService.getLines(),
    staleTime: 5 * 60 * 1000,
  });
};
