import axiosInstance from "../api/axios";
import type { ApiResponse } from "../types/fptk";
import type { Area } from "../types/area";

const areaService = {
  getAreas: async (params?: {
    search?: string;
  }): Promise<ApiResponse<Area[]>> => {
    const response = await axiosInstance.get<ApiResponse<Area[]>>("/areas", {
      params,
    });
    return response.data;
  },

  getArea: async (id: number): Promise<ApiResponse<Area>> => {
    const response = await axiosInstance.get<ApiResponse<Area>>(`/areas/${id}`);
    return response.data;
  },

  createArea: async (data: { name: string }): Promise<ApiResponse<Area>> => {
    const response = await axiosInstance.post<ApiResponse<Area>>(
      "/areas",
      data,
    );
    return response.data;
  },

  updateArea: async (
    id: number,
    data: { name: string },
  ): Promise<ApiResponse<Area>> => {
    const response = await axiosInstance.put<ApiResponse<Area>>(
      `/areas/${id}`,
      data,
    );
    return response.data;
  },

  deleteArea: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/areas/${id}`,
    );
    return response.data;
  },
};

export default areaService;
