import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Badge, Flex, Textarea, HStack } from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import fptkService from "../../services/fptkService";
import { useAuth } from "../../contexts/AuthContext";
import { toaster } from "../../components/ui/toaster";
import type { Requisition } from "../../types/fptk";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// ── Komponen di luar FptkApproval agar tidak dibuat ulang saat render ──

const Field = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <Box flex={1} minW="180px">
    <Text
      fontSize="11px"
      fontWeight="600"
      color="gray.400"
      textTransform="uppercase"
      letterSpacing="0.05em"
      mb="2px"
    >
      {label}
    </Text>
    <Text fontSize="14px" fontWeight="500" color="gray.800">
      {value || "-"}
    </Text>
  </Box>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text
    fontSize="13px"
    fontWeight="700"
    color="brand.600"
    textTransform="uppercase"
    letterSpacing="0.08em"
    mb={4}
    pb={2}
    borderBottom="2px solid"
    borderColor="brand.100"
  >
    {children}
  </Text>
);

// ── Komponen utama ──

const FptkApproval: React.FC = () => {
  const { noReq } = useParams<{ noReq: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const fetchRequisition = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const response = await fptkService.getRequisitionForReview(id);
        setRequisition(response.data);
      } catch (error: unknown) {
        const errorMessage =
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response
            ? (error.response.data as { message?: string }).message ||
              "Failed to fetch requisition"
            : "Failed to fetch requisition";

        toaster.create({
          title: "Error",
          description: errorMessage,
          type: "error",
        });
        navigate("/fptk/pending");
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (!noReq) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchRequisition(noReq);
  }, [noReq, fetchRequisition]);

  const handleSubmitClick = () => {
    if (!action) return;
    if (action === "rejected" && !rejectionReason.trim()) {
      toaster.create({
        title: "Validation Error",
        description: "Please provide a rejection reason",
        type: "error",
      });
      return;
    }
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    setDialogOpen(false);
    setSubmitting(true);
    try {
      await fptkService.reviewRequisition(noReq!, {
        action: action!,
        rejection_reason: action === "rejected" ? rejectionReason : undefined,
      });
      toaster.create({
        title: "Success",
        description: `Requisition ${action} successfully`,
        type: "success",
      });
      navigate("/fptk/pending");
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
          ? (error.response.data as { message?: string }).message ||
            `Failed to ${action} requisition`
          : `Failed to ${action} requisition`;

      toaster.create({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const canApprove = () => {
    if (!requisition || !user) return false;

    const currentStatus = requisition.approval_status;
    const userRole = user.role?.name;
    const userName = user.name;

    if (currentStatus === "Menunggu Approval Manager") {
      return userRole === "Manager" && requisition.manager === userName;
    }
    if (currentStatus === "Menunggu Approval Division Head") {
      return userRole === "Division Head" && requisition.division === userName;
    }
    if (currentStatus === "Menunggu Approval Director") {
      return userRole === "Director" && requisition.director === userName;
    }

    return false;
  };

  const getApprovalStage = (status: string) => {
    if (status.includes("Manager")) return "Manager";
    if (status.includes("Division Head")) return "Division Head";
    if (status.includes("Director")) return "Director";
    return "Unknown";
  };

  const getStatusColor = (status: string): React.CSSProperties => {
    if (status === "Approved")
      return {
        backgroundColor: "#f0fdf4",
        color: "#15803d",
        border: "1px solid #bbf7d0",
      };
    if (status === "Rejected")
      return {
        backgroundColor: "#fff1f2",
        color: "#be123c",
        border: "1px solid #fecdd3",
      };
    if (status === "Menunggu Approval Manager")
      return {
        backgroundColor: "#f8fafc",
        color: "#475569",
        border: "1px solid #cbd5e1",
      };
    if (status === "Menunggu Approval Division Head")
      return {
        backgroundColor: "#f1f5f9",
        color: "#334155",
        border: "1px solid #94a3b8",
      };
    if (status === "Menunggu Approval Director")
      return {
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      };
    return {
      backgroundColor: "#f8fafc",
      color: "#64748b",
      border: "1px solid #e2e8f0",
    };
  };

  if (loading) {
    return (
      <MainLayout>
        <Flex align="center" justify="center" h="200px">
          <Text color="gray.500">Loading...</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (!requisition) {
    return (
      <MainLayout>
        <Flex align="center" justify="center" h="200px">
          <Text color="gray.500">Requisition not found</Text>
        </Flex>
      </MainLayout>
    );
  }

  if (!canApprove()) {
    return (
      <MainLayout>
        <Box p={6}>
          <Text fontSize="xl" fontWeight="bold" color="gray.600">
            You don't have permission to approve this requisition.
          </Text>
          <Text mt={4} fontSize="14px" color="gray.500">
            This requisition is awaiting approval from{" "}
            {getApprovalStage(requisition.approval_status)}.
          </Text>
          <button
            type="button"
            onClick={() => navigate("/fptk/pending")}
            style={{
              marginTop: "16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#4a5568",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
            }}
          >
            Back to Pending Approvals
          </button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box>
        {/* Top bar */}
        <HStack mb={6}>
          <button
            type="button"
            onClick={() => navigate("/fptk/pending")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#4a5568",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f7fafc")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ffffff")
            }
          >
            <FiArrowLeft size={14} /> Back
          </button>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Review FPTK
            </Text>
            <Text fontSize="13px" color="gray.500" mt={1}>
              Approval Stage: {getApprovalStage(requisition.approval_status)}
            </Text>
          </Box>
        </HStack>

        <Box
          bg="white"
          rounded="xl"
          shadow="sm"
          p={8}
          borderWidth="1px"
          borderColor="gray.100"
        >
          <Flex direction="column" gap={8}>
            {/* ── Header ── */}
            <Box pb={5} borderBottom="1px solid #e2e8f0">
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text fontSize="20px" fontWeight="700" color="gray.800">
                    {requisition.no_req}
                  </Text>
                  <Text fontSize="13px" color="gray.500" mt={1}>
                    Request Date: {formatDate(requisition.request_date)}
                  </Text>
                </Box>
                <Badge
                  style={getStatusColor(requisition.approval_status)}
                  fontSize="12px"
                  px={3}
                  py={1}
                >
                  {requisition.approval_status}
                </Badge>
              </Flex>
            </Box>

            {/* ── Requester Information ── */}
            <Box>
              <SectionTitle>Requester Information</SectionTitle>
              <Flex gap={4} wrap="wrap">
                <Field
                  label="Requester Name"
                  value={requisition.requester_name}
                />
                <Field label="Department" value={requisition.department} />
                <Field label="Section" value={requisition.section} />
              </Flex>
            </Box>

            {/* ── Approval Routing ── */}
            <Box>
              <SectionTitle>Approval Routing</SectionTitle>
              <Flex gap={4} wrap="wrap">
                {[
                  {
                    label: "Manager",
                    name: requisition.manager,
                    date: requisition.manager_approved_at,
                  },
                  {
                    label: "Division Head",
                    name: requisition.division,
                    date: requisition.division_approved_at,
                  },
                  {
                    label: "Director",
                    name: requisition.director,
                    date: requisition.director_approved_at,
                  },
                ].map(({ label, name, date }) => (
                  <Box key={label} flex={1} minW="180px">
                    <Text
                      fontSize="11px"
                      fontWeight="600"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                      mb="2px"
                    >
                      {label}
                    </Text>
                    <Text fontSize="14px" fontWeight="500" color="gray.800">
                      {name || "-"}
                    </Text>
                    {date && (
                      <Text fontSize="12px" color="green.600" mt="2px">
                        ✓ Approved: {formatDate(date)}
                      </Text>
                    )}
                  </Box>
                ))}
              </Flex>
            </Box>

            {/* ── Position Information ── */}
            <Box>
              <SectionTitle>Position Information</SectionTitle>
              <Flex gap={4} wrap="wrap">
                <Field label="Position" value={requisition.position} />
                <Field label="Type" value={requisition.type} />
                <Field label="Level" value={requisition.level} />
                <Field
                  label="Number of Employees"
                  value={requisition.cost_employee}
                />
              </Flex>
            </Box>

            {/* ── Requirements ── */}
            <Box>
              <SectionTitle>Requirements</SectionTitle>
              <Flex gap={4} wrap="wrap" mb={4}>
                <Field label="Education" value={requisition.education} />
                <Field label="Maximum Age" value={requisition.max_age} />
                <Field
                  label="Minimum Experience"
                  value={
                    requisition.min_experience
                      ? `${requisition.min_experience} years`
                      : "-"
                  }
                />
              </Flex>

              {/* Technical Skills */}
              <Box mb={3}>
                <Text
                  fontSize="11px"
                  fontWeight="600"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                  mb="4px"
                >
                  Technical Skills
                </Text>
                <Text fontSize="14px" fontWeight="500" color="gray.800">
                  {requisition.technical_skill || "-"}
                </Text>
              </Box>

              {/* Job Description */}
              <Box>
                <Text
                  fontSize="11px"
                  fontWeight="600"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                  mb="4px"
                >
                  Job Description
                </Text>
                <Text
                  fontSize="14px"
                  fontWeight="500"
                  color="gray.800"
                  whiteSpace="pre-wrap"
                >
                  {requisition.description || "-"}
                </Text>
              </Box>
            </Box>

            {/* ── Approval Action ── */}
            <Box borderTop="1px solid #e2e8f0" pt={6}>
              <SectionTitle>Approval Action</SectionTitle>
              <Flex direction="column" gap={4}>
                <HStack gap={4}>
                  {/* Approve button */}
                  <button
                    type="button"
                    onClick={() => setAction("approved")}
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      ...(action === "approved"
                        ? {
                            backgroundColor: "#16a34a",
                            color: "#ffffff",
                            border: "1px solid #16a34a",
                          }
                        : {
                            backgroundColor: "#ffffff",
                            color: "#16a34a",
                            border: "1px solid #bbf7d0",
                          }),
                    }}
                    onMouseEnter={(e) => {
                      if (action !== "approved") {
                        e.currentTarget.style.backgroundColor = "#f0fdf4";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (action !== "approved") {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }
                    }}
                  >
                    <FiCheck size={14} /> Approve
                  </button>

                  {/* Reject button */}
                  <button
                    type="button"
                    onClick={() => setAction("rejected")}
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      ...(action === "rejected"
                        ? {
                            backgroundColor: "#be123c",
                            color: "#ffffff",
                            border: "1px solid #be123c",
                          }
                        : {
                            backgroundColor: "#ffffff",
                            color: "#be123c",
                            border: "1px solid #fecdd3",
                          }),
                    }}
                    onMouseEnter={(e) => {
                      if (action !== "rejected") {
                        e.currentTarget.style.backgroundColor = "#fff1f2";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (action !== "rejected") {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }
                    }}
                  >
                    <FiX size={14} /> Reject
                  </button>
                </HStack>

                {action === "rejected" && (
                  <Box>
                    <Text
                      fontSize="11px"
                      fontWeight="600"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                      mb="4px"
                    >
                      Rejection Reason *
                    </Text>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection"
                      rows={4}
                      fontSize="14px"
                    />
                  </Box>
                )}

                {action && (
                  <Flex gap={3} justify="flex-end">
                    {/* Cancel button */}
                    <button
                      type="button"
                      onClick={() => setAction(null)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#4a5568",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f7fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ffffff")
                      }
                    >
                      Cancel
                    </button>

                    {/* Submit button */}
                    <button
                      type="button"
                      onClick={handleSubmitClick}
                      disabled={submitting}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 20px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#ffffff",
                        backgroundColor: submitting ? "#93c5fd" : "#3b82f6",
                        border: "none",
                        cursor: submitting ? "not-allowed" : "pointer",
                        opacity: submitting ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting)
                          e.currentTarget.style.backgroundColor = "#2563eb";
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting)
                          e.currentTarget.style.backgroundColor = "#3b82f6";
                      }}
                    >
                      {submitting ? "Submitting..." : "Submit Decision"}
                    </button>
                  </Flex>
                )}
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Box>
      <ConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirm}
        loading={submitting}
        title={
          action === "approved" ? "Approve Requisition?" : "Reject Requisition?"
        }
        message={
          action === "approved"
            ? `You are about to approve requisition ${requisition?.no_req}. This action cannot be undone.`
            : `You are about to reject requisition ${requisition?.no_req}. Make sure the rejection reason is filled correctly.`
        }
        confirmText={action === "approved" ? "Yes, Approve" : "Yes, Reject"}
        cancelText="Cancel"
        confirmColor={action === "approved" ? "#16a34a" : "#be123c"}
        icon={
          action === "approved" ? (
            <FiCheckCircle size={24} color="#16a34a" />
          ) : (
            <FiXCircle size={24} color="#be123c" />
          )
        }
      />
    </MainLayout>
  );
};

export default FptkApproval;
