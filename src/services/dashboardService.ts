import axiosInstance from "../api/axios";
import type { DashboardResponse } from "../types/dashboard";

const dashboardService = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await axiosInstance.get("/dashboard");
    return response.data;
  },
};

export default dashboardService;