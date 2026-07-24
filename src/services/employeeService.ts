import axiosInstance from "../api/axios";
import type {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeListParams,
} from "../types/employee";
import type { PaginatedResponse, ApiResponse } from "../types/fptk";

const employeeService = {
  // Get all employees with optional filters
  getEmployees: async (
    params?: EmployeeListParams,
  ): Promise<PaginatedResponse<Employee>> => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, v]) => v !== "" && v !== undefined && v !== null,
          ),
        )
      : {};
    const response = await axiosInstance.get<PaginatedResponse<Employee>>(
      "/employees",
      { params: cleanParams },
    );
    return response.data;
  },

  // Get single employee
  getEmployee: async (id: number): Promise<ApiResponse<Employee>> => {
    const response = await axiosInstance.get<ApiResponse<Employee>>(
      `/employees/${id}`,
    );
    return response.data;
  },
  // Untuk export / print semua data
  getAllEmployees: async (
    params?: Omit<EmployeeListParams, "page" | "per_page">,
  ): Promise<ApiResponse<{ data: Employee[] }>> => {
    const cleanParams = {
      ...Object.fromEntries(
        Object.entries(params ?? {}).filter(
          ([, value]) => value !== "" && value !== undefined && value !== null,
        ),
      ),
      all: true,
    };

    const response = await axiosInstance.get<ApiResponse<{ data: Employee[] }>>(
      "/employees",
      {
        params: cleanParams,
      },
    );

    return response.data;
  },
  // Create new employee
  createEmployee: async (
    data: CreateEmployeeInput,
  ): Promise<ApiResponse<Employee>> => {
    const response = await axiosInstance.post<ApiResponse<Employee>>(
      "/employees",
      data,
    );
    return response.data;
  },

  // Update employee
  updateEmployee: async (
    id: number,
    data: UpdateEmployeeInput,
  ): Promise<ApiResponse<Employee>> => {
    const response = await axiosInstance.put<ApiResponse<Employee>>(
      `/employees/${id}`,
      data,
    );
    return response.data;
  },

  getActiveEmployees: async (): Promise<ApiResponse<Employee[]>> => {
    const response = await axiosInstance.get<ApiResponse<Employee[]>>(
      "/employees/active-list",
    );
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/employees/${id}`,
    );
    return response.data;
  },
};

export default employeeService;
