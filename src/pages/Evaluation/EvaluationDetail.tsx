import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiInfo,
  FiUser,
  FiHash,
  FiBriefcase,
  FiFileText,
  FiCalendar,
  FiFlag,
  FiAward,
  FiMessageSquare,
} from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import type {
  EvaluationApprover,
  EvaluationScorePayload,
} from "../../types/evaluation";
import AlertDialog from "../../components/common/AlertDialog";
import ScoringRubricTable from "./ScoringRubricTable";
import {
  useEvaluationDetail,
  useEvaluationCriteria,
  useUpdateScores,
  useSubmitEvaluation,
  useApproveEvaluation,
  useRejectEvaluation,
  useForwardToHrAdmin,
} from "../../hooks/queries/useEvaluationQueries";
import { notify } from "../../utils/toast";
// ─── Approval Chain sub-component ──────────────────────────────────────────

interface ApprovalChainCardProps {
  label: string;
  approver: EvaluationApprover | null;
  pendingLabel: string;
}

const ApprovalChainCard: React.FC<ApprovalChainCardProps> = ({
  label,
  approver,
  pendingLabel,
}) => (
  <Box
    p={4}
    bg="gray.50"
    borderRadius="8px"
    border="1px solid"
    borderColor="gray.200"
  >
    <Text
      fontSize="11px"
      fontWeight="700"
      color="gray.500"
      textTransform="uppercase"
      mb={1}
    >
      {label}
    </Text>
    <Text
      fontSize="14px"
      fontWeight="600"
      color={approver ? "gray.800" : "orange.500"}
    >
      {approver?.name ?? pendingLabel}
    </Text>
    {approver && (
      <Text fontSize="12px" color="gray.500" mt={1}>
        NPK: {approver.npk}
      </Text>
    )}
  </Box>
);

// ─── Summary field sub-component ───────────────────────────────────────────
// Setiap field ditampilkan sebagai baris icon + label + value, supaya mata
// bisa cepat scan tanpa harus baca label kecil satu-satu.

interface SummaryFieldProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  emphasize?: boolean;
}

const SummaryField: React.FC<SummaryFieldProps> = ({
  icon: Icon,
  label,
  value,
  emphasize,
}) => (
  <Flex align="flex-start" gap={3}>
    <Flex
      align="center"
      justify="center"
      w="32px"
      h="32px"
      flexShrink={0}
      borderRadius="8px"
      bg={emphasize ? "blue.50" : "gray.50"}
      color={emphasize ? "#1A5EA8" : "gray.400"}
    >
      <Icon size={15} />
    </Flex>
    <Box minW={0}>
      <Text fontSize="11px" color="gray.400" fontWeight="600" mb="1px">
        {label}
      </Text>
      <Text
        fontSize="14px"
        color={emphasize ? "#1A5EA8" : "gray.800"}
        fontWeight={emphasize ? "700" : "600"}
        wordBreak="break-word"
      >
        {value}
      </Text>
    </Box>
  </Flex>
);

const statusBadgeStyle = (status: string) => {
  if (status.includes("approved") || status.includes("completed_extended")) {
    return { bg: "green.50", color: "green.700", border: "green.200" };
  }
  if (status.includes("rejected") || status.includes("not_extended")) {
    return { bg: "red.50", color: "red.700", border: "red.200" };
  }
  if (status.includes("permanent")) {
    return { bg: "blue.50", color: "blue.700", border: "blue.200" };
  }
  return { bg: "orange.50", color: "orange.700", border: "orange.200" };
};

const decisionLabel = (value: string) => {
  const map: Record<string, string> = {
    permanen: "Permanen",
    kontrak_berakhir: "Kontrak Berakhir",
    perpanjang_kontrak: "Perpanjang Kontrak",
    promoted: "Promoted",
    not_extended: "Tidak Diperpanjang",
  };
  return map[value] ?? value;
};

const decisionBadgeStyle = (value: string) => {
  if (value === "permanen" || value === "promoted") {
    return { bg: "blue.50", color: "blue.700", border: "blue.200" };
  }
  if (value === "perpanjang_kontrak") {
    return { bg: "green.50", color: "green.700", border: "green.200" };
  }
  if (value === "kontrak_berakhir" || value === "not_extended") {
    return { bg: "red.50", color: "red.700", border: "red.200" };
  }
  return { bg: "gray.50", color: "gray.700", border: "gray.200" };
};

type AlertVariant = "warning" | "error";

interface AlertState {
  title: string;
  message: string;
  variant: AlertVariant;
}

const EvaluationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const evaluationId = Number(id);

  // ─── React Query: fetch detail + criteria ──────────────────────────────────
  const {
    data: evaluationRes,
    isLoading: loadingEvaluation,
    isError: isEvaluationError,
  } = useEvaluationDetail(evaluationId, !!id);

  const { data: criteriaRes, isLoading: loadingCriteria } =
    useEvaluationCriteria();

  const evaluation = evaluationRes?.data ?? null;
  const criteriaGroups = criteriaRes?.data ?? [];
  const loading = loadingEvaluation || loadingCriteria;
  const isInternSubject = !!evaluation?.intern_id;
  const subject = isInternSubject ? evaluation?.intern : evaluation?.employee;
  const subjectLabel = isInternSubject ? "Intern" : "Employee";

  useEffect(() => {
    if (isEvaluationError) {
      navigate("/evaluations");
    }
  }, [isEvaluationError, navigate]);

  const [notes, setNotes] = useState("");
  const [shScores, setShScores] = useState<Record<number, number>>({});
  const [unfilledIds, setUnfilledIds] = useState<number[]>([]);
  const [alertInfo, setAlertInfo] = useState<AlertState | null>(null);

  const showAlert = (
    title: string,
    message: string,
    variant: AlertVariant = "warning",
  ) => {
    setAlertInfo({ title, message, variant });
  };

  useEffect(() => {
    if (!evaluation) return;
    const initialShScores: Record<number, number> = {};
    evaluation.scores.forEach((score) => {
      if (score.filled_by_role === "section_head" && score.score !== null) {
        initialShScores[score.criteria_id] = score.score;
      }
    });
    setShScores(initialShScores);
  }, [evaluation]);

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const updateScoresMutation = useUpdateScores();
  const updateScoresForApproveMutation = useUpdateScores();
  const submitMutation = useSubmitEvaluation();
  const approveMutation = useApproveEvaluation();
  const rejectMutation = useRejectEvaluation();
  const forwardMutation = useForwardToHrAdmin();

  const savingScores = updateScoresMutation.isPending;
  const submitting = submitMutation.isPending;
  const approving =
    updateScoresForApproveMutation.isPending || approveMutation.isPending;
  const rejecting = rejectMutation.isPending;
  const forwarding = forwardMutation.isPending;

  const roleName = user?.role?.name;
  const canSubmit =
    (roleName === "Leader" || roleName === "Admin") &&
    evaluation?.current_stage === "leader";

  // === UBAH (Intern): SH intern TIDAK mengisi skor sama sekali — tugasnya
  // cuma approve/forward dengan notes. Jadi canFillScoresSH khusus untuk
  // Employee. Untuk Intern, "canApprove" tetap sama seperti Employee
  // (SH boleh approve di stage section_head), hanya saja tanpa syarat &
  // tanpa payload skor.
  const canFillScoresSH =
    !isInternSubject &&
    roleName === "Section Head" &&
    evaluation?.current_stage === "section_head";
  const canApprove =
    roleName === "Section Head" && evaluation?.current_stage === "section_head";
  const canApproveManager =
    roleName === "Manager" && evaluation?.current_stage === "manager";
  const canCreateReplacementFptk =
    !isInternSubject &&
    evaluation?.status === "completed_not_extended" &&
    roleName === "Section Head";

  const leaderScores = useMemo(() => {
    const map: Record<number, number> = {};
    evaluation?.scores.forEach((score) => {
      if (score.filled_by_role === "leader" && score.score !== null) {
        map[score.criteria_id] = score.score;
      }
    });
    return map;
  }, [evaluation]);

  const canForwardToHrAdmin =
    roleName === "Section Head" &&
    evaluation?.status === "approved" &&
    evaluation?.current_stage === "done";

  const sectionHeadScoresMap = useMemo(() => {
    const map: Record<number, number> = {};
    evaluation?.scores.forEach((score) => {
      if (score.filled_by_role === "section_head" && score.score !== null) {
        map[score.criteria_id] = score.score;
      }
    });
    return map;
  }, [evaluation]);

  const allCriteriaIds = useMemo(() => {
    return criteriaGroups.flatMap((group) =>
      group.subgroups.flatMap((subgroup) =>
        subgroup.criteria.map((criterion) => criterion.id),
      ),
    );
  }, [criteriaGroups]);

  const getUnfilledShCriteria = () => {
    // Intern tidak punya rubric SH sama sekali.
    if (isInternSubject) return [];
    return allCriteriaIds.filter(
      (criteriaId) =>
        shScores[criteriaId] === undefined || shScores[criteriaId] === null,
    );
  };

  const handleCreateReplacementFptk = () => {
    if (!evaluation) return;
    const params = new URLSearchParams({
      objective: "Replacement",
      reason: "End Of Contract",
      position: evaluation.jabatan ?? evaluation.employee?.jabatan ?? "",
      employee_out: evaluation.employee?.name ?? "",
      replacement_employee_id: evaluation.employee_id
        ? String(evaluation.employee_id)
        : "",
    });
    navigate(`/fptk/create?${params.toString()}`);
  };
  const handleForwardToHrAdmin = async () => {
    if (!evaluation) return;
    try {
      await forwardMutation.mutateAsync({
        id: evaluation.id,
        payload: { notes },
      });
      setNotes("");
      notify.success("Evaluation forwarded to HR Admin");
    } catch {
      notify.error("Failed to forward evaluation to HR Admin");
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async () => {
    if (!evaluation) return;

    if (
      !evaluation.recommendation ||
      !evaluation.recommendation.employee_status
    ) {
      showAlert(
        "Recommendation Belum Diisi",
        "Recommendation wajib diisi sebelum submit. Silakan edit evaluasi terlebih dahulu.",
      );
      return;
    }
    if (!evaluation.section_head) {
      showAlert(
        "Approver Belum Diatur",
        "Anda belum memiliki Approver Section Head. Hubungi Admin untuk mengatur ini sebelum submit.",
      );
      return;
    }

    try {
      await submitMutation.mutateAsync(evaluation.id);
      setNotes("");
      notify.success("Evaluation submitted successfully");
    } catch {
      notify.error("Failed to submit evaluation");
    }
  };

  const handleSaveShScores = async () => {
    if (!evaluation) return;

    const unfilled = getUnfilledShCriteria();
    if (unfilled.length > 0) {
      setUnfilledIds(unfilled);
      showAlert(
        "Skor Belum Lengkap",
        "Harap isi seluruh skor penilaian (SH) sebelum menyimpan.",
      );
      return;
    }
    setUnfilledIds([]);

    try {
      const payload: EvaluationScorePayload = {
        scores: Object.entries(shScores).map(([criteriaId, score]) => ({
          criteria_id: Number(criteriaId),
          score,
        })),
      };
      await updateScoresMutation.mutateAsync({ id: evaluation.id, payload });
      notify.success("Scores saved successfully");
    } catch {
      notify.error("Failed to save scores");
    }
  };

  const runApprove = async () => {
    if (!evaluation) return;
    try {
      // === UBAH (Intern): jangan kirim update skor sama sekali kalau
      // subjeknya Intern — SH intern approve murni tanpa payload skor.
      if (canApprove && !isInternSubject) {
        const scorePayload: EvaluationScorePayload = {
          scores: Object.entries(shScores).map(([criteriaId, score]) => ({
            criteria_id: Number(criteriaId),
            score,
          })),
        };
        await updateScoresForApproveMutation.mutateAsync({
          id: evaluation.id,
          payload: scorePayload,
        });
      }

      await approveMutation.mutateAsync({
        id: evaluation.id,
        payload: { notes },
      });
      setNotes("");
      setUnfilledIds([]);
      notify.success("Evaluation approved successfully");
    } catch {
      showAlert(
        "Gagal Approve",
        "Failed to approve evaluation. Jika Anda Section Head, pastikan Approver Manager Anda sudah di-set oleh Admin.",
        "error",
      );
    }
  };

  const handleApprove = async () => {
    if (!evaluation) return;

    // Section Head Employee: pastikan skor lengkap sebelum approve.
    // Section Head Intern: tidak ada skor untuk dicek, langsung lanjut.
    if (canApprove && !isInternSubject) {
      const unfilled = getUnfilledShCriteria();
      if (unfilled.length > 0) {
        setUnfilledIds(unfilled);
        showAlert(
          "Skor Belum Lengkap",
          "Harap isi seluruh skor penilaian (SH) sebelum approve.",
        );
        return;
      }
    }

    // Approver Manager SH tidak diketahui di frontend (tidak ada di data user
    // login), jadi biarkan backend yang memvalidasi. Kalau approve gagal
    // karena approver manager belum di-set, pesan errornya sudah ditangani
    // di catch block runApprove().
    await runApprove();
  };

  const handleReject = async () => {
    if (!evaluation) return;
    try {
      await rejectMutation.mutateAsync({
        id: evaluation.id,
        payload: { notes },
      });
      setNotes("");
      notify.success("Evaluation rejected");
    } catch {
      notify.error("Failed to reject evaluation");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box p={8} textAlign="center" color="gray.500">
          Loading...
        </Box>
      </MainLayout>
    );
  }

  if (!evaluation) return null;

  const rubricMode = canFillScoresSH
    ? "section_head"
    : roleName === "Leader" && evaluation.current_stage === "leader"
      ? "leader"
      : "readonly";

  // === UBAH (Intern): Evaluation Assessment section (baik editable maupun
  // read-only breakdown LD/SH) tidak pernah ditampilkan untuk Intern,
  // karena Intern memang tidak punya skor sama sekali.
  const showRubricTable =
    !isInternSubject &&
    ((roleName === "Leader" && evaluation.current_stage === "leader") ||
      canFillScoresSH);

  const recommendation = evaluation.recommendation;

  const sortedApprovals = evaluation.approvals.slice().sort((a, b) => {
    if (!a.acted_at) return 1;
    if (!b.acted_at) return -1;
    return new Date(b.acted_at).getTime() - new Date(a.acted_at).getTime();
  });

  const statusStyle = statusBadgeStyle(evaluation.status);

  return (
    <MainLayout>
      <Box>
        <Flex
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
          mb={6}
        >
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Evaluation Detail
            </Text>
            {/* === UBAH (Intern): pakai subject generic === */}
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              {subject?.name ?? "-"}
            </Text>
          </Box>

          {/* ── Action toolbar — wraps on small screens, full width per button on mobile ── */}
          <Flex
            gap={2}
            wrap="wrap"
            direction={{ base: "column", sm: "row" }}
            align={{ base: "stretch", sm: "center" }}
          >
            <Button
              type="button"
              onClick={() => navigate("/evaluations")}
              size="sm"
              w={{ base: "full", sm: "auto" }}
              bg="white"
              color="#1A5EA8"
              border="1px solid"
              borderColor="#1A5EA8"
              fontWeight="600"
              borderRadius="8px"
              px={5}
              transition="all 0.2s ease"
              _hover={{
                bg: "#EFF6FF",
                borderColor: "#164C87",
              }}
            >
              Back
            </Button>
            {canFillScoresSH && (
              <Button
                type="button"
                onClick={handleSaveShScores}
                loading={savingScores}
                loadingText="Saving..."
                size="sm"
                w={{ base: "full", sm: "auto" }}
                bg="#1A5EA8"
                color="white"
                fontWeight="600"
                borderRadius="8px"
                px={5}
                transition="all 0.2s ease"
                _hover={{
                  bg: "#164C87",
                  boxShadow: "0 4px 12px rgba(26,94,168,0.3)",
                }}
              >
                Save Scores (SH)
              </Button>
            )}

            {canSubmit && (
              <Button
                type="button"
                onClick={() => navigate(`/evaluations/${evaluation.id}/edit`)}
                variant="outline"
                colorPalette="brand"
                size="sm"
                w={{ base: "full", sm: "auto" }}
              >
                Edit Details & Recommendation
              </Button>
            )}

            {canSubmit && (
              <Button
                type="button"
                onClick={handleSubmit}
                loading={submitting}
                loadingText="Submitting..."
                colorPalette="brand"
                size="sm"
                w={{ base: "full", sm: "auto" }}
              >
                Submit
              </Button>
            )}

            {(canApprove || canApproveManager) && (
              <Button
                type="button"
                onClick={handleApprove}
                loading={approving}
                loadingText="Approving..."
                size="sm"
                w={{ base: "full", sm: "auto" }}
                bg="#16A34A"
                color="white"
                fontWeight="600"
                borderRadius="8px"
                px={5}
                transition="all 0.2s ease"
                _hover={{
                  bg: "#15803D",
                  boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                }}
              >
                Approve
              </Button>
            )}

            {(canApprove || canApproveManager) && (
              <Button
                type="button"
                onClick={handleReject}
                loading={rejecting}
                loadingText="Rejecting..."
                size="sm"
                w={{ base: "full", sm: "auto" }}
                bg="#DC2626"
                color="white"
                fontWeight="600"
                borderRadius="8px"
                px={5}
                transition="all 0.2s ease"
                _hover={{
                  bg: "#B91C1C",
                  boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
                }}
              >
                Reject
              </Button>
            )}
            {canForwardToHrAdmin && (
              <Button
                type="button"
                onClick={handleForwardToHrAdmin}
                loading={forwarding}
                loadingText="Forwarding..."
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                w={{ base: "100%", sm: "auto" }}
                px={{ base: 4, sm: 5 }}
                py={2.5}
                fontSize={{ base: "13px", sm: "14px" }}
                fontWeight="600"
                borderRadius="8px"
                bg="#1A5EA8"
                color="white"
                border="none"
                whiteSpace="nowrap"
                transition="all 0.2s ease-in-out"
                disabled={forwarding}
                _hover={{
                  bg: "#3A76B8",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(26, 94, 168, 0.3)",
                }}
                _active={{
                  transform: "translateY(0)",
                  boxShadow: "0 2px 6px rgba(26, 94, 168, 0.25)",
                }}
                _disabled={{
                  opacity: 0.6,
                  cursor: "not-allowed",
                  bg: "#1A5EA8",
                  transform: "none",
                  boxShadow: "none",
                }}
              >
                Forward to HR Admin
              </Button>
            )}
            {canCreateReplacementFptk && (
              <Button
                type="button"
                onClick={handleCreateReplacementFptk}
                size="sm"
                w={{ base: "full", sm: "auto" }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  color: "#ffffff",
                  backgroundColor: "#1A5EA8",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#154d8c")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1A5EA8")
                }
              >
                Create new FPTK
              </Button>
            )}
          </Flex>
        </Flex>

        {canSubmit &&
          (!evaluation.recommendation?.employee_status ||
            !evaluation.section_head) && (
            <Box
              bg="orange.50"
              border="1px solid"
              borderColor="orange.200"
              rounded="md"
              p={3}
              mb={4}
            >
              <Text fontSize="13px" color="orange.800" fontWeight={600}>
                ⚠️ Please complete the following before submitting:
              </Text>
              <Box as="ul" pl={5} mt={1} mb={2}>
                {!evaluation.recommendation?.employee_status && (
                  <Text as="li" fontSize="12px" color="orange.700">
                    Recommendation (Employee Status) is required.
                  </Text>
                )}
                {!evaluation.section_head && (
                  <Text as="li" fontSize="12px" color="orange.700">
                    No Section Head approver is assigned. Please contact the
                    administrator to configure this in User Management.
                  </Text>
                )}
              </Box>
              {!evaluation.recommendation?.employee_status && (
                <Button
                  type="button"
                  onClick={() => navigate(`/evaluations/${evaluation.id}/edit`)}
                  size="xs"
                  colorPalette="accent"
                >
                  Complete Now{" "}
                </Button>
              )}
            </Box>
          )}

        {canFillScoresSH && unfilledIds.length > 0 && (
          <Box
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            rounded="md"
            p={3}
            mb={4}
          >
            <Text fontSize="13px" color="red.700" fontWeight="600">
              ⚠️ There are still {unfilledIds.length} criteria with missing
              scores. Please review the rows highlighted in red in the rubric
              table below.
            </Text>
          </Box>
        )}

        {/* ── Summary — restyled: header dengan status badge yang lebih
             menonjol, tiap field dikasih icon supaya lebih cepat di-scan,
             dan grid dirapikan jadi 2/3 kolom tergantung layar. ── */}
        <Box
          bg="white"
          rounded="xl"
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          overflow="hidden"
          mb={6}
        >
          <Flex
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={3}
            px={6}
            py={4}
            borderBottom="1px solid"
            borderColor="gray.100"
            bg="gray.50"
          >
            <Text fontSize="16px" fontWeight="700" color="gray.800">
              Summary
            </Text>
            <HStack gap={2}>
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                fontSize="12px"
                fontWeight="600"
                bg={statusStyle.bg}
                color={statusStyle.color}
                border="1px solid"
                borderColor={statusStyle.border}
                textTransform="capitalize"
              >
                {evaluation.status.replace(/_/g, " ")}
              </Badge>
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                fontSize="12px"
                fontWeight="600"
                bg="white"
                color="gray.600"
                border="1px solid"
                borderColor="gray.200"
                textTransform="capitalize"
              >
                {evaluation.current_stage.replace(/_/g, " ")}
              </Badge>
            </HStack>
          </Flex>

          <Box
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              sm: "1fr 1fr",
              lg: "1fr 1fr 1fr",
            }}
            gap={5}
            px={6}
            py={5}
          >
            <SummaryField
              icon={FiUser}
              label={subjectLabel}
              value={subject?.name ?? "-"}
              emphasize
            />
            <SummaryField
              icon={FiHash}
              label="NPK"
              value={subject?.npk ?? evaluation.npk ?? "-"}
            />
            <SummaryField
              icon={FiBriefcase}
              label="Position"
              value={evaluation.jabatan ?? subject?.jabatan ?? "-"}
            />
            {!isInternSubject && (
              <SummaryField
                icon={FiFileText}
                label="PKWT Number"
                value={evaluation.employee?.pkwt_number ?? "-"}
              />
            )}
            <SummaryField
              icon={FiCalendar}
              label="Join Date"
              value={formatDate(evaluation.join_date)}
            />
            <SummaryField
              icon={FiCalendar}
              label="Start Contract"
              value={formatDate(evaluation.start_date)}
            />
            <SummaryField
              icon={FiCalendar}
              label="End Contract"
              value={formatDate(evaluation.end_date)}
            />
            {/* === UBAH (Intern): Intern tidak punya skor, jangan tampilkan
                "Belum dinilai SH" yang menyiratkan skor masih ditunggu. === */}
            {!isInternSubject && (
              <SummaryField
                icon={FiAward}
                label="Final Score (SH)"
                value={evaluation.total_score ?? "Belum dinilai SH"}
                emphasize={!!evaluation.total_score}
              />
            )}
          </Box>
        </Box>

        {/* ── Evaluation Assessment — editable for Leader or Section Head at their
             stage. Tidak pernah muncul untuk subjek Intern (lihat
             showRubricTable). ── */}
        {showRubricTable && (
          <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
            <Flex
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={2}
              mb={4}
            >
              <Text fontSize="16px" fontWeight="700" color="gray.800">
                Evaluation Assessment
              </Text>
              {canFillScoresSH && (
                <HStack gap={2} wrap="wrap">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box w="10px" h="10px" rounded="full" bg="brand.500" />
                    <Text fontSize="11px" color="gray.600">
                      LD (Leader — read only)
                    </Text>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box w="10px" h="10px" rounded="full" bg="accent.400" />
                    <Text fontSize="11px" color="gray.600">
                      SH (Section Head — editable)
                    </Text>
                  </Box>
                </HStack>
              )}
            </Flex>
            <ScoringRubricTable
              criteriaGroups={criteriaGroups}
              scores={rubricMode === "section_head" ? shScores : leaderScores}
              leaderScores={rubricMode === "section_head" ? leaderScores : {}}
              unfilledIds={unfilledIds}
              onChange={(criteriaId, value) => {
                if (rubricMode === "section_head") {
                  setShScores((prev) => ({ ...prev, [criteriaId]: value }));
                  setUnfilledIds((prev) =>
                    prev.filter((cid) => cid !== criteriaId),
                  );
                }
              }}
              mode={rubricMode}
            />
          </Box>
        )}

        {/* ── Scores (read-only, breakdown LD vs SH) — untuk Manager/viewer.
             Menggunakan tampilan rubrik yang sama seperti saat diisi di form,
             hanya saja seluruh radio LD & SH bersifat disabled.
             === UBAH (Intern): tidak pernah ditampilkan untuk Intern, karena
             tidak ada skor LD/SH apa pun yang bisa di-breakdown. ── */}
        {!showRubricTable && !isInternSubject && (
          <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
            <Flex
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={2}
              mb={4}
            >
              <Text fontSize="16px" fontWeight="700" color="gray.800">
                Penilaian Evaluasi
              </Text>
              <HStack gap={3} wrap="wrap">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box w="10px" h="10px" rounded="full" bg="brand.500" />
                  <Text fontSize="11px" color="gray.600">
                    LD (Leader)
                  </Text>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box w="10px" h="10px" rounded="full" bg="accent.400" />
                  <Text fontSize="11px" color="gray.600">
                    SH (Section Head)
                  </Text>
                </Box>
                <Text fontSize="11px" color="gray.400">
                  Tampilan saja — tidak bisa diedit
                </Text>
              </HStack>
            </Flex>
            <ScoringRubricTable
              criteriaGroups={criteriaGroups}
              scores={sectionHeadScoresMap}
              leaderScores={leaderScores}
              unfilledIds={[]}
              onChange={() => {
                /* read-only: manager_view tidak bisa diubah */
              }}
              mode="manager_view"
            />
          </Box>
        )}

        {/* ── Recommendation — restyled: Decision & Extend PKWT sekarang
             jadi badge berwarna yang menonjol di header, sisanya field
             ber-icon konsisten dengan Summary. Notes dipisah jadi blok
             sendiri dengan quote-style supaya kebaca sebagai catatan. ── */}
        <Box
          bg="white"
          rounded="xl"
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          overflow="hidden"
          mb={6}
        >
          <Flex
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={3}
            px={6}
            py={4}
            borderBottom="1px solid"
            borderColor="gray.100"
            bg="gray.50"
          >
            <Text fontSize="16px" fontWeight="700" color="gray.800">
              Recommendation
            </Text>
            {recommendation?.employee_status && (
              <Badge
                px={3}
                py={1}
                borderRadius="full"
                fontSize="12px"
                fontWeight="700"
                bg={decisionBadgeStyle(recommendation.employee_status).bg}
                color={decisionBadgeStyle(recommendation.employee_status).color}
                border="1px solid"
                borderColor={
                  decisionBadgeStyle(recommendation.employee_status).border
                }
              >
                {decisionLabel(recommendation.employee_status)}
              </Badge>
            )}
          </Flex>

          <Box px={6} py={5}>
            {recommendation ? (
              <>
                <Box
                  display="grid"
                  gridTemplateColumns={{
                    base: "1fr",
                    sm: "1fr 1fr",
                    lg: "1fr 1fr 1fr",
                  }}
                  gap={5}
                >
                  <SummaryField
                    icon={FiFlag}
                    label={`${subjectLabel} Status`}
                    value={
                      recommendation.employee_status
                        ? decisionLabel(recommendation.employee_status)
                        : "-"
                    }
                    emphasize
                  />
                  {/* === UBAH (Intern): Untuk Intern, field ini menunjukkan apakah
                      magang diperpanjang (extend_pkwt = false) atau naik jadi karyawan
                      dengan PKWT (extend_pkwt = true). Untuk Employee, menunjukkan apakah
                      kontrak PKWT diperpanjang. === */}
                  <SummaryField
                    icon={FiFileText}
                    label={isInternSubject ? "Status Perpanjangan" : "Sign PKWT"}
                    value={
                      <Badge
                        px={2}
                        py={0.5}
                        borderRadius="full"
                        fontSize="11px"
                        fontWeight="600"
                        bg={
                          recommendation.extend_pkwt ? "green.50" : "blue.50"
                        }
                        color={
                          recommendation.extend_pkwt ? "green.700" : "blue.700"
                        }
                      >
                        {isInternSubject
                          ? recommendation.extend_pkwt
                            ? "Naik jadi Karyawan (PKWT)"
                            : "Perpanjang Magang"
                          : recommendation.extend_pkwt
                            ? "Ya, diperpanjang"
                            : "Tidak diperpanjang"}
                      </Badge>
                    }
                  />
                  {/* === UBAH (Intern): Untuk Intern, extend_months SELALU ditampilkan
                      karena baik perpanjang magang maupun naik jadi karyawan sama-sama
                      butuh durasi. Untuk Employee, hanya ditampilkan jika extend_pkwt. === */}
                  {(isInternSubject || recommendation.extend_pkwt) && (
                    <>
                      {recommendation.extend_pkwt && (
                        <SummaryField
                          icon={FiHash}
                          label="PKWT Number"
                          value={recommendation.pkwt_number || "-"}
                        />
                      )}
                      <SummaryField
                        icon={FiCalendar}
                        label="Durasi Perpanjangan"
                        value={
                          recommendation.extend_months
                            ? `${recommendation.extend_months} bulan`
                            : "-"
                        }
                      />
                    </>
                  )}
                </Box>

                <Box mt={5} pt={4} borderTop="1px solid" borderColor="gray.100">
                  <Flex align="center" gap={2} mb={2}>
                    <FiMessageSquare size={14} color="#9CA3AF" />
                    <Text
                      fontSize="11px"
                      color="gray.400"
                      fontWeight="600"
                      textTransform="uppercase"
                    >
                      Notes
                    </Text>
                  </Flex>
                  <Box
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.100"
                    borderLeft="3px solid"
                    borderLeftColor="gray.300"
                    borderRadius="6px"
                    px={4}
                    py={3}
                  >
                    <Text
                      fontSize="13px"
                      color="gray.700"
                      whiteSpace="pre-wrap"
                      fontStyle={recommendation.notes ? "normal" : "italic"}
                    >
                      {recommendation.notes || "Tidak ada catatan."}
                    </Text>
                  </Box>
                </Box>
              </>
            ) : (
              <Text fontSize="13px" color="gray.400">
                Belum ada rekomendasi yang diisi.
              </Text>
            )}
          </Box>
        </Box>

        {/* ── Riwayat Review — submit/approve/reject beserta notes ── */}
        {sortedApprovals.length > 0 && (
          <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
            <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
              Riwayat Review
            </Text>
            {sortedApprovals.map((entry) => (
              <Box
                key={entry.id}
                py={3}
                borderBottom="1px solid"
                borderColor="gray.100"
              >
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={2}
                >
                  <Text fontSize="13px" fontWeight="700" color="gray.800">
                    {entry.role}
                  </Text>
                  <Badge
                    colorPalette={
                      entry.action === "approve"
                        ? "green"
                        : entry.action === "reject"
                          ? "red"
                          : "brand"
                    }
                  >
                    {entry.action}
                  </Badge>
                </Flex>
                <Text fontSize="12px" color="gray.500" mt={0.5}>
                  {formatDateTime(entry.acted_at)}
                </Text>
                {entry.notes && (
                  <Text
                    fontSize="13px"
                    color="gray.700"
                    mt={2}
                    whiteSpace="pre-wrap"
                  >
                    {entry.notes}
                  </Text>
                )}
              </Box>
            ))}
          </Box>
        )}
        {/* ── Approval Chain — Leader / Section Head / Manager ── */}
        <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
          <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
            Approval Chain
          </Text>
          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
            gap={4}
          >
            <ApprovalChainCard
              label="Leader"
              approver={evaluation.leader}
              pendingLabel="-"
            />
            <ApprovalChainCard
              label="Section Head"
              approver={evaluation.section_head}
              pendingLabel="Belum ditentukan"
            />
            <ApprovalChainCard
              label="Manager"
              approver={evaluation.manager}
              pendingLabel={
                evaluation.current_stage === "leader" ||
                evaluation.current_stage === "section_head"
                  ? "Menunggu review Section Head"
                  : "Belum ditentukan"
              }
            />
          </Box>
          <Text fontSize="11px" color="gray.400" mt={3}>
            Manager ditentukan otomatis dari Approver Manager milik Section Head
            saat evaluasi ini disetujui, bukan dari Leader.
          </Text>
        </Box>
        {/* Notes for approve/reject/submit */}
        {(canApprove || canApproveManager || canForwardToHrAdmin) && (
          <Box bg="white" rounded="lg" shadow="sm" p={6}>
            <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
              Review Notes
            </Text>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add review or rejection notes"
            />
          </Box>
        )}
      </Box>

      {/* ── Dialog alert (menggantikan window.alert) ── */}
      <AlertDialog
        open={alertInfo !== null}
        onClose={() => setAlertInfo(null)}
        title={alertInfo?.title ?? ""}
        message={alertInfo?.message ?? ""}
        confirmColor={alertInfo?.variant === "error" ? "#ef4444" : "#3b82f6"}
        icon={
          alertInfo?.variant === "error" ? (
            <FiAlertCircle size={24} color="#ef4444" />
          ) : (
            <FiInfo size={24} color="#f59e0b" />
          )
        }
      />
    </MainLayout>
  );
};

export default EvaluationDetail;
