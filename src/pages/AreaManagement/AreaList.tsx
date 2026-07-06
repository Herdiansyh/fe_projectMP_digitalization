import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Flex, Input, HStack } from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import areaService from "../../services/areaService";
import { toaster } from "../../components/ui/toaster";
import type { Area } from "../../types/area";
import AreaFormModal from "./AreaFormModal";
import DeleteAreaModal from "./DeleteAreaModal";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const AreaList: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Area | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchAreas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await areaService.getAreas({
        search: debouncedSearch || undefined,
      });
      setAreas(res.data);
    } catch {
      toaster.create({ title: "Failed to load area data", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    void fetchAreas();
  }, [fetchAreas]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await areaService.deleteArea(deleteTarget.id);
      toaster.create({ title: "Area deleted successfully", type: "success" });
      setDeleteTarget(null);
      void fetchAreas();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toaster.create({
        title: e.response?.data?.message ?? "Failed to delete area",
        type: "error",
      });
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
      <AreaFormModal
        isOpen={formOpen}
        editTarget={editTarget}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSaved={() => void fetchAreas()}
      />
      <DeleteAreaModal
        isOpen={!!deleteTarget}
        area={deleteTarget}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Box>
        {/* Header */}
        <Flex mb={6} justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Area Management
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {areas.length} total registered areas
            </Text>
          </Box>
          <button
            type="button"
            onClick={() => {
              setEditTarget(null);
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
            <FiPlus size={15} /> Add Area
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
              placeholder="Search area name..."
              value={search}
              fontSize="14px"
              onChange={(e) => setSearch(e.target.value)}
              bg="#f9fafb"
              border="1px solid #e2e8f0"
              borderRadius="8px"
            />
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
                  <th style={thStyle}>Area Name</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={2}
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
                ) : areas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      No area data
                    </td>
                  </tr>
                ) : (
                  areas.map((area) => (
                    <tr
                      key={area.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#1a202c",
                        }}
                      >
                        {area.name}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <HStack justify="center" gap={2}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditTarget(area);
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
                            onClick={() => setDeleteTarget(area)}
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
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AreaList;
