import React from "react";
import { Box, Text, Flex, Grid, Badge } from "@chakra-ui/react";
import { FiX, FiShield } from "react-icons/fi";
import type { UserItem } from "../../types/user";

interface UserDetailModalProps {
  user: UserItem;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <Box mb={4}>
    <Text fontSize="13px" fontWeight="600" color="gray.500" mb={1}>
      {label}
    </Text>
    <Text fontSize="14px" color="gray.800" fontWeight="500">
      {value || "-"}
    </Text>
  </Box>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Text
    fontSize="15px"
    fontWeight="bold"
    color="brand.700"
    mb={4}
    borderBottomWidth="2px"
    borderColor="brand.100"
    pb={2}
  >
    {children}
  </Text>
);

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.400"
        zIndex={400}
        onClick={onClose}
        backdropFilter="blur(2px)"
      />

      {/* Modal Content */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        bg="white"
        w="full"
        maxW="640px"
        borderRadius="12px"
        boxShadow="xl"
        zIndex={401}
        overflow="hidden"
        maxH="90vh"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          px={6}
          py={4}
          borderBottom="1px solid"
          borderColor="gray.100"
          bg="gray.50"
        >
          <Box>
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              Detail User
            </Text>
            <Text fontSize="13px" color="gray.500">
              Informasi lengkap profil pengguna
            </Text>
          </Box>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              color: "#64748b",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            <FiX size={16} />
          </button>
        </Flex>

        {/* Body */}
        <Box p={6} overflowY="auto">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            {/* ── Data Pribadi ── */}
            <Box>
              <SectionTitle>Data Pribadi</SectionTitle>
              <DetailRow label="Nama Lengkap" value={user.name} />
              <DetailRow
                label="NPK"
                value={<Text fontFamily="monospace">{user.npk}</Text>}
              />
              <DetailRow label="Username" value={user.username} />
              <DetailRow label="Email" value={user.email} />
            </Box>

            {/* ── Posisi & Hak Akses ── */}
            <Box>
              <SectionTitle>Posisi & Hak Akses</SectionTitle>
              <DetailRow label="Department" value={user.department?.name} />
              <DetailRow label="Section" value={user.section?.name} />{" "}
              {/* ← ditambahkan */}
              <DetailRow label="Role Level" value={user.role_level?.name} />
              <DetailRow
                label="Admin Status"
                value={
                  user.is_admin ? (
                    <Badge
                      colorPalette="blue"
                      display="inline-flex"
                      alignItems="center"
                      gap={1}
                    >
                      <FiShield size={10} /> Admin
                    </Badge>
                  ) : (
                    <Badge colorPalette="gray">User</Badge>
                  )
                }
              />
            </Box>

            {/* ── Approver Chain ── */}
            <Box gridColumn="1 / -1">
              <SectionTitle>Approver Chain</SectionTitle>
              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
                gap={4}
              >
                {/* Manager */}
                <Box
                  p={4}
                  bg="gray.50"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    color="gray.500"
                    mb={1}
                    textTransform="uppercase"
                  >
                    Manager
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    color={user.approver_manager ? "gray.800" : "gray.400"}
                  >
                    {user.approver_manager?.name ?? "Tidak ada"}
                  </Text>
                  {user.approver_manager && (
                    <Text fontSize="12px" color="gray.500" mt={1}>
                      NPK: {user.approver_manager.npk}
                    </Text>
                  )}
                </Box>

                {/* Division Head */}
                <Box
                  p={4}
                  bg="gray.50"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    color="gray.500"
                    mb={1}
                    textTransform="uppercase"
                  >
                    Division Head
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    color={user.approver_division ? "gray.800" : "gray.400"}
                  >
                    {user.approver_division?.name ?? "Tidak ada"}
                  </Text>
                  {user.approver_division && (
                    <Text fontSize="12px" color="gray.500" mt={1}>
                      NPK: {user.approver_division.npk}
                    </Text>
                  )}
                </Box>

                {/* Director */}
                <Box
                  p={4}
                  bg="gray.50"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    color="gray.500"
                    mb={1}
                    textTransform="uppercase"
                  >
                    Director
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    color={user.approver_director ? "gray.800" : "gray.400"}
                  >
                    {user.approver_director?.name ?? "Tidak ada"}
                  </Text>
                  {user.approver_director && (
                    <Text fontSize="12px" color="gray.500" mt={1}>
                      NPK: {user.approver_director.npk}
                    </Text>
                  )}
                </Box>
              </Grid>
            </Box>
          </Grid>
        </Box>

        {/* Footer */}
        <Box
          px={6}
          py={4}
          borderTop="1px solid"
          borderColor="gray.100"
          bg="gray.50"
          display="flex"
          justifyContent="flex-end"
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              color: "#475569",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f8fafc")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "white")
            }
          >
            Tutup
          </button>
        </Box>
      </Box>
    </>
  );
};

export default UserDetailModal;
