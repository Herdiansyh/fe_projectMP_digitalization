import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiClipboard } from "react-icons/fi";
import competencyService from "../../services/competencyService";
import CompetencyMatrixGrid from "../../components/competency/CompetencyMatrixGrid";
import type {
  AssessableSubject,
  CompetencyMatrix,
} from "../../types/competency";

interface Props {
  isOpen: boolean;
  subject: AssessableSubject | null;
  onClose: () => void;
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

const AssessmentFormModal: React.FC<Props> = ({
  isOpen,
  subject,
  onClose,
  onSuccess,
}) => {
  const [matrix, setMatrix] = useState<CompetencyMatrix | null>(null);
  const [loadingMatrix, setLoadingMatrix] = useState(true); // ← langsung true sebagai initial
  const [matrixError, setMatrixError] = useState<string | null>(null);

  const [scores, setScores] = useState<Record<number, number>>({});
  const [periodLabel, setPeriodLabel] = useState(
    () =>
      `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
  ); // ← initial value dari lazy initializer, bukan di-set di effect
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Effect ini SEKARANG hanya untuk fetch data (side effect ke luar), ──
  // ── bukan untuk reset state form. Reset dilakukan lewat remount (key). ──
  useEffect(() => {
    if (!isOpen || !subject) return;

    let cancelled = false;

    competencyService
      .getMatrixForSubject(subject.subject_type, subject.id)
      .then((res) => {
        if (!cancelled) setMatrix(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        setMatrixError(
          e.response?.data?.message ??
            "Failed to load competency matrix for this station.",
        );
        setMatrix(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingMatrix(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, subject]);

  // ...sisanya (categoryAverages, finalScore, totalCheckpoints, dst) tetap sama...
  // ── Live scoring, dihitung ulang setiap kali "scores" berubah ──
  const categoryAverages = useMemo(() => {
    if (!matrix) return [];

    return matrix.categories.map((category) => {
      const checkpointIds = category.checkpoints.map((c) => c.id);
      const filled = checkpointIds.filter((id) => scores[id] !== undefined);
      const cpMap = new Map(category.checkpoints.map((c) => [c.id, c]));
      const total = filled.reduce(
        (sum, id) => sum + cpMap.get(id)!.weight * scores[id], // ← fix: kali weight
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
    if (!subject || !matrix || !canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await competencyService.submitAssessment({
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
      onSuccess(res.message ?? "Assessment saved.");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setSubmitError(e.response?.data?.message ?? "Failed to save assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !subject) return null;

  return (
    <>
      <Box
        position="fixed"
        inset={0}
        zIndex={400}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={!submitting ? onClose : undefined}
      />
      <Box
        position="fixed"
        top="50%"
        left="50%"
        zIndex={500}
        style={{
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "960px",
          padding: "0 16px",
          maxHeight: "90vh",
        }}
      >
        <Box
          bg="white"
          borderRadius="12px"
          shadow="xl"
          borderWidth="1px"
          borderColor="gray.100"
          overflow="hidden"
          style={{
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box px={6} pt={6} pb={4} flexShrink={0}>
            <HStack gap={3} align="flex-start">
              <Box
                w="40px"
                h="40px"
                borderRadius="10px"
                bg="#eaf1f9"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <FiClipboard size={20} color="#1A5EA8" />
              </Box>
              <Box flex={1}>
                <Text fontSize="16px" fontWeight="700" color="gray.800">
                  Assess {subject.name}
                </Text>
                <Text fontSize="13px" color="gray.500">
                  NPK: {subject.npk} — {subject.station?.name || "-"}
                </Text>
              </Box>
              {finalScore !== null && (
                <Box textAlign="right">
                  <Text
                    fontSize="11px"
                    color="gray.400"
                    textTransform="uppercase"
                  >
                    Current Score
                  </Text>
                  <Text fontSize="22px" fontWeight="800" color="#1A5EA8">
                    {finalScore.toFixed(2)}
                  </Text>
                </Box>
              )}
            </HStack>
          </Box>
          <Box h="1px" bg="gray.100" flexShrink={0} />

          {/* Body */}
          <Box px={6} py={5} style={{ overflowY: "auto", flex: 1 }}>
            {loadingMatrix ? (
              <Flex justify="center" py={10}>
                <Text color="gray.500" fontSize="14px">
                  Loading matrix...
                </Text>
              </Flex>
            ) : matrixError ? (
              <Box
                p={4}
                bg="#fff1f2"
                border="1px solid #fecdd3"
                borderRadius="8px"
              >
                <Text fontSize="13px" color="#be123c">
                  {matrixError}
                </Text>
              </Box>
            ) : matrix ? (
              <Flex direction="column" gap={5}>
                {/* Period & notes */}
                <HStack gap={3} align="flex-start">
                  <Box flex={1}>
                    <label style={labelStyle}>Period</label>
                    <input
                      style={inputStyle}
                      value={periodLabel}
                      onChange={(e) => setPeriodLabel(e.target.value)}
                      placeholder="e.g. Q3 2026"
                    />
                  </Box>
                </HStack>

                {/* Grid ala-Excel: kategori sbg kolom, main process sbg baris */}
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
                    style={{
                      ...inputStyle,
                      minHeight: "70px",
                      resize: "vertical",
                    }}
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

          <Box h="1px" bg="gray.100" flexShrink={0} />

          {/* Footer */}
          <Flex
            px={6}
            py={4}
            justify="space-between"
            align="center"
            flexShrink={0}
          >
            <Text fontSize="12px" color="gray.500">
              {filledCheckpoints}/{totalCheckpoints} checkpoints filled
            </Text>
            <HStack gap={3}>
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  color: "#4a5568",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !canSubmit}
                onClick={handleSubmit}
                style={{
                  padding: "8px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  color: submitting || !canSubmit ? "#94a3b8" : "#ffffff",
                  backgroundColor:
                    submitting || !canSubmit ? "#f1f5f9" : "#1A5EA8",
                  border: `1px solid ${
                    submitting || !canSubmit ? "#e2e8f0" : "#1A5EA8"
                  }`,
                  cursor: submitting || !canSubmit ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Saving..." : "Save Assessment"}
              </button>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default AssessmentFormModal;
