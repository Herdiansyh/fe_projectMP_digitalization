import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Badge, Flex, HStack } from "@chakra-ui/react";
import { FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import fptkService from "../../services/fptkService";
import { useAuth } from "../../contexts/AuthContext";
import { toaster } from "../../components/ui/toaster";
import type { Requisition } from "../../types/fptk";

const FptkPending: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const fetchPendingApprovals = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);

      const response = await fptkService.getPendingApprovals({
        page: pageNum,
        per_page: 15,
      });

      setRequisitions(response.data.data);

      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
          ? (error.response.data as { message?: string }).message ||
            "Failed to fetch pending approvals"
          : "Failed to fetch pending approvals";

      toaster.create({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    void fetchPendingApprovals(page);
  }, [page, fetchPendingApprovals]);

  const getStatusColor = (status: string) => {
    if (status.includes("Approved")) return "green";
    if (status.includes("Rejected")) return "red";
    if (status.includes("Menunggu")) return "orange";
    return "gray";
  };

  const getApprovalStage = (status: string) => {
    if (status.includes("Manager")) return "Manager";
    if (status.includes("Division Head")) return "Division Head";
    if (status.includes("Director")) return "Director";
    return "Unknown";
  };

  const canViewPending =
    user?.role?.name === "Manager" ||
    user?.role?.name === "Division Head" ||
    user?.role?.name === "Director";

  if (!canViewPending) {
    return (
      <MainLayout>
        <Box p={6}>
          <Text fontSize="xl" fontWeight="bold" color="gray.600">
            You don't have permission to view pending approvals.
          </Text>
        </Box>
      </MainLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <MainLayout>
      <Box>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Pending Approvals
            </Text>
            <Text fontSize="13px" color="gray.500" mt={1}>
              Showing requisitions awaiting your approval as {user?.role?.name}
            </Text>
          </Box>
        </Flex>

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          {/* Table */}
          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500" fontSize="14px">
                Loading...
              </Text>
            </Flex>
          ) : requisitions.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                No pending approvals
              </Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    {[
                      "No",
                      "No Requisition",
                      "Request Date",
                      "Requester",
                      "Position",
                      "Approval Stage",
                      "Status",
                      "Actions",
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
                  {requisitions.map((req, index) => (
                    <tr
                      key={req.no_req}
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
                        {(pagination.current_page - 1) * pagination.per_page +
                          index +
                          1}
                      </td>

                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#1e293b",
                          fontWeight: "500",
                        }}
                      >
                        {req.no_req}
                      </td>

                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {formatDate(req.request_date)}
                      </td>

                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#1e293b",
                        }}
                      >
                        {req.requester_name}
                      </td>

                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {req.position || "-"}
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <Badge colorPalette="blue">
                          {getApprovalStage(req.approval_status)}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <Badge
                          colorPalette={getStatusColor(req.approval_status)}
                        >
                          {req.approval_status}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <HStack gap={1}>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/fptk/${req.no_req}/review`)
                            }
                            style={{
                              width: "30px",
                              height: "30px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "6px",
                              color: "#3b82f6",
                              backgroundColor: "#eff6ff",
                              border: "1px solid #bfdbfe",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#dbeafe")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#eff6ff")
                            }
                            title="Review"
                          >
                            <FiEye size={14} />
                          </button>
                        </HStack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}

          {/* Pagination */}
          <Flex
            justify="space-between"
            align="center"
            mt={5}
            pt={4}
            borderTop="1px solid"
            borderColor="gray.100"
          >
            <Text fontSize="12px" color="gray.500">
              Showing {requisitions.length} of {pagination.total} entries
            </Text>

            <HStack gap={2}>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                style={{
                  padding: "6px 14px",
                  fontSize: "13px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: page === 1 ? "#f8fafc" : "#ffffff",
                  color: page === 1 ? "#94a3b8" : "#475569",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>

              <Text fontSize="13px" color="gray.600" px={2}>
                Page {pagination.current_page} of {pagination.last_page}
              </Text>

              <button
                type="button"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((prev) => prev + 1)}
                style={{
                  padding: "6px 14px",
                  fontSize: "13px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  backgroundColor:
                    page >= pagination.last_page ? "#f8fafc" : "#ffffff",
                  color: page >= pagination.last_page ? "#94a3b8" : "#475569",
                  cursor:
                    page >= pagination.last_page ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default FptkPending;
