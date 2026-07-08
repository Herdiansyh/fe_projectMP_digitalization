import React, { useState, useEffect } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiClipboard, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import competencyService from "../../services/competencyService";
import type { AssessableSubject } from "../../types/competency";
import MainLayout from "../../components/layout/MainLayout";
import AssessmentFormModal from "./AssessmentFormModal";

const CompetencyAssessmentList: React.FC = () => {
  const [subjects, setSubjects] = useState<AssessableSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    subject: AssessableSubject | null;
  }>({ isOpen: false, subject: null });

  const fetchSubjects = async () => {
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

  useEffect(() => {
    void fetchSubjects();
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

  return (
    <MainLayout>
      <Box>
        {/* Assessment form modal */}
        <AssessmentFormModal
          isOpen={formModal.isOpen}
          subject={formModal.subject}
          onClose={() => setFormModal({ isOpen: false, subject: null })}
          onSuccess={(msg) => {
            setFormModal({ isOpen: false, subject: null });
            showSuccess(msg);
            void fetchSubjects();
          }}
        />

        {/* Success toast */}
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

        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Competency Assessment
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              Nilai kompetensi manpower di area Anda
            </Text>
          </Box>
        </Flex>

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
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

          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500" fontSize="14px">
                Loading...
              </Text>
            </Flex>
          ) : subjects.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                No manpower found in your area
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
                      "Latest Score",
                      "Last Assessed",
                      "Action",
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
                  {subjects.map((s, index) => (
                    <tr
                      key={`${s.subject_type}-${s.id}`}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
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
                          fontWeight: "500",
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
                        {s.latest_assessment ? (
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
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#94a3b8",
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              padding: "2px 8px",
                            }}
                          >
                            Not assessed yet
                          </span>
                        )}
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
                            setFormModal({ isOpen: true, subject: s })
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            fontSize: "13px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            color: "#ffffff",
                            backgroundColor: "#1A5EA8",
                            border: "1px solid #1A5EA8",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#164e8a")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#1A5EA8")
                          }
                        >
                          <FiClipboard size={13} /> Assess
                        </button>
                      </td>
                    </tr>
                  ))}
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
