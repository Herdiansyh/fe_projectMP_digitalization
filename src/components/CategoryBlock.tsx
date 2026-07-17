import React, { useState } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import ConfirmDialog from "../components/common/ConfirmDialog";
import matrixManagementService from "../services/matrixManagementService";
import type {
  CompetencyMatrix,
  CompetencyCategory,
  CompetencyCheckpoint,
} from "../types/competency";
import {
  fieldWrapperStyle,
  inputStyle,
  labelStyle,
  smallBtn,
} from "./shared/styles";
import {
  collectExistingGroups,
  type ExistingGroup,
} from "./shared/matrixHelpers";

// ── Target konfirmasi hapus: bisa checkpoint atau kategori itu sendiri ──
interface ConfirmCheckpointTarget {
  kind: "checkpoint";
  id: number;
  label: string;
}

interface ConfirmCategoryTarget {
  kind: "category";
}

type ConfirmTarget = ConfirmCheckpointTarget | ConfirmCategoryTarget;

// ── Row: satu checkpoint (view + edit mode) ──
interface CheckpointRowProps {
  checkpoint: CompetencyCheckpoint;
  existingGroups: ExistingGroup[];
  onEdit: (
    description: string,
    sequence: number | null,
    mainProcess: string,
    weight: number,
  ) => Promise<void>;
  onDelete: () => void;
}

const CheckpointRow: React.FC<CheckpointRowProps> = ({
  checkpoint,
  existingGroups,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(checkpoint.description);
  const [sequence, setSequence] = useState(
    checkpoint.sequence != null ? String(checkpoint.sequence) : "",
  );
  const [mainProcess, setMainProcess] = useState(checkpoint.main_process ?? "");
  const [weight, setWeight] = useState(checkpoint.weight);
  const [saving, setSaving] = useState(false);

  const datalistId = `main-process-suggestions-${checkpoint.id}`;

  const resetForm = () => {
    setDescription(checkpoint.description);
    setSequence(checkpoint.sequence != null ? String(checkpoint.sequence) : "");
    setMainProcess(checkpoint.main_process ?? "");
    setWeight(checkpoint.weight);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!description.trim()) return;
    setSaving(true);
    try {
      await onEdit(
        description.trim(),
        sequence.trim() ? Number(sequence) : null,
        mainProcess.trim(),
        weight,
      );
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <Flex
        direction="column"
        gap={2}
        px={3}
        py={2}
        borderBottom="1px solid #f1f5f9"
        bg="#fafbfc"
      >
        <Flex gap={2}>
          <Box style={fieldWrapperStyle} w="70px">
            <label style={labelStyle}>Seq</label>
            <input
              style={inputStyle}
              type="number"
              min={0}
              placeholder="0"
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
            />
          </Box>
          <Box style={fieldWrapperStyle} flex={1}>
            <label style={labelStyle}>Main Process</label>
            <input
              style={{ ...inputStyle, width: "100%" }}
              list={datalistId}
              placeholder="Main process / work step..."
              value={mainProcess}
              onChange={(e) => setMainProcess(e.target.value)}
            />
            <datalist id={datalistId}>
              {existingGroups.map((g) => (
                <option
                  key={`${g.sequence}-${g.mainProcess}`}
                  value={g.mainProcess}
                />
              ))}
            </datalist>
          </Box>
        </Flex>
        <Flex gap={2} align="flex-end">
          <Box style={fieldWrapperStyle} flex={1}>
            <label style={labelStyle}>Checkpoint Description</label>
            <input
              style={{ ...inputStyle, width: "100%" }}
              placeholder="Checkpoint description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
          <Box style={fieldWrapperStyle} w="70px">
            <label style={labelStyle}>Weight</label>
            <input
              style={inputStyle}
              type="number"
              min={1}
              max={10}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </Box>
          <button
            type="button"
            disabled={saving || !description.trim()}
            onClick={handleSave}
            style={{
              ...smallBtn,
              color: "#ffffff",
              backgroundColor: !description.trim() ? "#94a3b8" : "#1A5EA8",
              cursor: !description.trim() ? "not-allowed" : "pointer",
              height: "31px",
            }}
          >
            Save
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleCancel}
            style={{
              ...smallBtn,
              color: "#64748b",
              backgroundColor: "#f1f5f9",
              height: "31px",
            }}
          >
            Cancel
          </button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      justify="space-between"
      align="center"
      py={2}
      px={3}
      borderBottom="1px solid #f1f5f9"
    >
      <Box>
        {checkpoint.main_process && (
          <Text fontSize="11px" color="#1A5EA8" fontWeight={600} mb={0.5}>
            {checkpoint.sequence != null ? `${checkpoint.sequence}. ` : ""}
            {checkpoint.main_process}
          </Text>
        )}
        <Text fontSize="13px" color="gray.700">
          {checkpoint.description}
        </Text>
      </Box>
      <HStack gap={2}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#1A5EA8",
            backgroundColor: "#eaf1f9",
            padding: "2px 8px",
            borderRadius: "6px",
          }}
        >
          weight: {checkpoint.weight}
        </span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          style={{ ...smallBtn, color: "#1A5EA8", backgroundColor: "#eaf1f9" }}
        >
          <FiEdit2 size={12} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          style={{ ...smallBtn, color: "#be123c", backgroundColor: "#fff1f2" }}
        >
          <FiTrash2 size={12} />
        </button>
      </HStack>
    </Flex>
  );
};

// ── Form kecil: tambah checkpoint baru ──
// existingGroups: daftar (seq+main_process) yang SUDAH dipakai di matrix ini
// (dikumpulkan dari semua kategori), supaya admin tinggal PILIH grup yang sama
// persis alih-alih ketik ulang manual dan berisiko salah ketik/beda.
interface AddCheckpointFormProps {
  existingGroups: ExistingGroup[];
  onAdd: (
    description: string,
    sequence: number | null,
    mainProcess: string,
    weight: number,
  ) => Promise<void>;
}

const AddCheckpointForm: React.FC<AddCheckpointFormProps> = ({
  existingGroups,
  onAdd,
}) => {
  const [description, setDescription] = useState("");
  const [sequence, setSequence] = useState("");
  const [mainProcess, setMainProcess] = useState("");
  const [weight, setWeight] = useState(1);
  const [saving, setSaving] = useState(false);

  const datalistId = "main-process-suggestions";

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setSaving(true);
    try {
      await onAdd(
        description.trim(),
        sequence.trim() ? Number(sequence) : null,
        mainProcess.trim(),
        weight,
      );
      setDescription("");
      setSequence("");
      setMainProcess("");
      setWeight(1);
    } finally {
      setSaving(false);
    }
  };

  // Saat main process dipilih dari daftar yang sudah ada, otomatis isi Seq
  // yang sesuai supaya checkpoint ini nyambung ke grup/baris yang sama.
  const handleMainProcessChange = (value: string) => {
    setMainProcess(value);
    const match = existingGroups.find((g) => g.mainProcess === value);
    if (match) setSequence(String(match.sequence));
  };

  return (
    <Flex direction="column" gap={2} px={3} py={2}>
      <Flex gap={2}>
        <Box style={fieldWrapperStyle} w="70px">
          <label style={labelStyle}>Seq</label>
          <input
            style={inputStyle}
            type="number"
            min={0}
            placeholder="0"
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
          />
        </Box>
        <Box style={fieldWrapperStyle} flex={1}>
          <label style={labelStyle}>Main Process</label>
          <input
            style={{ ...inputStyle, width: "100%" }}
            list={datalistId}
            placeholder="Pilih yang sudah ada, atau ketik baru..."
            value={mainProcess}
            onChange={(e) => handleMainProcessChange(e.target.value)}
          />
          <datalist id={datalistId}>
            {existingGroups.map((g) => (
              <option
                key={`${g.sequence}-${g.mainProcess}`}
                value={g.mainProcess}
              />
            ))}
          </datalist>
        </Box>
      </Flex>
      {existingGroups.length > 0 && (
        <Text fontSize="10px" color="gray.400">
          Tip: pilih main process yang sama dari daftar supaya checkpoint ini
          masuk baris yang sama di grid.
        </Text>
      )}
      <Flex gap={2} align="flex-end">
        <Box style={fieldWrapperStyle} flex={1}>
          <label style={labelStyle}>Checkpoint Description</label>
          <input
            style={{ ...inputStyle, width: "100%" }}
            placeholder="New checkpoint description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
        <Box style={fieldWrapperStyle} w="70px">
          <label style={labelStyle}>Weight</label>
          <input
            style={inputStyle}
            type="number"
            min={1}
            max={10}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </Box>
        <button
          type="button"
          disabled={saving || !description.trim()}
          onClick={handleSubmit}
          style={{
            ...smallBtn,
            color: "#ffffff",
            backgroundColor: !description.trim() ? "#94a3b8" : "#1A5EA8",
            cursor: !description.trim() ? "not-allowed" : "pointer",
            height: "31px",
          }}
        >
          <FiPlus size={12} /> Add
        </button>
      </Flex>
    </Flex>
  );
};

// ── Block: satu kategori, expandable, berisi checkpoints ──
interface CategoryBlockProps {
  category: CompetencyCategory;
  matrix: CompetencyMatrix;
  onRefresh: () => void;
}

const CategoryBlock: React.FC<CategoryBlockProps> = ({
  category,
  matrix,
  onRefresh,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [categoryName, setCategoryName] = useState(category.name);
  const [savingName, setSavingName] = useState(false);
  const existingGroups = collectExistingGroups(matrix);

  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const handleAddCheckpoint = async (
    description: string,
    sequence: number | null,
    mainProcess: string,
    weight: number,
  ) => {
    await matrixManagementService.createCheckpoint(category.id, {
      description,
      sequence: sequence ?? undefined,
      main_process: mainProcess || undefined,
      weight,
    });
    onRefresh();
  };

  const handleEditCheckpoint = async (
    checkpointId: number,
    description: string,
    sequence: number | null,
    mainProcess: string,
    weight: number,
  ) => {
    await matrixManagementService.updateCheckpoint(checkpointId, {
      description,
      sequence,
      main_process: mainProcess,
      weight,
    });
    onRefresh();
  };

  const handleSaveCategoryName = async () => {
    if (!categoryName.trim() || categoryName.trim() === category.name) {
      setIsEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      await matrixManagementService.updateCategory(category.id, {
        name: categoryName.trim(),
      });
      setIsEditingName(false);
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "Failed to update category.");
    } finally {
      setSavingName(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      if (confirmTarget.kind === "checkpoint") {
        await matrixManagementService.deleteCheckpoint(confirmTarget.id);
      } else {
        await matrixManagementService.deleteCategory(category.id);
      }
      setConfirmTarget(null);
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(
        e.response?.data?.message ??
          (confirmTarget.kind === "checkpoint"
            ? "Failed to delete checkpoint."
            : "Failed to delete category."),
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box borderWidth="1px" borderColor="gray.100" borderRadius="8px" mb={2}>
      <Flex
        justify="space-between"
        align="center"
        px={3}
        py={2}
        bg="#f8fafc"
        cursor={isEditingName ? "default" : "pointer"}
        onClick={() => !isEditingName && setExpanded((v) => !v)}
      >
        <HStack
          gap={2}
          flex={1}
          onClick={(e) => isEditingName && e.stopPropagation()}
        >
          {expanded ? (
            <FiChevronDown size={14} />
          ) : (
            <FiChevronRight size={14} />
          )}
          {isEditingName ? (
            <HStack gap={2} flex={1}>
              <input
                style={{ ...inputStyle, flex: 1, maxWidth: "260px" }}
                value={categoryName}
                autoFocus
                onChange={(e) => setCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveCategoryName()}
              />
              <button
                type="button"
                disabled={savingName || !categoryName.trim()}
                onClick={handleSaveCategoryName}
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
                disabled={savingName}
                onClick={() => {
                  setCategoryName(category.name);
                  setIsEditingName(false);
                }}
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
            <>
              <Text fontSize="13px" fontWeight="700" color="gray.700">
                {category.name}
              </Text>
              <Text fontSize="11px" color="gray.400">
                ({category.checkpoints.length} checkpoints)
              </Text>
            </>
          )}
        </HStack>
        {!isEditingName && (
          <HStack gap={2}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingName(true);
              }}
              style={{
                ...smallBtn,
                color: "#1A5EA8",
                backgroundColor: "#eaf1f9",
              }}
            >
              <FiEdit2 size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmTarget({ kind: "category" });
              }}
              style={{
                ...smallBtn,
                color: "#be123c",
                backgroundColor: "#fff1f2",
              }}
            >
              <FiTrash2 size={12} />
            </button>
          </HStack>
        )}
      </Flex>

      {expanded && (
        <Box>
          {category.checkpoints.map((cp) => (
            <CheckpointRow
              key={cp.id}
              checkpoint={cp}
              existingGroups={existingGroups}
              onEdit={(description, sequence, mainProcess, weight) =>
                handleEditCheckpoint(
                  cp.id,
                  description,
                  sequence,
                  mainProcess,
                  weight,
                )
              }
              onDelete={() =>
                setConfirmTarget({
                  kind: "checkpoint",
                  id: cp.id,
                  label: cp.description,
                })
              }
            />
          ))}
          <AddCheckpointForm
            existingGroups={existingGroups}
            onAdd={handleAddCheckpoint}
          />
        </Box>
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title={
          confirmTarget?.kind === "checkpoint"
            ? "Delete Checkpoint?"
            : "Delete Category?"
        }
        message={
          confirmTarget?.kind === "checkpoint" ? (
            <>
              You are about to delete checkpoint{" "}
              <Text as="span" fontWeight="600" color="gray.700">
                "{confirmTarget.label}"
              </Text>
              . This action cannot be undone.
            </>
          ) : (
            <>
              You are about to delete category{" "}
              <Text as="span" fontWeight="600" color="gray.700">
                "{category.name}"
              </Text>{" "}
              and all its checkpoints. This action cannot be undone.
            </>
          )
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="#ef4444"
        icon={<FiTrash2 size={22} color="#ef4444" />}
      />
    </Box>
  );
};

export default CategoryBlock;
