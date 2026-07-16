import React, { useEffect, useMemo, useState } from "react";
import { Badge, Box, Flex, HStack, Text, Textarea } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import evaluationService from "../../services/evaluationService";
import type { Evaluation, EvaluationGroup, EvaluationScorePayload } from "../../types/evaluation";
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

  const canSubmit = roleName === "Leader" && evaluation?.current_stage === "leader";
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

  // All scores map (for read-only / non-section-head view)
  const criteriaMap = useMemo(() => {
    const map = new Map<number, { name: string; weight: number; score: number | null }>();
    evaluation?.scores.forEach((score) => {
      map.set(score.criteria_id, {
        name: score.criteria?.name ?? "",
        weight: score.criteria?.weight ?? 0,
        score: score.score,
      });
    });
    return map;
  }, [evaluation]);

  const handleSubmit = async () => {
    if (!evaluation) return;
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
  const rubricMode =
    canFillScoresSH
      ? "section_head"
      : roleName === "Leader" && evaluation.current_stage === "leader"
        ? "leader"
        : "readonly";

  // Only show rubric table for Leader (editing) or Section Head (editing)
  const showRubricTable =
    (roleName === "Leader" && evaluation.current_stage === "leader") || canFillScoresSH;

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
          <Text fontSize="13px" color="gray.600">
            Employee: {evaluation.employee?.name ?? "-"}
          </Text>
          <Text fontSize="13px" color="gray.600">
            NPK: {evaluation.employee?.npk ?? evaluation.npk ?? "-"}
          </Text>
          <Text fontSize="13px" color="gray.600">
            Score: {evaluation.total_score ?? 0}
          </Text>
          <Text fontSize="13px" color="gray.600">
            Recommendation: {evaluation.recommendation?.employee_status ?? "-"}
          </Text>
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
                    <Text fontSize="11px" color="gray.600">LD (Leader — read only)</Text>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box w="10px" h="10px" rounded="full" bg="#16a34a" />
                    <Text fontSize="11px" color="gray.600">SH (Section Head — editable)</Text>
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

        {/* ── Scores summary (read-only list for non-editing views) ── */}
        {!showRubricTable && (
          <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
            <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
              Scores
            </Text>
            {criteriaGroups.map((group) => (
              <Box key={group.id} mb={5}>
                <Text fontSize="14px" fontWeight="700" color="gray.800" mb={2}>
                  {group.name}
                </Text>
                {group.subgroups.map((subgroup) => (
                  <Box key={subgroup.id} mb={3}>
                    <Text fontSize="13px" fontWeight="600" color="gray.700" mb={2}>
                      {subgroup.name}
                    </Text>
                    {subgroup.criteria.map((criteria) => {
                      const score = criteriaMap.get(criteria.id);
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
                          <Text fontSize="13px" color="gray.600">
                            {score?.score ?? "-"}
                          </Text>
                        </Flex>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}

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
