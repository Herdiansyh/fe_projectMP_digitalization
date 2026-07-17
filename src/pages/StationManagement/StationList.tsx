import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Text, Flex, Input, HStack } from "@chakra-ui/react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import stationService from "../../services/stationService";
import lineService from "../../services/lineService";
import areaService from "../../services/areaService";
import { toaster } from "../../components/ui/toaster";
import type { Station } from "../../types/station";
import type { Line } from "../../types/line";
import type { Area } from "../../types/area";
import StationFormModal from "./StationFormModal";
import DeleteStationModal from "./DeleteStationModal";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const StationList: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Station | null>(null);
  const [formDefaultLineId, setFormDefaultLineId] = useState<number | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Station | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchAreas = useCallback(async () => {
    try {
      const res = await areaService.getAreas();
      setAreas(res.data);
    } catch {
      toaster.create({ title: "Failed to load area data", type: "error" });
    }
  }, []);

  const fetchLines = useCallback(async () => {
    try {
      const res = await lineService.getLines();
      setLines(res.data);
    } catch {
      toaster.create({ title: "Failed to load line data", type: "error" });
    }
  }, []);

  const fetchStations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await stationService.getStations({
        search: debouncedSearch || undefined,
      });
      setStations(res.data);
    } catch {
      toaster.create({ title: "Failed to load station data", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    void fetchAreas();
    void fetchLines();
  }, [fetchAreas, fetchLines]);

  useEffect(() => {
    void fetchStations();
  }, [fetchStations]);

  // Kelompokkan stations per line — line tanpa station pun tetap tampil
  const grouped = useMemo(() => {
    const map = new Map<number, { line: Line; stations: Station[] }>();
    lines.forEach((l) => map.set(Number(l.id), { line: l, stations: [] }));
    stations.forEach((s) => {
      const lineId = Number(s.line_id); // ← normalisasi ke number
      if (!map.has(lineId) && s.line) {
        map.set(lineId, { line: s.line, stations: [] });
      }
      map.get(lineId)?.stations.push(s);
    });
    return Array.from(map.values()).sort((a, b) =>
      a.line.name.localeCompare(b.line.name),
    );
  }, [lines, stations]);
  // Auto-expand semua grup saat sedang mencari
  useEffect(() => {
    if (debouncedSearch) {
      const allExpanded: Record<number, boolean> = {};
      grouped.forEach((g) => (allExpanded[g.line.id] = true));
      setExpanded(allExpanded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, stations]);

  const toggleExpand = (lineId: number) => {
    setExpanded((prev) => ({
      ...prev,
      [Number(lineId)]: !prev[Number(lineId)],
    }));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await stationService.deleteStation(deleteTarget.id);
      toaster.create({
        title: "Station deleted successfully",
        type: "success",
      });
      setDeleteTarget(null);
      void fetchStations();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toaster.create({
        title: e.response?.data?.message ?? "Failed to delete station",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout>
      <StationFormModal
        isOpen={formOpen}
        editTarget={editTarget}
        areas={areas}
        lines={lines}
        defaultLineId={formDefaultLineId}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
          setFormDefaultLineId(null);
        }}
        onSaved={() => void fetchStations()}
      />
      <DeleteStationModal
        isOpen={!!deleteTarget}
        station={deleteTarget}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Box>
        {/* Header */}
        <Flex mb={6} justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Station Management
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {stations.length} total registered stations across {lines.length}{" "}
              lines
            </Text>
          </Box>
          <button
            type="button"
            onClick={() => {
              setEditTarget(null);
              setFormDefaultLineId(null);
              setFormOpen(true);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 600,
              borderRadius: "8px",
              color: "#ffffff",
              backgroundColor: "#1A5EA8",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#154d8c")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#1A5EA8")
            }
          >
            <FiPlus size={15} /> Add Station
          </button>
        </Flex>

        {/* Search */}
        <Box
          bg="white"
          borderRadius="12px"
          borderWidth="1px"
          borderColor="gray.100"
          shadow="sm"
          p={4}
          mb={4}
        >
          <Box position="relative" maxW="320px">
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
              placeholder="Search station name..."
              value={search}
              fontSize="14px"
              onChange={(e) => setSearch(e.target.value)}
              bg="#f9fafb"
              border="1px solid #e2e8f0"
              borderRadius="8px"
            />
          </Box>
        </Box>

        {/* Accordion per Line */}
        {loading ? (
          <Box
            bg="white"
            borderRadius="12px"
            borderWidth="1px"
            borderColor="gray.100"
            shadow="sm"
            p={10}
            textAlign="center"
          >
            <Text color="gray.400" fontSize="14px">
              Loading data...
            </Text>
          </Box>
        ) : grouped.length === 0 ? (
          <Box
            bg="white"
            borderRadius="12px"
            borderWidth="1px"
            borderColor="gray.100"
            shadow="sm"
            p={10}
            textAlign="center"
          >
            <Text color="gray.400" fontSize="14px">
              No line data available. Please create a Line first.
            </Text>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={3}>
            {grouped.map(({ line, stations: lineStations }) => {
              const isOpen = !!expanded[line.id];
              return (
                <Box
                  key={line.id}
                  bg="white"
                  borderRadius="12px"
                  borderWidth="1px"
                  borderColor="gray.100"
                  shadow="sm"
                  overflow="hidden"
                >
                  {/* Accordion header */}
                  <Flex
                    align="center"
                    justify="space-between"
                    px={5}
                    py={3.5}
                    cursor="pointer"
                    onClick={() => toggleExpand(line.id)}
                    _hover={{ bg: "gray.50" }}
                  >
                    <Flex align="center" gap={2}>
                      <Box color="gray.400">
                        {isOpen ? (
                          <FiChevronDown size={16} />
                        ) : (
                          <FiChevronRight size={16} />
                        )}
                      </Box>
                      <Text fontWeight="600" fontSize="14px" color="gray.800">
                        {line.name}
                      </Text>
                      {line.area?.name && (
                        <Text fontSize="12px" color="gray.400">
                          ({line.area.name})
                        </Text>
                      )}
                      <span
                        style={{
                          backgroundColor: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
                          borderRadius: "999px",
                          padding: "1px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {lineStations.length} stations
                      </span>
                    </Flex>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTarget(null);
                        setFormDefaultLineId(line.id);
                        setFormOpen(true);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "6px",
                        color: "#1A5EA8",
                        backgroundColor: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        cursor: "pointer",
                      }}
                    >
                      <FiPlus size={12} /> Add Station
                    </button>
                  </Flex>

                  {/* Accordion body */}
                  {isOpen && (
                    <Box borderTop="1px solid" borderColor="gray.100">
                      {lineStations.length === 0 ? (
                        <Text fontSize="13px" color="gray.400" px={5} py={4}>
                          No stations yet in this line.
                        </Text>
                      ) : (
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <tbody>
                            {lineStations.map((station) => (
                              <tr
                                key={station.id}
                                style={{ borderBottom: "1px solid #f1f5f9" }}
                              >
                                <td
                                  style={{
                                    padding: "10px 20px 10px 44px",
                                    fontSize: "13.5px",
                                    color: "#334155",
                                  }}
                                >
                                  {station.name}
                                </td>
                                <td
                                  style={{
                                    padding: "10px 20px",
                                    textAlign: "right",
                                    width: "90px",
                                  }}
                                >
                                  <HStack justify="flex-end" gap={2}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditTarget(station);
                                        setFormDefaultLineId(null);
                                        setFormOpen(true);
                                      }}
                                      style={{
                                        width: "28px",
                                        height: "28px",
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
                                      <FiEdit2 size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteTarget(station)}
                                      style={{
                                        width: "28px",
                                        height: "28px",
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
                                      <FiTrash2 size={12} />
                                    </button>
                                  </HStack>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default StationList;
