import axiosInstance from "../api/axios";
import type { CompetencyMatrix } from "../types/competency";

const matrixManagementService = {
  getMatrices: async (): Promise<{
    success: boolean;
    data: CompetencyMatrix[];
  }> => {
    const response = await axiosInstance.get("/competency-matrices");
    return response.data;
  },

  createMatrix: async (payload: { station_id: number; name: string }) => {
    const response = await axiosInstance.post("/competency-matrices", payload);
    return response.data;
  },

  updateMatrix: async (
    id: number,
    payload: { name?: string; is_active?: boolean },
  ) => {
    const response = await axiosInstance.put(
      `/competency-matrices/${id}`,
      payload,
    );
    return response.data;
  },

  deleteMatrix: async (id: number) => {
    const response = await axiosInstance.delete(`/competency-matrices/${id}`);
    return response.data;
  },

  createCategory: async (
    matrixId: number,
    payload: { name: string; order?: number },
  ) => {
    const response = await axiosInstance.post(
      `/competency-matrices/${matrixId}/categories`,
      payload,
    );
    return response.data;
  },

  updateCategory: async (
    id: number,
    payload: { name?: string; order?: number },
  ) => {
    const response = await axiosInstance.put(
      `/competency-categories/${id}`,
      payload,
    );
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await axiosInstance.delete(`/competency-categories/${id}`);
    return response.data;
  },

  createCheckpoint: async (
    categoryId: number,
    payload: { description: string; weight: number; order?: number; sequence?: number; main_process?: string },
  ) => {
    const response = await axiosInstance.post(
      `/competency-categories/${categoryId}/checkpoints`,
      payload,
    );
    return response.data;
  },

  updateCheckpoint: async (
    id: number,
    payload: { description?: string; weight?: number; order?: number },
  ) => {
    const response = await axiosInstance.put(
      `/competency-checkpoints/${id}`,
      payload,
    );
    return response.data;
  },

  deleteCheckpoint: async (id: number) => {
    const response = await axiosInstance.delete(
      `/competency-checkpoints/${id}`,
    );
    return response.data;
  },
};

export default matrixManagementService;
