import React, { useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { FiLock, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import userService from "../../services/userService";
import type { UserItem } from "../../types/user";

interface ResetPasswordModalProps {
  user: UserItem;
  onClose: () => void;
  onSuccess: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  fontSize: "14px",
  color: "#1a202c",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  outline: "none",
};

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async () => {
    setErrors({});

    // Client-side validation
    const localErrors: Record<string, string[]> = {};
    if (!password) localErrors.password = ["New password is required."];
    else if (password.length < 8)
      localErrors.password = ["Password must be at least 8 characters."];
    if (password !== passwordConfirmation)
      localErrors.password_confirmation = ["Password confirmation does not match."];
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    try {
      setLoading(true);
      await userService.resetPassword(user.id, {
        password,
        password_confirmation: passwordConfirmation,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { errors?: Record<string, string[]> } };
      };
      if (e.response?.data?.errors) {
        setErrors(e.response.data.errors);
      } else {
        alert("Failed to reset password.");
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
      {/* Backdrop */}
      <Box
        position="absolute"
        inset={0}
        bg="blackAlpha.500"
        backdropFilter="blur(2px)"
        onClick={onClose}
      />

      {/* Modal */}
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
        {/* Header */}
        <Flex
          align="center"
          justify="space-between"
          px={6}
          py={4}
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Flex align="center" gap={2}>
            <Box color="orange.500">
              <FiLock size={18} />
            </Box>
            <Text fontWeight="600" fontSize="15px" color="gray.800">
              Reset Password
            </Text>
          </Flex>
          <button
            type="button"
            onClick={onClose}
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
              cursor: "pointer",
            }}
          >
            <FiX size={16} />
          </button>
        </Flex>

        {/* Body */}
        <Box px={6} py={5}>
          <Box
            bg="orange.50"
            border="1px solid"
            borderColor="orange.200"
            borderRadius="8px"
            px={4}
            py={3}
            mb={5}
          >
            <Text fontSize="13px" color="orange.700">
              Reset password for{" "}
              <Text as="span" fontWeight="600">
                {user.name}
              </Text>{" "}
              ({user.npk})
            </Text>
          </Box>

          {/* Password */}
          <Box mb={4}>
            <Text fontSize="13px" fontWeight="500" color="gray.700" mb={1}>
              New Password{" "}
              <Text as="span" color="red.400">
                *
              </Text>
            </Text>
            <Box position="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingRight: "40px",
                  borderColor: errors.password ? "#fc8181" : "#e2e8f0",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = errors.password
                    ? "#fc8181"
                    : "#3b82f6")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.password
                    ? "#fc8181"
                    : "#e2e8f0")
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 0,
                }}
              >
                {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </Box>
            {errors.password && (
              <Text fontSize="12px" color="red.500" mt={1}>
                {errors.password[0]}
              </Text>
            )}
          </Box>

          {/* Confirm Password */}
          <Box mb={2}>
            <Text fontSize="13px" fontWeight="500" color="gray.700" mb={1}>
              Confirm Password{" "}
              <Text as="span" color="red.400">
                *
              </Text>
            </Text>
            <Box position="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat new password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                style={{
                  ...inputStyle,
                  paddingRight: "40px",
                  borderColor: errors.password_confirmation
                    ? "#fc8181"
                    : "#e2e8f0",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = errors.password_confirmation
                    ? "#fc8181"
                    : "#3b82f6")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.password_confirmation
                    ? "#fc8181"
                    : "#e2e8f0")
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: 0,
                }}
              >
                {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </Box>
            {errors.password_confirmation && (
              <Text fontSize="12px" color="red.500" mt={1}>
                {errors.password_confirmation[0]}
              </Text>
            )}
          </Box>
        </Box>

        {/* Footer */}
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
              backgroundColor: loading ? "#fdba74" : "#f97316",
              color: "#ffffff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : "Reset Password"}
          </button>
        </Flex>
      </Box>
    </Box>
  );
};

export default ResetPasswordModal;
