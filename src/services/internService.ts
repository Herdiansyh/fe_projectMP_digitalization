import axiosInstance from "../api/axios";
import type { PaginatedResponse, ApiResponse } from "../types/fptk";
import type {
  CreateInternInput,
  Intern,
  InternListParams,
  UpdateInternInput,
} from "../types/intern";

const internService = {
  getInterns: async (
    params?: InternListParams,
  ): Promise<PaginatedResponse<Intern>> => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, v]) => v !== "" && v !== undefined && v !== null,
          ),
        )
      : {};
    const response = await axiosInstance.get<PaginatedResponse<Intern>>(
      "/interns",
      { params: cleanParams },
    );
    return response.data;
  },

  // Get single intern
  getIntern: async (id: number): Promise<ApiResponse<Intern>> => {
    const response = await axiosInstance.get<ApiResponse<Intern>>(
      `/interns/${id}`,
    );
    return response.data;
  },

  // Untuk export / print semua data sesuai filter aktif (bypass pagination)
  getAllInterns: async (
    params?: Omit<InternListParams, "page" | "per_page">,
  ): Promise<ApiResponse<{ data: Intern[] }>> => {
    const cleanParams = {
      ...Object.fromEntries(
        Object.entries(params ?? {}).filter(
          ([, value]) => value !== "" && value !== undefined && value !== null,
        ),
      ),
      all: true,
    };

    const response = await axiosInstance.get<ApiResponse<{ data: Intern[] }>>(
      "/interns",
      { params: cleanParams },
    );

    return response.data;
  },

  // Create new intern
  createIntern: async (
    data: CreateInternInput,
  ): Promise<ApiResponse<Intern>> => {
    const response = await axiosInstance.post<ApiResponse<Intern>>(
      "/interns",
      data,
    );
    return response.data;
  },

  // Update intern
  updateIntern: async (
    id: number,
    data: UpdateInternInput,
  ): Promise<ApiResponse<Intern>> => {
    const response = await axiosInstance.put<ApiResponse<Intern>>(
      `/interns/${id}`,
      data,
    );
    return response.data;
  },

  getActiveInterns: async (): Promise<ApiResponse<Intern[]>> => {
    const response = await axiosInstance.get<ApiResponse<Intern[]>>(
      "/interns/active-list",
    );
    return response.data;
  },

  // Delete intern
  deleteIntern: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/interns/${id}`,
    );
    return response.data;
  },
};

export default internService;
