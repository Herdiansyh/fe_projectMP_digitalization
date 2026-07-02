import React from "react";
import { Box, Text, Flex, HStack, Grid } from "@chakra-ui/react";
import { FiUser, FiX } from "react-icons/fi";
import type { Intern } from "../../types/intern";

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box>
    <Text
      fontSize="11px"
      fontWeight={700}
      color="gray.400"
      mb={1}
      textTransform="uppercase"
      letterSpacing="0.05em"
    >
      {label}
    </Text>
    <Text fontSize="14px" color="gray.800">
      {value ?? "-"}
    </Text>
  </Box>
);

const InternDetailModal = ({
  isOpen,
  intern,
  onClose,
}: {
  isOpen: boolean;
  intern: Intern | null;
  onClose: () => void;
}) => {
  if (!isOpen || !intern) return null;

  const isWarning = !!intern.is_near_expiry;

  return (
    <>
      <Box
        position="fixed"
        inset={0}
        zIndex={400}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />
      <Box
        position="fixed"
        top="50%"
        left="50%"
        zIndex={500}
        style={{
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "560px",
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
          {/* Header */}
          <Flex px={6} pt={6} pb={4} justify="space-between" align="flex-start">
            <HStack gap={3} align="flex-start">
              <Box
                w="44px"
                h="44px"
                borderRadius="10px"
                bg="#eff6ff"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <FiUser size={20} color="#1d4ed8" />
              </Box>
              <Box>
                <Text fontSize="17px" fontWeight="700" color="gray.800">
                  {intern.name}
                </Text>
                <Text fontSize="13px" color="gray.500" mt={0.5}>
                  NPK {intern.npk}
                </Text>
              </Box>
            </HStack>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                color: "#64748b",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <FiX size={15} />
            </button>
          </Flex>

          {isWarning && (
            <Box px={6} pb={2}>
              <Box
                bg="#fff1f2"
                border="1px solid #fecdd3"
                borderRadius="8px"
                px={3}
                py={2}
              >
                <Text fontSize="13px" fontWeight="600" color="#be123c">
                  ⚠ Need Evaluation — internship ends in{" "}
                  {intern.days_until_expiry} day
                  {intern.days_until_expiry === 1 ? "" : "s"}
                </Text>
              </Box>
            </Box>
          )}

          <Box h="1px" bg="gray.100" />

          {/* Body */}
          <Box px={6} py={5}>
            <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
              <DetailRow
                label="Gender"
                value={
                  intern.gender === "male"
                    ? "Male"
                    : intern.gender === "female"
                      ? "Female"
                      : "-"
                }
              />
              <DetailRow label="Position" value={intern.jabatan} />
              <DetailRow label="Department" value={intern.department?.name} />
              <DetailRow label="Section" value={intern.section?.name} />
              <DetailRow label="Role Level" value={intern.role_level} />
              <DetailRow label="Area" value={intern.area} />
              <DetailRow label="Line" value={intern.line} />
              <DetailRow label="Station" value={intern.station} />
            </Grid>

            <Box h="1px" bg="gray.100" my={4} />

            <Grid templateColumns="1fr 1fr" gap={4}>
              <DetailRow
                label="Start Internship"
                value={formatDate(intern.start_contract)}
              />
              <DetailRow
                label="End Internship"
                value={
                  <Text
                    color={isWarning ? "red.600" : "gray.800"}
                    fontWeight={isWarning ? 700 : 400}
                  >
                    {formatDate(intern.end_contract)}
                  </Text>
                }
              />
            </Grid>
          </Box>

          <Box h="1px" bg="gray.100" />
          <Flex px={6} py={4} justify="flex-end">
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "8px",
                color: "#ffffff",
                backgroundColor: "#1A5EA8",
                border: "1px solid #1A5EA8",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default InternDetailModal;
