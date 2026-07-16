import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { FiMapPin, FiX } from "react-icons/fi";
import stationService from "../../services/stationService";
import { toaster } from "../../components/ui/toaster";
import type { Station } from "../../types/station";
import type { Line } from "../../types/line";
import type { Area } from "../../types/area";

interface StationFormModalProps {
  isOpen: boolean;
  editTarget: Station | null;
  areas: Area[];
  lines: Line[];
  defaultLineId?: number | null;
  onClose: () => void;
  onSaved: () => void;
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "8px 12px",
  fontSize: "14px",
  color: "#1a202c",
  backgroundColor: "#ffffff",
  border: `1px solid ${hasError ? "#fc8181" : "#e2e8f0"}`,
  borderRadius: "8px",
  outline: "none",
});

const selectStyle = (hasError?: boolean): React.CSSProperties => ({
  ...inputStyle(hasError),
  cursor: "pointer",
});

const StationFormModal: React.FC<StationFormModalProps> = ({
  isOpen,
  editTarget,
  areas,
  lines,
  defaultLineId,
  onClose,
  onSaved,
}) => {
  const isEdit = !!editTarget;
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState<string>("");
  const [lineId, setLineId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; line_id?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setName(editTarget?.name ?? "");
      const initialLine = editTarget?.line_id ?? defaultLineId ?? "";
      setLineId(initialLine ? String(initialLine) : "");

      // Tentukan area awal dari line target/default, kalau ada
      const initialLineObj =
        editTarget?.line ??
        lines.find((l) => String(l.id) === String(initialLine));
      setAreaId(initialLineObj?.area_id ? String(initialLineObj.area_id) : "");

      setErrors({});
    }
  }, [isOpen, editTarget, defaultLineId, lines]);

  // Line yang ditampilkan di dropdown, difilter berdasarkan area terpilih
  const filteredLines = useMemo(() => {
    if (!areaId) return [];
    return lines.filter((l) => String(l.area_id) === areaId);
  }, [lines, areaId]);

  if (!isOpen) return null;

  const handleAreaChange = (value: string) => {
    setAreaId(value);
    setLineId(""); // reset line saat area berubah
  };

  const handleSubmit = async () => {
    const newErrors: { name?: string; line_id?: string } = {};
    if (!name.trim()) newErrors.name = "Station name is required";
    if (!lineId) newErrors.line_id = "Line is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const payload = { name: name.trim(), line_id: lineId };

      if (isEdit && editTarget) {
        await stationService.updateStation(editTarget.id, payload);
        toaster.create({
          title: "Station updated successfully",
          type: "success",
        });
      } else {
        await stationService.createStation(payload);
        toaster.create({
          title: "Station created successfully",
          type: "success",
        });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const e = err as {
        response?: {
          data?: { errors?: Record<string, string[]>; message?: string };
        };
      };
      const apiErrors = e.response?.data?.errors;
      if (apiErrors) {
        setErrors({
          name: apiErrors.name?.[0],
          line_id: apiErrors.line_id?.[0],
        });
      } else {
        toaster.create({
          title: e.response?.data?.message ?? "An error occurred.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={200}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        position="absolute"
        inset={0}
        bg="blackAlpha.500"
        backdropFilter="blur(2px)"
        onClick={!loading ? onClose : undefined}
      />

      <Box
        position="relative"
        bg="white"
        borderRadius="12px"
        shadow="xl"
        w="full"
        maxW="440px"
        mx={4}
        overflow="hidden"
      >
        <Flex
          align="center"
          justify="space-between"
          px={6}
          py={4}
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Flex align="center" gap={2}>
            <Box color="blue.500">
              <FiMapPin size={18} />
            </Box>
            <Text fontWeight="600" fontSize="15px" color="gray.800">
              {isEdit ? "Edit Station" : "Add New Station"}
            </Text>
          </Flex>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "transparent",
              color: "#94a3b8",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <FiX size={16} />
          </button>
        </Flex>

        <Box px={6} py={5} display="flex" flexDirection="column" gap={4}>
          {/* Area — hanya untuk filter, tidak dikirim ke API */}
          <Box>
            <Text fontSize="13px" fontWeight="500" color="gray.700" mb={1}>
              Area{" "}
              <Text as="span" color="red.400">
                *
              </Text>
            </Text>
            <select
              value={areaId}
              onChange={(e) => handleAreaChange(e.target.value)}
              style={selectStyle(!!errors.line_id && !areaId)}
            >
              <option value="">-- Select Area --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Box>

          {/* Line — difilter berdasarkan Area */}
          <Box>
            <Text fontSize="13px" fontWeight="500" color="gray.700" mb={1}>
              Line{" "}
              <Text as="span" color="red.400">
                *
              </Text>
            </Text>
            <select
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              disabled={!areaId}
              style={selectStyle(!!errors.line_id)}
            >
              <option value="">
                {areaId ? "-- Select Line --" : "Select an area first"}
              </option>
              {filteredLines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            {errors.line_id && (
              <Text fontSize="12px" color="red.500" mt={1}>
                {errors.line_id}
              </Text>
            )}
          </Box>

          {/* Station Name */}
          <Box>
            <Text fontSize="13px" fontWeight="500" color="gray.700" mb={1}>
              Station Name{" "}
              <Text as="span" color="red.400">
                *
              </Text>
            </Text>
            <input
              placeholder="e.g. Station 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle(!!errors.name)}
              autoFocus
            />
            {errors.name && (
              <Text fontSize="12px" color="red.500" mt={1}>
                {errors.name}
              </Text>
            )}
          </Box>
        </Box>

        <Flex
          gap={3}
          px={6}
          py={4}
          borderTop="1px solid"
          borderColor="gray.100"
          justify="flex-end"
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: "500",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              color: "#475569",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: "500",
              borderRadius: "8px",
              border: "none",
              backgroundColor: loading ? "#93c5fd" : "#3b82f6",
              color: "#ffffff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Station"}
          </button>
        </Flex>
      </Box>
    </Box>
  );
};

export default StationFormModal;
