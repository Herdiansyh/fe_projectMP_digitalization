import axiosInstance from "../api/axios";
import type { ApiResponse, EvaluationGroup, EvaluationSubgroup, EvaluationCriteria } from "../types/evaluation";
import type {
  ReorderPayload,
  GroupPayload,
  SubgroupPayload,
  CriteriaPayload,
  ScaleOptionsBulkPayload,
} from "../types/evaluationCriteriaManage";

const evaluationCriteriaManageService = {
  // Groups
  createGroup: async (payload: GroupPayload): Promise<ApiResponse<EvaluationGroup>> => {
    const response = await axiosInstance.post<ApiResponse<EvaluationGroup>>("/evaluation-criteria/groups", payload);
    return response.data;
  },
  updateGroup: async (id: number, payload: GroupPayload): Promise<ApiResponse<EvaluationGroup>> => {
    const response = await axiosInstance.put<ApiResponse<EvaluationGroup>>(`/evaluation-criteria/groups/${id}`, payload);
    return response.data;
  },
  deleteGroup: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/evaluation-criteria/groups/${id}`);
    return response.data;
  },
  reorderGroups: async (payload: ReorderPayload): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.put<ApiResponse<void>>("/evaluation-criteria/groups/reorder", payload);
    return response.data;
  },

  // Subgroups
  createSubgroup: async (groupId: number, payload: SubgroupPayload): Promise<ApiResponse<EvaluationSubgroup>> => {
    const response = await axiosInstance.post<ApiResponse<EvaluationSubgroup>>(`/evaluation-criteria/groups/${groupId}/subgroups`, payload);
    return response.data;
  },
  updateSubgroup: async (id: number, payload: SubgroupPayload): Promise<ApiResponse<EvaluationSubgroup>> => {
    const response = await axiosInstance.put<ApiResponse<EvaluationSubgroup>>(`/evaluation-criteria/subgroups/${id}`, payload);
    return response.data;
  },
  deleteSubgroup: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/evaluation-criteria/subgroups/${id}`);
    return response.data;
  },
  reorderSubgroups: async (groupId: number, payload: ReorderPayload): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.put<ApiResponse<void>>(`/evaluation-criteria/groups/${groupId}/subgroups/reorder`, payload);
    return response.data;
  },

  // Criteria
  createCriteria: async (groupId: number, payload: CriteriaPayload): Promise<ApiResponse<EvaluationCriteria>> => {
    const response = await axiosInstance.post<ApiResponse<EvaluationCriteria>>(`/evaluation-criteria/groups/${groupId}/criteria`, payload);
    return response.data;
  },
  updateCriteria: async (id: number, payload: CriteriaPayload): Promise<ApiResponse<EvaluationCriteria>> => {
    const response = await axiosInstance.put<ApiResponse<EvaluationCriteria>>(`/evaluation-criteria/criteria/${id}`, payload);
    return response.data;
  },
  deleteCriteria: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/evaluation-criteria/criteria/${id}`);
    return response.data;
  },
  reorderCriteria: async (groupId: number, payload: ReorderPayload): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.put<ApiResponse<void>>(`/evaluation-criteria/groups/${groupId}/criteria/reorder`, payload);
    return response.data;
  },

  // Scale Options
  updateScaleOptions: async (criteriaId: number, payload: ScaleOptionsBulkPayload): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.put<ApiResponse<void>>(`/evaluation-criteria/criteria/${criteriaId}/scale-options`, payload);
    return response.data;
  },
  // Bulk Save
  bulkUpdate: async (payload: { groups: EvaluationGroup[] }): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.put<ApiResponse<void>>("/evaluation-criteria/bulk-save", payload);
    return response.data;
  },
};

export default evaluationCriteriaManageService;
