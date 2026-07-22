import React, { useEffect, useState } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiClock as FiPending,
  FiEye,
} from "react-icons/fi";
import competencyService from "../../services/competencyService";
import type { MySubmissionItem } from "../../types/competency";
import MainLayout from "../../components/layout/MainLayout";
import SubmissionDetailModal from "./SubmissionDetailModal";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const StatusBadge: React.FC<{ status: "pending_qa" | "approved" }> = ({
  status,
}) => {
  const isApproved = status === "approved";
  return (
    <Box
      display="inline-flex"
      alignItems="center"
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

const MySubmissionsList: React.FC = () => {
  const [submissions, setSubmissions] = useState<MySubmissionItem[]>([]);
  const [loading, setLoading] = useState(true); // ← initial true
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  // ── Effect murni untuk fetch awal saat mount ──
  useEffect(() => {
    let cancelled = false;

    competencyService
      .getMySubmissions()
      .then((res) => {
        if (!cancelled) setSubmissions(res.data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        setErrorMsg(
          e.response?.data?.message ?? "Failed to load your submissions.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const pendingCount = submissions.filter(
    (s) => s.status === "pending_qa",
  ).length;

  return (
    <MainLayout>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              My Submissions
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              Assessments you have submitted and their QA review status
            </Text>
          </Box>
          {pendingCount > 0 && (
            <Box
              px={3}
              py={2}
              bg="#fffbeb"
              border="1px solid #fde68a"
              borderRadius="8px"
            >
              <Text fontSize="12px" color="#b45309" fontWeight="600">
                {pendingCount} waiting for QA review
              </Text>
            </Box>
          )}
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

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500" fontSize="14px">
                Loading...
              </Text>
            </Flex>
          ) : submissions.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                You haven't submitted any assessments yet.
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
                      "Period",
                      "Status",
                      "Score",
                      "Submitted At",
                      "Reviewed By",
                      "Detail",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: 600,
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
                  {submissions.map((s, index) => {
                    const isApproved = s.status === "approved";
                    return (
                      <tr
                        key={s.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
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
                          {s.subject.npk}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#1e293b",
                          }}
                        >
                          {s.subject.name}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {s.subject.station?.name || "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {s.period_label}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <StatusBadge status={s.status} />
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {isApproved ? (
                            <HStack gap={1}>
                              <Text
                                fontSize="14px"
                                fontWeight="700"
                                color="#1A5EA8"
                              >
                                {s.final_score.toFixed(2)}
                              </Text>
                              {s.final_score >= 3 ? (
                                <FiTrendingUp size={13} color="#15803d" />
                              ) : (
                                <FiTrendingDown size={13} color="#c2410c" />
                              )}
                            </HStack>
                          ) : (
                            <HStack gap={1}>
                              <FiPending size={12} color="#b45309" />
                              <Text fontSize="12px" color="#b45309">
                                Waiting
                              </Text>
                            </HStack>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {formatDate(s.assessed_at)}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {s.qa_reviewer?.name ?? "-"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            type="button"
                            onClick={() => setDetailId(s.id)}
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
                            <FiEye size={13} /> Detail
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
        <SubmissionDetailModal
          key={detailId ?? "none"}
          isOpen={detailId !== null}
          assessmentId={detailId}
          onClose={() => setDetailId(null)}
        />
      </Box>
    </MainLayout>
  );
};

export default MySubmissionsList;
