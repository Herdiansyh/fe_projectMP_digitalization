import React, { useEffect, useState } from "react";
import { Box, Text, Flex, HStack, Grid, Badge } from "@chakra-ui/react";
import { FiUser, FiX } from "react-icons/fi";
import type { Evaluation, EvaluationGroup } from "../../types/evaluation";
import evaluationService from "../../services/evaluationService";
import ScoringRubricTable from "./ScoringRubricTable";

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box>
    <Text
      fontSize="11px"
      fontWeight={700}
      color="gray.400"
      mb={1}
      textTransform="uppercase"
      letterSpacing="0.05em"
    >
      {label}
    </Text>
    <Text fontSize="14px" color="gray.800">
      {value ?? "-"}
    </Text>
  </Box>
);

interface HrDecisionDetailModalProps {
  evaluation: Evaluation;
  subjectType: "employee" | "intern";
  onClose: () => void;
}

const HrDecisionDetailModal: React.FC<HrDecisionDetailModalProps> = ({
  evaluation,
  subjectType,
  onClose,
}) => {
  const isIntern = subjectType === "intern";

  const [criteriaGroups, setCriteriaGroups] = useState<EvaluationGroup[]>([]);
  const [loadingCriteria, setLoadingCriteria] = useState(true);

  useEffect(() => {
    if (isIntern) {
      setLoadingCriteria(false);
      return;
    }

    let mounted = true;
    setLoadingCriteria(true);
    evaluationService
      .getCriteria()
      .then((res) => {
        if (mounted) setCriteriaGroups(res.data ?? []);
      })
      .catch(() => {
        if (mounted) setCriteriaGroups([]);
      })
      .finally(() => {
        if (mounted) setLoadingCriteria(false);
      });
    return () => {
      mounted = false;
    };
  }, [isIntern]);

  const subject =
    subjectType === "intern" ? evaluation.intern : evaluation.employee;

  // Pisahkan skor Leader dan Section Head dari array scores flat
  const leaderScores: Record<number, number> = {};
  const shScores: Record<number, number> = {};
  evaluation.scores.forEach((s) => {
    if (s.score === null) return;
    if (s.filled_by_role === "leader") {
      leaderScores[s.criteria_id] = s.score;
    }
    if (s.filled_by_role === "section_head") {
      shScores[s.criteria_id] = s.score;
    }
  });

  // Fallback: kalau SH belum mengisi (evaluation masih di tahap leader),
  // tampilkan skor leader saja di kedua kolom supaya tabel tidak kosong.
  const hasShScores = Object.keys(shScores).length > 0;

  const recommendation = evaluation.recommendation;

  return (
    <>
      <Box
        position="fixed"
        inset={0}
        zIndex={600}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />
      <Box
        position="fixed"
        top="50%"
        left="50%"
        zIndex={700}
        style={{
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "1100px",
          maxHeight: "calc(100vh - 32px)",
          padding: "0 16px",
          display: "flex",
        }}
      >
        <Box
          bg="white"
          borderRadius="12px"
          shadow="xl"
          borderWidth="1px"
          borderColor="gray.100"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          w="100%"
          maxH="calc(100vh - 32px)"
        >
          {/* Header */}
          <Box flexShrink={0} borderBottom="1px solid" borderColor="gray.100">
            <Flex
              px={{ base: 4, md: 6 }}
              pt={{ base: 4, md: 6 }}
              pb={4}
              justify="space-between"
              align="flex-start"
              wrap="wrap"
              gap={3}
            >
              <HStack gap={3} align="flex-start">
                <Box
                  w="44px"
                  h="44px"
                  borderRadius="10px"
                  bg="#eff6ff"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <FiUser size={20} color="#1d4ed8" />
                </Box>
                <Box>
                  <Text fontSize="17px" fontWeight="700" color="gray.800">
                    {subject?.name ?? "-"}
                  </Text>
                  <Text fontSize="13px" color="gray.500" mt={0.5}>
                    NPK {subject?.npk ?? evaluation.npk ?? "-"}
                  </Text>
                  <HStack gap={2} mt={2}>
                    <Badge colorPalette="blue">
                      {isIntern ? "Intern" : "Employee"}
                    </Badge>
                    <Badge colorPalette="purple">{evaluation.status}</Badge>
                  </HStack>
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
          </Box>

          {/* Body */}
          <Box flex="1" overflowY="auto" px={{ base: 4, md: 6 }} py={5}>
            {/* Data Diri */}
            <Text
              fontSize="11px"
              fontWeight={700}
              color="gray.400"
              mb={3}
              textTransform="uppercase"
              letterSpacing="0.05em"
            >
              {isIntern ? "Intern" : "Employee"} Details
            </Text>
            <Grid
              templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }}
              gap={4}
              mb={5}
            >
              <DetailRow label="Position" value={evaluation.jabatan} />
              <DetailRow
                label="Join Date"
                value={formatDate(evaluation.join_date)}
              />
              <DetailRow
                label="Start Contract"
                value={formatDate(evaluation.start_date)}
              />
              <DetailRow
                label="End Contract"
                value={formatDate(evaluation.end_date)}
              />
              {!isIntern && (
                <DetailRow
                  label="PKWT Number"
                  value={evaluation.employee?.pkwt_number}
                />
              )}
              {/* Total Score hanya relevan untuk Employee — Intern tidak
                  punya Evaluation Assessment is not required for interns. An intern's status is determined entirely by the Recommendation section below. sama sekali, jadi total_score-nya
                  selalu null dan tidak perlu ditampilkan. */}
              {!isIntern && (
                <DetailRow
                  label="Total Score"
                  value={evaluation.total_score ?? "-"}
                />
              )}
            </Grid>

            <Box h="1px" bg="gray.100" my={5} />

            {/* Recommendation */}
            <Text
              fontSize="11px"
              fontWeight={700}
              color="gray.400"
              mb={3}
              textTransform="uppercase"
              letterSpacing="0.05em"
            >
              Recommendation
            </Text>
            {!recommendation ? (
              <Text fontSize="13px" color="gray.400" mb={5}>
                No recommendation submitted yet.
              </Text>
            ) : (
              <Box
                bg="gray.50"
                borderRadius="8px"
                p={4}
                mb={5}
                border="1px solid #e2e8f0"
              >
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                  <DetailRow
                    label="Decision"
                    value={recommendation.employee_status ?? "-"}
                  />
                  <DetailRow
                    label="Extend PKWT"
                    value={recommendation.extend_pkwt ? "Yes" : "No"}
                  />
                  {recommendation.extend_pkwt && (
                    <>
                      <DetailRow
                        label="PKWT Number"
                        value={recommendation.pkwt_number}
                      />
                      <DetailRow
                        label="Duration (Months)"
                        value={recommendation.extend_months}
                      />
                    </>
                  )}
                </Grid>
                {recommendation.notes && (
                  <Box mt={3}>
                    <Text
                      fontSize="11px"
                      fontWeight={700}
                      color="gray.400"
                      mb={1}
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                    >
                      Notes
                    </Text>
                    <Text fontSize="13px" color="gray.700">
                      {recommendation.notes}
                    </Text>
                  </Box>
                )}
              </Box>
            )}

            {/* Evaluation Assessment is not required for interns. An intern's status is determined entirely by the Recommendation section below. — HANYA untuk Employee. Intern tidak pernah
                mengisi rubric sama sekali (baik Leader maupun SH), jadi
                section ini disembunyikan total untuk subjek Intern. */}
            {!isIntern && (
              <>
                <Box h="1px" bg="gray.100" my={5} />
                <Text
                  fontSize="11px"
                  fontWeight={700}
                  color="gray.400"
                  mb={3}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  Evaluation Assessment is not required for interns. An intern's
                  status is determined entirely by the Recommendation section
                  below.
                </Text>
                {loadingCriteria ? (
                  <Text fontSize="13px" color="gray.400">
                    Loading rubric...
                  </Text>
                ) : criteriaGroups.length === 0 ? (
                  <Text fontSize="13px" color="gray.400">
                    No criteria data available.
                  </Text>
                ) : (
                  <ScoringRubricTable
                    criteriaGroups={criteriaGroups}
                    scores={hasShScores ? shScores : leaderScores}
                    leaderScores={leaderScores}
                    mode="manager_view"
                    onChange={() => {
                      /* read-only, no-op */
                    }}
                  />
                )}
              </>
            )}
          </Box>

          {/* Footer */}
          <Flex
            px={{ base: 4, md: 6 }}
            py={4}
            justify="flex-end"
            flexShrink={0}
            borderTop="1px solid"
            borderColor="gray.100"
          >
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

export default HrDecisionDetailModal;
