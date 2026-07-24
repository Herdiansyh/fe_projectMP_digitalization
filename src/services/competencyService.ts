import axiosInstance from "../api/axios";
import type {
  AssessableSubject,
  CompetencyMatrix,
  AssessmentHistoryItem,
  QaQueueItem,
  MySubmissionItem,
  AssessmentDetail,
  MyReviewItem,
  MonitoringItem,
} from "../types/competency";

const competencyService = {
  getAssessableEmployees: async (): Promise<{
    success: boolean;
    data: AssessableSubject[];
  }> => {
    const response = await axiosInstance.get("/assessments/assessable");
    return response.data;
  },

  getMatrixForSubject: async (
    subjectType: "employee" | "intern",
    subjectId: number,
  ): Promise<{ success: boolean; data: CompetencyMatrix }> => {
    const response = await axiosInstance.get("/assessments/matrix", {
      params: { subject_type: subjectType, subject_id: subjectId },
    });
    return response.data;
  },

  submitAssessment: async (payload: {
    subject_type: "employee" | "intern";
    subject_id: number;
    matrix_id: number;
    period_label: string;
    notes?: string;
    scores: { checkpoint_id: number; point: number }[];
  }) => {
    const response = await axiosInstance.post("/assessments", payload);
    return response.data;
  },

  getHistory: async (
    subjectType: "employee" | "intern",
    subjectId: number,
  ): Promise<{ success: boolean; data: AssessmentHistoryItem[] }> => {
    const response = await axiosInstance.get("/assessments/history", {
      params: { subject_type: subjectType, subject_id: subjectId },
    });
    return response.data;
  },

  getQaQueue: async (): Promise<{ success: boolean; data: QaQueueItem[] }> => {
    const response = await axiosInstance.get("/assessments/qa-queue");
    return response.data;
  },

  submitQaReview: async (
    assessmentId: number,
    payload: { scores: { checkpoint_id: number; point: number }[] },
  ) => {
    const response = await axiosInstance.post(
      `/assessments/${assessmentId}/qa`,
      payload,
    );
    return response.data;
  },

  getMySubmissions: async (): Promise<{
    success: boolean;
    data: MySubmissionItem[];
  }> => {
    const response = await axiosInstance.get("/assessments/my-submissions");
    return response.data;
  },
  getAssessmentDetail: async (
    id: number,
  ): Promise<{ success: boolean; data: AssessmentDetail }> => {
    const response = await axiosInstance.get(`/assessments/${id}`);
    return response.data;
  },
  getMyReviews: async (): Promise<{
    success: boolean;
    data: MyReviewItem[];
  }> => {
    const response = await axiosInstance.get("/assessments/my-reviews");
    return response.data;
  },

  getMonitoring: async (): Promise<{
    success: boolean;
    data: MonitoringItem[];
  }> => {
    const response = await axiosInstance.get("/assessments/monitoring");
    return response.data;
  },
  getStationSummary: async (
    subjectType: "employee" | "intern",
    subjectId: number,
  ): Promise<{ success: boolean; data: StationCompetencySummary[] }> => {
    const response = await axiosInstance.get("/assessments/station-summary", {
      params: { subject_type: subjectType, subject_id: subjectId },
    });
    return response.data;
  },
};

export default competencyService;
