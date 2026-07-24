import React, { useState, useMemo } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiCheckCircle } from "react-icons/fi";
import CompetencyMatrixGrid from "../../components/competency/CompetencyMatrixGrid";
import type { QaQueueItem } from "../../types/competency";
import {
  useMatrixForSubject,
  useSubmitQaReview,
} from "../../hooks/queries/useCompetencyQueries";

interface Props {
  isOpen: boolean;
  item: QaQueueItem | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const QaReviewModal: React.FC<Props> = ({
  isOpen,
  item,
  onClose,
  onSuccess,
}) => {
  const {
    data: matrixRes,
    isLoading: loadingMatrix,
    isError: isMatrixError,
    error: matrixErrorRaw,
  } = useMatrixForSubject(
    item?.subject_type ?? "employee",
    item?.subject.id ?? 0,
    isOpen && !!item,
  );

  const matrix = matrixRes?.data ?? null;
  const matrixError = isMatrixError
    ? ((
        matrixErrorRaw as unknown as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message ?? "Failed to load competency matrix.")
    : null;

  const submitMutation = useSubmitQaReview();

  const [scores, setScores] = useState<Record<number, number>>({});

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
    try {
      const res = await submitMutation.mutateAsync({
        assessmentId: item.id,
        payload: {
          scores: Object.entries(scores).map(([checkpointId, point]) => ({
            checkpoint_id: Number(checkpointId),
            point,
          })),
        },
      });
      onSuccess((res as { message?: string })?.message ?? "QA review saved.");
    } catch {
      // error sudah ditangani lewat submitMutation.error di bawah
    }
  };

  const submitError = submitMutation.isError
    ? ((
        submitMutation.error as unknown as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message ?? "Failed to save QA review.")
    : null;

  const submitting = submitMutation.isPending;

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
                  QA Review — {item.subject.name}
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

export default QaReviewModal;
