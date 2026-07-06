import axiosInstance from "../api/axios";
import type { ApiResponse } from "../types/fptk";
import type { Line } from "../types/line";

const lineService = {
  getLines: async (params?: {
    search?: string;
    area_id?: number;
  }): Promise<ApiResponse<Line[]>> => {
    const response = await axiosInstance.get<ApiResponse<Line[]>>("/lines", {
      params,
    });
    return response.data;
  },

  getLine: async (id: number): Promise<ApiResponse<Line>> => {
    const response = await axiosInstance.get<ApiResponse<Line>>(`/lines/${id}`);
    return response.data;
  },

  createLine: async (data: {
    area_id: number;
    name: string;
  }): Promise<ApiResponse<Line>> => {
    const response = await axiosInstance.post<ApiResponse<Line>>(
      "/lines",
      data,
    );
    return response.data;
  },

  updateLine: async (
    id: number,
    data: { area_id: number; name: string },
  ): Promise<ApiResponse<Line>> => {
    const response = await axiosInstance.put<ApiResponse<Line>>(
      `/lines/${id}`,
      data,
    );
    return response.data;
  },

  deleteLine: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/lines/${id}`,
    );
    return response.data;
  },
};

export default lineService;
