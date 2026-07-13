import React, { useEffect, useState, useMemo } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiCheckCircle } from "react-icons/fi";
import competencyService from "../../services/competencyService";
import CompetencyMatrixGrid from "../../components/competency/CompetencyMatrixGrid";
import type { QcQueueItem, CompetencyMatrix } from "../../types/competency";

interface Props {
  isOpen: boolean;
  item: QcQueueItem | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const QcReviewModal: React.FC<Props> = ({
  isOpen,
  item,
  onClose,
  onSuccess,
}) => {
  const [matrix, setMatrix] = useState<CompetencyMatrix | null>(null);
  const [loadingMatrix, setLoadingMatrix] = useState(true);
  const [matrixError, setMatrixError] = useState<string | null>(null);

  const [scores, setScores] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !item) return;

    let cancelled = false;

    competencyService
      .getMatrixForSubject(item.subject_type, item.subject.id)
      .then((res) => {
        if (!cancelled) setMatrix(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        setMatrixError(
          e.response?.data?.message ?? "Failed to load competency matrix.",
        );
        setMatrix(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingMatrix(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, item]);

  const totalCheckpoints = useMemo(
    () => matrix?.categories.reduce((s, c) => s + c.checkpoints.length, 0) ?? 0,
    [matrix],
  );
  const filledCheckpoints = Object.keys(scores).length;
  const canSubmit =
    matrix !== null &&
    totalCheckpoints > 0 &&
    filledCheckpoints === totalCheckpoints;

  const handleSubmit = async () => {
    if (!item || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await competencyService.submitQcReview(item.id, {
        scores: Object.entries(scores).map(([checkpointId, point]) => ({
          checkpoint_id: Number(checkpointId),
          point,
        })),
      });
      onSuccess(res.message ?? "QC review saved.");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setSubmitError(e.response?.data?.message ?? "Failed to save QC review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !item) return null;

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
                <FiCheckCircle size={20} color="#1A5EA8" />
              </Box>
              <Box flex={1}>
                <Text fontSize="16px" fontWeight="700" color="gray.800">
                  QC Review — {item.subject.name}
                </Text>
                <Text fontSize="13px" color="gray.500">
                  NPK: {item.subject.npk} — Period: {item.period_label} —
                  Submitted by {item.assessor.name}
                </Text>
              </Box>
            </HStack>
          </Box>
          <Box h="1px" bg="gray.100" flexShrink={0} />

          <Box px={6} py={5} style={{ overflowY: "auto", flex: 1 }}>
            {/* Referensi ringkas nilai Leader per kategori */}
            <Box
              mb={4}
              p={3}
              bg="#f8fafc"
              borderRadius="8px"
              border="1px solid #e2e8f0"
            >
              <Text fontSize="12px" fontWeight={700} color="gray.500" mb={2}>
                LEADER'S SCORES (reference)
              </Text>
              <Flex gap={4} wrap="wrap">
                {item.leader_category_scores.map((c) => (
                  <Text key={c.category_id} fontSize="12px" color="gray.700">
                    {c.category_name}: <b>{c.average.toFixed(2)}</b>
                  </Text>
                ))}
              </Flex>
            </Box>

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
              <CompetencyMatrixGrid
                matrix={matrix}
                mode="assessment"
                scores={scores}
                referenceScores={item.leader_scores}
                onScoreChange={(checkpointId, point) =>
                  setScores((prev) => ({ ...prev, [checkpointId]: point }))
                }
              />
            ) : null}

            {submitError && (
              <Box
                mt={4}
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
          </Box>

          <Box h="1px" bg="gray.100" flexShrink={0} />
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
                  fontWeight: 600,
                  borderRadius: "8px",
                  color: submitting || !canSubmit ? "#94a3b8" : "#ffffff",
                  backgroundColor:
                    submitting || !canSubmit ? "#f1f5f9" : "#1A5EA8",
                  border: `1px solid ${submitting || !canSubmit ? "#e2e8f0" : "#1A5EA8"}`,
                  cursor: submitting || !canSubmit ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Saving..." : "Approve & Save Final Score"}
              </button>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default QcReviewModal;
