import axiosInstance from "../api/axios";
import type { ApiResponse } from "../types/fptk";
import type { Station } from "../types/station";

const stationService = {
  // List semua station (dipakai untuk dropdown / list). Bisa difilter per line atau area.
  getStations: async (params?: {
    search?: string;
    line_id?: number | string;
    area_id?: number | string;
  }): Promise<ApiResponse<Station[]>> => {
    const response = await axiosInstance.get<ApiResponse<Station[]>>(
      "/stations",
      { params },
    );
    return response.data;
  },

  getStation: async (id: number): Promise<ApiResponse<Station>> => {
    const response = await axiosInstance.get<ApiResponse<Station>>(
      `/stations/${id}`,
    );
    return response.data;
  },

  createStation: async (data: {
    name: string;
    line_id: number | string;
  }): Promise<ApiResponse<Station>> => {
    const response = await axiosInstance.post<ApiResponse<Station>>(
      "/stations",
      data,
    );
    return response.data;
  },

  updateStation: async (
    id: number,
    data: { name: string; line_id: number | string },
  ): Promise<ApiResponse<Station>> => {
    const response = await axiosInstance.put<ApiResponse<Station>>(
      `/stations/${id}`,
      data,
    );
    return response.data;
  },

  deleteStation: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/stations/${id}`,
    );
    return response.data;
  },
};

export default stationService;
