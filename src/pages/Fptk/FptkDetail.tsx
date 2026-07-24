import React, { useState } from "react";
import { Box, Text, Badge, Flex, HStack, Grid } from "@chakra-ui/react";
import { FiArrowLeft, FiPlay, FiAlertTriangle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import {
  useFptkDetail,
  useProcessHrd,
} from "../../hooks/queries/useFptkQueries";

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

// ── Bentuk gabungan candidate yang ditampilkan di "Manpower Assignment".
//    Bisa berasal dari 3 sumber berbeda: requisition.employees (sudah final,
//    punya id+area+line+station), requisition.interns (sama), atau
//    requisition.pending_candidates (belum final, cuma npk/name/tanggal
//    kontrak, tanpa id/area/line/station). Field opsional di bawah ini
//    merefleksikan itu — dipakai sebagai pengganti `any` saat casting. ──
interface AssignedCandidate {
  id?: number;
  npk: string;
  name: string;
  join_date?: string | null;
  start_contract?: string | null;
  end_contract?: string | null;
  area?: { name?: string | null } | null;
  line?: { name?: string | null } | null;
  station?: { name?: string | null } | null;
}

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

// ── Main Component ────────────────────────────────────────────────────────────
const FptkDetail: React.FC = () => {
  const { noReq } = useParams<{ noReq: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isHrAdmin = user?.role?.name === "HR Admin";

  // ── React Query: detail FPTK ──
  const { data: detailResponse, isLoading: loading } = useFptkDetail(
    noReq ?? "",
    !!noReq,
  );
  const requisition = detailResponse?.data ?? null;

  // ── React Query: mutation Process HRD ──
  const processHrdMutation = useProcessHrd();
  const processingHrd = processHrdMutation.isPending;

  const handleProcessHrd = () => {
    if (!noReq) return;
    setShowConfirmModal(false);
    processHrdMutation.mutate(noReq, {
      onSuccess: () => {
        setSuccessMsg(`FPTK ${noReq} successfully processed by HRD.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { message?: string } } };
        alert(e.response?.data?.message ?? "Failed to process FPTK.");
      },
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string): React.CSSProperties => {
    if (status === "Processed HRD")
      return {
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      };
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
    if (status === "Manpower Assigned")
      return {
        backgroundColor: "#f0fdf4",
        color: "#166534",
        border: "1px solid #bbf7d0",
      };
    if (status === "Waiting for Manager Approval")
      return {
        backgroundColor: "#f8fafc",
        color: "#475569",
        border: "1px solid #cbd5e1",
      };
    if (status === "Waiting for Division Head Approval")
      return {
        backgroundColor: "#f1f5f9",
        color: "#334155",
        border: "1px solid #94a3b8",
      };
    if (status === "Waiting for Director Approval")
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

  return (
    <MainLayout>
      <Box>
        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          noReq={noReq ?? ""}
          isLoading={processingHrd}
          onConfirm={handleProcessHrd}
          onCancel={() => setShowConfirmModal(false)}
        />

        {/* Success toast */}
        {successMsg && (
          <Box
            position="fixed"
            top={4}
            right={4}
            zIndex={300}
            bg="blue.600"
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

        {/* Top bar */}
        <HStack mb={6} justify="space-between" align="center">
          <HStack>
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/fptklist");
                }
              }}
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
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              FPTK Details
            </Text>
          </HStack>

          {isHrAdmin && requisition.approval_status === "Approved" && (
            <button
              type="button"
              disabled={processingHrd}
              onClick={() => setShowConfirmModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: processingHrd ? "#94a3b8" : "#ffffff",
                backgroundColor: processingHrd ? "#f1f5f9" : "#1d4ed8",
                border: `1px solid ${processingHrd ? "#e2e8f0" : "#1d4ed8"}`,
                cursor: processingHrd ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!processingHrd)
                  e.currentTarget.style.backgroundColor = "#1e40af";
              }}
              onMouseLeave={(e) => {
                if (!processingHrd)
                  e.currentTarget.style.backgroundColor = "#1d4ed8";
              }}
            >
              <FiPlay size={14} />
              {processingHrd ? "Processing..." : "Process FPTK (HRD)"}
            </button>
          )}

          {isHrAdmin && requisition.approval_status === "Processed HRD" && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#1d4ed8",
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
              }}
            >
              ✓ Processed by HRD
            </span>
          )}
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

            {/* ── Requester Data — dipisah tegas dari data requirement,
                 supaya jelas mana identitas SIAPA yang mengajukan vs APA
                 yang diminta. Field ini sejalan dengan yang ditampilkan
                 disabled/auto-fill di form pembuatan FPTK. ── */}
            <Box>
              <SectionTitle>Requester Data</SectionTitle>
              <Flex gap={4} wrap="wrap">
                <Field
                  label="Requested By"
                  value={requisition.requester_name}
                />
                <Field
                  label="Request Date"
                  value={formatDate(requisition.request_date)}
                />
                <Field label="Department" value={requisition.department} />
                <Field label="Section" value={requisition.section} />
              </Flex>
            </Box>

            {/* ── 2-Column Layout ── */}
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={10}>
              {/* Left Column */}
              <Flex direction="column" gap={8}>
                {/* ── Requirement (Department/Section sudah dipindah ke
                     "Requester Data" di atas, supaya tidak duplikat) ── */}
                <Box>
                  <SectionTitle>Requirement</SectionTitle>
                  <Flex gap={4} wrap="wrap">
                    <Field label="Position" value={requisition.position} />
                    <Field label="Fullfillment Type" value={requisition.type} />
                    <Field label="Status" value={requisition.status} />
                    <Field
                      label="Duration"
                      value={
                        requisition.duration
                          ? `${requisition.duration} Month`
                          : "-"
                      }
                    />
                    <Field label="Level" value={requisition.level} />
                    <Field
                      label="Number of Employees"
                      value={requisition.cost_employee}
                    />
                    <Field
                      label="Start Date Required"
                      value={
                        requisition.fulfilment_time
                          ? formatDate(requisition.fulfilment_time)
                          : "-"
                      }
                    />
                  </Flex>
                </Box>

                {/* ── Man Specification ── */}
                <Box>
                  <SectionTitle>Man Specification</SectionTitle>
                  <Flex gap={4} wrap="wrap">
                    <Field
                      label="Minimum Education"
                      value={requisition.education}
                    />
                    <Field
                      label="Min. Experience"
                      value={
                        requisition.min_experience
                          ? `${requisition.min_experience} years`
                          : "-"
                      }
                    />
                  </Flex>
                </Box>
              </Flex>

              {/* Right Column */}
              <Flex direction="column" gap={8}>
                {/* ── Job Specification ── */}
                <Box>
                  <SectionTitle>Job Specification</SectionTitle>
                  <Box mb={6}>
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
                    {Array.isArray(requisition.technical_skill) &&
                    requisition.technical_skill.length > 0 ? (
                      <Flex direction="column" gap={2}>
                        {requisition.technical_skill.map((s, i) => (
                          <Text
                            key={i}
                            fontSize="14px"
                            color="gray.800"
                            fontWeight="500"
                          >
                            {String.fromCharCode(97 + i)}.) {s}
                          </Text>
                        ))}
                      </Flex>
                    ) : (
                      <Text fontSize="14px" color="gray.800" fontWeight="500">
                        -
                      </Text>
                    )}
                  </Box>
                  <Box>
                    <Text
                      fontSize="11px"
                      fontWeight="600"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                      mb="4px"
                    >
                      Soft Skills
                    </Text>
                    {Array.isArray(requisition.soft_skill) &&
                    requisition.soft_skill.length > 0 ? (
                      <Flex direction="column" gap={2}>
                        {requisition.soft_skill.map((s, i) => (
                          <Text
                            key={i}
                            fontSize="14px"
                            color="gray.800"
                            fontWeight="500"
                          >
                            {String.fromCharCode(97 + i)}.) {s}
                          </Text>
                        ))}
                      </Flex>
                    ) : (
                      <Text fontSize="14px" color="gray.800" fontWeight="500">
                        -
                      </Text>
                    )}
                  </Box>
                </Box>

                {/* ── Detail Requirement ── */}
                <Box>
                  <SectionTitle>Detail Requirement</SectionTitle>
                  <Flex gap={4} wrap="wrap" mb={4}>
                    <Field
                      label="Employee Cost Center"
                      value={requisition.cost_center}
                    />
                    <Field
                      label="Requisition Objective"
                      value={requisition.objective}
                    />

                    {/* ── Apprenticeship Period ── */}
                    <Box flex={1} minW="180px">
                      <Text
                        fontSize="11px"
                        fontWeight="600"
                        color="gray.400"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        mb="2px"
                      >
                        Apprenticeship Period
                      </Text>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "2px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: requisition.apprenticeship_period
                            ? "#15803d"
                            : "#64748b",
                          backgroundColor: requisition.apprenticeship_period
                            ? "#f0fdf4"
                            : "#f8fafc",
                          border: `1px solid ${requisition.apprenticeship_period ? "#bbf7d0" : "#e2e8f0"}`,
                        }}
                      >
                        {requisition.apprenticeship_period ? "Yes" : "No"}
                      </span>
                    </Box>
                  </Flex>

                  {/* ── Replaced Employee ── */}
                  {requisition.objective === "Replacement" && (
                    <Box mb={4}>
                      <Text
                        fontSize="11px"
                        fontWeight="600"
                        color="gray.400"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        mb="4px"
                      >
                        Replaced Employee
                      </Text>
                      <Box
                        p={3}
                        borderRadius="8px"
                        bg="#f0fdf4"
                        border="1px solid #bbf7d0"
                        display="inline-block"
                      >
                        <Text
                          fontSize="14px"
                          fontWeight="600"
                          color="green.700"
                        >
                          {requisition.employee_out || "-"}
                        </Text>
                        {requisition.replacement_employee?.npk && (
                          <Text fontSize="12px" color="green.600">
                            NPK: {requisition.replacement_employee.npk}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  )}

                  <Flex gap={4} wrap="wrap">
                    <Box flex={1} minW="180px">
                      <Text
                        fontSize="11px"
                        fontWeight="600"
                        color="gray.400"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        mb="4px"
                      >
                        Replacement Reason
                      </Text>
                      <Text
                        fontSize="14px"
                        color="gray.800"
                        fontWeight="500"
                        whiteSpace="pre-wrap"
                      >
                        {requisition.reason || "-"}
                      </Text>
                    </Box>
                    <Box flex={1} minW="180px">
                      <Text
                        fontSize="11px"
                        fontWeight="600"
                        color="gray.400"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        mb="4px"
                      >
                        Manpower Plan
                      </Text>
                      <Text fontSize="14px" color="gray.800" fontWeight="500">
                        {requisition.manpower_plan || "-"}
                      </Text>
                    </Box>
                    <Box flex={1} minW="180px">
                      <Text
                        fontSize="11px"
                        fontWeight="600"
                        color="gray.400"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        mb="4px"
                      >
                        Unplanned Reason
                      </Text>
                      <Text
                        fontSize="14px"
                        color="gray.800"
                        fontWeight="500"
                        whiteSpace="pre-wrap"
                      >
                        {requisition.unplanned_reason || "-"}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </Grid>

            {/* ── Manpower Assignment (muncul setelah HRD assign) ── */}
            {requisition.hrd_assigned_at && (
              <Box>
                <SectionTitle>Manpower Assignment</SectionTitle>

                {(() => {
                  // Kalau sudah lengkap (area/line sudah diisi), datanya ada di
                  // employees/interns. Kalau belum, tampilkan dari pending_candidates.
                  const finalized = requisition.apprenticeship_period
                    ? (requisition.interns ?? [])
                    : (requisition.employees ?? []);

                  const isFinalized = finalized.length > 0;
                  const pending = requisition.pending_candidates ?? [];

                  const candidates = isFinalized ? finalized : pending;

                  if (candidates.length === 0) {
                    return (
                      <Text fontSize="14px" color="gray.400">
                        No candidate data yet.
                      </Text>
                    );
                  }

                  return (
                    <Flex direction="column" gap={3}>
                      {candidates.map((c, idx) => (
                        <Box
                          key={
                            isFinalized
                              ? (c as AssignedCandidate).id
                              : (c as AssignedCandidate).npk
                          }
                          borderWidth="1px"
                          borderColor="gray.100"
                          borderRadius="10px"
                          p={4}
                          bg="#f9fafb"
                        >
                          <Flex justify="space-between" align="center" mb={3}>
                            <Text
                              fontSize="12px"
                              fontWeight={700}
                              color="gray.500"
                              textTransform="uppercase"
                              letterSpacing="0.05em"
                            >
                              Candidate {idx + 1}
                            </Text>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "2px 8px",
                                borderRadius: "6px",
                                color: isFinalized ? "#15803d" : "#c2410c",
                                backgroundColor: isFinalized
                                  ? "#f0fdf4"
                                  : "#fff7ed",
                                border: `1px solid ${isFinalized ? "#bbf7d0" : "#fed7aa"}`,
                              }}
                            >
                              {isFinalized ? "Placed" : "Awaiting Area/Line"}
                            </span>
                          </Flex>

                          <Flex gap={4} wrap="wrap">
                            <Field label="NPK" value={c.npk} />
                            <Field label="Name" value={c.name} />
                            <Field
                              label="Join Date"
                              value={
                                (c as AssignedCandidate).join_date
                                  ? formatDate(
                                      (c as AssignedCandidate)
                                        .join_date as string,
                                    )
                                  : "-"
                              }
                            />
                            <Field
                              label="Start Contract"
                              value={
                                c.start_contract
                                  ? formatDate(c.start_contract)
                                  : "-"
                              }
                            />
                            <Field
                              label="End Contract"
                              value={
                                c.end_contract
                                  ? formatDate(c.end_contract)
                                  : "-"
                              }
                            />
                            {isFinalized && (
                              <>
                                <Field
                                  label="Area"
                                  value={(c as AssignedCandidate).area?.name}
                                />
                                <Field
                                  label="Line"
                                  value={(c as AssignedCandidate).line?.name}
                                />
                                <Field
                                  label="Station"
                                  value={(c as AssignedCandidate).station?.name}
                                />
                              </>
                            )}
                          </Flex>
                        </Box>
                      ))}
                    </Flex>
                  );
                })()}

                <Text fontSize="12px" color="gray.500" mt={3}>
                  Assigned by: {requisition.hrd_assigned_by || "-"}
                </Text>
              </Box>
            )}

            {/* ── Approval Information (Requested By dipindah ke section
                 "Requester Data" di atas, supaya tidak duplikat di sini) ── */}
            <Box>
              <SectionTitle>Approver</SectionTitle>
              <Flex gap={4} wrap="wrap">
                {[
                  {
                    label: "Acknowledged By (Manager)",
                    name: requisition.manager,
                    date: requisition.manager_approved_at,
                  },
                  {
                    label: "Approved By (Division)",
                    name: requisition.division,
                    date: requisition.division_approved_at,
                  },
                  {
                    label: "Approved By (Director)",
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
                <Box flex={1} minW="180px">
                  <Text
                    fontSize="11px"
                    fontWeight="600"
                    color="gray.400"
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                    mb="2px"
                  >
                    Processed by HRD
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    color={
                      requisition.hrd_processed_by ? "blue.600" : "gray.800"
                    }
                  >
                    {requisition.hrd_processed_by || "-"}
                  </Text>
                  {requisition.hrd_processed_at && (
                    <Text fontSize="12px" color="blue.500" mt="2px">
                      ✓ Processed: {formatDate(requisition.hrd_processed_at)}
                    </Text>
                  )}
                </Box>
              </Flex>

              {requisition.rejection_reason && (
                <Box
                  mt={4}
                  p={3}
                  bg="red.50"
                  borderRadius="md"
                  borderLeft="3px solid"
                  borderColor="red.400"
                >
                  <Text
                    fontSize="11px"
                    fontWeight="600"
                    color="red.400"
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                    mb="2px"
                  >
                    Rejection Reason
                  </Text>
                  <Text fontSize="14px" fontWeight="500" color="red.700">
                    {requisition.rejection_reason}
                  </Text>
                </Box>
              )}
            </Box>
          </Flex>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default FptkDetail;
