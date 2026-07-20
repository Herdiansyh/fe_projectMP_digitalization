import axiosInstance from "../api/axios";
import type {
  LoginCredentials,
  AuthResponse,
  User,
  RoleLevel,
  ApiResponse,
} from "../types/auth";

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      credentials,
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  me: async (): Promise<User> => {
    const response = await axiosInstance.get<{
      success: boolean;
      message: string;
      data: User;
    }>("/auth/me");
    return response.data.data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/auth/refresh");
    return response.data;
  },

  getRoleLevels: async (): Promise<ApiResponse<RoleLevel[]>> => {
    const response =
      await axiosInstance.get<ApiResponse<RoleLevel[]>>("/role-levels");
    return response.data;
  },
};

export default authService;
