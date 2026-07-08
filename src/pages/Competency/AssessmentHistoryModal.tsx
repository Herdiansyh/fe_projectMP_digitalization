import React, { useEffect, useState } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiClock, FiX, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import competencyService from "../../services/competencyService";
import type {
  AssessableSubject,
  AssessmentHistoryItem,
} from "../../types/competency";

interface Props {
  isOpen: boolean;
  subject: AssessableSubject | null;
  onClose: () => void;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const AssessmentHistoryModal: React.FC<Props> = ({
  isOpen,
  subject,
  onClose,
}) => {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && subject) {
      setLoading(true);
      setErrorMsg(null);
      setExpandedId(null);
      competencyService
        .getHistory(subject.subject_type, subject.id)
        .then((res) => {
          // urutkan terbaru dulu untuk tampilan (backend kirim ascending by assessed_at)
          setHistory([...res.data].reverse());
        })
        .catch((err) => {
          const e = err as { response?: { data?: { message?: string } } };
          setErrorMsg(
            e.response?.data?.message ?? "Failed to load assessment history.",
          );
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, subject]);

  if (!isOpen || !subject) return null;

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
          maxWidth: "680px",
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
                <FiClock size={20} color="#1A5EA8" />
              </Box>
              <Box>
                <Text fontSize="16px" fontWeight="700" color="gray.800">
                  Assessment History — {subject.name}
                </Text>
                <Text fontSize="13px" color="gray.500">
                  NPK: {subject.npk} — {subject.station?.name || "-"}
                </Text>
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

          {/* Body */}
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
            ) : history.length === 0 ? (
              <Flex justify="center" py={10}>
                <Text color="gray.400" fontSize="14px">
                  No assessment history yet.
                </Text>
              </Flex>
            ) : (
              <Flex direction="column" gap={3}>
                {history.map((item, idx) => {
                  const prev = history[idx + 1]; // item sesudahnya di array = periode sebelumnya (karena sudah di-reverse)
                  const trendUp = prev
                    ? item.final_score >= prev.final_score
                    : null;
                  const isExpanded = expandedId === item.id;

                  return (
                    <Box
                      key={item.id}
                      borderWidth="1px"
                      borderColor="gray.100"
                      borderRadius="10px"
                      overflow="hidden"
                    >
                      <Flex
                        justify="space-between"
                        align="center"
                        px={4}
                        py={3}
                        bg="#f8fafc"
                        cursor="pointer"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : item.id)
                        }
                      >
                        <Box>
                          <Text
                            fontSize="13px"
                            fontWeight="700"
                            color="gray.700"
                          >
                            {item.period_label}
                          </Text>
                          <Text fontSize="11px" color="gray.500">
                            {formatDate(item.assessed_at)} — by{" "}
                            {item.assessor.name}
                          </Text>
                        </Box>
                        <HStack gap={2}>
                          <Text
                            fontSize="18px"
                            fontWeight="800"
                            color="#1A5EA8"
                          >
                            {item.final_score.toFixed(2)}
                          </Text>
                          {trendUp !== null &&
                            (trendUp ? (
                              <FiTrendingUp size={14} color="#15803d" />
                            ) : (
                              <FiTrendingDown size={14} color="#c2410c" />
                            ))}
                        </HStack>
                      </Flex>

                      {isExpanded && (
                        <Box px={4} py={3}>
                          <Flex direction="column" gap={2}>
                            {item.category_scores.map((cat) => (
                              <Flex
                                key={cat.category_id}
                                justify="space-between"
                                align="center"
                              >
                                <Text fontSize="13px" color="gray.600">
                                  {cat.category_name}
                                </Text>
                                <Text
                                  fontSize="13px"
                                  fontWeight="600"
                                  color="gray.700"
                                >
                                  {cat.average.toFixed(2)}{" "}
                                  <Text
                                    as="span"
                                    fontSize="11px"
                                    color="gray.400"
                                  >
                                    ({cat.checkpoint_count} checkpoints)
                                  </Text>
                                </Text>
                              </Flex>
                            ))}
                          </Flex>
                          {item.notes && (
                            <Box mt={3} pt={3} borderTop="1px solid #f1f5f9">
                              <Text
                                fontSize="11px"
                                fontWeight={700}
                                color="gray.400"
                                mb={1}
                              >
                                NOTES
                              </Text>
                              <Text fontSize="13px" color="gray.700">
                                {item.notes}
                              </Text>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Flex>
            )}
          </Box>

          <Box h="1px" bg="gray.100" flexShrink={0} />
          <Flex px={6} py={4} justify="flex-end" flexShrink={0}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: "600",
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

export default AssessmentHistoryModal;
