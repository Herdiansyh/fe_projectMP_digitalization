import axiosInstance from "../api/axios";
import type { Area } from "../types/area";
import type {
  UserListParams,
  UserFormData,
  ResetPasswordData,
  UserApiResponse,
  UserListApiResponse,
  Department,
  Section,
  RoleLevel,
  SectionHeadApprover,
} from "../types/user";

export interface MasterDataResponse {
  success: boolean;
  data: {
    departments: Department[];
    sections: Section[];
    role_levels: RoleLevel[];
    areas: Area[];
    companies: { id: number; name: string }[];
    employee_statuses: { id: number; name: string; level_default: string }[];
  };
}

export interface SectionHeadListResponse {
  success: boolean;
  message: string;
  data: SectionHeadApprover[];
}

const userService = {
  // Get paginated list of users
  getUsers: async (params?: UserListParams): Promise<UserListApiResponse> => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, v]) => v !== "" && v !== undefined && v !== null,
          ),
        )
      : {};
    const response = await axiosInstance.get<any>("/users", {
      params: cleanParams,
    });

    const payload = response.data.data; // { data: [...], links, meta }

    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        data: payload.data,
        current_page: payload.meta.current_page,
        last_page: payload.meta.last_page,
        per_page: payload.meta.per_page,
        total: payload.meta.total,
      },
    };
  },

  // Get single user
  getUser: async (id: number): Promise<UserApiResponse> => {
    const response = await axiosInstance.get<UserApiResponse>(`/users/${id}`);
    return response.data;
  },

  // Create user
  createUser: async (data: UserFormData): Promise<UserApiResponse> => {
    const response = await axiosInstance.post<UserApiResponse>("/users", data);
    return response.data;
  },

  // Update user
  updateUser: async (
    id: number,
    data: Partial<UserFormData>,
  ): Promise<UserApiResponse> => {
    const response = await axiosInstance.put<UserApiResponse>(
      `/users/${id}`,
      data,
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete<{
      success: boolean;
      message: string;
    }>(`/users/${id}`);
    return response.data;
  },

  // Reset password by admin
  resetPassword: async (
    id: number,
    data: ResetPasswordData,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post<{
      success: boolean;
      message: string;
    }>(`/users/${id}/reset-password`, data);
    return response.data;
  },

  getApproversForUser: async (id: number) => {
    const response = await axiosInstance.get(`/users/${id}/approvers`);
    return response.data;
  },

  // Get all master data (departments, sections, role_levels) dari satu endpoint
  getMasterData: async (): Promise<MasterDataResponse> => {
    const response =
      await axiosInstance.get<MasterDataResponse>("/master-data");
    return response.data;
  },

  // Get list of users with role level "Section Head", untuk dropdown
  // Approver Section Head — dipakai untuk routing approval Evaluation form
  getSectionHeads: async (): Promise<SectionHeadListResponse> => {
    const response = await axiosInstance.get<SectionHeadListResponse>(
      "/users/section-heads",
    );
    return response.data;
  },
};

export default userService;
