import { useQuery } from "@tanstack/react-query";
import dashboardService from "../../services/dashboardService";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  main: () => [...dashboardKeys.all, "summary"] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.main(),
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 60 * 1000,
  });
}