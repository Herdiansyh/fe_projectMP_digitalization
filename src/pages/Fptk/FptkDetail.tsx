import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Badge, Flex, HStack, Grid } from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import fptkService from "../../services/fptkService";
// import { useAuth } from "../../contexts/AuthContext";
import type { Requisition } from "../../types/fptk";

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

const FptkDetail: React.FC = () => {
  const { noReq } = useParams<{ noReq: string }>();
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [loading, setLoading] = useState(true);

  // const canCreateEdit =
  //   user?.role?.name !== "Manager" &&
  //   user?.role?.name !== "Division Head" &&
  //   user?.role?.name !== "Director" &&
  //   user?.role?.name !== "Section Head";

  const fetchRequisition = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fptkService.getRequisition(id);
      setRequisition(response.data);
    } catch {
      alert("Failed to fetch requisition");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!noReq) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchRequisition(noReq);
  }, [noReq, fetchRequisition]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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

  return (
    <MainLayout>
      <Box>
        {/* Top bar */}
        <HStack mb={6}>
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

            {/* ── 2-Column Layout for Main Content ── */}
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={10}>
              {/* Left Column */}
              <Flex direction="column" gap={8}>
                {/* ── Requirement ── */}
                <Box>
                  <SectionTitle>Requirement</SectionTitle>
                  <Flex gap={4} wrap="wrap">
                    {/* <Field label="Fullfilment Type" value={requisition.type} /> */}
                    {/* <Field label="Group" value={requisition.group} /> */}
                    <Field label="Departement" value={requisition.department} />
                    <Field label="Section" value={requisition.section} />
                    <Field label="Position" value={requisition.position} />
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
                      label="Number Of Employee"
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
                    {/* <Field label="Maximum Age" value={requisition.max_age} /> */}
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

                {/* ── Detail Requirement ── */}
                <Box>
                  <SectionTitle>Detail Requirement</SectionTitle>
                  <Flex gap={4} wrap="wrap" mb={4}>
                    <Field
                      label="Employee Cost Center"
                      value={requisition.cost_center}
                    />
                    <Field
                      label="Requisition Objectives"
                      value={requisition.objective}
                    />
                    <Field
                      label="Name Of Employee Out"
                      value={requisition.employee_out}
                    />
                  </Flex>
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

              {/* Right Column */}
              <Flex direction="column" gap={8}>
                {/* ── Job Specification ── */}
                <Box>
                  <SectionTitle>Job Specification</SectionTitle>

                  {/* Technical Skills */}
                  <Box mb={6}>
                    <Text
                      fontSize="11px"
                      fontWeight="600"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                      mb="4px"
                    >
                      Technical Skill
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

                  {/* Soft Skills */}
                  <Box>
                    <Text
                      fontSize="11px"
                      fontWeight="600"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                      mb="4px"
                    >
                      Soft Skill
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

                {/* ── Job Description ──
                <Box>
                  <SectionTitle>Job Description</SectionTitle>
                  <Box>
                    <Text
                      fontSize="11px"
                      fontWeight="600"
                      color="gray.400"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                      mb="4px"
                    >
                      Description
                    </Text>
                    <Text
                      fontSize="14px"
                      color="gray.800"
                      fontWeight="500"
                      whiteSpace="pre-wrap"
                    >
                      {requisition.description || "-"}
                    </Text>
                  </Box>
                </Box> */}
              </Flex>
            </Grid>

            {/* ── Opsi / Approval Information ── */}
            <Box>
              <SectionTitle>Opsi</SectionTitle>
              <Flex gap={4} wrap="wrap">
                {[
                  {
                    label: "Requested By",
                    name: requisition.requester_name,
                    date: requisition.request_date,
                  },
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
                    label: "Request Approval To (Director)",
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
                        ✓ {label === "Requested By" ? "Date" : "Approved"}:{" "}
                        {formatDate(date)}
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
                    HRD Approved
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    color={requisition.hrd_approved ? "green.600" : "gray.800"}
                  >
                    {requisition.hrd_approved ? "✓ Yes" : "-"}
                  </Text>
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
