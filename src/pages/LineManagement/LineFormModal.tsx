import React, { useState, useEffect } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { FiGitBranch, FiX } from "react-icons/fi";
import lineService from "../../services/lineService";
import { toaster } from "../../components/ui/toaster";
import type { Line } from "../../types/line";
import type { Area } from "../../types/area";

interface LineFormModalProps {
  isOpen: boolean;
  editTarget: Line | null;
  areas: Area[];
  defaultAreaId?: number | null;
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

const LineFormModal: React.FC<LineFormModalProps> = ({
  isOpen,
  editTarget,
  areas,
  defaultAreaId,
  onClose,
  onSaved,
}) => {
  const isEdit = !!editTarget;
  const [areaId, setAreaId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ area_id?: string; name?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setAreaId(editTarget?.area_id ?? defaultAreaId ?? "");
      setName(editTarget?.name ?? "");
      setErrors({});
    }
  }, [isOpen, editTarget, defaultAreaId]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const newErrors: { area_id?: string; name?: string } = {};
    if (!areaId) newErrors.area_id = "Area is required";
    if (!name.trim()) newErrors.name = "Line name is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const payload = { area_id: Number(areaId), name: name.trim() };
      if (isEdit && editTarget) {
        await lineService.updateLine(editTarget.id, payload);
        toaster.create({ title: "Line updated successfully", type: "success" });
      } else {
        await lineService.createLine(payload);
        toaster.create({ title: "Line created successfully", type: "success" });
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
          area_id: apiErrors.area_id?.[0],
          name: apiErrors.name?.[0],
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
              <FiGitBranch size={18} />
            </Box>
            <Text fontWeight="600" fontSize="15px" color="gray.800">
              {isEdit ? "Edit Line" : "Add New Line"}
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

        <Box px={6} py={5}>
          <Box mb={3}>
            <Text fontSize="13px" fontWeight="500" color="gray.700" mb={1}>
              Area{" "}
              <Text as="span" color="red.400">
                *
              </Text>
            </Text>
            <select
              value={areaId}
              onChange={(e) =>
                setAreaId(e.target.value === "" ? "" : Number(e.target.value))
              }
              style={selectStyle(!!errors.area_id)}
            >
              <option value="">-- Select Area --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {errors.area_id && (
              <Text fontSize="12px" color="red.500" mt={1}>
                {errors.area_id}
              </Text>
            )}
          </Box>

          <Box>
            <Text fontSize="13px" fontWeight="500" color="gray.700" mb={1}>
              Line Name{" "}
              <Text as="span" color="red.400">
                *
              </Text>
            </Text>
            <input
              placeholder="e.g. Line A"
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
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Line"}
          </button>
        </Flex>
      </Box>
    </Box>
  );
};

export default LineFormModal;
