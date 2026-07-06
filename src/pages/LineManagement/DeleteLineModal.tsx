import React from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiAlertTriangle } from "react-icons/fi";
import type { Line } from "../../types/line";

interface DeleteLineModalProps {
  isOpen: boolean;
  line: Line | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteLineModal: React.FC<DeleteLineModalProps> = ({
  isOpen,
  line,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !line) return null;

  return (
    <>
      <Box
        position="fixed"
        inset={0}
        zIndex={400}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={!isLoading ? onCancel : undefined}
      />
      <Box
        position="fixed"
        top="50%"
        left="50%"
        zIndex={500}
        style={{
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "420px",
          padding: "0 16px",
        }}
      >
        <Box
          bg="white"
          borderRadius="12px"
          shadow="xl"
          borderWidth="1px"
          borderColor="gray.100"
          overflow="hidden"
        >
          <Box px={6} pt={6} pb={4}>
            <HStack gap={3} align="flex-start">
              <Box
                w="40px"
                h="40px"
                borderRadius="10px"
                bg="#fff1f2"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <FiAlertTriangle size={20} color="#be123c" />
              </Box>
              <Box>
                <Text fontSize="16px" fontWeight="700" color="gray.800" mb={1}>
                  Delete Line
                </Text>
                <Text fontSize="13px" color="gray.500" lineHeight="1.5">
                  Are you sure you want to delete{" "}
                  <Text as="span" fontWeight="700" color="red.700">
                    {line.name}
                  </Text>
                  {line.area?.name && ` from area "${line.area.name}"`}? This
                  action cannot be undone.
                </Text>
              </Box>
            </HStack>
          </Box>
          <Box h="1px" bg="gray.100" />
          <Flex px={6} py={4} justify="flex-end" gap={3}>
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                borderRadius: "8px",
                color: "#4a5568",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              style={{
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "8px",
                color: "#ffffff",
                backgroundColor: isLoading ? "#fda4af" : "#be123c",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Deleting..." : "Yes, Delete"}
            </button>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default DeleteLineModal;
