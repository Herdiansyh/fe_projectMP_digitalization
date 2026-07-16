import React, { useEffect, useMemo, useState } from "react";
import { Badge, Box, Flex, HStack, Text, Textarea } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import evaluationService from "../../services/evaluationService";
import type {
  Evaluation,
  EvaluationGroup,
  EvaluationScorePayload,
} from "../../types/evaluation";
import ScoringRubricTable from "./ScoringRubricTable";

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

  // SH scores (editable for section head)
  const [shScores, setShScores] = useState<Record<number, number>>({});

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

      // Pre-populate SH scores from existing data
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

  // LD scores map (filled_by_role === "leader")
  const leaderScores = useMemo(() => {
    const map: Record<number, number> = {};
    evaluation?.scores.forEach((score) => {
      if (score.filled_by_role === "leader" && score.score !== null) {
        map[score.criteria_id] = score.score;
      }
    });
    return map;
  }, [evaluation]);

  // SH scores map (untuk ditampilkan di readonly summary, misal saat Manager lihat)
  const sectionHeadScoresMap = useMemo(() => {
    const map: Record<number, number> = {};
    evaluation?.scores.forEach((score) => {
      if (score.filled_by_role === "section_head" && score.score !== null) {
        map[score.criteria_id] = score.score;
      }
    });
    return map;
  }, [evaluation]);

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleSubmit = async () => {
    if (!evaluation) return;

    // Validasi wajib isi sebelum submit ke Section Head
    if (!evaluation.pkwt) {
      alert(
        "PKWT wajib diisi sebelum submit. Silakan edit evaluasi terlebih dahulu.",
      );
      return;
    }
    if (
      !evaluation.recommendation ||
      !evaluation.recommendation.employee_status
    ) {
      alert(
        "Recommendation wajib diisi sebelum submit. Silakan edit evaluasi terlebih dahulu.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await evaluationService.submitEvaluation(evaluation.id);
      await loadData();
    } catch {
      alert("Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveShScores = async () => {
    if (!evaluation) return;
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
      alert("Failed to save scores");
    } finally {
      setSavingScores(false);
    }
  };

  const handleApprove = async () => {
    if (!evaluation) return;
    setApproving(true);
    try {
      await evaluationService.approveEvaluation(evaluation.id, { notes });
      await loadData();
    } catch {
      alert("Failed to approve evaluation");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!evaluation) return;
    setRejecting(true);
    try {
      await evaluationService.rejectEvaluation(evaluation.id, { notes });
      await loadData();
    } catch {
      alert("Failed to reject evaluation");
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

  // Determine rubric display mode
  const rubricMode = canFillScoresSH
    ? "section_head"
    : roleName === "Leader" && evaluation.current_stage === "leader"
      ? "leader"
      : "readonly";

  // Only show rubric table for Leader (editing) or Section Head (editing)
  const showRubricTable =
    (roleName === "Leader" && evaluation.current_stage === "leader") ||
    canFillScoresSH;

  const recommendation = evaluation.recommendation;

  return (
    <MainLayout>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Evaluation Detail
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              {evaluation.employee?.name ?? "-"}
            </Text>
          </Box>
          <HStack gap={2}>
            <button
              type="button"
              onClick={() => navigate("/evaluations")}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                color: "#475569",
              }}
            >
              Back
            </button>
            {canFillScoresSH && (
              <button
                type="button"
                onClick={handleSaveShScores}
                disabled={savingScores}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#7c3aed",
                  color: "#fff",
                  opacity: savingScores ? 0.7 : 1,
                }}
              >
                {savingScores ? "Saving..." : "Save Scores (SH)"}
              </button>
            )}
            {canSubmit && (
              <button
                type="button"
                onClick={() => navigate(`/evaluations/${evaluation.id}/edit`)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #3b82f6",
                  backgroundColor: "#fff",
                  color: "#3b82f6",
                  fontWeight: 600,
                }}
              >
                Edit Details & Recommendation
              </button>
            )}
            {canSubmit && (
              <button
                type="button"
                onClick={handleSubmit}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                }}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
            {(canApprove || canApproveManager) && (
              <button
                type="button"
                onClick={handleApprove}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#16a34a",
                  color: "#fff",
                }}
              >
                {approving ? "Approving..." : "Approve"}
              </button>
            )}
            {(canApprove || canApproveManager) && (
              <button
                type="button"
                onClick={handleReject}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "#fff",
                }}
              >
                {rejecting ? "Rejecting..." : "Reject"}
              </button>
            )}
          </HStack>
        </Flex>
        {canSubmit &&
          (!evaluation.pkwt || !evaluation.recommendation?.employee_status) && (
            <Box
              bg="orange.50"
              border="1px solid"
              borderColor="orange.200"
              rounded="md"
              p={3}
              mb={4}
            >
              <Text fontSize="13px" color="orange.800" fontWeight="600">
                ⚠️ Lengkapi data berikut sebelum submit:
              </Text>
              <Box as="ul" pl={5} mt={1} mb={2}>
                {!evaluation.pkwt && (
                  <Text as="li" fontSize="12px" color="orange.700">
                    PKWT belum diisi
                  </Text>
                )}
                {!evaluation.recommendation?.employee_status && (
                  <Text as="li" fontSize="12px" color="orange.700">
                    Recommendation (Employee Status) belum diisi
                  </Text>
                )}
              </Box>
              <button
                type="button"
                onClick={() => navigate(`/evaluations/${evaluation.id}/edit`)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  color: "#ffffff",
                  backgroundColor: "#ea580c",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Lengkapi Sekarang
              </button>
            </Box>
          )}
        {/* Summary */}
        <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
          <Flex justify="space-between" align="center" mb={4}>
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
                    : "orange"
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
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="16px" fontWeight="700" color="gray.800">
                Scoring Rubric
              </Text>
              {canFillScoresSH && (
                <HStack gap={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box w="10px" h="10px" rounded="full" bg="#2563eb" />
                    <Text fontSize="11px" color="gray.600">
                      LD (Leader — read only)
                    </Text>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box w="10px" h="10px" rounded="full" bg="#16a34a" />
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
              onChange={(criteriaId, value) => {
                if (rubricMode === "section_head") {
                  setShScores((prev) => ({ ...prev, [criteriaId]: value }));
                }
              }}
              mode={rubricMode}
            />
          </Box>
        )}

        {/* ── Scores summary (read-only, breakdown LD vs SH) untuk Manager/viewer ── */}
        {!showRubricTable && (
          <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="16px" fontWeight="700" color="gray.800">
                Scores
              </Text>
              <HStack gap={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box w="10px" h="10px" rounded="full" bg="#2563eb" />
                  <Text fontSize="11px" color="gray.600">
                    Leader
                  </Text>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box w="10px" h="10px" rounded="full" bg="#16a34a" />
                  <Text fontSize="11px" color="gray.600">
                    Section Head
                  </Text>
                </Box>
              </HStack>
            </Flex>
            {criteriaGroups.map((group) => (
              <Box key={group.id} mb={5}>
                <Text fontSize="14px" fontWeight="700" color="gray.800" mb={2}>
                  {group.name}
                </Text>
                {group.subgroups.map((subgroup) => (
                  <Box key={subgroup.id} mb={3}>
                    <Text
                      fontSize="13px"
                      fontWeight="600"
                      color="gray.700"
                      mb={2}
                    >
                      {subgroup.name}
                    </Text>
                    {subgroup.criteria.map((criteria) => {
                      const ld = leaderScores[criteria.id];
                      const sh = sectionHeadScoresMap[criteria.id];
                      return (
                        <Flex
                          key={criteria.id}
                          justify="space-between"
                          align="center"
                          py={2}
                          borderBottom="1px solid"
                          borderColor="gray.100"
                        >
                          <Box>
                            <Text fontSize="13px" color="gray.700">
                              {criteria.name}
                            </Text>
                            <Text fontSize="12px" color="gray.500">
                              Weight: {criteria.weight}
                            </Text>
                          </Box>
                          <HStack gap={4}>
                            <Box textAlign="center">
                              <Text
                                fontSize="10px"
                                color="#2563eb"
                                fontWeight="700"
                              >
                                LD
                              </Text>
                              <Text fontSize="13px" color="gray.700">
                                {ld ?? "-"}
                              </Text>
                            </Box>
                            <Box textAlign="center">
                              <Text
                                fontSize="10px"
                                color="#16a34a"
                                fontWeight="700"
                              >
                                SH
                              </Text>
                              <Text fontSize="13px" color="gray.700">
                                {sh ?? "-"}
                              </Text>
                            </Box>
                          </HStack>
                        </Flex>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            ))}
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

        {/* Notes for approve/reject/submit */}
        {(canApprove || canApproveManager || canSubmit) && (
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
    </MainLayout>
  );
};

export default EvaluationDetail;
