import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Badge, Flex, HStack } from "@chakra-ui/react";
import { FiEye, FiSearch, FiPrinter } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import fptkService from "../../services/fptkService";
import type { Requisition } from "../../types/fptk";

const FptkHistoryList: React.FC = () => {
  const navigate = useNavigate();
  const [allRequisitions, setAllRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHistory = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await fptkService.getApproverActionHistory({
        page: pageNum,
        per_page: 50,
      });
      setAllRequisitions(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch {
      alert("Failed to fetch FPTK history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHistory(page);
  }, [page, fetchHistory]);

  // Client-side filter by search query
  const filtered = searchQuery
    ? allRequisitions.filter(
        (r) =>
          r.requester_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.no_req.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allRequisitions;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    if (status === "Approved") return "green";
    if (status.includes("Rejected")) return "red";
    return "orange";
  };

  const handlePrint = (noReq: string) => {
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    const printUrl =
      API_BASE_URL.replace(/\/api\/?$/, "") + `/print/fptk/${noReq}`;
    window.open(printUrl, "_blank");
  };

  return (
    <MainLayout>
      <Box>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              FPTK History
            </Text>
            <Text fontSize="13px" color="gray.500" mt={1}>
              FPTK yang sudah Anda berikan aksi (approve/reject) — terlepas
              dari status keseluruhan FPTK saat ini
            </Text>
          </Box>
        </Flex>

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          {/* Search bar */}
          <HStack mb={5} gap={3}>
            <Box position="relative" maxW="340px" w="full">
              <Box
                position="absolute"
                left="10px"
                top="50%"
                transform="translateY(-50%)"
                color="gray.400"
                pointerEvents="none"
                zIndex={1}
              >
                <FiSearch size={14} />
              </Box>
              <input
                placeholder="Cari nama requester atau no. requisition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "32px",
                  paddingRight: "12px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  fontSize: "14px",
                  color: "#1a202c",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </Box>
          </HStack>

          {/* Table */}
          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500" fontSize="14px">
                Loading...
              </Text>
            </Flex>
          ) : filtered.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                Tidak ada data history
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
                      "Status Sekarang",
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
                  {filtered.map((req, index) => (
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
                            onClick={() => navigate(`/fptk/${req.no_req}`)}
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
                            title="Detail"
                          >
                            <FiEye size={14} />
                          </button>

                          {req.approval_status === "Approved" && (
                            <button
                              type="button"
                              onClick={() => handlePrint(req.no_req)}
                              style={{
                                width: "30px",
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#10b981",
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#d1fae5")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#ecfdf5")
                              }
                              title="Print"
                            >
                              <FiPrinter size={14} />
                            </button>
                          )}
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
              Showing {filtered.length} of {pagination.total} entries
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

export default FptkHistoryList;
