import React, { useState, useMemo } from "react";
import { Box, Text, HStack } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { inputStyle } from "./shared/styles";
import type { Station } from "../types/station";
import type { Line } from "../types/line";
import type { Area } from "../types/area";
import matrixManagementService from "../services/matrixManagementService";

interface CreateMatrixFormProps {
  areas: Area[];
  lines: Line[];
  stations: Station[];
  onCreated: () => void;
}

// ── Form: bikin matrix baru ──
const CreateMatrixForm: React.FC<CreateMatrixFormProps> = ({
  areas,
  lines,
  stations,
  onCreated,
}) => {
  const [areaId, setAreaId] = useState<number | "">("");
  const [lineId, setLineId] = useState<number | "">("");
  const [stationId, setStationId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Line difilter berdasarkan Area terpilih
  const filteredLines = useMemo(() => {
    if (!areaId) return [];
    return lines.filter((l) => Number(l.area_id) === Number(areaId));
  }, [lines, areaId]);

  // Station difilter berdasarkan Line terpilih
  const filteredStations = useMemo(() => {
    if (!lineId) return [];
    return stations.filter((s) => Number(s.line_id) === Number(lineId));
  }, [stations, lineId]);

  const handleAreaChange = (value: number | "") => {
    setAreaId(value);
    setLineId("");
    setStationId("");
  };

  const handleLineChange = (value: number | "") => {
    setLineId(value);
    setStationId("");
  };

  const handleSubmit = async () => {
    if (!stationId || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await matrixManagementService.createMatrix({
        station_id: Number(stationId),
        name: name.trim(),
      });
      setAreaId("");
      setLineId("");
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
        <Box minW="180px">
          <Text fontSize="12px" fontWeight="600" color="gray.500" mb={1}>
            Area
          </Text>
          <select
            style={{ ...inputStyle, width: "100%", padding: "8px 10px" }}
            value={areaId}
            onChange={(e) =>
              handleAreaChange(
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
        </Box>

        <Box minW="180px">
          <Text fontSize="12px" fontWeight="600" color="gray.500" mb={1}>
            Line
          </Text>
          <select
            style={{ ...inputStyle, width: "100%", padding: "8px 10px" }}
            value={lineId}
            disabled={!areaId}
            onChange={(e) =>
              handleLineChange(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
          >
            <option value="">
              {!areaId
                ? "Select area first"
                : filteredLines.length === 0
                  ? "No lines in this area"
                  : "Select line"}
            </option>
            {filteredLines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </Box>

        <Box minW="180px">
          <Text fontSize="12px" fontWeight="600" color="gray.500" mb={1}>
            Station
          </Text>
          <select
            style={{ ...inputStyle, width: "100%", padding: "8px 10px" }}
            value={stationId}
            disabled={!lineId}
            onChange={(e) =>
              setStationId(e.target.value === "" ? "" : Number(e.target.value))
            }
          >
            <option value="">
              {!lineId
                ? "Select line first"
                : filteredStations.length === 0
                  ? "No stations in this line"
                  : "Select station"}
            </option>
            {filteredStations.map((s) => (
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
