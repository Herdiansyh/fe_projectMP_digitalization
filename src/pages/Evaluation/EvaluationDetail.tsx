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
import { FiAlertCircle, FiInfo } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import evaluationService from "../../services/evaluationService";
import type {
  Evaluation,
  EvaluationApprover,
  EvaluationGroup,
  EvaluationScorePayload,
} from "../../types/evaluation";
import AlertDialog from "../../components/common/AlertDialog";
import ScoringRubricTable from "./ScoringRubricTable";

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
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [criteriaGroups, setCriteriaGroups] = useState<EvaluationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [savingScores, setSavingScores] = useState(false);
  const [notes, setNotes] = useState("");

  const [shScores, setShScores] = useState<Record<number, number>>({});
  const [unfilledIds, setUnfilledIds] = useState<number[]>([]);

  // ─── Dialog alert (menggantikan window.alert) ──────────────────────────────
  const [alertInfo, setAlertInfo] = useState<AlertState | null>(null);
  const [forwarding, setForwarding] = useState(false);

  const showAlert = (
    title: string,
    message: string,
    variant: AlertVariant = "warning",
  ) => {
    setAlertInfo({ title, message, variant });
  };

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [evaluationResponse, criteriaResponse] = await Promise.all([
        evaluationService.getEvaluation(Number(id)),
        evaluationService.getCriteria(),
      ]);
      const evalData = evaluationResponse.data;
      setEvaluation(evalData);
      setCriteriaGroups(criteriaResponse.data ?? []);

      const initialShScores: Record<number, number> = {};
      evalData.scores.forEach((score) => {
        if (score.filled_by_role === "section_head" && score.score !== null) {
          initialShScores[score.criteria_id] = score.score;
        }
      });
      setShScores(initialShScores);
    } catch {
      navigate("/evaluations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [id]);

  const roleName = user?.role?.name;

  const canSubmit =
    roleName === "Leader" && evaluation?.current_stage === "leader";
  const canFillScoresSH =
    roleName === "Section Head" && evaluation?.current_stage === "section_head";
  const canApprove =
    roleName === "Section Head" && evaluation?.current_stage === "section_head";
  const canApproveManager =
    roleName === "Manager" && evaluation?.current_stage === "manager";
  const canCreateReplacementFptk =
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
    setForwarding(true);
    try {
      await evaluationService.forwardToHrAdmin(evaluation.id, { notes });
      setNotes("");
      await loadData();
    } catch {
      showAlert(
        "Gagal Forward",
        "Failed to forward evaluation to HR Admin",
        "error",
      );
    } finally {
      setForwarding(false);
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

    if (!evaluation.pkwt) {
      showAlert(
        "PKWT Belum Diisi",
        "PKWT wajib diisi sebelum submit. Silakan edit evaluasi terlebih dahulu.",
      );
      return;
    }
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

    setSubmitting(true);
    try {
      await evaluationService.submitEvaluation(evaluation.id);
      setNotes("");
      await loadData();
    } catch {
      showAlert("Gagal Submit", "Failed to submit evaluation", "error");
    } finally {
      setSubmitting(false);
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

    setSavingScores(true);
    try {
      const payload: EvaluationScorePayload = {
        scores: Object.entries(shScores).map(([criteriaId, score]) => ({
          criteria_id: Number(criteriaId),
          score,
        })),
      };
      await evaluationService.updateScores(evaluation.id, payload);
      await loadData();
    } catch {
      showAlert("Gagal Menyimpan", "Failed to save scores", "error");
    } finally {
      setSavingScores(false);
    }
  };

  // Proses approve yang sesungguhnya — dipanggil langsung kalau tidak perlu
  // konfirmasi tambahan, atau dari dialog konfirmasi setelah user klik "Ya".
  const runApprove = async () => {
    if (!evaluation) return;
    setApproving(true);
    try {
      if (canApprove) {
        const scorePayload: EvaluationScorePayload = {
          scores: Object.entries(shScores).map(([criteriaId, score]) => ({
            criteria_id: Number(criteriaId),
            score,
          })),
        };
        await evaluationService.updateScores(evaluation.id, scorePayload);
      }

      await evaluationService.approveEvaluation(evaluation.id, { notes });
      setNotes("");
      setUnfilledIds([]);
      await loadData();
    } catch {
      showAlert(
        "Gagal Approve",
        "Failed to approve evaluation. Jika Anda Section Head, pastikan Approver Manager Anda sudah di-set oleh Admin.",
        "error",
      );
    } finally {
      setApproving(false);
    }
  };

  const handleApprove = async () => {
    if (!evaluation) return;

    // Section Head: pastikan skor lengkap sebelum approve
    if (canApprove) {
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
    setRejecting(true);
    try {
      await evaluationService.rejectEvaluation(evaluation.id, { notes });
      setNotes("");
      await loadData();
    } catch {
      showAlert("Gagal Reject", "Failed to reject evaluation", "error");
    } finally {
      setRejecting(false);
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

  const showRubricTable =
    (roleName === "Leader" && evaluation.current_stage === "leader") ||
    canFillScoresSH;

  const recommendation = evaluation.recommendation;

  const sortedApprovals = evaluation.approvals.slice().sort((a, b) => {
    if (!a.acted_at) return 1;
    if (!b.acted_at) return -1;
    return new Date(b.acted_at).getTime() - new Date(a.acted_at).getTime();
  });

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
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              {evaluation.employee?.name ?? "-"}
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
              variant="outline"
              colorPalette="brand"
              size="sm"
              w={{ base: "full", sm: "auto" }}
            >
              Back
            </Button>

            {canFillScoresSH && (
              <Button
                type="button"
                onClick={handleSaveShScores}
                loading={savingScores}
                loadingText="Saving..."
                colorPalette="accent"
                size="sm"
                w={{ base: "full", sm: "auto" }}
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
                colorPalette="green"
                size="sm"
                w={{ base: "full", sm: "auto" }}
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
                colorPalette="red"
                size="sm"
                w={{ base: "full", sm: "auto" }}
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
                colorPalette="purple"
                size="sm"
                w={{ base: "full", sm: "auto" }}
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
          (!evaluation.pkwt ||
            !evaluation.recommendation?.employee_status ||
            !evaluation.section_head) && (
            <Box
              bg="orange.50"
              border="1px solid"
              borderColor="orange.200"
              rounded="md"
              p={3}
              mb={4}
            >
              <Text fontSize="13px" color="orange.800" fontWeight="600">
                ⚠️ Please complete the following before submitting:
              </Text>
              <Box as="ul" pl={5} mt={1} mb={2}>
                {!evaluation.pkwt && (
                  <Text as="li" fontSize="12px" color="orange.700">
                    PKWT has not been completed.
                  </Text>
                )}
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
              {(!evaluation.pkwt ||
                !evaluation.recommendation?.employee_status) && (
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

        {/* Summary */}
        <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
          <Flex
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={2}
            mb={4}
          >
            <Box>
              <Text fontSize="16px" fontWeight="700" color="gray.800">
                Summary
              </Text>
              <Text fontSize="13px" color="gray.500">
                Status: {evaluation.status.replace(/_/g, " ")}
              </Text>
            </Box>
            <Badge
              colorPalette={
                evaluation.status.includes("approved")
                  ? "green"
                  : evaluation.status.includes("rejected")
                    ? "red"
                    : "accent"
              }
            >
              {evaluation.current_stage.replace(/_/g, " ")}
            </Badge>
          </Flex>

          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={3}
          >
            <Box>
              <Text fontSize="12px" color="gray.400">
                Employee
              </Text>
              <Text fontSize="13px" color="gray.700" fontWeight="600">
                {evaluation.employee?.name ?? "-"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.400">
                NPK
              </Text>
              <Text fontSize="13px" color="gray.700" fontWeight="600">
                {evaluation.employee?.npk ?? evaluation.npk ?? "-"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.400">
                Position
              </Text>
              <Text fontSize="13px" color="gray.700">
                {evaluation.jabatan ?? evaluation.employee?.jabatan ?? "-"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.400">
                PKWT
              </Text>
              <Text fontSize="13px" color="gray.700">
                {evaluation.pkwt ?? "-"}
              </Text>
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.400">
                Join Date
              </Text>
              <Text fontSize="13px" color="gray.700">
                {formatDate(evaluation.join_date)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.400">
                Start Contract
              </Text>
              <Text fontSize="13px" color="gray.700">
                {formatDate(evaluation.start_date)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.400">
                End Contract
              </Text>
              <Text fontSize="13px" color="gray.700">
                {formatDate(evaluation.end_date)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.400">
                Final Score (SH)
              </Text>
              <Text fontSize="13px" color="gray.700" fontWeight="700">
                {evaluation.total_score ?? "Belum dinilai SH"}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* ── Scoring Rubric — editable for Leader or Section Head at their stage ── */}
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
                Scoring Rubric
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
             hanya saja seluruh radio LD & SH bersifat disabled. ── */}
        {!showRubricTable && (
          <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
            <Flex
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={2}
              mb={4}
            >
              <Text fontSize="16px" fontWeight="700" color="gray.800">
                Scoring Rubric
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

        {/* ── Recommendation — hasil rekomendasi dari Leader ── */}
        <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
          <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
            Recommendation
          </Text>
          {recommendation ? (
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={3}
            >
              <Box>
                <Text fontSize="12px" color="gray.400">
                  Employee Status
                </Text>
                <Text fontSize="13px" color="gray.700" fontWeight="600">
                  {recommendation.employee_status || "-"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="12px" color="gray.400">
                  Extend PKWT
                </Text>
                <Badge
                  colorPalette={recommendation.extend_pkwt ? "green" : "gray"}
                >
                  {recommendation.extend_pkwt
                    ? "Ya, diperpanjang"
                    : "Tidak diperpanjang"}
                </Badge>
              </Box>
              {recommendation.extend_pkwt && (
                <>
                  <Box>
                    <Text fontSize="12px" color="gray.400">
                      PKWT Number
                    </Text>
                    <Text fontSize="13px" color="gray.700">
                      {recommendation.pkwt_number || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="12px" color="gray.400">
                      Extend Months
                    </Text>
                    <Text fontSize="13px" color="gray.700">
                      {recommendation.extend_months ?? "-"} bulan
                    </Text>
                  </Box>
                </>
              )}
              <Box gridColumn={{ base: "1", md: "1 / -1" }}>
                <Text fontSize="12px" color="gray.400">
                  Notes
                </Text>
                <Text fontSize="13px" color="gray.700" whiteSpace="pre-wrap">
                  {recommendation.notes || "-"}
                </Text>
              </Box>
            </Box>
          ) : (
            <Text fontSize="13px" color="gray.400">
              Belum ada rekomendasi yang diisi.
            </Text>
          )}
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
        {(canApprove ||
          canApproveManager ||
          canSubmit ||
          canForwardToHrAdmin) && (
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
