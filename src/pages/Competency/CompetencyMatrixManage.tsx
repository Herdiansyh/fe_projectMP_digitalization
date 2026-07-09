import React, { useState, useEffect } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import {
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiChevronRight,
  FiLayers,
  FiGrid,
  FiList,
} from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import matrixManagementService from "../../services/matrixManagementService";
import stationService from "../../services/stationService";
import CompetencyMatrixGrid from "../../components/competency/CompetencyMatrixGrid";
import type { CompetencyMatrix } from "../../types/competency";
import type { Station } from "../../types/station";

const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  fontSize: "13px",
  color: "#1a202c",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  outline: "none",
};

const smallBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "5px 10px",
  fontSize: "12px",
  fontWeight: 600,
  borderRadius: "6px",
  cursor: "pointer",
  border: "1px solid transparent",
};

// ── Row: satu checkpoint ──
const CheckpointRow = ({
  checkpoint,
  onDelete,
}: {
  checkpoint: {
    id: number;
    description: string;
    sequence?: number | null;
    main_process?: string | null;
    weight: number;
  };
  onDelete: () => void;
}) => (
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
    <HStack gap={3}>
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
        onClick={onDelete}
        style={{ ...smallBtn, color: "#be123c", backgroundColor: "#fff1f2" }}
      >
        <FiTrash2 size={12} />
      </button>
    </HStack>
  </Flex>
);

// ── Form kecil: tambah checkpoint baru ──
// existingGroups: daftar (seq+main_process) yang SUDAH dipakai di matrix ini
// (dikumpulkan dari semua kategori), supaya admin tinggal PILIH grup yang sama
// persis alih-alih ketik ulang manual dan berisiko salah ketik/beda.
const AddCheckpointForm = ({
  existingGroups,
  onAdd,
}: {
  existingGroups: { sequence: number; mainProcess: string }[];
  onAdd: (
    description: string,
    sequence: number | null,
    mainProcess: string,
    weight: number,
  ) => Promise<void>;
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
        <input
          style={{ ...inputStyle, width: "70px" }}
          type="number"
          min={0}
          placeholder="Seq"
          value={sequence}
          onChange={(e) => setSequence(e.target.value)}
        />
        <input
          style={{ ...inputStyle, flex: 1 }}
          list={datalistId}
          placeholder="Main process / work step (pilih yang sudah ada, atau ketik baru)..."
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
      </Flex>
      {existingGroups.length > 0 && (
        <Text fontSize="10px" color="gray.400">
          Tip: pilih main process yang sama dari daftar supaya checkpoint ini
          masuk baris yang sama di grid.
        </Text>
      )}
      <Flex gap={2} align="center">
        <input
          style={{ ...inputStyle, flex: 1 }}
          placeholder="New checkpoint description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          style={{ ...inputStyle, width: "70px" }}
          type="number"
          min={1}
          max={10}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
        <button
          type="button"
          disabled={saving || !description.trim()}
          onClick={handleSubmit}
          style={{
            ...smallBtn,
            color: "#ffffff",
            backgroundColor: !description.trim() ? "#94a3b8" : "#1A5EA8",
            cursor: !description.trim() ? "not-allowed" : "pointer",
          }}
        >
          <FiPlus size={12} /> Add
        </button>
      </Flex>
    </Flex>
  );
};

// ── Kumpulkan semua kombinasi (sequence, main_process) unik yang sudah
//    dipakai di seluruh kategori pada satu matrix — dipakai sebagai daftar
//    pilihan (datalist) supaya admin gampang menyambungkan checkpoint baru
//    ke grup/baris main-process yang sudah ada. ──
function collectExistingGroups(
  matrix: CompetencyMatrix,
): { sequence: number; mainProcess: string }[] {
  const map = new Map<string, { sequence: number; mainProcess: string }>();
  matrix.categories.forEach((cat) => {
    cat.checkpoints.forEach((cp) => {
      if (cp.sequence != null && cp.main_process) {
        map.set(`${cp.sequence}-${cp.main_process}`, {
          sequence: cp.sequence,
          mainProcess: cp.main_process,
        });
      }
    });
  });
  return Array.from(map.values()).sort((a, b) => a.sequence - b.sequence);
}

// ── Block: satu kategori, expandable, berisi checkpoints ──
const CategoryBlock = ({
  category,
  matrix,
  onRefresh,
}: {
  category: CompetencyMatrix["categories"][number];
  matrix: CompetencyMatrix;
  onRefresh: () => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const existingGroups = collectExistingGroups(matrix);

  // ── State konfirmasi hapus: bisa untuk checkpoint ATAU kategori ini sendiri ──
  const [confirmTarget, setConfirmTarget] = useState<
    | { type: "checkpoint"; id: number; label: string }
    | { type: "category" }
    | null
  >(null);
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

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      if (confirmTarget.type === "checkpoint") {
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
          (confirmTarget.type === "checkpoint"
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
        cursor="pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <HStack gap={2}>
          {expanded ? (
            <FiChevronDown size={14} />
          ) : (
            <FiChevronRight size={14} />
          )}
          <Text fontSize="13px" fontWeight="700" color="gray.700">
            {category.name}
          </Text>
          <Text fontSize="11px" color="gray.400">
            ({category.checkpoints.length} checkpoints)
          </Text>
        </HStack>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmTarget({ type: "category" });
          }}
          style={{ ...smallBtn, color: "#be123c", backgroundColor: "#fff1f2" }}
        >
          <FiTrash2 size={12} />
        </button>
      </Flex>

      {expanded && (
        <Box>
          {category.checkpoints.map((cp) => (
            <CheckpointRow
              key={cp.id}
              checkpoint={cp}
              onDelete={() =>
                setConfirmTarget({
                  type: "checkpoint",
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
          confirmTarget?.type === "checkpoint"
            ? "Delete Checkpoint?"
            : "Delete Category?"
        }
        message={
          confirmTarget?.type === "checkpoint" ? (
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

// ── Form kecil: tambah kategori baru ──
const AddCategoryForm = ({
  onAdd,
}: {
  onAdd: (name: string) => Promise<void>;
}) => {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onAdd(name.trim());
      setName("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Flex gap={2} mt={2}>
      <input
        style={{ ...inputStyle, flex: 1 }}
        placeholder="New category name (e.g. Material Handling)..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        type="button"
        disabled={saving || !name.trim()}
        onClick={handleSubmit}
        style={{
          ...smallBtn,
          color: "#ffffff",
          backgroundColor: !name.trim() ? "#94a3b8" : "#1A5EA8",
          cursor: !name.trim() ? "not-allowed" : "pointer",
        }}
      >
        <FiPlus size={12} /> Add Category
      </button>
    </Flex>
  );
};

// ── Card: satu matrix, expandable, berisi kategori ──
const MatrixCard = ({
  matrix,
  onRefresh,
}: {
  matrix: CompetencyMatrix;
  onRefresh: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        cursor="pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <HStack gap={3}>
          {expanded ? (
            <FiChevronDown size={16} />
          ) : (
            <FiChevronRight size={16} />
          )}
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
            <Text fontSize="12px" color="gray.500">
              {matrix.categories.length} categories •{" "}
              {matrix.categories.reduce((s, c) => s + c.checkpoints.length, 0)}{" "}
              checkpoints
            </Text>
          </Box>
        </HStack>
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

// ── Form: bikin matrix baru ──
const CreateMatrixForm = ({
  stations,
  onCreated,
}: {
  stations: Station[];
  onCreated: () => void;
}) => {
  const [stationId, setStationId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stationId || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await matrixManagementService.createMatrix({
        station_id: Number(stationId),
        name: name.trim(),
      });
      setStationId("");
      setName("");
      onCreated();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Failed to create matrix.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box bg="white" borderRadius="12px" shadow="sm" p={5} mb={6}>
      <Text fontSize="14px" fontWeight="700" color="gray.800" mb={3}>
        Create New Matrix
      </Text>
      <HStack gap={3} align="flex-end" wrap="wrap">
        <Box minW="220px">
          <Text fontSize="12px" fontWeight="600" color="gray.500" mb={1}>
            Station
          </Text>
          <select
            style={{ ...inputStyle, width: "100%", padding: "8px 10px" }}
            value={stationId}
            onChange={(e) =>
              setStationId(e.target.value === "" ? "" : Number(e.target.value))
            }
          >
            <option value="">Select station</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Box>
        <Box flex={1} minW="220px">
          <Text fontSize="12px" fontWeight="600" color="gray.500" mb={1}>
            Matrix Name
          </Text>
          <input
            style={{ ...inputStyle, width: "100%", padding: "8px 10px" }}
            placeholder="e.g. PWBA Assy (L5)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Box>
        <button
          type="button"
          disabled={saving || !stationId || !name.trim()}
          onClick={handleSubmit}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 18px",
            fontSize: "13px",
            fontWeight: 600,
            borderRadius: "8px",
            color: "#ffffff",
            backgroundColor: !stationId || !name.trim() ? "#94a3b8" : "#1A5EA8",
            border: "none",
            cursor: !stationId || !name.trim() ? "not-allowed" : "pointer",
          }}
        >
          <FiPlus size={14} /> Create Matrix
        </button>
      </HStack>
      {error && (
        <Text fontSize="12px" color="#be123c" mt={2}>
          {error}
        </Text>
      )}
      <Text fontSize="11px" color="gray.400" mt={2}>
        Note: creating a new matrix for a station automatically deactivates the
        previous active matrix for that station (only one active matrix per
        station is allowed).
      </Text>
    </Box>
  );
};

// ── Halaman utama ──
const CompetencyMatrixManage: React.FC = () => {
  const [matrices, setMatrices] = useState<CompetencyMatrix[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);

  // silent=true dipakai untuk refresh setelah create/update/delete (add checkpoint,
  // add category, dsb) — supaya list TIDAK di-unmount & tidak collapse ulang
  // (efeknya kalau tidak silent: terasa seperti "refresh" karena loading state
  // menggantikan seluruh tampilan list sebentar).
  const fetchAll = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const [matrixRes, stationRes] = await Promise.all([
        matrixManagementService.getMatrices(),
        stationService.getStations(),
      ]);
      setMatrices(matrixRes.data);
      setStations(stationRes.data);
    } catch {
      alert("Failed to load competency matrices.");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  return (
    <MainLayout>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <HStack gap={3}>
            <Box
              w="40px"
              h="40px"
              borderRadius="10px"
              bg="#eaf1f9"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiLayers size={18} color="#1A5EA8" />
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Manage Competency Matrix
              </Text>
              <Text fontSize="13px" color="gray.500" mt={0.5}>
                Setup rubrik penilaian kompetensi per station
              </Text>
            </Box>
          </HStack>
        </Flex>

        <CreateMatrixForm stations={stations} onCreated={fetchAll} />

        {loading ? (
          <Flex justify="center" py={10}>
            <Text color="gray.500" fontSize="14px">
              Loading...
            </Text>
          </Flex>
        ) : matrices.length === 0 ? (
          <Flex justify="center" py={10}>
            <Text color="gray.400" fontSize="14px">
              No competency matrix created yet
            </Text>
          </Flex>
        ) : (
          matrices.map((m) => (
            <MatrixCard
              key={m.id}
              matrix={m}
              onRefresh={() => fetchAll({ silent: true })}
            />
          ))
        )}
      </Box>
    </MainLayout>
  );
};

export default CompetencyMatrixManage;
