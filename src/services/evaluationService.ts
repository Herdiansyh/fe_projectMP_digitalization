import axiosInstance from "../api/axios";
import type {
  ApiResponse,
  Evaluation,
  EvaluationActionPayload,
  EvaluationCreatePayload,
  EvaluationListParams,
  EvaluationRecommendationPayload,
  EvaluationScorePayload,
  EvaluationUpdatePayload,
  EvaluationGroup,
  PaginatedResponse,
  PendingTrigger,
  PendingInternTrigger,
  CloseContractPayload,
  ExtendContractPayload,
  PromotePayload,
  NotExtendPayload,
} from "../types/evaluation";

const evaluationService = {
  getCriteria: async (): Promise<ApiResponse<EvaluationGroup[]>> => {
    const response = await axiosInstance.get<ApiResponse<EvaluationGroup[]>>(
      "/evaluations/criteria",
    );
    return response.data;
  },

  getEvaluations: async (
    params?: EvaluationListParams,
  ): Promise<PaginatedResponse<Evaluation>> => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, v]) => v !== "" && v !== undefined && v !== null,
          ),
        )
      : {};
    const response = await axiosInstance.get<any>("/evaluations", {
      params: cleanParams,
    });

    const payload = response.data.data; // { data: [...], links, meta }

    return {
      success: response.data.success,
      message: response.data.message,
      data: payload.data,
      current_page: payload.meta.current_page,
      last_page: payload.meta.last_page,
      per_page: payload.meta.per_page,
      total: payload.meta.total,
    };
  },

  createEvaluation: async (
    payload: EvaluationCreatePayload,
  ): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.post<ApiResponse<Evaluation>>(
      "/evaluations",
      payload,
    );
    return response.data;
  },

  getEvaluation: async (id: number): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.get<ApiResponse<Evaluation>>(
      `/evaluations/${id}`,
    );
    return response.data;
  },

  updateEvaluation: async (
    id: number,
    payload: EvaluationUpdatePayload,
  ): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.put<ApiResponse<Evaluation>>(
      `/evaluations/${id}`,
      payload,
    );
    return response.data;
  },

  updateScores: async (
    id: number,
    payload: EvaluationScorePayload,
  ): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.post<ApiResponse<Evaluation>>(
      `/evaluations/${id}/scores`,
      payload,
    );
    return response.data;
  },

  updateRecommendation: async (
    id: number,
    payload: EvaluationRecommendationPayload,
  ): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.post<ApiResponse<Evaluation>>(
      `/evaluations/${id}/recommendation`,
      payload,
    );
    return response.data;
  },

  submitEvaluation: async (id: number): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.post<ApiResponse<Evaluation>>(
      `/evaluations/${id}/submit`,
    );
    return response.data;
  },

  deleteEvaluation: async (id: number): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/evaluations/${id}`,
    );
    return response.data;
  },

  approveEvaluation: async (
    id: number,
    payload?: EvaluationActionPayload,
  ): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.post<ApiResponse<Evaluation>>(
      `/evaluations/${id}/approve`,
      payload ?? {},
    );
    return response.data;
  },

  rejectEvaluation: async (
    id: number,
    payload: EvaluationActionPayload,
  ): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.post<ApiResponse<Evaluation>>(
      `/evaluations/${id}/reject`,
      payload,
    );
    return response.data;
  },

  getPendingTriggers: async (
    type?: "employee" | "intern",
  ): Promise<ApiResponse<(PendingTrigger | PendingInternTrigger)[]>> => {
    const response = await axiosInstance.get<
      ApiResponse<(PendingTrigger | PendingInternTrigger)[]>
    >("/evaluations/pending-triggers", {
      params: type ? { type } : {},
    });
    return response.data;
  },

  forwardToHrAdmin: async (
    id: number,
    payload?: EvaluationActionPayload,
  ): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.post<ApiResponse<Evaluation>>(
      `/evaluations/${id}/forward-to-hr-admin`,
      payload ?? {},
    );
    return response.data;
  },

  getPendingHrDecisions: async (
    params?: EvaluationListParams,
  ): Promise<PaginatedResponse<Evaluation>> => {
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(
            ([, v]) => v !== "" && v !== undefined && v !== null,
          ),
        )
      : {};
    const response = await axiosInstance.get<any>(
      "/evaluations/pending-hr-decisions",
      { params: cleanParams },
    );

    const payload = response.data.data; // { data: [...], links, meta }

    return {
      success: response.data.success,
      message: response.data.message,
      data: payload.data,
      current_page: payload.meta.current_page,
      last_page: payload.meta.last_page,
      per_page: payload.meta.per_page,
      total: payload.meta.total,
    };
  },

  extendContract: async (
    id: number,
    payload: ExtendContractPayload,
  ): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.post<ApiResponse<Evaluation>>(
      `/evaluations/${id}/extend-contract`,
      payload,
    );
    return response.data;
  },

  closeContract: async (
    id: number,
    payload: CloseContractPayload,
  ): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.post<ApiResponse<Evaluation>>(
      `/evaluations/${id}/close-contract`,
      payload,
    );
    return response.data;
  },

  // === TAMBAHAN INTERN ===
  // Sesuai routes/api.php: POST /evaluations/{evaluation}/promote
  promoteIntern: async (
    id: number,
    payload: PromotePayload,
  ): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.post<ApiResponse<Evaluation>>(
      `/evaluations/${id}/promote`,
      payload,
    );
    return response.data;
  },

  // === TAMBAHAN INTERN ===
  // Sesuai routes/api.php: POST /evaluations/{evaluation}/not-extend
  notExtendIntern: async (
    id: number,
    payload: NotExtendPayload,
  ): Promise<ApiResponse<Evaluation>> => {
    const response = await axiosInstance.post<ApiResponse<Evaluation>>(
      `/evaluations/${id}/not-extend`,
      payload,
    );
    return response.data;
  },

  getHrDecisionHistory: async (
    params?: EvaluationListParams,
  ): Promise<PaginatedResponse<Evaluation>> => {
    const response = await axiosInstance.get(
      "/evaluations/hr-decision-history",
      {
        params,
      },
    );

    const payload = response.data.data; // { data: [...], links, meta }

    return {
      success: response.data.success,
      message: response.data.message,
      data: payload.data,
      current_page: payload.meta.current_page,
      last_page: payload.meta.last_page,
      per_page: payload.meta.per_page,
      total: payload.meta.total,
    };
  },
};

export default evaluationService;
