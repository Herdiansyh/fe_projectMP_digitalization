import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Flex, Input, HStack, Grid, Stack } from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPrinter } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import internService from "../../services/internService";
import areaService from "../../services/areaService";
import { toaster } from "../../components/ui/toaster";
import fptkService from "../../services/fptkService";
import type { Intern } from "../../types/intern";
import type { Area } from "../../types/area";
import DeleteModal from "./DeleteModal";
import InternFormModal from "./InternFormModal";
import type { MasterData } from "../../types/fptk";
import InternDetailModal from "./InternDetailModal";
import type { Line } from "../../types/line";
import type { Station } from "../../types/station";
import stationService from "../../services/stationService";
import lineService from "../../services/lineService";

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Main Component ────────────────────────────────────────────────────────────
const NeedEvaluationBadge = () => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 8px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 700,
      color: "#be123c",
      backgroundColor: "#fff1f2",
      border: "1px solid #fecdd3",
      marginTop: "4px",
    }}
  >
    ⚠ Need Evaluation
  </span>
);
const InternList: React.FC = () => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Intern | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Intern | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Intern | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const [printingAll, setPrintingAll] = useState(false);
  const [filterArea, setFilterArea] = useState("");
  const [filterLine, setFilterLine] = useState("");
  const [filterStation, setFilterStation] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  const [filterGroup, setFilterGroup] = useState("");
  const handlePrintAllFiltered = async () => {
    try {
      setPrintingAll(true);
      const res = await internService.getAllInterns({
        search: debouncedSearch || undefined,
        department_id: filterDept ? Number(filterDept) : undefined,
        area_id: filterArea ? Number(filterArea) : undefined,
        line_id: filterLine ? Number(filterLine) : undefined,
        station_id: filterStation ? Number(filterStation) : undefined,
        group: filterGroup || undefined,
      });

      const allFiltered = res.data.data;

      if (!allFiltered || allFiltered.length === 0) {
        toaster.create({ title: "No data to print", type: "warning" });
        return;
      }

      const payload = allFiltered.map((i) => ({
        subject_type: "intern",
        subject_id: i.id,
      }));

      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
      const printUrl =
        API_BASE_URL.replace(/\/api\/?$/, "") + "/print/manpower/bulk";

      const form = document.createElement("form");
      form.method = "POST";
      form.action = printUrl;
      form.target = "_blank";

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "items";
      input.value = JSON.stringify(payload);
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch {
      toaster.create({ title: "Failed to prepare print data", type: "error" });
    } finally {
      setPrintingAll(false);
    }
  };

  const fetchInterns = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const res = await internService.getInterns({
          page,
          per_page: 15,
          search: debouncedSearch || undefined,
          department_id: filterDept ? Number(filterDept) : undefined,
          area_id: filterArea ? Number(filterArea) : undefined,
          line_id: filterLine ? Number(filterLine) : undefined,
          station_id: filterStation ? Number(filterStation) : undefined,
          group: filterGroup || undefined,
        });
        setInterns(res.data.data);
        setTotalPages(res.data.meta.last_page);
        setTotalData(res.data.meta.total);
        setCurrentPage(res.data.meta.current_page);
      } catch {
        toaster.create({ title: "Failed to load intern data", type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [
      debouncedSearch,
      filterDept,
      filterArea,
      filterLine,
      filterStation,
      filterGroup,
    ],
  );
  // Master data (department/section) + Area di-fetch sekali saat halaman
  // dimuat, supaya modal form tidak perlu loading ulang tiap dibuka.
  // Station TIDAK di-fetch di sini — InternFormModal fetch Station-nya
  // sendiri secara dinamis berdasarkan Line yang dipilih (cascade Area -> Line -> Station).
  useEffect(() => {
    void fptkService.getMasterData().then((res) => setMasterData(res.data));
    void areaService
      .getAreas()
      .then((res) => setAreas(res.data))
      .catch(() => setAreas([]));
  }, []);
  useEffect(() => {
    if (!filterArea) {
      setLines([]);
      setFilterLine("");
      setStations([]);
      setFilterStation("");
      return;
    }
    void lineService
      .getLines({ area_id: Number(filterArea) })
      .then((res) => setLines(res.data))
      .catch(() => setLines([]));
    setFilterLine("");
    setStations([]);
    setFilterStation("");
  }, [filterArea]);

  useEffect(() => {
    if (!filterLine) {
      setStations([]);
      setFilterStation("");
      return;
    }
    void stationService
      .getStations({ line_id: Number(filterLine) })
      .then((res) => setStations(res.data))
      .catch(() => setStations([]));
    setFilterStation("");
  }, [filterLine]);
  useEffect(() => {
    void fetchInterns(1);
  }, [fetchInterns]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await internService.deleteIntern(deleteTarget.id);
      toaster.create({ title: "Intern deleted successfully", type: "success" });
      setDeleteTarget(null);
      const targetPage =
        interns.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      void fetchInterns(targetPage);
    } catch {
      toaster.create({ title: "Failed to delete intern", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const thStyle: React.CSSProperties = {
    padding: "10px 16px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "left",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  };

  return (
    <MainLayout>
      <InternFormModal
        isOpen={formOpen}
        editTarget={editTarget}
        masterData={masterData}
        areas={areas}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSaved={() => void fetchInterns(currentPage)}
      />
      <DeleteModal
        isOpen={!!deleteTarget}
        intern={deleteTarget}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <InternDetailModal
        isOpen={!!detailTarget}
        intern={detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      <Box>
        {/* Header */}
        <Flex mb={6} justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Internship Manpower{" "}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {totalData} total registered interns
            </Text>
          </Box>
          <Stack gap={3} direction={{ base: "column", md: "row" }}>
            <Box w={{ base: "100%", md: "auto" }}>
              <Box
                as="button"
                type="button"
                onClick={handlePrintAllFiltered}
                disabled={printingAll || totalData === 0}
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                w="100%"
                gap="8px"
                px="clamp(14px, 3vw, 20px)"
                py="clamp(8px, 2vw, 10px)"
                fontSize="clamp(12px, 2vw, 14px)"
                fontWeight={600}
                borderRadius="8px"
                color={printingAll || totalData === 0 ? "#94a3b8" : "#1A5EA8"}
                bg="#ffffff"
                border="1px solid"
                borderColor={
                  printingAll || totalData === 0 ? "#e2e8f0" : "#1A5EA8"
                }
                cursor={
                  printingAll || totalData === 0 ? "not-allowed" : "pointer"
                }
                whiteSpace="nowrap"
                transition="all 0.2s ease"
                _hover={
                  printingAll || totalData === 0
                    ? {}
                    : {
                        bg: "#f8fafc",
                        transform: "translatey(-1px) scale(1.02)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }
                }
              >
                <FiPrinter size={15} />
                {printingAll ? "Preparing..." : `Print All (${totalData})`}
              </Box>
            </Box>
            <Box w={{ base: "100%", md: "auto" }}>
              <Box
                as="button"
                type="button"
                onClick={() => {
                  setEditTarget(null);
                  setFormOpen(true);
                }}
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                w="100%"
                gap="8px"
                px="clamp(14px, 3vw, 20px)"
                py="clamp(8px, 2vw, 10px)"
                fontSize="clamp(12px, 2vw, 14px)"
                fontWeight={600}
                borderRadius="8px"
                color="#ffffff"
                bg="#1A5EA8"
                border="none"
                cursor="pointer"
                whiteSpace="nowrap"
                transition="all 0.2s ease"
                _hover={{
                  bg: "#3A76B8",
                  transform: "translatey(-1px) scale(1.02)",
                  boxShadow: "0 4px 12px rgba(26,94,168,0.35)",
                }}
              >
                <FiPlus size={15} />
                Add Intern
              </Box>
            </Box>
          </Stack>
        </Flex>

        {/* Filters */}
        <Box
          bg="white"
          borderRadius="12px"
          borderWidth="1px"
          borderColor="gray.100"
          shadow="sm"
          p={4}
          mb={4}
        >
          <Box
            bg="white"
            borderRadius="12px"
            borderWidth="1px"
            borderColor="gray.100"
            shadow="sm"
            p={4}
            mb={4}
          >
            <Grid
              templateColumns={{
                base: "1fr",
                md: "2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
              }}
              gap={3}
            >
              <Box position="relative">
                <Box
                  position="absolute"
                  left="10px"
                  top="50%"
                  style={{ transform: "translateY(-50%)" }}
                >
                  <FiSearch size={14} color="#94a3b8" />
                </Box>
                <Input
                  pl="32px"
                  placeholder="Search NPK or name..."
                  value={search}
                  fontSize="14px"
                  onChange={(e) => setSearch(e.target.value)}
                  bg="#f9fafb"
                  border="1px solid #e2e8f0"
                  borderRadius="8px"
                />
              </Box>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f9fafb",
                  fontSize: "14px",
                  color: "#1a202c",
                }}
              >
                <option value="">All Departments</option>
                {masterData?.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* ── Filter Area ── */}
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f9fafb",
                  fontSize: "14px",
                  color: "#1a202c",
                }}
              >
                <option value="">All Areas</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              {/* ── Filter Line (aktif hanya jika Area dipilih) ── */}
              <select
                value={filterLine}
                onChange={(e) => setFilterLine(e.target.value)}
                disabled={!filterArea}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: filterArea ? "#f9fafb" : "#f1f5f9",
                  fontSize: "14px",
                  color: filterArea ? "#1a202c" : "#94a3b8",
                  cursor: filterArea ? "pointer" : "not-allowed",
                }}
              >
                <option value="">All Lines</option>
                {lines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>

              {/* ── Filter Station (aktif hanya jika Line dipilih) ── */}
              <select
                value={filterStation}
                onChange={(e) => setFilterStation(e.target.value)}
                disabled={!filterLine}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: filterLine ? "#f9fafb" : "#f1f5f9",
                  fontSize: "14px",
                  color: filterLine ? "#1a202c" : "#94a3b8",
                  cursor: filterLine ? "pointer" : "not-allowed",
                }}
              >
                <option value="">All Stations</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f9fafb",
                  fontSize: "14px",
                  color: "#1a202c",
                }}
              >
                <option value="">All Groups</option>
                <option value="A">Group A</option>
                <option value="B">Group B</option>
              </select>
            </Grid>
          </Box>
        </Box>

        {/* Table */}
        <Box
          bg="white"
          borderRadius="12px"
          borderWidth="1px"
          borderColor="gray.100"
          shadow="sm"
          overflow="hidden"
        >
          <Box style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>NPK</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Position</th>
                  <th style={thStyle}>Area / Line</th>
                  <th style={thStyle}>Station</th>
                  <th style={thStyle}>End Internship</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      Loading data...
                    </td>
                  </tr>
                ) : interns.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      No intern data
                    </td>
                  </tr>
                ) : (
                  interns.map((intern) => {
                    const isWarning = !!intern.is_near_expiry;
                    return (
                      <tr
                        key={intern.id}
                        onClick={() => setDetailTarget(intern)}
                        style={{
                          backgroundColor: isWarning ? "#fff5f5" : "white",
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background-color 0.15s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          if (!isWarning)
                            e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isWarning
                            ? "#fff5f5"
                            : "white";
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "13px",
                            color: "#1a202c",
                          }}
                        >
                          {intern.npk}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "14px",
                            color: "#1a202c",
                          }}
                        >
                          <Text fontWeight="500">{intern.name}</Text>
                          {intern.gender && (
                            <Text fontSize="12px" color="gray.400">
                              {intern.gender === "male" ? "Male" : "Female"}
                            </Text>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          <div>{intern.department?.name ?? "-"}</div>
                          {intern.section && (
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                              {intern.section.name}
                            </div>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {intern.jabatan ?? "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {intern.area?.name || "-"}
                          {intern.line?.name && (
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                              {intern.line.name}
                            </div>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {intern.station?.name || "-"}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                          {intern.end_contract ? (
                            <Box>
                              <Text
                                fontWeight={isWarning ? 700 : 400}
                                color={isWarning ? "red.600" : "gray.700"}
                              >
                                {isWarning && "⚠️ "}
                                {formatDate(intern.end_contract)}
                              </Text>
                              {isWarning &&
                                intern.days_until_expiry !== null && (
                                  <>
                                    <Box mt={1}>
                                      <NeedEvaluationBadge />
                                    </Box>
                                  </>
                                )}
                            </Box>
                          ) : (
                            <Text color="gray.400">-</Text>
                          )}
                        </td>
                        <td
                          style={{ padding: "12px 16px", textAlign: "center" }}
                        >
                          <HStack justify="center" gap={2}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTarget(intern);
                                setFormOpen(true);
                              }}
                              style={{
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#1A5EA8",
                                backgroundColor: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                cursor: "pointer",
                              }}
                              title="Edit"
                            >
                              <FiEdit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(intern);
                              }}
                              style={{
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#be123c",
                                backgroundColor: "#fff1f2",
                                border: "1px solid #fecdd3",
                                cursor: "pointer",
                              }}
                              title="Delete"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </HStack>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex
              px={6}
              py={4}
              justify="space-between"
              align="center"
              borderTop="1px solid #f1f5f9"
            >
              <Text fontSize="13px" color="gray.500">
                Page {currentPage} of {totalPages}
              </Text>
              <HStack gap={2}>
                <button
                  type="button"
                  disabled={currentPage === 1 || loading}
                  onClick={() => void fetchInterns(currentPage - 1)}
                  style={{
                    padding: "6px 12px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    color: currentPage === 1 ? "#94a3b8" : "#1A5EA8",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    cursor:
                      currentPage === 1 || loading ? "not-allowed" : "pointer",
                  }}
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages || loading}
                  onClick={() => void fetchInterns(currentPage + 1)}
                  style={{
                    padding: "6px 12px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    color: currentPage === totalPages ? "#94a3b8" : "#1A5EA8",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    cursor:
                      currentPage === totalPages || loading
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Next →
                </button>
              </HStack>
            </Flex>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default InternList;
