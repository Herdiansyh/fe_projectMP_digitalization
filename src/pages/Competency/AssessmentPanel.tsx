import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import CompetencyMatrixGrid from "../../components/competency/CompetencyMatrixGrid";
import type { AssessableSubject } from "../../types/competency";
import {
  useMatrixForSubject,
  useSubmitAssessment,
} from "../../hooks/queries/useCompetencyQueries";

interface Props {
  subject: AssessableSubject;
  onCancel: () => void;
  onSuccess: (message: string) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  fontSize: "14px",
  color: "#1a202c",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#334155",
  marginBottom: "6px",
  display: "block",
};

const AssessmentPanel: React.FC<Props> = ({ subject, onCancel, onSuccess }) => {
  const {
    data: matrixRes,
    isLoading: loadingMatrix,
    isError: isMatrixError,
    error: matrixErrorRaw,
  } = useMatrixForSubject(subject.subject_type, subject.id);

  const matrix = matrixRes?.data ?? null;
  const matrixError = isMatrixError
    ? ((
        matrixErrorRaw as unknown as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message ??
      "Failed to load competency matrix for this station.")
    : null;

  const submitMutation = useSubmitAssessment();

  const [scores, setScores] = useState<Record<number, number>>({});
  const [periodLabel, setPeriodLabel] = useState("");
  const [notes, setNotes] = useState("");

  // Reset form tiap kali subject berganti (bukan tiap matrix selesai fetch)
  useEffect(() => {
    setScores({});
    setNotes("");
    setPeriodLabel(
      `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
    );
  }, [subject]);

  const categoryAverages = useMemo(() => {
    if (!matrix) return [];
    return matrix.categories.map((category) => {
      const checkpointIds = category.checkpoints.map((c) => c.id);
      const filled = checkpointIds.filter((id) => scores[id] !== undefined);
      const cpMap = new Map(category.checkpoints.map((c) => [c.id, c]));
      const total = filled.reduce(
        (sum, id) => sum + cpMap.get(id)!.weight * scores[id],
        0,
      );
      return {
        categoryId: category.id,
        categoryName: category.name,
        total,
        filledCount: filled.length,
        checkpointCount: checkpointIds.length,
        average: filled.length > 0 ? total / filled.length : null,
      };
    });
  }, [matrix, scores]);

  const finalScore = useMemo(() => {
    const withAverage = categoryAverages.filter((c) => c.average !== null);
    if (withAverage.length === 0) return null;
    const sum = withAverage.reduce((s, c) => s + (c.average as number), 0);
    return sum / withAverage.length;
  }, [categoryAverages]);

  const totalCheckpoints = useMemo(
    () => matrix?.categories.reduce((s, c) => s + c.checkpoints.length, 0) ?? 0,
    [matrix],
  );
  const filledCheckpoints = Object.keys(scores).length;
  const canSubmit =
    matrix !== null &&
    totalCheckpoints > 0 &&
    filledCheckpoints === totalCheckpoints &&
    periodLabel.trim() !== "";

  const handleSubmit = async () => {
    if (!matrix || !canSubmit) return;
    try {
      const res = await submitMutation.mutateAsync({
        subject_type: subject.subject_type,
        subject_id: subject.id,
        matrix_id: matrix.id,
        period_label: periodLabel,
        notes: notes || undefined,
        scores: Object.entries(scores).map(([checkpointId, point]) => ({
          checkpoint_id: Number(checkpointId),
          point,
        })),
      });
      onSuccess((res as { message?: string })?.message ?? "Assessment saved.");
    } catch {
      // error sudah ditangani lewat submitMutation.error di bawah
    }
  };

  const submitError = submitMutation.isError
    ? ((
        submitMutation.error as unknown as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message ?? "Failed to save assessment.")
    : null;

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.100"
      borderRadius="12px"
      overflow="hidden"
    >
      {/* Header */}
      <Box px={5} pt={5} pb={4} bg="#fbfcfe">
        <HStack gap={3} align="flex-start">
          <Box flex={1}>
            <Text fontSize="15px" fontWeight="700" color="gray.800">
              Assess {subject.name}
            </Text>
            <Text fontSize="13px" color="gray.500">
              NPK: {subject.npk} — {subject.station?.name || "-"}
            </Text>
          </Box>
          {finalScore !== null && (
            <Box textAlign="right">
              <Text fontSize="11px" color="gray.400" textTransform="uppercase">
                Current Score
              </Text>
              <Text fontSize="20px" fontWeight="800" color="#1A5EA8">
                {finalScore.toFixed(2)}
              </Text>
            </Box>
          )}
        </HStack>
      </Box>
      <Box h="1px" bg="gray.100" />

      {/* Body */}
      <Box px={5} py={5}>
        {loadingMatrix ? (
          <Flex justify="center" py={10}>
            <Text color="gray.500" fontSize="14px">
              Loading matrix...
            </Text>
          </Flex>
        ) : matrixError ? (
          <Box p={4} bg="#fff1f2" border="1px solid #fecdd3" borderRadius="8px">
            <Text fontSize="13px" color="#be123c">
              {matrixError}
            </Text>
          </Box>
        ) : matrix ? (
          <Flex direction="column" gap={5}>
            <Box maxW="240px">
              <label style={labelStyle}>Period</label>
              <input
                style={inputStyle}
                value={periodLabel}
                onChange={(e) => setPeriodLabel(e.target.value)}
                placeholder="e.g. Q3 2026"
              />
            </Box>

            <CompetencyMatrixGrid
              matrix={matrix}
              mode="assessment"
              scores={scores}
              onScoreChange={(checkpointId, point) =>
                setScores((prev) => ({ ...prev, [checkpointId]: point }))
              }
            />

            <Box>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this assessment..."
              />
            </Box>

            {submitError && (
              <Box
                p={3}
                bg="#fff1f2"
                border="1px solid #fecdd3"
                borderRadius="8px"
              >
                <Text fontSize="13px" color="#be123c">
                  {submitError}
                </Text>
              </Box>
            )}
          </Flex>
        ) : null}
      </Box>

      <Box h="1px" bg="gray.100" />

      {/* Footer */}
      <Flex px={5} py={4} justify="space-between" align="center" bg="#fbfcfe">
        <Text fontSize="12px" color="gray.500">
          {filledCheckpoints}/{totalCheckpoints} checkpoints filled
        </Text>
        <HStack gap={3}>
          <button
            type="button"
            disabled={submitMutation.isPending}
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              borderRadius: "8px",
              color: "#4a5568",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              cursor: submitMutation.isPending ? "not-allowed" : "pointer",
              opacity: submitMutation.isPending ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitMutation.isPending || !canSubmit}
            onClick={handleSubmit}
            style={{
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: "600",
              borderRadius: "8px",
              color:
                submitMutation.isPending || !canSubmit ? "#94a3b8" : "#ffffff",
              backgroundColor:
                submitMutation.isPending || !canSubmit ? "#f1f5f9" : "#1A5EA8",
              border: `1px solid ${
                submitMutation.isPending || !canSubmit ? "#e2e8f0" : "#1A5EA8"
              }`,
              cursor:
                submitMutation.isPending || !canSubmit
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {submitMutation.isPending ? "Saving..." : "Save Assessment"}
          </button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default AssessmentPanel;
