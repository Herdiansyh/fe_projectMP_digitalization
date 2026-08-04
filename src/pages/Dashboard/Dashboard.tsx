import type { ReactElement } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiClipboard,
  FiFileText,
  FiLayers,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { usePermission } from "../../hooks/usePermission";
import { useDashboard } from "../../hooks/queries/useDashboardQueries";
import { getVisibleWidgets } from "./dashboardConfig";
import KpiCard from "./widgets/KpiCard";
import ChartCard from "./widgets/ChartCard";
import TrendAreaChart from "./widgets/TrendAreaChart";
import ScoreLineChart from "./widgets/ScoreLineChart";
import StatusDonut, { type DonutSlice } from "./widgets/StatusDonut";
import DepartmentBarChart from "./widgets/DepartmentBarChart";
import { CHART_PALETTE } from "./widgets/chartTheme";

const MODULE_LINKS: { label: string; path: string; key: string }[] = [
  { label: "FPTK", path: "/fptklist", key: "fptk.view_list" },
  { label: "FPTK Pending", path: "/fptk/pending", key: "fptk.approve" },
  { label: "FPTK History", path: "/fptk/history", key: "fptk.view_history" },
  {
    label: "Competency Assessment",
    path: "/competency-assessment",
    key: "competency.assess",
  },
  { label: "QA Review", path: "/qa-review", key: "competency.qa_review" },
  {
    label: "Assessment Monitoring",
    path: "/assessment-monitoring",
    key: "competency.monitor",
  },
  { label: "Evaluations", path: "/evaluations", key: "evaluations.view" },
  { label: "Manpower", path: "/employees", key: "manpower" },
];

interface KpiConfig {
  label: string;
  value: number;
  hint: string;
  icon: ReactElement;
  accent: string;
  tint: string;
  href: string;
}

/** Warna donut per status FPTK, berdasarkan pola nama status. */
function fptkStatusColor(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes("reject")) return CHART_PALETTE.red;
  if (lower.includes("approved")) return CHART_PALETTE.green;
  if (lower.includes("processed") || lower.includes("manpower")) {
    return CHART_PALETTE.cyan;
  }
  if (lower.includes("waiting") || lower.includes("pending")) {
    return CHART_PALETTE.amber;
  }
  return CHART_PALETTE.gray;
}

/** Inisial 1–2 huruf dari nama user (fallback avatar). */
function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Dashboard() {
  const { user } = useAuth();
  const { can } = usePermission();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDashboard();

  const widgets = data?.data.widgets ?? {};
  const visibleWidgets = getVisibleWidgets(can);
  const hasAnyWidget = visibleWidgets.some(
    (widget) => widgets[widget.key] != null,
  );

  const fptk = widgets.fptk_summary;
  const manpower = widgets.manpower_summary;
  const competency = widgets.competency_summary;
  const evaluations = widgets.evaluations_summary;

  const todayLabel = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fptkDonut: DonutSlice[] = fptk
    ? Object.entries(fptk.by_status).map(([status, count]) => ({
        label: status,
        value: count,
        color: fptkStatusColor(status),
      }))
    : [];

  const evaluationsDonut: DonutSlice[] = evaluations
    ? [
        {
          label: "Pending review",
          value: evaluations.in_progress,
          color: CHART_PALETTE.blue,
        },
        {
          label: "Pending HR",
          value: evaluations.pending_hr,
          color: CHART_PALETTE.amber,
        },
        {
          label: "Approved",
          value: evaluations.approved,
          color: CHART_PALETTE.green,
        },
        {
          label: "Rejected",
          value: evaluations.rejected,
          color: CHART_PALETTE.red,
        },
      ]
    : [];

  const kpiCards: KpiConfig[] = [];
  if (fptk) {
    kpiCards.push({
      label: "Permintaan FPTK",
      value: fptk.total,
      hint: "semua status",
      icon: <FiFileText size={20} />,
      accent: CHART_PALETTE.blue,
      tint: "#eff6ff",
      href: "/fptklist",
    });
  }
  if (manpower) {
    kpiCards.push({
      label: "Total Manpower",
      value: manpower.employees + manpower.interns,
      hint: `${manpower.active_employees} karyawan & ${manpower.active_interns} intern aktif`,
      icon: <FiUsers size={20} />,
      accent: CHART_PALETTE.green,
      tint: "#f0fdf4",
      href: "/employees",
    });
  }
  if (competency) {
    kpiCards.push({
      label: "Assessment Disetujui",
      value: competency.total_approved,
      hint: `${competency.pending_qa} menunggu QA`,
      icon: <FiBarChart2 size={20} />,
      accent: CHART_PALETTE.amber,
      tint: "#fffbeb",
      href: "/assessment-monitoring",
    });
  }
  if (evaluations) {
    kpiCards.push({
      label: "Total Evaluasi",
      value: evaluations.total,
      hint: `${evaluations.in_progress} sedang berproses`,
      icon: <FiClipboard size={20} />,
      accent: CHART_PALETTE.purple,
      tint: "#faf5ff",
      href: "/evaluations",
    });
  }

  const accessibleModules = MODULE_LINKS.filter((m) => can(m.key));

  return (
    <MainLayout>
      <Box>
        {/* ── Hero header ───────────────────────────────────────────── */}
        <Box
          borderRadius="20px"
          p={6}
          mb={6}
          color="white"
          bgImage="linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%)"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={-24}
            right={-12}
            w={48}
            h={48}
            borderRadius="full"
            bg="whiteAlpha.200"
          />
          <Box
            position="absolute"
            bottom={-28}
            left={-10}
            w={56}
            h={56}
            borderRadius="full"
            bg="whiteAlpha.100"
          />

          <Flex
            position="relative"
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={4}
          >
            <Flex align="center" gap={3}>
              <Flex
                w="48px"
                h="48px"
                borderRadius="full"
                bg="whiteAlpha.300"
                color="white"
                align="center"
                justify="center"
                fontWeight="700"
                fontSize="md"
                flexShrink={0}
              >
                {getInitials(user?.name)}
              </Flex>
              <Box>
                <Heading as="h1" size="lg" lineHeight={1.2}>
                  Selamat datang, {user?.name ?? "kamu"}
                </Heading>
                <Text fontSize="sm" color="whiteAlpha.800" mt={1}>
                  {user?.role?.name ?? "Role tidak diketahui"}
                  {user?.department?.name ? ` • ${user.department.name}` : ""}
                </Text>
              </Box>
            </Flex>

            <Box textAlign={{ base: "left", lg: "right" }}>
              <Text
                fontSize="xs"
                color="whiteAlpha.700"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Hari ini
              </Text>
              <Text fontSize="lg" fontWeight="700">
                {todayLabel}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* ── Loading skeleton ──────────────────────────────────────── */}
        {isLoading && (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={6}>
              {[0, 1, 2, 3].map((i) => (
                <Box
                  key={i}
                  height="128px"
                  borderRadius="16px"
                  bg="gray.100"
                  animation="pulse 1.5s ease-in-out infinite"
                />
              ))}
            </SimpleGrid>
            <Box
              height="260px"
              borderRadius="16px"
              bg="gray.100"
              animation="pulse 1.5s ease-in-out infinite"
            />
          </>
        )}

        {/* ── Error state ───────────────────────────────────────────── */}
        {!isLoading && isError && (
          <Box
            borderWidth="1px"
            borderColor="red.200"
            bg="red.50"
            borderRadius="16px"
            p={4}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
              <Box>
                <Text fontWeight="700" color="red.700">
                  Gagal memuat dashboard.
                </Text>
                <Text fontSize="sm" color="red.500">
                  Mungkin koneksi bermasalah atau server sibuk.
                </Text>
              </Box>
              <Button size="sm" colorScheme="red" onClick={() => refetch()}>
                Coba lagi
              </Button>
            </Flex>
          </Box>
        )}

        {/* ── Konten dashboard ──────────────────────────────────────── */}
        {!isLoading && !isError && hasAnyWidget && (
          <>
            {kpiCards.length > 0 && (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={6}>
                {kpiCards.map((card) => (
                  <KpiCard key={card.label} {...card} />
                ))}
              </SimpleGrid>
            )}

            {(widgets.fptk_trend || fptk) && (
              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }}
                gap={4}
                mb={6}
              >
                {widgets.fptk_trend && (
                  <ChartCard
                    title="Tren FPTK"
                    subtitle="Jumlah FPTK per bulan — 6 bulan terakhir"
                    icon={<FiTrendingUp size={16} />}
                  >
                    <TrendAreaChart data={widgets.fptk_trend} height={230} />
                  </ChartCard>
                )}

                {fptk && (
                  <ChartCard title="FPTK per Status" icon={<FiLayers size={16} />}>
                    <StatusDonut data={fptkDonut} centerLabel="FPTK" height={165} />
                  </ChartCard>
                )}
              </Box>
            )}

            {(widgets.competency_trend || evaluations) && (
              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr", lg: "2fr 1fr" }}
                gap={4}
                mb={6}
              >
                {widgets.competency_trend && (
                  <ChartCard
                    title="Tren Skor Kompetensi"
                    subtitle="Rata-rata skor assessment disetujui — skala 0-4"
                    icon={<FiTrendingUp size={16} />}
                  >
                    <ScoreLineChart data={widgets.competency_trend} height={230} />
                  </ChartCard>
                )}

                {evaluations && (
                  <ChartCard
                    title="Status Evaluasi"
                    icon={<FiLayers size={16} />}
                  >
                    <StatusDonut
                      data={evaluationsDonut}
                      centerLabel="Evaluasi"
                      height={165}
                    />
                  </ChartCard>
                )}
              </Box>
            )}

            {widgets.manpower_by_department && (
              <ChartCard
                title="Manpower per Departemen"
                subtitle="Karyawan & intern — 8 departemen teratas"
                icon={<FiUsers size={16} />}
                height={280}
              >
                <DepartmentBarChart
                  data={widgets.manpower_by_department}
                  height={280}
                />
              </ChartCard>
            )}
          </>
        )}

        {/* ── Empty state ───────────────────────────────────────────── */}
        {!isLoading && !isError && !hasAnyWidget && (
          <Box
            bg="white"
            borderWidth="1px"
            borderColor="gray.100"
            borderRadius="16px"
            boxShadow="sm"
            p={8}
          >
            <Heading as="h2" fontSize="lg" color="gray.700" mb={2}>
              Belum ada widget dashboard untuk akses kamu
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Pilih menu di bawah untuk memulai, atau hubungi admin untuk
              menyesuaikan permission kamu.
            </Text>
            {accessibleModules.length > 0 ? (
              <HStack gap={2} flexWrap="wrap">
                {accessibleModules.map((module) => (
                  <Button
                    key={module.key}
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => navigate(module.path)}
                  >
                    {module.label}
                  </Button>
                ))}
              </HStack>
            ) : (
              <Text fontSize="sm" color="gray.400">
                Akses kamu belum dikonfigurasi. Silakan hubungi admin.
              </Text>
            )}
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}
