// src/hooks/queries/useStationQueries.tsx
import { useQuery } from "@tanstack/react-query";
import stationService from "../../services/stationService";

export const stationKeys = {
  all: ["stations"] as const,
  lists: () => [...stationKeys.all, "list"] as const,
};

export const useStations = () => {
  return useQuery({
    queryKey: stationKeys.lists(),
    queryFn: () => stationService.getStations(),
    staleTime: 5 * 60 * 1000,
  });
};
