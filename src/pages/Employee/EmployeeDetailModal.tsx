import React, { useEffect, useState } from "react";
import { Box, Text, Flex, HStack, Grid } from "@chakra-ui/react";
import { FiClock, FiPrinter, FiUser, FiX } from "react-icons/fi";
import type { Employee } from "../../types/employee";
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
const Badge = ({
  children,
  color,
  bg,
  border,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      color,
      backgroundColor: bg,
      border: `1px solid ${border}`,
    }}
  >
    {children}
  </span>
);

const employmentTypeBadge = (type: string) => {
  const map: Record<
    string,
    { color: string; bg: string; border: string; label: string }
  > = {
    permanent: {
      color: "#15803d",
      bg: "#f0fdf4",
      border: "#bbf7d0",
      label: "Permanent",
    },
    contract: {
      color: "#92400e",
      bg: "#fffbeb",
      border: "#fde68a",
      label: "Contract",
    },
    apprentice: {
      color: "#1d4ed8",
      bg: "#eff6ff",
      border: "#bfdbfe",
      label: "Apprentice",
    },
  };
  const s = map[type] ?? {
    color: "#64748b",
    bg: "#f8fafc",
    border: "#e2e8f0",
    label: type,
  };
  return <Badge {...s}>{s.label}</Badge>;
};

// Status logic removed

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

const EmployeeDetailModal = ({
  isOpen,
  employee,
  onClose,
}: {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
}) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [stationSummary, setStationSummary] = useState<
    StationCompetencySummary[]
  >([]);

  const [isHovered, setIsHovered] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  useEffect(() => {
    if (isOpen && employee) {
      setLoadingSummary(true);
      competencyService
        .getStationSummary("employee", employee.id)
        .then((res) => setStationSummary(res.data))
        .catch(() => setStationSummary([]))
        .finally(() => setLoadingSummary(false));
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;
  const handlePrint = () => {
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    const printUrl =
      API_BASE_URL.replace(/\/api\/?$/, "") +
      `/print/manpower/employee/${employee.id}`;
    //           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ini yang menghapus "/api" di akhir
    window.open(printUrl, "_blank");
  };
  const isWarning = !!employee.is_near_expiry;

  // Bentuk subject minimal yang dibutuhkan AssessmentHistoryModal
  const assessmentSubject: AssessableSubject = {
    id: employee.id,
    npk: employee.npk,
    name: employee.name,
    subject_type: "employee",
    station_id: employee.station?.id ?? 0,
    station: employee.station || undefined,
    latest_assessment: null, // tidak dipakai oleh history modal
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
                    {employee.name}
                  </Text>
                  <Text fontSize="13px" color="gray.500" mt={0.5}>
                    NPK {employee.npk}
                  </Text>
                  <HStack gap={2} mt={2}>
                    {employmentTypeBadge(employee.employment_type)}
                  </HStack>
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
                    ⚠ Need Evaluation — contract ends in{" "}
                    {employee.days_until_expiry} day
                    {employee.days_until_expiry === 1 ? "" : "s"}
                  </Text>
                </Box>
              </Box>
            )}
            {employee.replaced_by &&
              employee.replaced_by.employees.length > 0 && (
                <Box px={{ base: 4, md: 6 }} pb={4}>
                  <Box
                    bg="blue.50"
                    border="1px solid #bfdbfe"
                    borderRadius="8px"
                    px={3}
                    py={2}
                  >
                    <Text
                      fontSize="12px"
                      fontWeight="700"
                      color="#1d4ed8"
                      mb={1}
                    >
                      Sudah Digantikan (FPTK {employee.replaced_by.no_req})
                    </Text>
                    {employee.replaced_by.employees.map((newEmp) => (
                      <Text key={newEmp.id} fontSize="13px" color="gray.700">
                        {newEmp.name}{" "}
                        <Text as="span" color="gray.500">
                          (NPK {newEmp.npk}) — mulai{" "}
                          {formatDate(newEmp.start_contract)}
                        </Text>
                      </Text>
                    ))}
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
                  employee.gender === "male"
                    ? "Male"
                    : employee.gender === "female"
                      ? "Female"
                      : "-"
                }
              />
              <DetailRow label="Position" value={employee.jabatan} />
              <DetailRow label="Department" value={employee.department?.name} />
              <DetailRow label="Section" value={employee.section?.name} />
              <DetailRow label="Role Level" value={employee.role_level} />
              <DetailRow label="Area" value={employee.area?.name} />
              <DetailRow label="Line" value={employee.line?.name} />
              <DetailRow label="Station" value={employee.station?.name} />
              <DetailRow
                label="Group"
                value={employee.group ? `Group ${employee.group}` : "-"}
              />
            </Grid>

            <Box h="1px" bg="gray.100" my={4} />

            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
              <DetailRow
                label="Join Date"
                value={formatDate(employee.join_date)}
              />
              <DetailRow
                label="Start Contract"
                value={formatDate(employee.start_contract)}
              />
              <DetailRow
                label="End Contract"
                value={
                  employee.end_contract ? (
                    <Text
                      color={isWarning ? "red.600" : "gray.800"}
                      fontWeight={isWarning ? 700 : 400}
                    >
                      {formatDate(employee.end_contract)}
                    </Text>
                  ) : (
                    "-"
                  )
                }
              />
              <DetailRow
                label="Contract Duration"
                value={getContractDuration(
                  employee.start_contract,
                  employee.end_contract,
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

export default EmployeeDetailModal;
