import React, { useState, useEffect } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { FiMapPin, FiX } from "react-icons/fi";
import stationService from "../../services/stationService";
import { toaster } from "../../components/ui/toaster";
import type { Station } from "../../types/station";

interface StationFormModalProps {
  isOpen: boolean;
  editTarget: Station | null;
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

const StationFormModal: React.FC<StationFormModalProps> = ({
  isOpen,
  editTarget,
  onClose,
  onSaved,
}) => {
  const isEdit = !!editTarget;
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(editTarget?.name ?? "");
      setError(null);
    }
  }, [isOpen, editTarget]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Station name is required");
      return;
    }
    try {
      setLoading(true);
      if (isEdit && editTarget) {
        await stationService.updateStation(editTarget.id, {
          name: name.trim(),
        });
        toaster.create({
          title: "Station updated successfully",
          type: "success",
        });
      } else {
        await stationService.createStation({ name: name.trim() });
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
      const fieldError = e.response?.data?.errors?.name?.[0];
      setError(fieldError ?? e.response?.data?.message ?? "An error occurred.");
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
        maxW="420px"
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

        <Box px={6} py={5}>
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
            style={inputStyle(!!error)}
            autoFocus
          />
          {error && (
            <Text fontSize="12px" color="red.500" mt={1}>
              {error}
            </Text>
          )}
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
