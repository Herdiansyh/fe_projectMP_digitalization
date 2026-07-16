import React, { useState, useMemo } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import {
  FiTrash2,
  FiEdit2,
  FiChevronDown,
  FiChevronRight,
  FiGrid,
  FiList,
} from "react-icons/fi";

import { inputStyle, smallBtn } from "./shared/styles";
import CategoryBlock from "./CategoryBlock";
import AddCategoryForm from "./AddCategoryForm";
import type { CompetencyMatrix } from "../types/competency";
import type { Station } from "../types/station";
import type { Line } from "../types/line";
import type { Area } from "../types/area";
import matrixManagementService from "../services/matrixManagementService";
import CompetencyMatrixGrid from "./competency/CompetencyMatrixGrid";
import ConfirmDialog from "./common/ConfirmDialog";

interface MatrixCardProps {
  matrix: CompetencyMatrix;
  areas: Area[];
  lines: Line[];
  stations: Station[];
  onRefresh: () => void;
}

// ── Card: satu matrix, expandable, berisi kategori ──
const MatrixCard: React.FC<MatrixCardProps> = ({
  matrix,
  areas,
  lines,
  stations,
  onRefresh,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editName, setEditName] = useState(matrix.name);

  // Station saat ini yang dipakai matrix (untuk tahu line & area awal)
  const currentStation = useMemo(
    () => stations.find((s) => Number(s.id) === Number(matrix.station?.id)),
    [stations, matrix.station?.id],
  );
  const currentLine = useMemo(
    () => lines.find((l) => Number(l.id) === Number(currentStation?.line_id)),
    [lines, currentStation],
  );

  const [editAreaId, setEditAreaId] = useState<number | "">(
    currentLine?.area_id ?? "",
  );
  const [editLineId, setEditLineId] = useState<number | "">(
    currentStation?.line_id ?? "",
  );
  const [editStationId, setEditStationId] = useState<number | "">(
    matrix.station?.id ?? "",
  );
  const [savingHeader, setSavingHeader] = useState(false);

  // Line difilter berdasarkan Area yang sedang diedit
  const filteredEditLines = useMemo(() => {
    if (!editAreaId) return [];
    return lines.filter((l) => Number(l.area_id) === Number(editAreaId));
  }, [lines, editAreaId]);

  // Station difilter berdasarkan Line yang sedang diedit
  const filteredEditStations = useMemo(() => {
    if (!editLineId) return [];
    return stations.filter((s) => Number(s.line_id) === Number(editLineId));
  }, [stations, editLineId]);

  const handleEditAreaChange = (value: number | "") => {
    setEditAreaId(value);
    setEditLineId("");
    setEditStationId("");
  };

  const handleEditLineChange = (value: number | "") => {
    setEditLineId(value);
    setEditStationId("");
  };

  const handleAddCategory = async (name: string) => {
    await matrixManagementService.createCategory(matrix.id, { name });
    onRefresh();
  };

  const handleToggleActive = async () => {
    try {
      await matrixManagementService.updateMatrix(matrix.id, {
        is_active: !matrix.is_active,
      });
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "Failed to update matrix.");
    }
  };

  const handleSaveHeader = async () => {
    if (!editName.trim() || !editStationId) return;
    setSavingHeader(true);
    try {
      await matrixManagementService.updateMatrix(matrix.id, {
        name: editName.trim(),
        station_id: Number(editStationId),
      });
      setIsEditingHeader(false);
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "Failed to update matrix.");
    } finally {
      setSavingHeader(false);
    }
  };

  const handleCancelHeader = () => {
    setEditName(matrix.name);
    setEditAreaId(currentLine?.area_id ?? "");
    setEditLineId(currentStation?.line_id ?? "");
    setEditStationId(matrix.station?.id ?? "");
    setIsEditingHeader(false);
  };

  const handleDeleteMatrix = async () => {
    setDeleting(true);
    try {
      await matrixManagementService.deleteMatrix(matrix.id);
      setConfirmDeleteOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "Failed to delete matrix.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.100"
      borderRadius="12px"
      shadow="sm"
      mb={4}
      overflow="hidden"
    >
      <Flex
        justify="space-between"
        align="center"
        px={5}
        py={4}
        cursor={isEditingHeader ? "default" : "pointer"}
        onClick={() => !isEditingHeader && setExpanded((v) => !v)}
      >
        <HStack
          gap={3}
          flex={1}
          onClick={(e) => isEditingHeader && e.stopPropagation()}
        >
          {expanded ? (
            <FiChevronDown size={16} />
          ) : (
            <FiChevronRight size={16} />
          )}

          {isEditingHeader ? (
            <HStack gap={2} flex={1} wrap="wrap">
              <input
                style={{ ...inputStyle, minWidth: "200px" }}
                value={editName}
                autoFocus
                onChange={(e) => setEditName(e.target.value)}
              />
              <select
                style={{ ...inputStyle, minWidth: "140px" }}
                value={editAreaId}
                onChange={(e) =>
                  handleEditAreaChange(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              >
                <option value="">Select area</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <select
                style={{ ...inputStyle, minWidth: "140px" }}
                value={editLineId}
                disabled={!editAreaId}
                onChange={(e) =>
                  handleEditLineChange(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              >
                <option value="">
                  {!editAreaId ? "Select area first" : "Select line"}
                </option>
                {filteredEditLines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <select
                style={{ ...inputStyle, minWidth: "140px" }}
                value={editStationId}
                disabled={!editLineId}
                onChange={(e) =>
                  setEditStationId(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              >
                <option value="">
                  {!editLineId ? "Select line first" : "Select station"}
                </option>
                {filteredEditStations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={savingHeader || !editName.trim() || !editStationId}
                onClick={handleSaveHeader}
                style={{
                  ...smallBtn,
                  color: "#ffffff",
                  backgroundColor: "#1A5EA8",
                }}
              >
                Save
              </button>
              <button
                type="button"
                disabled={savingHeader}
                onClick={handleCancelHeader}
                style={{
                  ...smallBtn,
                  color: "#64748b",
                  backgroundColor: "#f1f5f9",
                }}
              >
                Cancel
              </button>
            </HStack>
          ) : (
            <Box>
              <HStack gap={2} align="center">
                <Text fontSize="14px" fontWeight="700" color="gray.800">
                  {matrix.name}
                </Text>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    color: "#1A5EA8",
                    backgroundColor: "#eaf1f9",
                    border: "1px solid #bfdbfe",
                    textTransform: "uppercase",
                  }}
                >
                  {matrix.station?.name ?? "Unknown Station"}
                </span>
              </HStack>
              <HStack gap={1} mt={1}>
                <Text fontSize="12px" color="gray.500">
                  {currentLine?.area?.name ??
                    currentStation?.line?.area?.name ??
                    "-"}
                </Text>
                <Text fontSize="12px" color="gray.400">
                  /
                </Text>
                <Text fontSize="12px" color="gray.500">
                  {currentLine?.name ?? currentStation?.line?.name ?? "-"}
                </Text>
                <Text fontSize="12px" color="gray.400">
                  •
                </Text>
                <Text fontSize="12px" color="gray.500">
                  {matrix.categories.length} categories •{" "}
                  {matrix.categories.reduce(
                    (s, c) => s + c.checkpoints.length,
                    0,
                  )}{" "}
                  checkpoints
                </Text>
              </HStack>
            </Box>
          )}
        </HStack>

        {!isEditingHeader && (
          <HStack gap={2} onClick={(e) => e.stopPropagation()}>
            {expanded && (
              <button
                type="button"
                onClick={() =>
                  setViewMode((v) => (v === "list" ? "grid" : "list"))
                }
                style={{
                  ...smallBtn,
                  color: "#1A5EA8",
                  backgroundColor: "#eaf1f9",
                }}
              >
                {viewMode === "list" ? (
                  <>
                    <FiGrid size={12} /> Grid View
                  </>
                ) : (
                  <>
                    <FiList size={12} /> List View
                  </>
                )}
              </button>
            )}
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: "999px",
                color: matrix.is_active ? "#15803d" : "#64748b",
                backgroundColor: matrix.is_active ? "#f0fdf4" : "#f8fafc",
                border: `1px solid ${matrix.is_active ? "#bbf7d0" : "#e2e8f0"}`,
                cursor: "pointer",
              }}
              onClick={() => void handleToggleActive()}
            >
              {matrix.is_active ? "Active" : "Inactive"}
            </span>
            <button
              type="button"
              onClick={() => setIsEditingHeader(true)}
              style={{
                ...smallBtn,
                color: "#1A5EA8",
                backgroundColor: "#eaf1f9",
              }}
            >
              <FiEdit2 size={13} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              style={{
                ...smallBtn,
                color: "#be123c",
                backgroundColor: "#fff1f2",
              }}
            >
              <FiTrash2 size={13} />
            </button>
          </HStack>
        )}
      </Flex>

      {expanded && (
        <Box px={5} pb={5}>
          <Box h="1px" bg="gray.100" mb={4} />
          {viewMode === "grid" ? (
            <CompetencyMatrixGrid matrix={matrix} mode="setup" />
          ) : (
            <>
              {matrix.categories
                .sort((a, b) => a.order - b.order)
                .map((cat) => (
                  <CategoryBlock
                    key={cat.id}
                    category={cat}
                    matrix={matrix}
                    onRefresh={onRefresh}
                  />
                ))}
              <AddCategoryForm onAdd={handleAddCategory} />
            </>
          )}
        </Box>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteMatrix}
        loading={deleting}
        title="Delete Matrix?"
        message={
          <>
            You are about to delete matrix{" "}
            <Text as="span" fontWeight="600" color="gray.700">
              "{matrix.name}"
            </Text>{" "}
            and all its categories & checkpoints. This action cannot be undone.
          </>
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="#ef4444"
        icon={<FiTrash2 size={22} color="#ef4444" />}
      />
    </Box>
  );
};

export default MatrixCard;
