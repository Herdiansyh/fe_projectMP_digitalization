import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import evaluationService from "../../services/evaluationService";
import type {
  EvaluationListParams,
  ExtendContractPayload,
  CloseContractPayload,
} from "../../types/evaluation";

// ─── Query Key Factory ──────────────────────────────────────────────────────
// Semua query key untuk domain Evaluation dipusatkan di sini.
// Dengan pola ini, invalidateQueries({ queryKey: evaluationKeys.lists() })
// akan meng-invalidate semua list serentak (partial match prefix).
export const evaluationKeys = {
  all: ["evaluations"] as const,
  lists: () => [...evaluationKeys.all, "list"] as const,
  list: (filters: EvaluationListParams) =>
    [...evaluationKeys.lists(), filters] as const,
  pendingTriggers: () => [...evaluationKeys.all, "pendingTriggers"] as const,
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

// ─── Mutations ──────────────────────────────────────────────────────────────

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
