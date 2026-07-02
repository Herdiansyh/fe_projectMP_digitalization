import React, { useState, useEffect } from "react";
import { Box, Text, Badge, Flex, HStack, Textarea } from "@chakra-ui/react";
import { FiCheck, FiX, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import fptkService from "../../services/fptkService";
import { useAuth } from "../../contexts/AuthContext";
import { toaster } from "../../components/ui/toaster";
import type { Requisition } from "../../types/fptk";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// ── Rejection Note Modal ────────────────────────────────────────────────────
interface RejectionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  noReq: string;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  open,
  onClose,
  onConfirm,
  noReq,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={200}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Backdrop */}
      <Box
        position="absolute"
        inset={0}
        backgroundColor="blackAlpha.600"
        onClick={onClose}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      />

      {/* Dialog */}
      <Box
        position="relative"
        bg="white"
        borderRadius="12px"
        shadow="xl"
        p={6}
        w="full"
        maxW="440px"
        mx={4}
        zIndex={1}
      >
        {/* Icon + Title */}
        <Flex align="center" gap={3} mb={4}>
          <Box
            w="40px"
            h="40px"
            borderRadius="10px"
            backgroundColor="#fff1f2"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <FiXCircle size={20} color="#be123c" />
          </Box>
          <Box>
            <Text fontSize="16px" fontWeight="700" color="gray.800">
              Reject Requisition?
            </Text>
            <Text fontSize="12px" color="gray.500" mt={0.5}>
              {noReq}
            </Text>
          </Box>
        </Flex>

        {/* Reason input */}
        <Box mb={4}>
          <Text
            fontSize="11px"
            fontWeight="600"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="0.05em"
            mb={1}
          >
            Rejection Reason{" "}
            <Text as="span" color="red.500">
              *
            </Text>
          </Text>
          <Textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError("");
            }}
            placeholder="Write rejection reason clearly..."
            rows={4}
            fontSize="14px"
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "14px",
              color: "#1a202c",
              backgroundColor: "#ffffff",
              border: error ? "1px solid #ef4444" : "1px solid #e2e8f0",
              borderRadius: "8px",
              outline: "none",
              resize: "vertical",
            }}
          />
          {error && (
            <Text fontSize="12px" color="red.500" mt={1}>
              {error}
            </Text>
          )}
        </Box>

        {/* Actions */}
        <Flex gap={2} justify="flex-end">
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "8px",
              color: "#475569",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f8fafc")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ffffff")
            }
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "8px",
              color: "#ffffff",
              backgroundColor: "#be123c",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#9f1239")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#be123c")
            }
          >
            <FiX size={13} /> Submit
          </button>
        </Flex>
      </Box>
    </Box>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────

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

  // ── Approval action state ───────────────────────────────────────────────
  const [approveTarget, setApproveTarget] = useState<Requisition | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Requisition | null>(null);
  const [pendingReject, setPendingReject] = useState<{
    req: Requisition;
    reason: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // HAPUS fetchPendingApprovals useCallback, ganti dengan ini:
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const response = await fptkService.getPendingApprovals({
          page,
          per_page: 15,
        });
        if (cancelled) return;
        setRequisitions(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
      } catch (error: unknown) {
        if (cancelled) return;
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
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [page, refreshKey]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleApproveConfirm = async () => {
    if (!approveTarget) return;
    setSubmitting(true);
    try {
      await fptkService.reviewRequisition(approveTarget.no_req, {
        action: "approved",
      });
      toaster.create({
        title: "Success",
        description: `Requisition ${approveTarget.no_req} has been approved.`,
        type: "success",
      });
      setApproveTarget(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error: unknown) {
      const msg =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (error as { response: { data: { message: string } } }).response.data
              .message
          : "Failed to approve requisition.";
      toaster.create({ title: "Error", description: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectNoteConfirm = (reason: string) => {
    if (!rejectTarget) return;
    setPendingReject({ req: rejectTarget, reason });
    setRejectTarget(null);
  };

  const handleRejectConfirm = async () => {
    if (!pendingReject) return;
    setSubmitting(true);
    try {
      await fptkService.reviewRequisition(pendingReject.req.no_req, {
        action: "rejected",
        rejection_reason: pendingReject.reason,
      });
      toaster.create({
        title: "Success",
        description: `Requisition ${pendingReject.req.no_req} has been rejected.`,
        type: "success",
      });
      setPendingReject(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error: unknown) {
      const msg =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (error as { response: { data: { message: string } } }).response.data
              .message
          : "Failed to reject requisition.";
      toaster.create({ title: "Error", description: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────

  const getStatusColor = (status: string) => {
    if (status.includes("Approved")) return "green";
    if (status.includes("Rejected")) return "red";
    if (status.includes("Waiting")) return "orange";
    return "gray";
  };

  const getApprovalStage = (status: string) => {
    if (status.includes("Manager")) return "Manager";
    if (status.includes("Division Head")) return "Division Head";
    if (status.includes("Director")) return "Director";
    return "Unknown";
  };

  const canApproveThis = (req: Requisition) => {
    if (!user) return false;
    const currentStatus = req.approval_status;
    const userRole = user.role?.name;
    const userName = user.name;
    if (currentStatus === "Waiting for Manager Approval")
      return userRole === "Manager" && req.manager === userName;
    if (currentStatus === "Waiting for Division Head Approval")
      return userRole === "Division Head" && req.division === userName;
    if (currentStatus === "Waiting for Director Approval")
      return userRole === "Director" && req.director === userName;
    return false;
  };

  const canViewPending =
    user?.role?.name === "Manager" ||
    user?.role?.name === "Division Head" ||
    user?.role?.name === "Director";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

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
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/fptk/${req.no_req}/review`)}
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

                      {/* Actions */}
                      <td style={{ padding: "12px 14px" }}>
                        {canApproveThis(req) ? (
                          <HStack gap={1}>
                            {/* Approve */}
                            <button
                              type="button"
                              title="Approve"
                              onClick={(e) => {
                                e.stopPropagation();
                                setApproveTarget(req);
                              }}
                              style={{
                                width: "30px",
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#16a34a",
                                backgroundColor: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#dcfce7")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#f0fdf4")
                              }
                            >
                              <FiCheck size={14} />
                            </button>

                            {/* Reject */}
                            <button
                              type="button"
                              title="Reject"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRejectTarget(req);
                              }}
                              style={{
                                width: "30px",
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#be123c",
                                backgroundColor: "#fff1f2",
                                border: "1px solid #fecdd3",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#ffe4e6")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#fff1f2")
                              }
                            >
                              <FiX size={14} />
                            </button>
                          </HStack>
                        ) : (
                          <Text fontSize="12px" color="gray.400">
                            —
                          </Text>
                        )}
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

      {/* ── Modal 1: Input alasan reject ── */}
      <RejectionModal
        key={rejectTarget?.no_req ?? "closed"}
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectNoteConfirm}
        noReq={rejectTarget?.no_req ?? ""}
      />

      {/* ── Modal 2: Konfirmasi Approve ── */}
      <ConfirmDialog
        open={approveTarget !== null}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApproveConfirm}
        loading={submitting}
        title="Approve Requisition?"
        message={
          <>
            You are about to approve requisition{" "}
            <Text as="span" fontWeight="600" color="gray.700">
              {approveTarget?.no_req}
            </Text>
          </>
        }
        confirmText="Yes, Approve"
        cancelText="Cancel"
        confirmColor="#16a34a"
        icon={<FiCheckCircle size={22} color="#16a34a" />}
      />

      {/* ── Modal 3: Konfirmasi Reject (setelah isi alasan) ── */}
      <ConfirmDialog
        open={pendingReject !== null}
        onClose={() => setPendingReject(null)}
        onConfirm={handleRejectConfirm}
        loading={submitting}
        title="Reject Requisition?"
        message={
          <>
            You are about to reject requisition{" "}
            <Text as="span" fontWeight="600" color="gray.700">
              {pendingReject?.req.no_req}
            </Text>
          </>
        }
        confirmText="Yes, Reject"
        cancelText="Cancel"
        confirmColor="#be123c"
        icon={<FiXCircle size={22} color="#be123c" />}
      />
    </MainLayout>
  );
};

export default FptkPending;
