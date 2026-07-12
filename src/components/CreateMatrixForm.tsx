import React, { useState } from "react";
import { Box, Text, HStack } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { inputStyle } from "./shared/styles";
import type { Station } from "../types/station";
import matrixManagementService from "../services/matrixManagementService";

interface CreateMatrixFormProps {
  stations: Station[];
  onCreated: () => void;
}

// ── Form: bikin matrix baru ──
const CreateMatrixForm: React.FC<CreateMatrixFormProps> = ({
  stations,
  onCreated,
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

export default CreateMatrixForm;
