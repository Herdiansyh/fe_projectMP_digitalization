import React from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";

import ConfirmDialog from "../common/ConfirmDialog";

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const IconHamburger = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconClose = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconLogout = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();

  // Chakra UI v3: useDisclosure mengembalikan `open`, bukan `isOpen`
  const [open, setOpen] = React.useState(false);

  const handleLogoutConfirm = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <>
      <Box
        as="header"
        bg="white"
        borderBottom="0.5px solid"
        borderColor="gray.200"
        position="sticky"
        top={0}
        zIndex={200}
      >
        {/* Accent bar */}
        <Box
          h="4px"
          flexShrink={0}
          bgGradient="to-r"
          gradientFrom="accent.400"
          gradientTo="brand.500"
        />
        <Flex
          justify="space-between"
          align="center"
          h="56px"
          px={{ base: 4, sm: 6 }}
        >
          {/* Kiri: Hamburger + Brand */}
          <Flex align="center" gap={3}>
            <Box
              as="button"
              onClick={onToggleSidebar}
              w="36px"
              h="36px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.300"
              bg="white"
              color="gray.700"
              cursor="pointer"
              transition="all 0.2s ease"
              _hover={{
                bg: "gray.100",
                borderColor: "gray.400",
                color: "gray.900",
              }}
              _active={{ bg: "gray.200" }}
            >
              {sidebarOpen ? <IconClose /> : <IconHamburger />}
            </Box>

            {!sidebarOpen && (
              <Flex align="center" gap={2}>
                <Box
                  w="28px"
                  h="28px"
                  borderRadius="md"
                  overflow="hidden"
                  flexShrink={0}
                >
                  <img
                    src="/favicon.png"
                    alt="Astra Visteon"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <Box display={{ base: "none", sm: "block" }}>
                  <Text
                    fontSize="12px"
                    fontWeight="500"
                    color="gray.900"
                    lineHeight="1.2"
                  >
                    Astra Visteon Indonesia
                  </Text>
                  <Text fontSize="10px" color="gray.400" lineHeight="1.3">
                    Enterprise Management System
                  </Text>
                </Box>
              </Flex>
            )}
          </Flex>

          {/* Kanan: User info + Logout */}
          <Flex align="center" gap={3}>
            <Flex align="center" gap={2}>
              <Flex
                w="30px"
                h="30px"
                borderRadius="full"
                bg="brand.50"
                border="0.5px solid"
                borderColor="brand.100"
                align="center"
                justify="center"
                fontSize="12px"
                fontWeight="500"
                color="brand.500"
                flexShrink={0}
              >
                {user?.name?.charAt(0).toUpperCase() ?? "A"}
              </Flex>
              <Box display={{ base: "none", sm: "block" }}>
                <Text
                  fontSize="12px"
                  fontWeight="500"
                  color="gray.900"
                  lineHeight="1.2"
                >
                  {user?.name}
                </Text>
                <Text fontSize="11px" color="gray.500" lineHeight="1.2">
                  {user?.role?.name}
                </Text>
              </Box>
            </Flex>

            <Button
              onClick={() => setOpen(true)}
              size="sm"
              variant="outline"
              borderColor="gray.200"
              color="gray.600"
              fontSize="12px"
              borderRadius="md"
              _hover={{ bg: "gray.50", borderColor: "gray.300" }}
            >
              Logout
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Modal Konfirmasi Logout — Chakra UI v3 Dialog API */}

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Logout"
        message={
          <>
            Apakah Anda yakin ingin keluar dari akun{" "}
            <Text as="span" fontWeight="600" color="gray.700">
              {user?.name}
            </Text>
            ?
          </>
        }
        confirmText="Ya, Logout"
        cancelText="Batal"
        confirmColor="orange.400"
        icon={<IconLogout />}
      />
    </>
  );
};

export default Navbar;
