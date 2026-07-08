import axiosInstance from "../api/axios";
import type {
  AssessableSubject,
  CompetencyMatrix,
  AssessmentHistoryItem,
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
};

export default competencyService;
