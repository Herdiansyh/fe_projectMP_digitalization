import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  InputGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FiEye, FiEyeOff, FiHash, FiLock } from "react-icons/fi";

const loginSchema = z.object({
  npk: z.string().min(1, "NPK cannot be empty"),
  password: z.string().min(8, "Password minimum 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Ringkasan value proposition — jargon singkat, bukan penjelasan proses.
const HIGHLIGHTS = [
  "FPTK Management",
  "Structured Scoring",
  "Multi-Level Approval",
  "Full Traceability",
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError("");
    try {
      await login(data);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError(
          error.response?.data?.message || "Login failed. Please try again.",
        );
      } else if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError("An unexpected error occurred.");
      }
    }
  };

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Global keyframes — respects prefers-reduced-motion */}
      <style>{`
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginDrift {
          from { background-position: 0 0; }
          to { background-position: 120px 120px; }
        }
        .login-animate { animation: loginFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .login-drift { animation: loginDrift 30s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .login-animate, .login-drift { animation: none !important; }
        }
      `}</style>

      {/* ── Panel kiri — brand & signature (approval flow) ── */}
      <Box
        display={{ base: "none", lg: "flex" }}
        flex="1"
        position="relative"
        overflow="hidden"
        bgGradient="to-br"
        gradientFrom="brand.600"
        gradientTo="brand.800"
      >
        {/* Pola grid halus — mengesankan presisi manufaktur, bukan dekorasi acak */}
        <Box
          position="absolute"
          inset={0}
          opacity={0.12}
          className="login-drift"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Aksen radial accent color di sudut */}
        <Box
          position="absolute"
          top="-120px"
          right="-120px"
          w="360px"
          h="360px"
          borderRadius="full"
          bgGradient="to-br"
          gradientFrom="accent.400"
          gradientTo="transparent"
          opacity={0.35}
          filter="blur(40px)"
        />

        <Flex
          position="relative"
          direction="column"
          justify="space-between"
          w="full"
          px={{ lg: 12, xl: 16 }}
          py={14}
          color="white"
        >
          {/* Brand mark */}
          <Flex align="center" gap={3}>
            <Box
              w="46px"
              h="46px"
              borderRadius="10px"
              overflow="hidden"
              bg="white"
              boxShadow="0 2px 10px rgba(0,0,0,0.18)"
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <img
                src="/favicon.png"
                alt="Astra Visteon"
                style={{ width: "72%", height: "72%", objectFit: "contain" }}
              />
            </Box>
            <Box>
              <Text fontSize="13px" fontWeight="600" lineHeight="1.2">
                PT. Astra Visteon Indonesia
              </Text>
              <Text fontSize="11px" color="whiteAlpha.700" letterSpacing="wide">
                MANPOWER MANAGEMENT SYSTEM
              </Text>
            </Box>
          </Flex>

          {/* Headline + value proposition (jargon singkat, bukan penjelasan proses) */}
          <Box maxW="420px">
            <Text
              fontSize="11px"
              fontWeight="700"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="accent.300"
              mb={3}
            >
              Workforce Evaluation Platform
            </Text>
            <Heading
              as="h2"
              fontSize={{ lg: "30px", xl: "34px" }}
              fontWeight="600"
              lineHeight="1.25"
              letterSpacing="-0.01em"
              mb={4}
            >
              Manage FPTK, employee assessments, and approval workflows in one
              system.{" "}
            </Heading>
            <Text
              fontSize="14px"
              color="whiteAlpha.800"
              mb={8}
              lineHeight="1.6"
            >
              Manage FPTK, competency assessments, employee evaluations, and
              approvals in one centralized platform.{" "}
            </Text>

            <Flex gap={2} wrap="wrap">
              {HIGHLIGHTS.map((item) => (
                <Flex
                  key={item}
                  align="center"
                  gap={2}
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  bg="whiteAlpha.100"
                >
                  <Box w="5px" h="5px" borderRadius="full" bg="accent.300" />
                  <Text fontSize="12px" fontWeight="600" color="white">
                    {item}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>

          <Text fontSize="11.5px" color="whiteAlpha.600">
            © {new Date().getFullYear()} PT. Astra Visteon Indonesia. All rights
            reserved.
          </Text>
        </Flex>
      </Box>

      {/* ── Panel kanan — form login ── */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        px={{ base: 5, sm: 8 }}
        py={12}
      >
        <Box
          w="full"
          maxW="420px"
          className="login-animate"
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="18px"
          boxShadow="lg"
          p={{ base: 6, md: 8 }}
        >
          {" "}
          {/* Header ringkas — tampil hanya saat panel kiri disembunyikan (mobile) */}
          <Flex
            display={{ base: "flex", lg: "none" }}
            align="center"
            gap={3}
            mb={9}
          >
            <Box
              w="44px"
              h="44px"
              borderRadius="10px"
              overflow="hidden"
              bg="white"
              boxShadow="0 1px 6px rgba(0,0,0,0.12)"
              border="1px solid"
              borderColor="gray.100"
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <img
                src="/favicon.png"
                alt="Astra Visteon"
                style={{ width: "72%", height: "72%", objectFit: "contain" }}
              />
            </Box>
            <Box>
              <Text
                fontSize="13px"
                fontWeight="600"
                color="gray.900"
                lineHeight="1.2"
              >
                PT. Astra Visteon Indonesia
              </Text>
              <Text fontSize="11px" color="gray.500" letterSpacing="wide">
                MANPOWER MANAGEMENT SYSTEM
              </Text>
            </Box>
          </Flex>
          <Box mb={8}>
            <Heading
              as="h1"
              fontSize="26px"
              fontWeight="600"
              color="gray.900"
              letterSpacing="-0.01em"
              mb={1.5}
            >
              Welcome back
            </Heading>
            <Text fontSize="14px" color="gray.500">
              Sign in to continue to your account.
            </Text>
          </Box>
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={5}>
              {apiError && (
                <Box
                  bg="red.50"
                  border="1px solid"
                  borderColor="red.200"
                  color="red.700"
                  px={4}
                  py={3}
                  borderRadius="10px"
                  fontSize="sm"
                >
                  {apiError}
                </Box>
              )}

              {/* NPK Field */}
              <Field.Root invalid={!!errors.npk}>
                <Field.Label
                  fontSize="11px"
                  fontWeight="600"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  NPK
                </Field.Label>
                <InputGroup startElement={<FiHash size={16} color="#9CA3AF" />}>
                  <Input
                    {...register("npk")}
                    type="text"
                    placeholder="Enter your NPK"
                    bg="white"
                    border="1.5px solid"
                    borderColor="gray.200"
                    borderRadius="10px"
                    fontSize="sm"
                    color="black"
                    h="44px"
                    _placeholder={{ color: "gray.400" }}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 3px var(--chakra-colors-brand-100)",
                      bg: "white",
                      color: "black",
                    }}
                    _hover={{ borderColor: "gray.300" }}
                  />
                </InputGroup>
                {errors.npk && (
                  <Field.ErrorText fontSize="xs">
                    {errors.npk.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              {/* Password Field */}
              <Field.Root invalid={!!errors.password}>
                <Field.Label
                  fontSize="11px"
                  fontWeight="600"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  Password
                </Field.Label>
                <InputGroup
                  startElement={<FiLock size={16} color="#9CA3AF" />}
                  endElement={
                    <Button
                      variant="ghost"
                      size="sm"
                      minW="unset"
                      p={0}
                      h="100%"
                      color="gray.400"
                      _hover={{ color: "gray.600", bg: "transparent" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FiEyeOff size={17} />
                      ) : (
                        <FiEye size={17} />
                      )}
                    </Button>
                  }
                >
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    bg="white"
                    border="1.5px solid"
                    borderColor="gray.200"
                    borderRadius="10px"
                    fontSize="sm"
                    color="black"
                    h="44px"
                    _placeholder={{ color: "gray.400" }}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 3px var(--chakra-colors-brand-100)",
                      bg: "white",
                      color: "black",
                    }}
                    _hover={{ borderColor: "gray.300" }}
                  />
                </InputGroup>
                {errors.password && (
                  <Field.ErrorText fontSize="xs">
                    {errors.password.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              <Button
                type="submit"
                loading={isSubmitting}
                loadingText="Signing in..."
                bgGradient="to-r"
                gradientFrom="brand.500"
                gradientTo="brand.600"
                color="white"
                width="full"
                size="md"
                h="46px"
                mt={1}
                borderRadius="10px"
                fontWeight="600"
                _hover={{
                  gradientFrom: "brand.600",
                  gradientTo: "brand.700",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 14px var(--chakra-colors-brand-200)",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.15s ease"
              >
                Sign in →
              </Button>
            </Stack>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Login;
