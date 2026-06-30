import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiSearch, FiPrinter, FiPlay, FiAlertTriangle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import fptkService from "../../services/fptkService";
import type { Requisition, RequisitionListParams } from "../../types/fptk";
import { useAuth } from "../../contexts/AuthContext";

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({
  isOpen,
  noReq,
  isLoading,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  noReq: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <>
      <Box
        position="fixed"
        inset={0}
        zIndex={400}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={!isLoading ? onCancel : undefined}
      />
      <Box
        position="fixed"
        top="50%"
        left="50%"
        zIndex={500}
        style={{
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "440px",
          padding: "0 16px",
        }}
      >
        <Box
          bg="white"
          borderRadius="12px"
          shadow="xl"
          borderWidth="1px"
          borderColor="gray.100"
          overflow="hidden"
        >
          <Box px={6} pt={6} pb={4}>
            <HStack gap={3} align="flex-start">
              <Box
                w="40px"
                h="40px"
                borderRadius="10px"
                bg="#eff6ff"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <FiAlertTriangle size={20} color="#1d4ed8" />
              </Box>
              <Box>
                <Text fontSize="16px" fontWeight="700" color="gray.800" mb={1}>
                  HRD Process Confirmation
                </Text>
                <Text fontSize="13px" color="gray.500" lineHeight="1.5">
                  You are about to process FPTK{" "}
                  <Text as="span" fontWeight="700" color="blue.700">
                    {noReq}
                  </Text>{" "}
                  to start HRD screening. This action cannot be undone.
                </Text>
              </Box>
            </HStack>
          </Box>
          <Box h="1px" bg="gray.100" />
          <Flex px={6} py={4} justify="flex-end" gap={3}>
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                borderRadius: "8px",
                color: "#4a5568",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "8px",
                color: isLoading ? "#94a3b8" : "#ffffff",
                backgroundColor: isLoading ? "#f1f5f9" : "#1d4ed8",
                border: `1px solid ${isLoading ? "#e2e8f0" : "#1d4ed8"}`,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              <FiPlay size={13} />
              {isLoading ? "Processing..." : "Yes, Process Now"}
            </button>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

// ── Komponen utama ────────────────────────────────────────────────────────────
const FptkApprovedList: React.FC = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── State untuk confirm modal ──
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    noReq: string;
  }>({ isOpen: false, noReq: "" });

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RequisitionListParams>({
    status: "Approved,Processed HRD",
  });
  const [searchInput, setSearchInput] = useState("");
  const { user } = useAuth();
  const isHrAdmin = user?.role?.name === "HR Admin";

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

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Buka modal konfirmasi — dipanggil saat icon Process diklik
  const openConfirmModal = (e: React.MouseEvent, noReq: string) => {
    e.stopPropagation();
    setConfirmModal({ isOpen: true, noReq });
  };

  // Eksekusi proses setelah user konfirmasi di modal
  const handleConfirmProcess = async () => {
    const noReq = confirmModal.noReq;
    setConfirmModal({ isOpen: false, noReq: "" });

    try {
      setProcessingId(noReq);
      await fptkService.processHrd(noReq);
      showSuccess(`FPTK ${noReq} successfully processed by HRD.`);
      void fetchRequisitions({ page, per_page: 10, ...filters });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "Failed to process FPTK.");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePrint = (noReq: string) => {
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    const printUrl =
      API_BASE_URL.replace(/\/api\/?$/, "") + `/print/fptk/${noReq}`;
    window.open(printUrl, "_blank");
  };

  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    if (status === "Approved")
      return {
        backgroundColor: "#f0fdf4",
        color: "#15803d",
        border: "1px solid #bbf7d0",
        borderRadius: "6px",
        padding: "2px 8px",
        fontSize: "12px",
        fontWeight: 500,
      };
    if (status === "Processed HRD")
      return {
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
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
        {/* ── Confirm Modal ── */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          noReq={confirmModal.noReq}
          isLoading={processingId === confirmModal.noReq}
          onConfirm={handleConfirmProcess}
          onCancel={() => setConfirmModal({ isOpen: false, noReq: "" })}
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

        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Approved FPTK
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              List of approved FPTK
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
                No FPTK with Approved / Processed HRD status
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

                          {/* Tombol Process HRD — hanya muncul untuk HR Admin dan status masih Approved */}
                          {isHrAdmin && req.approval_status === "Approved" && (
                            <button
                              type="button"
                              title="Process as HRD"
                              disabled={processingId === req.no_req}
                              onClick={(e) => openConfirmModal(e, req.no_req)}
                              style={{
                                width: "30px",
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color:
                                  processingId === req.no_req
                                    ? "#94a3b8"
                                    : "#3b82f6",
                                backgroundColor:
                                  processingId === req.no_req
                                    ? "#f1f5f9"
                                    : "#eff6ff",
                                border: `1px solid ${processingId === req.no_req ? "#e2e8f0" : "#bfdbfe"}`,
                                cursor:
                                  processingId === req.no_req
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                              onMouseEnter={(e) => {
                                if (processingId !== req.no_req)
                                  e.currentTarget.style.backgroundColor =
                                    "#dbeafe";
                              }}
                              onMouseLeave={(e) => {
                                if (processingId !== req.no_req)
                                  e.currentTarget.style.backgroundColor =
                                    "#eff6ff";
                              }}
                            >
                              <FiPlay size={13} />
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

export default FptkApprovedList;
