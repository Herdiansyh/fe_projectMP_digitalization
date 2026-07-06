import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiSearch, FiPrinter, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import fptkService from "../../services/fptkService";
import type { Requisition, RequisitionListParams } from "../../types/fptk";

// ── Komponen utama ────────────────────────────────────────────────────────────
const FptkRejectedList: React.FC = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [filters] = useState<RequisitionListParams>({
    status: "Rejected",
  });
  const [searchInput, setSearchInput] = useState("");

  const fetchRequisitions = useCallback(
    async (params: RequisitionListParams) => {
      try {
        setLoading(true);
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(
            ([, v]) => v !== "" && v !== undefined && v !== null,
          ),
        ) as RequisitionListParams;
        const response = await fptkService.getRequisitions(cleanParams);
        setRequisitions(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
      } catch {
        alert("Failed to fetch requisitions");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setClientSearch(searchInput.toLowerCase());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    void fetchRequisitions({ page, per_page: 10, ...filters });
  }, [page, filters, fetchRequisitions]);

  const displayedRequisitions = clientSearch
    ? requisitions.filter(
        (r) =>
          r.requester_name.toLowerCase().includes(clientSearch) ||
          (r.no_req ?? "").toLowerCase().includes(clientSearch) ||
          (r.position ?? "").toLowerCase().includes(clientSearch) ||
          (r.department ?? "").toLowerCase().includes(clientSearch),
      )
    : requisitions;

  const handlePrint = (noReq: string) => {
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    const printUrl =
      API_BASE_URL.replace(/\/api\/?$/, "") + `/print/fptk/${noReq}`;
    window.open(printUrl, "_blank");
  };

  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    if (status === "Rejected")
      return {
        backgroundColor: "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
        borderRadius: "6px",
        padding: "2px 8px",
        fontSize: "12px",
        fontWeight: 500,
      };
    return {
      backgroundColor: "#f8fafc",
      color: "#64748b",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      padding: "2px 8px",
      fontSize: "12px",
      fontWeight: 500,
    };
  };

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
              Rejected FPTK
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              List of rejected FPTK
            </Text>
          </Box>
        </Flex>

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          {/* Filter bar */}
          <HStack mb={5} gap={3}>
            <Box position="relative" maxW="300px" w="full">
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
                placeholder="Search no. req / requester / position..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
          ) : displayedRequisitions.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                No FPTK with Rejected status
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
                      "Department",
                      "Status",
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
                  {displayedRequisitions.map((req, index) => (
                    <tr
                      key={req.no_req}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/fptk/${req.no_req}`)}
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
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {req.department || "-"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={getStatusBadgeStyle(req.approval_status)}>
                          {req.approval_status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <HStack gap={1}>
                          {/* Tombol Detail */}
                          <button
                            type="button"
                            title="Detail"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/fptk/${req.no_req}`);
                            }}
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
                          >
                            <FiEye size={14} />
                          </button>

                          {/* Tombol Print */}
                          <button
                            type="button"
                            title="Print"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrint(req.no_req);
                            }}
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
                          >
                            <FiPrinter size={14} />
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
              Showing {requisitions.length} of {pagination.total} FPTK
            </Text>
            <HStack gap={2}>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
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
                onClick={() => setPage((p) => p + 1)}
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

export default FptkRejectedList;
