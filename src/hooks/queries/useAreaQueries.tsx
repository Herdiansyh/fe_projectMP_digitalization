// src/hooks/queries/useAreaQueries.tsx
import { useQuery } from "@tanstack/react-query";
import areaService from "../../services/areaService";

export const areaKeys = {
  all: ["areas"] as const,
  lists: () => [...areaKeys.all, "list"] as const,
};

export const useAreas = () => {
  return useQuery({
    queryKey: areaKeys.lists(),
    queryFn: () => areaService.getAreas(),
    staleTime: 5 * 60 * 1000,
  });
};
