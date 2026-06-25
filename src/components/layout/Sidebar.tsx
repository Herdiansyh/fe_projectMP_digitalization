import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const IconDashboard = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconFPTK = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 11l2 2 4-4" />
  </svg>
);

const IconPending = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const IconUsers = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconApproved = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);


const IconHistory = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const approvalNavItems: NavItem[] = [
  { label: "Pending Approvals", path: "/fptk/pending", icon: <IconPending /> },
];

const adminNavItems: NavItem[] = [
  { label: "User Management", path: "/users", icon: <IconUsers /> },
];

interface SidebarProps {
  open: boolean;
}

const SIDEBAR_WIDTH = 220;

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isApproverRole =
    user?.role?.name === "Manager" ||
    user?.role?.name === "Division Head" ||
    user?.role?.name === "Director";

  const isAdmin = user?.is_admin === true;

  const navItems: NavItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: <IconDashboard /> },
    ...(!isApproverRole ? [{ label: "On Progress FPTK", path: "/fptklist", icon: <IconFPTK /> }] : []),
    { label: "Approved FPTK", path: "/fptk/approved", icon: <IconApproved /> },
    ...(isApproverRole ? approvalNavItems : []),
    ...(isApproverRole ? [{ label: "FPTK History", path: "/fptk/history", icon: <IconHistory /> }] : []),
  ];

  return (
    <>
      {!open && (
        <Box
          display={{ base: "none", md: "none" }}
          position="fixed"
          inset={0}
          bg="blackAlpha.400"
          zIndex={50}
        />
      )}

      <Box
        as="aside"
        position="fixed"
        top={0}
        left={open ? "0px" : `-${SIDEBAR_WIDTH}px`}
        h="100vh"
        w={`${SIDEBAR_WIDTH}px`}
        bg="white"
        borderRight="0.5px solid"
        borderColor="gray.200"
        display="flex"
        flexDirection="column"
        zIndex={100}
        transition="left 0.25s ease"
      >
        {/* Accent bar */}
        <Box
          h="4px"
          flexShrink={0}
          bgGradient="to-r"
          gradientFrom="brand.500"
          gradientTo="accent.400"
        />

        {/* Brand */}
        <Flex
          align="center"
          gap={3}
          px={4}
          h="56px"
          flexShrink={0}
          borderBottom="0.5px solid"
          borderColor="gray.100"
        >
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
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>
          <Box overflow="hidden">
            <Text
              fontSize="12px"
              fontWeight="500"
              color="gray.900"
              lineHeight="1.2"
              whiteSpace="nowrap"
            >
              Astra Visteon Indonesia
            </Text>
            <Text
              fontSize="10px"
              color="gray.400"
              lineHeight="1.3"
              whiteSpace="nowrap"
            >
              MP
            </Text>
          </Box>
        </Flex>

        {/* Nav items */}
        <Box flex={1} py={3} overflowY="auto" overflowX="hidden">
          <Text
            fontSize="10px"
            fontWeight="500"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
            px={4}
            mb={2}
            whiteSpace="nowrap"
          >
            Menu
          </Text>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Flex
                key={item.path}
                align="center"
                gap={3}
                px={4}
                h="40px"
                mx={2}
                borderRadius="md"
                cursor="pointer"
                bg={isActive ? "brand.50" : "transparent"}
                color={isActive ? "brand.500" : "gray.500"}
                _hover={{
                  bg: isActive ? "brand.50" : "gray.50",
                  color: isActive ? "brand.500" : "gray.700",
                }}
                transition="all 0.15s"
                onClick={() => navigate(item.path)}
                position="relative"
              >
                {isActive && (
                  <Box
                    position="absolute"
                    left={0}
                    top="20%"
                    h="60%"
                    w="3px"
                    bg="brand.500"
                    borderRadius="0 2px 2px 0"
                  />
                )}
                <Box flexShrink={0}>{item.icon}</Box>
                <Text
                  fontSize="13px"
                  fontWeight={isActive ? "500" : "400"}
                  whiteSpace="nowrap"
                >
                  {item.label}
                </Text>
              </Flex>
            );
          })}

          {/* Admin section — hanya tampil untuk admin */}
          {isAdmin && (
            <>
              <Text
                fontSize="10px"
                fontWeight="500"
                color="gray.400"
                textTransform="uppercase"
                letterSpacing="wider"
                px={4}
                mb={2}
                mt={4}
                whiteSpace="nowrap"
              >
                Admin
              </Text>
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Flex
                    key={item.path}
                    align="center"
                    gap={3}
                    px={4}
                    h="40px"
                    mx={2}
                    borderRadius="md"
                    cursor="pointer"
                    bg={isActive ? "brand.50" : "transparent"}
                    color={isActive ? "brand.500" : "gray.500"}
                    _hover={{
                      bg: isActive ? "brand.50" : "gray.50",
                      color: isActive ? "brand.500" : "gray.700",
                    }}
                    transition="all 0.15s"
                    onClick={() => navigate(item.path)}
                    position="relative"
                  >
                    {isActive && (
                      <Box
                        position="absolute"
                        left={0}
                        top="20%"
                        h="60%"
                        w="3px"
                        bg="brand.500"
                        borderRadius="0 2px 2px 0"
                      />
                    )}
                    <Box flexShrink={0}>{item.icon}</Box>
                    <Text
                      fontSize="13px"
                      fontWeight={isActive ? "500" : "400"}
                      whiteSpace="nowrap"
                    >
                      {item.label}
                    </Text>
                  </Flex>
                );
              })}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Sidebar;
