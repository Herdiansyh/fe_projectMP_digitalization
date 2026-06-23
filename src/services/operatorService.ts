import api from "../api/axios";
import type {
  OperatorFormData,
  OperatorApiResponse,
  OperatorListApiResponse,
} from "../types/auth";

const operatorService = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<OperatorListApiResponse> => {
    const response = await api.get("/operators", { params });
    return response.data;
  },

  store: async (data: OperatorFormData): Promise<OperatorApiResponse> => {
    const response = await api.post("/operators", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<OperatorFormData>,
  ): Promise<OperatorApiResponse> => {
    const response = await api.put(`/operators/${id}`, data);
    return response.data;
  },

  destroy: async (id: number): Promise<void> => {
    await api.delete(`/operators/${id}`);
  },
};

export default operatorService;
