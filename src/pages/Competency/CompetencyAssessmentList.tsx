import React, { useState, useMemo } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiClock as FiPending,
} from "react-icons/fi";
import type { AssessableSubject } from "../../types/competency";
import MainLayout from "../../components/layout/MainLayout";
import AssessmentPanel from "./AssessmentPanel";
import AssessmentHistoryModal from "./AssessmentHistoryModal";
import { useAssessableEmployees } from "../../hooks/queries/useCompetencyQueries";
import { useStations } from "../../hooks/queries/useStationQueries";
import { useLines } from "../../hooks/queries/useLineQueries";
import { useAreas } from "../../hooks/queries/useAreaQueries";

const selectStyle: React.CSSProperties = {
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

// ── Badge status assessment ──
const StatusBadge: React.FC<{ status: "pending_qa" | "approved" }> = ({
  status,
}) => {
  const isApproved = status === "approved";
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="5px"
      px="8px"
      py="3px"
      borderRadius="6px"
      fontSize="11px"
      fontWeight="600"
      bg={isApproved ? "#ecfdf5" : "#fffbeb"}
      color={isApproved ? "#15803d" : "#b45309"}
      border={`1px solid ${isApproved ? "#bbf7d0" : "#fde68a"}`}
    >
      {isApproved ? "Approved" : "Pending QA"}
    </Box>
  );
};

const CompetencyAssessmentList: React.FC = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedLineId, setSelectedLineId] = useState<string>("");
  const [selectedStationId, setSelectedStationId] = useState<string>("");
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>("");

  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    subject: AssessableSubject | null;
  }>({ isOpen: false, subject: null });

  // ── React Query: menggantikan Promise.all manual di useEffect ──
  const {
    data: subjectsRes,
    isLoading: isLoadingSubjects,
    isError: isErrorSubjects,
    error: subjectsError,
    refetch: refetchSubjects,
  } = useAssessableEmployees();

  const { data: stationsRes, isError: isErrorStations } = useStations();
  const { data: linesRes, isError: isErrorLines } = useLines();
  const { data: areasRes, isError: isErrorAreas } = useAreas();

  const subjects = subjectsRes?.data ?? [];
  const stations = stationsRes?.data ?? [];
  const lines = linesRes?.data ?? [];
  const areas = areasRes?.data ?? [];

  const loading = isLoadingSubjects;

  const errorMsg = useMemo(() => {
    if (isErrorSubjects) {
      const e = subjectsError as unknown as {
        response?: { data?: { message?: string } };
      };
      return (
        e?.response?.data?.message ?? "Failed to load assessable employees."
      );
    }
    if (isErrorStations || isErrorLines || isErrorAreas) {
      return "Failed to load initial data.";
    }
    return null;
  }, [
    isErrorSubjects,
    subjectsError,
    isErrorStations,
    isErrorLines,
    isErrorAreas,
  ]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // Line difilter berdasarkan Area terpilih
  const filteredLines = useMemo(() => {
    if (!selectedAreaId) return [];
    return lines.filter((l) => Number(l.area_id) === Number(selectedAreaId));
  }, [lines, selectedAreaId]);

  // Station difilter berdasarkan Line terpilih
  const filteredStations = useMemo(() => {
    if (!selectedLineId) return [];
    return stations.filter((s) => Number(s.line_id) === Number(selectedLineId));
  }, [stations, selectedLineId]);

  const subjectsInStation = useMemo(() => {
    if (!selectedStationId) return [];
    return subjects.filter(
      (s) => String(s.station?.id ?? "") === selectedStationId,
    );
  }, [subjects, selectedStationId]);

  const selectedSubject = useMemo(() => {
    if (!selectedSubjectKey) return null;
    return (
      subjectsInStation.find(
        (s) => `${s.subject_type}-${s.id}` === selectedSubjectKey,
      ) ?? null
    );
  }, [subjectsInStation, selectedSubjectKey]);

  const handleAreaChange = (val: string) => {
    setSelectedAreaId(val);
    setSelectedLineId("");
    setSelectedStationId("");
    setSelectedSubjectKey("");
  };

  const handleLineChange = (val: string) => {
    setSelectedLineId(val);
    setSelectedStationId("");
    setSelectedSubjectKey("");
  };

  const handleStationChange = (val: string) => {
    setSelectedStationId(val);
    setSelectedSubjectKey("");
  };

  const assessedSubjects = useMemo(
    () => subjects.filter((s) => s.latest_assessment),
    [subjects],
  );

  return (
    <MainLayout>
      <Box>
        {successMsg && (
          <Box
            position="fixed"
            top={4}
            right={4}
            zIndex={300}
            bg="green.500"
            color="white"
            px={5}
            py={3}
            borderRadius="8px"
            shadow="lg"
            fontSize="14px"
            fontWeight="500"
          >
            {successMsg}
          </Box>
        )}

        <AssessmentHistoryModal
          key={
            historyModal.subject
              ? `${historyModal.subject.subject_type}-${historyModal.subject.id}`
              : "none"
          }
          isOpen={historyModal.isOpen}
          subject={historyModal.subject}
          onClose={() => setHistoryModal({ isOpen: false, subject: null })}
        />

        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Competency Assessment
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              Manpower competency levels in your region
            </Text>
          </Box>
        </Flex>

        {errorMsg && (
          <Box
            mb={4}
            p={3}
            bg="#fff1f2"
            border="1px solid #fecdd3"
            borderRadius="8px"
          >
            <Text fontSize="13px" color="#be123c">
              {errorMsg}
            </Text>
          </Box>
        )}

        {/* ─────────────── SECTION 1: Buat Penilaian Baru ─────────────── */}
        <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
          <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
            Create New Assessment
          </Text>
          <Text fontSize="12px" color="gray.500" mb={4} mt={-2}>
            Your scores will be submitted for QA review before becoming final.
          </Text>

          <HStack
            gap={4}
            align="flex-start"
            mb={selectedSubject ? 5 : 0}
            wrap="wrap"
          >
            <Box flex={1} minW="200px" maxW="240px">
              <label style={labelStyle}>Area</label>
              <select
                style={selectStyle}
                value={selectedAreaId}
                onChange={(e) => handleAreaChange(e.target.value)}
              >
                <option value="">-- Choose Area --</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Box>

            <Box flex={1} minW="200px" maxW="240px">
              <label style={labelStyle}>Line</label>
              <select
                style={selectStyle}
                value={selectedLineId}
                disabled={!selectedAreaId}
                onChange={(e) => handleLineChange(e.target.value)}
              >
                <option value="">
                  {!selectedAreaId
                    ? "Choose area first"
                    : filteredLines.length === 0
                      ? "No lines in this area"
                      : "-- Choose Line --"}
                </option>
                {filteredLines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Box>

            <Box flex={1} minW="200px" maxW="240px">
              <label style={labelStyle}>Station</label>
              <select
                style={selectStyle}
                value={selectedStationId}
                disabled={!selectedLineId}
                onChange={(e) => handleStationChange(e.target.value)}
              >
                <option value="">
                  {!selectedLineId
                    ? "Choose line first"
                    : filteredStations.length === 0
                      ? "No stations in this line"
                      : "-- Choose Station --"}
                </option>
                {filteredStations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </Box>

            <Box flex={1} minW="220px" maxW="320px">
              <label style={labelStyle}>Manpower</label>
              <select
                style={selectStyle}
                value={selectedSubjectKey}
                disabled={!selectedStationId}
                onChange={(e) => setSelectedSubjectKey(e.target.value)}
              >
                <option value="">
                  {selectedStationId
                    ? "-- Choose Manpower --"
                    : "Choose station first"}
                </option>
                {subjectsInStation.map((s) => (
                  <option
                    key={`${s.subject_type}-${s.id}`}
                    value={`${s.subject_type}-${s.id}`}
                  >
                    {s.name} ({s.npk})
                  </option>
                ))}
              </select>
            </Box>
          </HStack>

          {selectedSubject && (
            <AssessmentPanel
              key={`${selectedSubject.subject_type}-${selectedSubject.id}`}
              subject={selectedSubject}
              onCancel={() => setSelectedSubjectKey("")}
              onSuccess={(msg) => {
                setSelectedSubjectKey("");
                setSelectedStationId("");
                setSelectedLineId("");
                setSelectedAreaId("");
                showSuccess(msg);
                void refetchSubjects();
              }}
            />
          )}
        </Box>

        {/* ─────────────── SECTION 2: Riwayat Penilaian ─────────────── */}
        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
            Manpower Already Assessed
          </Text>

          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500" fontSize="14px">
                Loading...
              </Text>
            </Flex>
          ) : assessedSubjects.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                No manpower has been assessed yet
              </Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    {[
                      "No",
                      "NPK",
                      "Name",
                      "Station",
                      "Status",
                      "Latest Score",
                      "Last Assessed",
                      "History",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: "1px solid #e2e8f0",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assessedSubjects.map((s, index) => {
                    const isApproved =
                      s.latest_assessment?.status === "approved";
                    return (
                      <tr
                        key={`${s.subject_type}-${s.id}`}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8fafc")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          {index + 1}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#1e293b",
                            fontWeight: 500,
                          }}
                        >
                          {s.npk}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#1e293b",
                          }}
                        >
                          {s.name}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {s.station?.name || "-"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {s.latest_assessment && (
                            <StatusBadge status={s.latest_assessment.status} />
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {s.latest_assessment &&
                            (isApproved ? (
                              <HStack gap={1}>
                                <Text
                                  fontSize="14px"
                                  fontWeight="700"
                                  color="#1A5EA8"
                                >
                                  {s.latest_assessment.final_score.toFixed(2)}
                                </Text>
                                {s.latest_assessment.final_score >= 3 ? (
                                  <FiTrendingUp size={13} color="#15803d" />
                                ) : (
                                  <FiTrendingDown size={13} color="#c2410c" />
                                )}
                              </HStack>
                            ) : (
                              <HStack gap={1}>
                                <FiPending size={12} color="#b45309" />
                                <Text fontSize="12px" color="#b45309">
                                  Waiting QA
                                </Text>
                              </HStack>
                            ))}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {s.latest_assessment
                            ? `${formatDate(s.latest_assessment.assessed_at)} (${s.latest_assessment.period_label})`
                            : "-"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            type="button"
                            onClick={() =>
                              setHistoryModal({ isOpen: true, subject: s })
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 14px",
                              fontSize: "13px",
                              fontWeight: 600,
                              borderRadius: "8px",
                              color: "#1A5EA8",
                              backgroundColor: "#eaf1f9",
                              border: "1px solid #cfe0f2",
                              cursor: "pointer",
                            }}
                          >
                            <FiClock size={13} /> History
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default CompetencyAssessmentList;
