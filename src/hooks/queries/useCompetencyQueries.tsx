// src/hooks/queries/useCompetencyQueries.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import competencyService from "../../services/competencyService";

export const competencyKeys = {
  all: ["competency"] as const,
  assessable: () => [...competencyKeys.all, "assessable"] as const,
  matrix: (subjectType?: "employee" | "intern", subjectId?: number) =>
    [...competencyKeys.all, "matrix", subjectType, subjectId] as const,
  history: (subjectType?: "employee" | "intern", subjectId?: number) =>
    [...competencyKeys.all, "history", subjectType, subjectId] as const,
  qaQueue: () => [...competencyKeys.all, "qa-queue"] as const,
  mySubmissions: () => [...competencyKeys.all, "my-submissions"] as const,
  details: () => [...competencyKeys.all, "detail"] as const,
  detail: (id: number) => [...competencyKeys.details(), id] as const,
  myReviews: () => [...competencyKeys.all, "my-reviews"] as const,
  monitoring: () => [...competencyKeys.all, "monitoring"] as const,
  stationSummary: (subjectType?: "employee" | "intern", subjectId?: number) =>
    [...competencyKeys.all, "station-summary", subjectType, subjectId] as const,
};

// ── Queries ──────────────────────────────────────────

export const useAssessableEmployees = () => {
  return useQuery({
    queryKey: competencyKeys.assessable(),
    queryFn: () => competencyService.getAssessableEmployees(),
  });
};

export const useMatrixForSubject = (
  subjectType: "employee" | "intern",
  subjectId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: competencyKeys.matrix(subjectType, subjectId),
    queryFn: () =>
      competencyService.getMatrixForSubject(subjectType, subjectId),
    enabled: !!subjectType && !!subjectId && enabled,
  });
};

export const useAssessmentHistory = (
  subjectType: "employee" | "intern",
  subjectId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: competencyKeys.history(subjectType, subjectId),
    queryFn: () => competencyService.getHistory(subjectType, subjectId),
    enabled: !!subjectType && !!subjectId && enabled,
  });
};

export const useQaQueue = () => {
  return useQuery({
    queryKey: competencyKeys.qaQueue(),
    queryFn: () => competencyService.getQaQueue(),
  });
};

export const useMySubmissions = () => {
  return useQuery({
    queryKey: competencyKeys.mySubmissions(),
    queryFn: () => competencyService.getMySubmissions(),
  });
};

export const useAssessmentDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: competencyKeys.detail(id),
    queryFn: () => competencyService.getAssessmentDetail(id),
    enabled: !!id && enabled,
  });
};

export const useMyReviews = () => {
  return useQuery({
    queryKey: competencyKeys.myReviews(),
    queryFn: () => competencyService.getMyReviews(),
  });
};

export const useMonitoring = () => {
  return useQuery({
    queryKey: competencyKeys.monitoring(),
    queryFn: () => competencyService.getMonitoring(),
  });
};

export const useStationSummary = (
  subjectType: "employee" | "intern",
  subjectId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: competencyKeys.stationSummary(subjectType, subjectId),
    queryFn: () => competencyService.getStationSummary(subjectType, subjectId),
    enabled: !!subjectType && !!subjectId && enabled,
  });
};

// ── Mutations ────────────────────────────────────────

export const useSubmitAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      subject_type: "employee" | "intern";
      subject_id: number;
      matrix_id: number;
      period_label: string;
      notes?: string;
      scores: { checkpoint_id: number; point: number }[];
    }) => competencyService.submitAssessment(payload),
    onSuccess: (_data, variables) => {
      // Supaya CompetencyAssessmentList (list utama) auto-refresh tanpa refetch manual
      queryClient.invalidateQueries({
        queryKey: competencyKeys.assessable(),
      });
      queryClient.invalidateQueries({
        queryKey: competencyKeys.mySubmissions(),
      });
      queryClient.invalidateQueries({
        queryKey: competencyKeys.history(
          variables.subject_type,
          variables.subject_id,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: competencyKeys.stationSummary(
          variables.subject_type,
          variables.subject_id,
        ),
      });
      queryClient.invalidateQueries({ queryKey: competencyKeys.monitoring() });
    },
  });
};

export const useSubmitQaReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assessmentId,
      payload,
    }: {
      assessmentId: number;
      payload: { scores: { checkpoint_id: number; point: number }[] };
    }) => competencyService.submitQaReview(assessmentId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: competencyKeys.qaQueue() });
      queryClient.invalidateQueries({ queryKey: competencyKeys.myReviews() });
      queryClient.invalidateQueries({
        queryKey: competencyKeys.detail(variables.assessmentId),
      });
      queryClient.invalidateQueries({ queryKey: competencyKeys.monitoring() });
    },
  });
};
