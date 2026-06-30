import axiosInstance from "../api/axios";
import type {
  Requisition,
  CreateRequisitionInput,
  UpdateRequisitionInput,
  RequisitionListParams,
  PaginatedResponse,
  ApiResponse,
  ApprovalInput,
  ApprovalHistory,
  MasterData,
} from "../types/fptk";

const fptkService = {
  // Get master data
  getMasterData: async (): Promise<ApiResponse<MasterData>> => {
    const response =
      await axiosInstance.get<ApiResponse<MasterData>>("/master-data");
    return response.data;
  },

  // Get all requisitions with optional filters
  getRequisitions: async (
    params?: RequisitionListParams,
  ): Promise<PaginatedResponse<Requisition>> => {
    const response = await axiosInstance.get<PaginatedResponse<Requisition>>(
      "/fptk",
      { params },
    );
    return response.data;
  },

  // Get pending approvals for current user
  getPendingApprovals: async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Requisition>> => {
    const response = await axiosInstance.get<PaginatedResponse<Requisition>>(
      "/fptk/pending",
      { params },
    );
    return response.data;
  },

  // Get single requisition
  getRequisition: async (noReq: string): Promise<ApiResponse<Requisition>> => {
    const response = await axiosInstance.get<ApiResponse<Requisition>>(
      `/fptk/${noReq}`,
    );
    return response.data;
  },

  // Create new requisition
  createRequisition: async (
    data: CreateRequisitionInput,
  ): Promise<ApiResponse<Requisition>> => {
    const response = await axiosInstance.post<ApiResponse<Requisition>>(
      "/fptk",
      data,
    );
    return response.data;
  },

  // Update requisition
  updateRequisition: async (
    noReq: string,
    data: UpdateRequisitionInput,
  ): Promise<ApiResponse<Requisition>> => {
    const response = await axiosInstance.put<ApiResponse<Requisition>>(
      `/fptk/${noReq}`,
      data,
    );
    return response.data;
  },

  // Delete requisition
  deleteRequisition: async (noReq: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/fptk/${noReq}`,
    );
    return response.data;
  },

  // Approve or reject requisition
  reviewRequisition: async (
    noReq: string,
    data: ApprovalInput,
  ): Promise<ApiResponse<Requisition>> => {
    const response = await axiosInstance.post<ApiResponse<Requisition>>(
      `/approvals/${noReq}/review`,
      data,
    );
    return response.data;
  },

  // Get requisition for review
  getRequisitionForReview: async (
    noReq: string,
  ): Promise<ApiResponse<Requisition>> => {
    const response = await axiosInstance.get<ApiResponse<Requisition>>(
      `/approvals/${noReq}`,
    );
    return response.data;
  },

  // Get approval history
  getApprovalHistory: async (
    noReq: string,
  ): Promise<ApiResponse<ApprovalHistory>> => {
    const response = await axiosInstance.get<ApiResponse<ApprovalHistory>>(
      `/approvals/${noReq}/history`,
    );
    return response.data;
  },
  // Get approvers grouped by role level
  getApprovers: async () => {
    const response = await axiosInstance.get("/fptk/approvers");
    return response.data;
  },

  // Get FPTKs where the current approver has already acted (regardless of overall status)
  getApproverActionHistory: async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Requisition>> => {
    const response = await axiosInstance.get<PaginatedResponse<Requisition>>(
      "/fptk/approval-history",
      { params },
    );
    return response.data;
  },

  processHrd: async (noReq: string): Promise<ApiResponse<Requisition>> => {
    const response = await axiosInstance.post<ApiResponse<Requisition>>(
      `/fptk/${noReq}/process-hrd`,
    );
    return response.data;
  },
};

export default fptkService;
