import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Text, Flex, Input, HStack, Grid, Stack } from "@chakra-ui/react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiPrinter,
  FiChevronDown,
  FiMapPin,
} from "react-icons/fi";
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

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handlerRef.current();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref]);
}

// ── Badge ─────────────────────────────────────────────────────────────────────

const Badge = ({
  children,
  color,
  bg,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: 500,
      color,
      backgroundColor: bg,
      letterSpacing: "0.01em",
    }}
  >
    {children}
  </span>
);

const NeedEvaluationBadge = () => (
  <Badge color="#be123c" bg="#fff1f2">
    ⚠ Need Evaluation
  </Badge>
);

const OutcomeBadge: React.FC<{ intern: Intern }> = ({ intern }) => {
  if (intern.outcome_status === "converted") {
    return (
      <Badge color="#15803d" bg="#f0fdf4">
        ✓ Naik Kontrak
      </Badge>
    );
  }
  if (intern.outcome_status === "ended") {
    return (
      <Badge color="#475569" bg="#f1f5f9">
        ✕ Selesai / Tidak Dilanjutkan
      </Badge>
    );
  }
  return null;
};

// ── Cascading Location Filter Component ───────────────────────────────────────

interface LocationFilterProps {
  areas: Area[];
  lines: Line[];
  stations: Station[];
  filterArea: string;
  filterLine: string;
  filterStation: string;
  onChangeArea: (v: string) => void;
  onChangeLine: (v: string) => void;
  onChangeStation: (v: string) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({
  areas,
  lines,
  stations,
  filterArea,
  filterLine,
  filterStation,
  onChangeArea,
  onChangeLine,
  onChangeStation,
}) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  useClickOutside(panelRef, () => setOpen(false));

  const activeCount = [filterArea, filterLine, filterStation].filter(
    Boolean,
  ).length;

  return (
    <Box position="relative" ref={panelRef}>
      <Box
        as="button"
        onClick={() => setOpen(!open)}
        display="inline-flex"
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        gap="6px"
        px="12px"
        py="8px"
        fontSize="13px"
        fontWeight={activeCount > 0 ? 600 : 400}
        borderRadius="8px"
        color={activeCount > 0 ? "#1A5EA8" : "#334155"}
        bg={activeCount > 0 ? "#eff6ff" : "#f9fafb"}
        border="1px solid"
        borderColor={activeCount > 0 ? "#1A5EA8" : "#e2e8f0"}
        cursor="pointer"
        whiteSpace="nowrap"
        transition="all 0.15s"
        _hover={{
          borderColor: "#1A5EA8",
          color: "#1A5EA8",
          bg: "#eff6ff",
        }}
      >
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <FiMapPin size={13} />
          Area
          {activeCount > 0 && (
            <span
              style={{
                background: "#1A5EA8",
                color: "white",
                fontSize: "11px",
                padding: "1px 6px",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              {activeCount}
            </span>
          )}
        </span>
        <FiChevronDown
          size={14}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            color: activeCount > 0 ? "#1A5EA8" : "#94a3b8",
          }}
        />
      </Box>

      {open && (
        <Box
          position="absolute"
          top="calc(100% + 6px)"
          right={0}
          minW="260px"
          bg="white"
          borderRadius="10px"
          border="1px solid #e2e8f0"
          boxShadow="0 10px 25px rgba(0,0,0,0.1)"
          p="14px"
          zIndex={50}
        >
          <Text
            fontSize="11px"
            fontWeight={600}
            color="#64748b"
            textTransform="uppercase"
            letterSpacing="0.04em"
            mb="6px"
          >
            Area
          </Text>
          <select
            value={filterArea}
            onChange={(e) => onChangeArea(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f9fafb",
              fontSize: "13px",
              color: "#334155",
              marginBottom: "10px",
            }}
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <Text
            fontSize="11px"
            fontWeight={600}
            color="#64748b"
            textTransform="uppercase"
            letterSpacing="0.04em"
            mb="6px"
          >
            Line
          </Text>
          <select
            value={filterLine}
            onChange={(e) => onChangeLine(e.target.value)}
            disabled={!filterArea}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              backgroundColor: filterArea ? "#f9fafb" : "#f1f5f9",
              fontSize: "13px",
              color: filterArea ? "#334155" : "#94a3b8",
              cursor: filterArea ? "pointer" : "not-allowed",
              marginBottom: "10px",
            }}
          >
            <option value="">All Lines</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <Text
            fontSize="11px"
            fontWeight={600}
            color="#64748b"
            textTransform="uppercase"
            letterSpacing="0.04em"
            mb="6px"
          >
            Station
          </Text>
          <select
            value={filterStation}
            onChange={(e) => onChangeStation(e.target.value)}
            disabled={!filterLine}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              backgroundColor: filterLine ? "#f9fafb" : "#f1f5f9",
              fontSize: "13px",
              color: filterLine ? "#334155" : "#94a3b8",
              cursor: filterLine ? "pointer" : "not-allowed",
              marginBottom: "4px",
            }}
          >
            <option value="">All Stations</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <Flex
            justify="space-between"
            mt="12px"
            pt="10px"
            borderTop="1px solid #f1f5f9"
          >
            <Box
              as="button"
              onClick={() => {
                onChangeArea("");
                onChangeLine("");
                onChangeStation("");
              }}
              fontSize="12px"
              fontWeight={500}
              color="#64748b"
              bg="transparent"
              border="none"
              cursor="pointer"
              px="4px"
              _hover={{ color: "#dc2626" }}
            >
              Reset
            </Box>
            <Box
              as="button"
              onClick={() => setOpen(false)}
              fontSize="12px"
              fontWeight={500}
              color="white"
              bg="#1A5EA8"
              border="none"
              cursor="pointer"
              px="14px"
              py="5px"
              borderRadius="6px"
              _hover={{ bg: "#3A76B8" }}
            >
              Apply
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

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
        sort_by: "created_at",
        sort_order: "desc",
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
          sort_by: "created_at",
          sort_order: "desc",
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
    padding: "12px 16px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    textAlign: "left",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  };

  const tdBase: React.CSSProperties = {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top",
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
              Internship Manpower
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {totalData} total registered interns
            </Text>
          </Box>
          <Stack gap={3} direction={{ base: "column", md: "row" }}>
            <Box w={{ base: "100%", md: "auto" }}>
              <Box
                as="button"
                onClick={
                  printingAll || totalData === 0
                    ? undefined
                    : handlePrintAllFiltered
                }
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
                        transform: "translateY(-1px) scale(1.05)",
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
                  transform: "translateY(-1px) scale(1.05)",
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
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "1fr 1fr",
              md: "2fr 1fr 1fr 1fr 1fr auto",
            }}
            gap={3}
            alignItems="center"
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
                color: "#334155",
                width: "100%",
              }}
            >
              <option value="">All Departments</option>
              {masterData?.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
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
                color: "#334155",
                width: "100%",
              }}
            >
              <option value="">All Groups</option>
              <option value="A">Group A</option>
              <option value="B">Group B</option>
            </select>

            <LocationFilter
              areas={areas}
              lines={lines}
              stations={stations}
              filterArea={filterArea}
              filterLine={filterLine}
              filterStation={filterStation}
              onChangeArea={setFilterArea}
              onChangeLine={setFilterLine}
              onChangeStation={setFilterStation}
            />
          </Grid>
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "inherit",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{ ...thStyle, width: "48px", textAlign: "center" }}
                  >
                    No.
                  </th>
                  <th style={thStyle}>NPK</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Position</th>
                  <th style={thStyle}>Area / Line</th>
                  <th style={thStyle}>Station</th>
                  <th style={{ ...thStyle, width: "130px" }}>End Internship</th>
                  <th
                    style={{ ...thStyle, width: "90px", textAlign: "center" }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: "48px",
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
                      colSpan={9}
                      style={{
                        padding: "48px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      No intern data
                    </td>
                  </tr>
                ) : (
                  interns.map((intern, idx) => {
                    const isWarning = !!intern.is_near_expiry;
                    const isProcessed = intern.outcome_status !== "active";
                    const rowBg = isProcessed
                      ? "#f8fafc"
                      : isWarning
                        ? "#fef2f2"
                        : "white";
                    const rowNumber = (currentPage - 1) * 15 + idx + 1;

                    return (
                      <tr
                        key={intern.id}
                        onClick={() => setDetailTarget(intern)}
                        style={{
                          backgroundColor: rowBg,
                          transition: "background-color 0.15s ease",
                          cursor: "pointer",
                          opacity: isProcessed ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isProcessed && !isWarning)
                            e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdBase,
                            textAlign: "center",
                            color: "#94a3b8",
                            fontWeight: 500,
                          }}
                        >
                          {rowNumber}
                        </td>
                        <td
                          style={{
                            ...tdBase,
                            fontWeight: 500,
                            color: "#1e293b",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {intern.npk}
                        </td>
                        <td style={tdBase}>
                          <Text
                            fontWeight="500"
                            color="#1e293b"
                            fontSize="13px"
                          >
                            {intern.name}
                          </Text>
                          {intern.gender && (
                            <Text fontSize="12px" color="#94a3b8" mt="2px">
                              {intern.gender === "male" ? "Male" : "Female"}
                            </Text>
                          )}
                          {isProcessed && (
                            <Box mt="4px">
                              <OutcomeBadge intern={intern} />
                            </Box>
                          )}
                        </td>
                        <td style={tdBase}>
                          <Text fontSize="13px" color="#334155">
                            {intern.department?.name ?? "-"}
                          </Text>
                          {intern.section && (
                            <Text fontSize="12px" color="#94a3b8" mt="2px">
                              {intern.section.name}
                            </Text>
                          )}
                        </td>
                        <td style={{ ...tdBase, color: "#475569" }}>
                          {intern.jabatan ?? "-"}
                        </td>
                        <td style={tdBase}>
                          <Text fontSize="13px" color="#334155">
                            {intern.area?.name || "-"}
                          </Text>
                          {intern.line?.name && (
                            <Text fontSize="12px" color="#94a3b8" mt="2px">
                              {intern.line.name}
                            </Text>
                          )}
                        </td>
                        <td style={{ ...tdBase, color: "#475569" }}>
                          {intern.station?.name || "-"}
                        </td>
                        <td style={{ ...tdBase, whiteSpace: "nowrap" }}>
                          {intern.end_contract ? (
                            <Box>
                              <Text
                                fontWeight={isWarning ? 600 : 400}
                                color={isWarning ? "#dc2626" : "#334155"}
                                fontSize="13px"
                              >
                                {isWarning && "⚠ "}
                                {formatDate(intern.end_contract)}
                              </Text>
                              {!isProcessed &&
                                isWarning &&
                                intern.days_until_expiry !== null && (
                                  <Box mt="4px">
                                    <NeedEvaluationBadge />
                                  </Box>
                                )}
                            </Box>
                          ) : (
                            <Text color="#94a3b8" fontSize="13px">
                              -
                            </Text>
                          )}
                        </td>
                        <td style={{ ...tdBase, textAlign: "center" }}>
                          <HStack justify="center" gap={2}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTarget(intern);
                                setFormOpen(true);
                              }}
                              style={{
                                width: "30px",
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#2563eb",
                                backgroundColor: "#eff6ff",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#dbeafe";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#eff6ff";
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
                                width: "30px",
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#dc2626",
                                backgroundColor: "#fef2f2",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#fee2e2";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#fef2f2";
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
                    padding: "6px 14px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    color: currentPage === 1 ? "#94a3b8" : "#334155",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    cursor:
                      currentPage === 1 || loading ? "not-allowed" : "pointer",
                    fontWeight: 500,
                  }}
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages || loading}
                  onClick={() => void fetchInterns(currentPage + 1)}
                  style={{
                    padding: "6px 14px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    color: currentPage === totalPages ? "#94a3b8" : "#334155",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    cursor:
                      currentPage === totalPages || loading
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: 500,
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
