import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiClock as FiPending,
} from "react-icons/fi";
import competencyService from "../../services/competencyService";
import type { AssessableSubject } from "../../types/competency";
import MainLayout from "../../components/layout/MainLayout";
import AssessmentPanel from "./AssessmentPanel";
import AssessmentHistoryModal from "./AssessmentHistoryModal";
import stationService from "../../services/stationService";
import type { Station } from "../../types/station";

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
const StatusBadge: React.FC<{ status: "pending_qc" | "approved" }> = ({
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
      {isApproved ? "Approved" : "Pending QC"}
    </Box>
  );
};

const CompetencyAssessmentList: React.FC = () => {
  const [subjects, setSubjects] = useState<AssessableSubject[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true); // ← initial true, bukan di-set di effect
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [selectedStationId, setSelectedStationId] = useState<string>("");
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>("");

  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    subject: AssessableSubject | null;
  }>({ isOpen: false, subject: null });

  // ── Dipakai untuk REFETCH manual (dipanggil dari event handler, mis. onSuccess) ──
  // Aman punya setState sinkron di depan karena ini bukan dipanggil dari body effect.
  const refetchSubjects = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await competencyService.getAssessableEmployees();
      setSubjects(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setErrorMsg(
        e.response?.data?.message ?? "Failed to load assessable employees.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Effect ini MURNI untuk fetch awal saat mount — tidak ada setState ──
  // sinkron sebelum await; setState hanya dipanggil setelah promise selesai.
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      competencyService.getAssessableEmployees(),
      stationService.getStations(),
    ])
      .then(([subjectsRes, stationsRes]) => {
        if (cancelled) return;
        setSubjects(subjectsRes.data);
        setStations(stationsRes.data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        setErrorMsg(
          e.response?.data?.message ?? "Failed to load initial data.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
            Your scores will be submitted for QC review before becoming final.
          </Text>

          <HStack gap={4} align="flex-start" mb={selectedSubject ? 5 : 0}>
            <Box flex={1} maxW="280px">
              <label style={labelStyle}>Station</label>
              <select
                style={selectStyle}
                value={selectedStationId}
                onChange={(e) => handleStationChange(e.target.value)}
              >
                <option value="">-- Choose Station --</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </Box>

            <Box flex={1} maxW="320px">
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
                                  Waiting QC
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
