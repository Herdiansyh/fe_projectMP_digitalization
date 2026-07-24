import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import evaluationService from "../../services/evaluationService";
import type {
  EvaluationListParams,
  ExtendContractPayload,
  CloseContractPayload,
  EvaluationCreatePayload,
  EvaluationUpdatePayload,
  EvaluationScorePayload,
  EvaluationRecommendationPayload,
  EvaluationActionPayload,
} from "../../types/evaluation";

export const evaluationKeys = {
  all: ["evaluations"] as const,
  lists: () => [...evaluationKeys.all, "list"] as const,
  list: (filters: EvaluationListParams) =>
    [...evaluationKeys.lists(), filters] as const,
  pendingTriggers: () => [...evaluationKeys.all, "pendingTriggers"] as const,
  pendingHrDecisionsList: () =>
    [...evaluationKeys.all, "pendingHrDecisions"] as const,
  pendingHrDecisions: (filters?: EvaluationListParams) =>
    [...evaluationKeys.pendingHrDecisionsList(), filters] as const,
  criteria: () => [...evaluationKeys.all, "criteria"] as const,
  detail: (id: number) => [...evaluationKeys.all, "detail", id] as const,
};

// ─── Queries ────────────────────────────────────────────────────────────────

/**
 * Fetch daftar evaluasi (riwayat) dengan filter server-side.
 * staleTime: 0 → data selalu dianggap stale, refetch di background
 * setiap mount/windowFocus, tapi cache lama tetap ditampilkan sementara.
 */
export const useEvaluationList = (filters: EvaluationListParams) =>
  useQuery({
    queryKey: evaluationKeys.list(filters),
    queryFn: () => evaluationService.getEvaluations(filters),
    staleTime: 0,
  });

/**
 * Fetch worklist — karyawan yang kontraknya mendekati berakhir.
 * refetchOnWindowFocus diaktifkan di QueryClient global, jadi hook ini
 * akan auto-refresh setiap kali user kembali ke tab — menggantikan
 * window.addEventListener("focus", ...) manual yang sebelumnya ada.
 */
export const usePendingTriggers = (enabled: boolean) =>
  useQuery({
    queryKey: evaluationKeys.pendingTriggers(),
    queryFn: () =>
      evaluationService.getPendingTriggers().then((res) => res.data),
    enabled, // hanya fetch kalau isLeader || isAdmin
    staleTime: 0,
  });

/**
 * Fetch daftar evaluasi yang menunggu keputusan HR (approve/reject),
 * dengan filter server-side sama seperti getEvaluations.
 */
export const usePendingHrDecisions = (
  filters?: EvaluationListParams,
  enabled = true,
) =>
  useQuery({
    queryKey: evaluationKeys.pendingHrDecisions(filters),
    queryFn: () => evaluationService.getPendingHrDecisions(filters),
    enabled,
    staleTime: 0,
  });

/**
 * Fetch daftar kriteria/struktur form evaluasi.
 * Ini data referensi (jarang berubah), jadi diberi staleTime lebih panjang.
 */
export const useEvaluationCriteria = (enabled = true) =>
  useQuery({
    queryKey: evaluationKeys.criteria(),
    queryFn: () => evaluationService.getCriteria(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

/**
 * Fetch detail satu evaluasi.
 */
export const useEvaluationDetail = (id: number, enabled = true) =>
  useQuery({
    queryKey: evaluationKeys.detail(id),
    queryFn: () => evaluationService.getEvaluation(id),
    enabled: !!id && enabled,
  });

// ─── Mutations ──────────────────────────────────────────────────────────────

/**
 * Buat evaluasi baru (draft).
 */
export const useCreateEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EvaluationCreatePayload) =>
      evaluationService.createEvaluation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.pendingTriggers(),
      });
    },
  });
};

/**
 * Update data evaluasi (draft).
 */
export const useUpdateEvaluation = () => {
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
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Update skor evaluasi.
 */
export const useUpdateScores = () => {
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
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Update rekomendasi (mis. lanjut kontrak / tidak) pada evaluasi.
 */
export const useUpdateRecommendation = () => {
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
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Submit evaluasi draft untuk masuk alur approval.
 */
export const useSubmitEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => evaluationService.submitEvaluation(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.pendingTriggers(),
      });
      queryClient.invalidateQueries({ queryKey: evaluationKeys.detail(id) });
    },
  });
};

/**
 * Approve evaluasi (approval flow internal, sebelum ke HR).
 */
export const useApproveEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload?: EvaluationActionPayload;
    }) => evaluationService.approveEvaluation(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.pendingHrDecisionsList(),
      });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Reject evaluasi (approval flow internal).
 */
export const useRejectEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: EvaluationActionPayload;
    }) => evaluationService.rejectEvaluation(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.pendingHrDecisionsList(),
      });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Teruskan evaluasi ke HR Admin untuk keputusan akhir.
 * Karena ini memindahkan evaluasi dari alur approval biasa ke
 * pendingHrDecisions, kedua list perlu di-invalidate.
 */
export const useForwardToHrAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload?: EvaluationActionPayload;
    }) => evaluationService.forwardToHrAdmin(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.pendingHrDecisionsList(),
      });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hapus evaluasi draft.
 * onSuccess: invalidate list + pendingTriggers agar kedua tabel ter-refresh.
 */
export const useDeleteEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => evaluationService.deleteEvaluation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.pendingTriggers(),
      });
    },
  });
};

/**
 * Close contract (deactivate/delete employee).
 * Cross-domain: perlu invalidate 'employees' dan 'interns' juga karena
 * action ini mengubah status karyawan di luar domain evaluasi.
 */
export const useCloseContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CloseContractPayload;
    }) => evaluationService.closeContract(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.detail(variables.id),
      });
      // Cross-domain: employee bisa jadi inactive/deleted
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["interns"] });
    },
  });
};

/**
 * Extend contract (perpanjang kontrak karyawan).
 * Cross-domain: update end_contract di Employee/Intern juga.
 */
export const useExtendContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ExtendContractPayload;
    }) => evaluationService.extendContract(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: evaluationKeys.detail(variables.id),
      });
      // Cross-domain: end_contract di employee/intern berubah
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["interns"] });
    },
  });
};
