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
import lineService from "../../services/lineService";
import areaService from "../../services/areaService";
import { toaster } from "../../components/ui/toaster";
import type { Line } from "../../types/line";
import type { Area } from "../../types/area";
import LineFormModal from "./LineFormModal";
import DeleteLineModal from "./DeleteLineModal";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const LineList: React.FC = () => {
  const [lines, setLines] = useState<Line[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Line | null>(null);
  const [formDefaultAreaId, setFormDefaultAreaId] = useState<number | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Line | null>(null);
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
      setLoading(true);
      const res = await lineService.getLines({
        search: debouncedSearch || undefined,
      });
      setLines(res.data);
    } catch {
      toaster.create({ title: "Failed to load line data", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    void fetchAreas();
  }, [fetchAreas]);

  useEffect(() => {
    void fetchLines();
  }, [fetchLines]);

  // Kelompokkan lines per area — area tanpa line pun tetap tampil (grup kosong)
  const grouped = useMemo(() => {
    const map = new Map<number, { area: Area; lines: Line[] }>();
    areas.forEach((a) => map.set(a.id, { area: a, lines: [] }));
    lines.forEach((l) => {
      if (!map.has(l.area_id) && l.area) {
        map.set(l.area_id, { area: l.area, lines: [] });
      }
      map.get(l.area_id)?.lines.push(l);
    });
    return Array.from(map.values()).sort((a, b) =>
      a.area.name.localeCompare(b.area.name),
    );
  }, [areas, lines]);

  // Auto-expand semua grup saat sedang mencari, supaya hasil pencarian terlihat
  useEffect(() => {
    if (debouncedSearch) {
      const allExpanded: Record<number, boolean> = {};
      grouped.forEach((g) => (allExpanded[g.area.id] = true));
      setExpanded(allExpanded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, lines]);

  const toggleExpand = (areaId: number) => {
    setExpanded((prev) => ({ ...prev, [areaId]: !prev[areaId] }));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await lineService.deleteLine(deleteTarget.id);
      toaster.create({ title: "Line deleted successfully", type: "success" });
      setDeleteTarget(null);
      void fetchLines();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toaster.create({
        title: e.response?.data?.message ?? "Failed to delete line",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout>
      <LineFormModal
        isOpen={formOpen}
        editTarget={editTarget}
        areas={areas}
        defaultAreaId={formDefaultAreaId}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
          setFormDefaultAreaId(null);
        }}
        onSaved={() => void fetchLines()}
      />
      <DeleteLineModal
        isOpen={!!deleteTarget}
        line={deleteTarget}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Box>
        {/* Header */}
        <Flex mb={6} justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Line Management
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {lines.length} total registered lines across {areas.length} areas
            </Text>
          </Box>
          <button
            type="button"
            onClick={() => {
              setEditTarget(null);
              setFormDefaultAreaId(null);
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
            <FiPlus size={15} /> Add Line
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
              placeholder="Search line name..."
              value={search}
              fontSize="14px"
              onChange={(e) => setSearch(e.target.value)}
              bg="#f9fafb"
              border="1px solid #e2e8f0"
              borderRadius="8px"
            />
          </Box>
        </Box>

        {/* Accordion per Area */}
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
              No area data available. Please create an Area first.
            </Text>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={3}>
            {grouped.map(({ area, lines: areaLines }) => {
              const isOpen = !!expanded[area.id];
              return (
                <Box
                  key={area.id}
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
                    onClick={() => toggleExpand(area.id)}
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
                        {area.name}
                      </Text>
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
                        {areaLines.length} lines
                      </span>
                    </Flex>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTarget(null);
                        setFormDefaultAreaId(area.id);
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
                      <FiPlus size={12} /> Add Line
                    </button>
                  </Flex>

                  {/* Accordion body */}
                  {isOpen && (
                    <Box borderTop="1px solid" borderColor="gray.100">
                      {areaLines.length === 0 ? (
                        <Text fontSize="13px" color="gray.400" px={5} py={4}>
                          No lines yet in this area.
                        </Text>
                      ) : (
                        <table
                          style={{ width: "100%", borderCollapse: "collapse" }}
                        >
                          <tbody>
                            {areaLines.map((line) => (
                              <tr
                                key={line.id}
                                style={{ borderBottom: "1px solid #f1f5f9" }}
                              >
                                <td
                                  style={{
                                    padding: "10px 20px 10px 44px",
                                    fontSize: "13.5px",
                                    color: "#334155",
                                  }}
                                >
                                  {line.name}
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
                                        setEditTarget(line);
                                        setFormDefaultAreaId(null);
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
                                      onClick={() => setDeleteTarget(line)}
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

export default LineList;
