// src/hooks/queries/useFptkQueries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import fptkService from "../../services/fptkService";
import type {
  CreateRequisitionInput,
  UpdateRequisitionInput,
  RequisitionListParams,
  ApprovalInput,
  AssignManpowerCandidateInput,
  AssignAreaLineCandidateInput,
} from "../../types/fptk";

export const fptkKeys = {
  all: ["fptk"] as const,
  lists: () => [...fptkKeys.all, "list"] as const,
  list: (params?: RequisitionListParams) =>
    [...fptkKeys.lists(), params] as const,
  pending: (params?: { page?: number; per_page?: number }) =>
    [...fptkKeys.all, "pending", params] as const,
  approvalHistory: (params?: { page?: number; per_page?: number }) =>
    [...fptkKeys.all, "approval-history", params] as const,
  details: () => [...fptkKeys.all, "detail"] as const,
  detail: (noReq: string) => [...fptkKeys.details(), noReq] as const,
  review: (noReq: string) => [...fptkKeys.all, "review", noReq] as const,
  history: (noReq: string) => [...fptkKeys.all, "history", noReq] as const,
  masterData: () => [...fptkKeys.all, "master-data"] as const,
  approvers: () => [...fptkKeys.all, "approvers"] as const,
};

// ── Queries ──────────────────────────────────────────

export const useMasterData = () => {
  return useQuery({
    queryKey: fptkKeys.masterData(),
    queryFn: () => fptkService.getMasterData(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFptkList = (params?: RequisitionListParams) => {
  return useQuery({
    queryKey: fptkKeys.list(params),
    queryFn: () => fptkService.getRequisitions(params),
  });
};

export const usePendingApprovals = (params?: {
  page?: number;
  per_page?: number;
}) => {
  return useQuery({
    queryKey: fptkKeys.pending(params),
    queryFn: () => fptkService.getPendingApprovals(params),
  });
};

export const useApproverActionHistory = (params?: {
  page?: number;
  per_page?: number;
}) => {
  return useQuery({
    queryKey: fptkKeys.approvalHistory(params),
    queryFn: () => fptkService.getApproverActionHistory(params),
  });
};

export const useFptkDetail = (noReq: string, enabled = true) => {
  return useQuery({
    queryKey: fptkKeys.detail(noReq),
    queryFn: () => fptkService.getRequisition(noReq),
    enabled: !!noReq && enabled,
  });
};

export const useFptkForReview = (noReq: string, enabled = true) => {
  return useQuery({
    queryKey: fptkKeys.review(noReq),
    queryFn: () => fptkService.getRequisitionForReview(noReq),
    enabled: !!noReq && enabled,
  });
};

export const useApprovalHistory = (noReq: string, enabled = true) => {
  return useQuery({
    queryKey: fptkKeys.history(noReq),
    queryFn: () => fptkService.getApprovalHistory(noReq),
    enabled: !!noReq && enabled,
  });
};

export const useApprovers = () => {
  return useQuery({
    queryKey: fptkKeys.approvers(),
    queryFn: () => fptkService.getApprovers(),
  });
};

// ── Mutations ────────────────────────────────────────

export const useCreateFptk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRequisitionInput) =>
      fptkService.createRequisition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fptkKeys.lists() });
    },
  });
};

export const useUpdateFptk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noReq,
      data,
    }: {
      noReq: string;
      data: UpdateRequisitionInput;
    }) => fptkService.updateRequisition(noReq, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fptkKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: fptkKeys.detail(variables.noReq),
      });
    },
  });
};

export const useDeleteFptk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noReq: string) => fptkService.deleteRequisition(noReq),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fptkKeys.lists() });
    },
  });
};

export const useReviewFptk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noReq, data }: { noReq: string; data: ApprovalInput }) =>
      fptkService.reviewRequisition(noReq, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fptkKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fptkKeys.pending() });
      queryClient.invalidateQueries({
        queryKey: fptkKeys.detail(variables.noReq),
      });
      queryClient.invalidateQueries({
        queryKey: fptkKeys.review(variables.noReq),
      });
      queryClient.invalidateQueries({
        queryKey: fptkKeys.history(variables.noReq),
      });
    },
  });
};

export const useProcessHrd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noReq: string) => fptkService.processHrd(noReq),
    onSuccess: (_data, noReq) => {
      queryClient.invalidateQueries({ queryKey: fptkKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fptkKeys.detail(noReq) });
    },
  });
};

export const useAssignManpower = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noReq,
      candidates,
    }: {
      noReq: string;
      candidates: AssignManpowerCandidateInput[];
    }) => fptkService.assignManpower(noReq, { candidates }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fptkKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: fptkKeys.detail(variables.noReq),
      });
    },
  });
};

export const useAssignAreaLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noReq,
      candidates,
    }: {
      noReq: string;
      candidates: AssignAreaLineCandidateInput[];
    }) => fptkService.assignAreaLine(noReq, { candidates }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: fptkKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: fptkKeys.detail(variables.noReq),
      });
    },
  });
};
