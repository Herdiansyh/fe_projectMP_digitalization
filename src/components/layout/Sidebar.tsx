import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
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
const IconStation = () => (
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
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 9h6M9 13h6M9 17h6" />
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

const IconRejected = () => (
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
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
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

const IconEmployee = () => (
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconIntern = () => (
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
    <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" />
    <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
  </svg>
);
const IconArea = () => (
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
    <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
  </svg>
);

const IconLine = () => (
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
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M6 9v6" />
    <path d="M9 6h9a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H9" />
  </svg>
);

const IconMasterData = () => (
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
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

// ── Icon baru: Competency Assessment (Leader) ──
const IconClipboard = () => (
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
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
    <path d="M9 12h6M9 16h6" />
  </svg>
);

// ── Icon baru: Manage Competency Matrix (Admin) ──
const IconLayers = () => (
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
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform 0.15s ease",
      flexShrink: 0,
    }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const approvalNavItems: NavItem[] = [
  { label: "Pending Approvals", path: "/fptk/pending", icon: <IconPending /> },
];

// ── Menu "Data Master" — submenu, hanya untuk is_admin === true ──
const masterDataNavItem: NavItem = {
  label: "Data Master",
  path: "/master-data",
  icon: <IconMasterData />,
  children: [
    { label: "User Management", path: "/users", icon: <IconUsers /> },
    { label: "Area Management", path: "/areas", icon: <IconArea /> },
    { label: "Line Management", path: "/lines", icon: <IconLine /> },
    { label: "Station Management", path: "/stations", icon: <IconStation /> },
    // Rubrik kompetensi juga tergolong "data master" — setup sekali,
    // dipakai berulang oleh modul Competency Assessment.
    {
      label: "Competency Matrix",
      path: "/manage-competency-matrix",
      icon: <IconLayers />,
    },
  ],
};

// ── Boleh diakses is_admin ATAU can_view_manpower ──
const manpowerNavItems: NavItem[] = [
  { label: "Manpower Management", path: "/employees", icon: <IconEmployee /> },
  { label: "Manpower Pemagangan", path: "/interns", icon: <IconIntern /> },
];

interface SidebarProps {
  open: boolean;
}

const SIDEBAR_WIDTH = 220;

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const roleName = user?.role?.name;

  const isApproverRole =
    roleName === "Manager" ||
    roleName === "Division Head" ||
    roleName === "Director";

  const isHrAdmin = roleName === "HR Admin";

  // ── Role "Leader" murni HANYA boleh lihat menu Competency Assessment —
  //    tidak ada menu lain sama sekali (Dashboard, FPTK, section Admin, dsb),
  //    walaupun kebetulan user itu juga is_admin/can_view_manpower true. ──
  const isLeaderRole = roleName === "Leader";

  // ── Dua flag akses terpisah ──
  const isAdmin = user?.is_admin === true;
  const canViewManpower = user?.can_view_manpower === true;

  // Dipakai untuk kondisi "apakah user punya area" — tetap dipertahankan
  // untuk kasus role lain (mis. Supervisor) yang di-assign area_id.
  const isLeader = !!user?.area_id;

  // Section "Admin" di sidebar tampil kalau salah satu benar — role Leader
  // murni SELALU disembunyikan dari section ini, apa pun flag lainnya.
  const showAdminSection = !isLeaderRole && (isAdmin || canViewManpower);

  // Item yang benar-benar ditampilkan di section Admin,
  // digabung sesuai hak masing-masing user
  const visibleAdminSectionItems: NavItem[] = [
    ...(isAdmin ? [masterDataNavItem] : []), // Data Master (User/Area/Line/Station/Competency Matrix) → wajib is_admin
    ...(isAdmin || canViewManpower ? manpowerNavItems : []), // Manpower → admin ATAU permission khusus
  ];

  // ── Kalau role-nya "Leader", short-circuit total: cuma satu menu ini,
  //    tidak digabung dengan menu lain sama sekali. ──
  const navItems: NavItem[] = isLeaderRole
    ? [
        { label: "Dashboard", path: "/dashboard", icon: <IconDashboard /> },

        {
          label: "Competency Assessment",
          path: "/competency-assessment",
          icon: <IconClipboard />,
        },
      ]
    : [
        { label: "Dashboard", path: "/dashboard", icon: <IconDashboard /> },
        // "On Progress FPTK" hanya untuk non-approver dan non-HR Admin
        ...(!isApproverRole && !isHrAdmin
          ? [
              {
                label: "On Progress FPTK",
                path: "/fptklist",
                icon: <IconFPTK />,
              },
            ]
          : []),
        // "Approved FPTK" tampil untuk semua kecuali approver murni
        ...(!isApproverRole
          ? [
              {
                label: "Approved FPTK",
                path: "/fptk/approved",
                icon: <IconApproved />,
              },
            ]
          : []),
        // "Rejected FPTK" hanya untuk non-approver dan non-HR Admin
        ...(!isApproverRole && !isHrAdmin
          ? [
              {
                label: "Rejected FPTK",
                path: "/fptk/rejected",
                icon: <IconRejected />,
              },
            ]
          : []),
        // Pending Approvals & History hanya untuk approver roles
        ...(isApproverRole ? approvalNavItems : []),
        ...(isApproverRole
          ? [
              {
                label: "FPTK History",
                path: "/fptk/history",
                icon: <IconHistory />,
              },
            ]
          : []),
        // Competency Assessment — untuk siapa pun yang punya area_id
        // (di luar role Leader murni yang sudah ditangani short-circuit di atas,
        // misal Supervisor yang di-assign area tapi role-nya bukan "Leader")
        ...(isLeader
          ? [
              {
                label: "Competency Assessment",
                path: "/competency-assessment",
                icon: <IconClipboard />,
              },
            ]
          : []),
      ];

  // Submenu otomatis terbuka kalau salah satu child-nya sedang aktif
  const isChildActive = (item: NavItem) =>
    !!item.children?.some((c) => c.path === location.pathname);

  // Menyimpan preferensi buka/tutup yang di-klik manual oleh user (override
  // eksplisit). Kalau belum pernah di-klik untuk path tertentu, statusnya
  // jatuh balik ke auto-open berdasarkan halaman aktif. Semua dihitung
  // langsung saat render (derived state) — tanpa useEffect + setState.
  const [manualOverride, setManualOverride] = useState<Record<string, boolean>>(
    {},
  );

  const isMenuOpen = (item: NavItem) => {
    const override = manualOverride[item.path];
    if (override !== undefined) return override;
    return isChildActive(item);
  };

  const toggleMenu = (item: NavItem) => {
    setManualOverride((prev) => ({
      ...prev,
      [item.path]: !isMenuOpen(item),
    }));
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = !!item.children && item.children.length > 0;
    const isActive = location.pathname === item.path;
    const isOpenMenu = hasChildren ? isMenuOpen(item) : false;
    const parentHighlighted = hasChildren && isChildActive(item) && !isOpenMenu;

    return (
      <Box key={item.path}>
        <Flex
          align="center"
          gap={3}
          px={4}
          pl={depth > 0 ? 8 : 4}
          h="40px"
          mx={2}
          borderRadius="md"
          cursor="pointer"
          bg={isActive || parentHighlighted ? "brand.50" : "transparent"}
          color={isActive || parentHighlighted ? "brand.500" : "gray.500"}
          _hover={{
            bg: isActive || parentHighlighted ? "brand.50" : "gray.50",
            color: isActive || parentHighlighted ? "brand.500" : "gray.700",
          }}
          transition="all 0.15s"
          onClick={() => (hasChildren ? toggleMenu(item) : navigate(item.path))}
          position="relative"
        >
          {(isActive || (hasChildren && parentHighlighted)) && (
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
            flex={1}
          >
            {item.label}
          </Text>
          {hasChildren && <IconChevron open={isOpenMenu} />}
        </Flex>

        {hasChildren && isOpenMenu && (
          <Box>
            {item.children!.map((child) => renderNavItem(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
  };

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

          {navItems.map((item) => renderNavItem(item))}

          {/* Admin section — tampil untuk is_admin ATAU can_view_manpower,
              KECUALI role Leader murni (selalu disembunyikan).
              Isi barisnya berbeda tergantung hak masing-masing:
              - Data Master (User/Area/Line/Station/Competency Matrix) HANYA untuk is_admin === true
              - Manpower Management/Pemagangan untuk is_admin ATAU can_view_manpower === true */}
          {showAdminSection && (
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
              {visibleAdminSectionItems.map((item) => renderNavItem(item))}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Sidebar;
