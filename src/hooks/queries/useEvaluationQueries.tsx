import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import evaluationService from "../../services/evaluationService";
import type {
  // Evaluation,
  EvaluationCreatePayload,
  EvaluationUpdatePayload,
  EvaluationScorePayload,
  EvaluationRecommendationPayload,
  EvaluationActionPayload,
  EvaluationListParams,
  CloseContractPayload,
  ExtendContractPayload,
  ExtendInternContractPayload,
  ConvertToPermanentPayload,
  PromotePayload,
  NotExtendPayload,
} from "../../types/evaluation";

// ─── Queries ───────────────────────────────────────────────────────────────

export function useEvaluationList(params: EvaluationListParams) {
  return useQuery({
    queryKey: ["evaluations", params],
    queryFn: () => evaluationService.getEvaluations(params),
  });
}

export function useEvaluationDetail(id: number, enabled = true) {
  return useQuery({
    queryKey: ["evaluations", id],
    queryFn: () => evaluationService.getEvaluation(id),
    enabled: enabled && !!id,
  });
}

export function useEvaluationCriteria() {
  return useQuery({
    queryKey: ["evaluation-criteria"],
    queryFn: () => evaluationService.getCriteria(),
  });
}

export function usePendingTriggers(
  enabled: boolean,
  type?: "employee" | "intern",
) {
  return useQuery({
    queryKey: ["evaluations", "pending-triggers", type],
    queryFn: () => evaluationService.getPendingTriggers(type),
    enabled,
    select: (res) => res.data,
  });
}

export function usePendingHrDecisions(
  params: EvaluationListParams,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["evaluations", "pending-hr-decisions", params],
    queryFn: () => evaluationService.getPendingHrDecisions(params),
    enabled,
  });
}

export function useHrDecisionHistory(params: EvaluationListParams) {
  return useQuery({
    queryKey: ["evaluations", "hr-decision-history", params],
    queryFn: () => evaluationService.getHrDecisionHistory(params),
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────

export function useCreateEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EvaluationCreatePayload) =>
      evaluationService.createEvaluation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function useUpdateEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: EvaluationUpdatePayload;
    }) => evaluationService.updateEvaluation(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      queryClient.invalidateQueries({
        queryKey: ["evaluations", variables.id],
      });
    },
  });
}

export function useUpdateScores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: EvaluationScorePayload;
    }) => evaluationService.updateScores(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["evaluations", variables.id],
      });
    },
  });
}

export function useUpdateRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: EvaluationRecommendationPayload;
    }) => evaluationService.updateRecommendation(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["evaluations", variables.id],
      });
    },
  });
}

export function useSubmitEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => evaluationService.submitEvaluation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function useDeleteEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => evaluationService.deleteEvaluation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function useApproveEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload?: EvaluationActionPayload;
    }) => evaluationService.approveEvaluation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function useRejectEvaluation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: EvaluationActionPayload;
    }) => evaluationService.rejectEvaluation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function useForwardToHrAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload?: EvaluationActionPayload;
    }) => evaluationService.forwardToHrAdmin(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function useExtendContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ExtendContractPayload;
    }) => evaluationService.extendContract(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function useExtendInternContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ExtendInternContractPayload;
    }) => evaluationService.extendInternContract(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function useCloseContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CloseContractPayload;
    }) => evaluationService.closeContract(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function useConvertToPermanent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ConvertToPermanentPayload;
    }) => evaluationService.convertToPermanent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function usePromoteIntern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PromotePayload }) =>
      evaluationService.promoteIntern(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function useNotExtendIntern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: NotExtendPayload }) =>
      evaluationService.notExtendIntern(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}

export function useLatestPkwt(
  params: { employee_id?: number; intern_id?: number },
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["evaluations", "latest-pkwt", params],
    queryFn: () => evaluationService.getLatestPkwt(params),
    enabled: enabled && (!!params.employee_id || !!params.intern_id),
    select: (res) => res.data,
  });
}
