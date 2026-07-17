import React, { useEffect, useState } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiX, FiEye } from "react-icons/fi";
import competencyService from "../../services/competencyService";
import CompetencyMatrixGrid from "../../components/competency/CompetencyMatrixGrid";
import type { AssessmentDetail } from "../../types/competency";

interface Props {
  isOpen: boolean;
  assessmentId: number | null;
  onClose: () => void;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const SubmissionDetailModal: React.FC<Props> = ({
  isOpen,
  assessmentId,
  onClose,
}) => {
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true); // ← initial true, bukan di-set di effect
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Effect murni untuk fetch. Reset state (detail/loading/errorMsg) tidak
  // perlu dilakukan manual di sini karena parent memanggil komponen ini
  // dengan key={assessmentId ?? "none"}, jadi tiap assessment berbeda akan
  // remount komponen dan otomatis mengembalikan semua state ke initial. ──
  useEffect(() => {
    if (!isOpen || !assessmentId) return;

    let cancelled = false;

    competencyService
      .getAssessmentDetail(assessmentId)
      .then((res) => {
        if (!cancelled) setDetail(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        setErrorMsg(
          e.response?.data?.message ?? "Failed to load assessment detail.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, assessmentId]);

  if (!isOpen) return null;

  const isApproved = detail?.status === "approved";

  return (
    <>
      <Box
        position="fixed"
        inset={0}
        zIndex={400}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />
      <Box
        position="fixed"
        top="50%"
        left="50%"
        zIndex={500}
        style={{
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "1000px",
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
          <Flex
            px={6}
            pt={6}
            pb={4}
            justify="space-between"
            align="flex-start"
            flexShrink={0}
          >
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
                <FiEye size={20} color="#1A5EA8" />
              </Box>
              <Box>
                <Text fontSize="16px" fontWeight="700" color="gray.800">
                  Assessment Detail {detail ? `— ${detail.period_label}` : ""}
                </Text>
                {detail && (
                  <Text fontSize="13px" color="gray.500">
                    Submitted {formatDate(detail.assessed_at)} by{" "}
                    {detail.assessor.name}
                    {detail.qa_reviewer &&
                      ` · Reviewed by ${detail.qa_reviewer.name}`}
                  </Text>
                )}
              </Box>
            </HStack>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                color: "#64748b",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <FiX size={15} />
            </button>
          </Flex>
          <Box h="1px" bg="gray.100" flexShrink={0} />

          <Box px={6} py={5} style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <Flex justify="center" py={10}>
                <Text color="gray.500" fontSize="14px">
                  Loading...
                </Text>
              </Flex>
            ) : errorMsg ? (
              <Box
                p={4}
                bg="#fff1f2"
                border="1px solid #fecdd3"
                borderRadius="8px"
              >
                <Text fontSize="13px" color="#be123c">
                  {errorMsg}
                </Text>
              </Box>
            ) : detail ? (
              <Flex direction="column" gap={5}>
                <Box>
                  <Text
                    fontSize="13px"
                    fontWeight="700"
                    color="gray.700"
                    mb={2}
                  >
                    Leader's Input
                  </Text>
                  <CompetencyMatrixGrid
                    matrix={detail.matrix}
                    mode="assessment"
                    scores={detail.leader_scores}
                  />
                </Box>

                {isApproved && Object.keys(detail.qa_scores).length > 0 && (
                  <Box>
                    <Text
                      fontSize="13px"
                      fontWeight="700"
                      color="gray.700"
                      mb={2}
                    >
                      QA Final Score
                    </Text>
                    <CompetencyMatrixGrid
                      matrix={detail.matrix}
                      mode="assessment"
                      scores={detail.qa_scores}
                    />
                  </Box>
                )}

                {!isApproved && (
                  <Box
                    p={3}
                    bg="#fffbeb"
                    border="1px solid #fde68a"
                    borderRadius="8px"
                  >
                    <Text fontSize="12px" color="#b45309">
                      This assessment is still waiting for QA review. The final
                      score will appear here once reviewed.
                    </Text>
                  </Box>
                )}

                {detail.notes && (
                  <Box>
                    <Text
                      fontSize="11px"
                      fontWeight={700}
                      color="gray.400"
                      mb={1}
                    >
                      NOTES
                    </Text>
                    <Text fontSize="13px" color="gray.700">
                      {detail.notes}
                    </Text>
                  </Box>
                )}
              </Flex>
            ) : null}
          </Box>

          <Box h="1px" bg="gray.100" flexShrink={0} />
          <Flex px={6} py={4} justify="flex-end" flexShrink={0}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "8px",
                color: "#ffffff",
                backgroundColor: "#1A5EA8",
                border: "1px solid #1A5EA8",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default SubmissionDetailModal;
