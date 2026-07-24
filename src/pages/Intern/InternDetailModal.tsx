import React, { useEffect, useState } from "react";
import { Box, Text, Flex, HStack, Grid } from "@chakra-ui/react";
import { FiClock, FiPrinter, FiUser, FiX } from "react-icons/fi";
import type { Intern } from "../../types/intern";
import type {
  AssessableSubject,
  StationCompetencySummary,
} from "../../types/competency";
import AssessmentHistoryModal from "../Competency/AssessmentHistoryModal";
import competencyService from "../../services/competencyService";
import CompetencyDonutBadge from "../../components/competency/CompetencyDonutBadge";

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
const getContractDuration = (start?: string | null, end?: string | null) => {
  if (!start) return "-";

  const startDate = new Date(start);

  // gunakan hari ini atau end contract (mana yang lebih kecil)
  const today = new Date();
  const endDate = end && new Date(end) < today ? new Date(end) : today;

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts: string[] = [];

  if (years > 0) parts.push(`${years} Year${years > 1 ? "s" : ""}`);

  if (months > 0) parts.push(`${months} Month${months > 1 ? "s" : ""}`);

  if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);

  return parts.length ? parts.join(" ") : "0 Day";
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

const InternDetailModal = ({
  isOpen,
  intern,
  onClose,
}: {
  isOpen: boolean;
  intern: Intern | null;
  onClose: () => void;
}) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [stationSummary, setStationSummary] = useState<
    StationCompetencySummary[]
  >([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isOpen && intern) {
      setLoadingSummary(true);
      competencyService
        .getStationSummary("intern", intern.id)
        .then((res) => setStationSummary(res.data))
        .catch(() => setStationSummary([]))
        .finally(() => setLoadingSummary(false));
    }
  }, [isOpen, intern]);

  if (!isOpen || !intern) return null;

  const handlePrint = () => {
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    const printUrl =
      API_BASE_URL.replace(/\/api\/?$/, "") +
      `/print/manpower/intern/${intern.id}`;
    //           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ini yang menghapus "/api" di akhir
    window.open(printUrl, "_blank");
  };

  const isWarning = !!intern.is_near_expiry;

  const assessmentSubject: AssessableSubject = {
    id: intern.id,
    npk: intern.npk,
    name: intern.name,
    subject_type: "intern",
    station_id: intern.station?.id ?? 0,
    station: intern.station || undefined,
    latest_assessment: null,
  };

  return (
    <>
      <Box
        position="fixed"
        inset={0}
        zIndex={400}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />
      {/*
        Outer positioning wrapper.
        - width is responsive (100% up to a max, with side padding so it never
          touches the screen edges on small viewports)
        - height is capped to the viewport (minus a top/bottom margin) so the
          modal never overflows the screen; the inner card handles its own
          internal scrolling.
      */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        zIndex={500}
        style={{
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "560px",
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
          {/* Header (fixed, does not scroll) */}
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
                    {intern.name}
                  </Text>
                  <Text fontSize="13px" color="gray.500" mt={0.5}>
                    NPK {intern.npk}
                  </Text>
                </Box>
              </HStack>
              <HStack gap={2} flexShrink={0}>
                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    fontSize: "14px",
                    fontWeight: "600",
                    borderRadius: "8px",
                    color: "#ffffff",
                    backgroundColor: isHovered ? "#169696" : "#008080",
                    border: "1px solid #008080",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <FiPrinter size={14} />
                </button>
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
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#eef2f7";
                    e.currentTarget.style.transform = "scale(1.08)";
                    e.currentTarget.style.color = "#334155";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  <FiX size={15} />
                </button>
              </HStack>
            </Flex>

            {isWarning && (
              <Box px={{ base: 4, md: 6 }} pb={2}>
                <Box
                  bg="#fff1f2"
                  border="1px solid #fecdd3"
                  borderRadius="8px"
                  px={3}
                  py={2}
                >
                  <Text fontSize="13px" fontWeight="600" color="#be123c">
                    ⚠ Need Evaluation — internship ends in{" "}
                    {intern.days_until_expiry} day
                    {intern.days_until_expiry === 1 ? "" : "s"}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>

          {/* Body (the only part that scrolls) */}
          <Box flex="1" overflowY="auto" px={{ base: 4, md: 6 }} py={5}>
            <Grid
              templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
              gap={4}
              mb={4}
            >
              <DetailRow
                label="Gender"
                value={
                  intern.gender === "male"
                    ? "Male"
                    : intern.gender === "female"
                      ? "Female"
                      : "-"
                }
              />
              <DetailRow label="Position" value={intern.jabatan} />
              <DetailRow label="Department" value={intern.department?.name} />
              <DetailRow label="Section" value={intern.section?.name} />
              <DetailRow label="Role Level" value={intern.role_level} />
              <DetailRow label="Area" value={intern.area?.name} />
              <DetailRow label="Line" value={intern.line?.name} />
              <DetailRow label="Station" value={intern.station?.name} />
              <DetailRow
                label="Group"
                value={intern.group ? `Group ${intern.group}` : "-"}
              />
            </Grid>

            <Box h="1px" bg="gray.100" my={4} />

            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
              <DetailRow
                label="Join Date"
                value={formatDate(intern.join_date)}
              />
              <DetailRow
                label="Start Internship"
                value={formatDate(intern.start_contract)}
              />
              <DetailRow
                label="End Internship"
                value={
                  <Text
                    color={isWarning ? "red.600" : "gray.800"}
                    fontWeight={isWarning ? 700 : 400}
                  >
                    {formatDate(intern.end_contract)}
                  </Text>
                }
              />
              <DetailRow
                label="Total Working Period"
                value={getContractDuration(
                  intern.start_contract,
                  intern.end_contract,
                )}
              />
            </Grid>

            <Box h="1px" bg="gray.100" my={4} />

            <Text
              fontSize="11px"
              fontWeight={700}
              color="gray.400"
              mb={3}
              textTransform="uppercase"
              letterSpacing="0.05em"
            >
              Competency by Station
            </Text>

            {loadingSummary ? (
              <Text fontSize="13px" color="gray.400">
                Loading...
              </Text>
            ) : stationSummary.length === 0 ? (
              <Text fontSize="13px" color="gray.400">
                No approved assessment yet.
              </Text>
            ) : (
              <Flex gap={4} wrap="wrap">
                {stationSummary.map((s) => (
                  <CompetencyDonutBadge
                    key={s.station_id}
                    score={s.final_score}
                    stationName={s.station_name}
                    periodLabel={s.period_label}
                  />
                ))}
              </Flex>
            )}
          </Box>

          {/* Footer (fixed, does not scroll) */}
          <Flex
            px={{ base: 4, md: 6 }}
            py={4}
            justify="space-between"
            align="center"
            flexShrink={0}
            borderTop="1px solid"
            borderColor="gray.100"
            wrap="wrap"
            gap={3}
          >
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "8px",
                color: "#1A5EA8",
                backgroundColor: "#ffffff",
                border: "1px solid #1A5EA8",
                cursor: "pointer",
              }}
            >
              <FiClock size={14} /> Assessment History
            </button>
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

          <AssessmentHistoryModal
            isOpen={historyOpen}
            subject={assessmentSubject}
            onClose={() => setHistoryOpen(false)}
          />
        </Box>
      </Box>
    </>
  );
};

export default InternDetailModal;
