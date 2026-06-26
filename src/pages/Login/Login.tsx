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
  Stack,
  Text,
} from "@chakra-ui/react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = React.useState<string>("");

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
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      py={12}
      px={{ base: 4, sm: 6, lg: 8 }}
    >
      <Stack gap={0} w="full" maxW="420px">
        <Box
          bg="white"
          borderRadius="lg"
          border="0.5px solid"
          borderColor="gray.200"
          overflow="hidden"
          boxShadow="sm"
        >
          <Box
            h="4px"
            bgGradient="to-r"
            gradientFrom="brand.500"
            gradientTo="accent.400"
          />

          <Box px={9} pt={9} pb={8}>
            <Flex align="center" gap={3} mb={7}>
              <Box
                w="50px"
                h="50px"
                borderRadius="md"
                overflow="hidden"
                flexShrink={0}
              >
                <img
                  src="/favicon.png"
                  alt="Astra Visteon"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
              <Box>
                <Text
                  fontSize="13px"
                  fontWeight="500"
                  color="gray.900"
                  lineHeight="1.2"
                >
                  Astra Visteon Indonesia
                </Text>
                <Text fontSize="11px" color="gray.500" lineHeight="1.3">
                  MP
                </Text>
              </Box>
            </Flex>

            <Heading
              as="h1"
              fontSize="xl"
              fontWeight="500"
              color="gray.900"
              mb={1}
            >
              Welcome back
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={7}>
              Sign in to continue
            </Text>

            <Box as="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack gap={5}>
                {apiError && (
                  <Box
                    bg="red.50"
                    border="0.5px solid"
                    borderColor="red.200"
                    color="red.700"
                    px={4}
                    py={3}
                    borderRadius="md"
                    fontSize="sm"
                  >
                    {apiError}
                  </Box>
                )}

                <Field.Root invalid={!!errors.email}>
                  <Field.Label
                    fontSize="11px"
                    fontWeight="500"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Email address
                  </Field.Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="admin@astravisteon.co.id"
                    bg="white"
                    border="0.5px solid"
                    borderColor="gray.200"
                    fontSize="sm"
                    color="black"
                    _placeholder={{ color: "gray.400" }}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 2px var(--chakra-colors-brand-100)",
                      bg: "white",
                      color: "black",
                    }}
                    _hover={{ borderColor: "gray.300" }}
                  />
                  {errors.email && (
                    <Field.ErrorText fontSize="xs">
                      {errors.email.message}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Field.Label
                    fontSize="11px"
                    fontWeight="500"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Password
                  </Field.Label>
                  <Input
                    {...register("password")}
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    bg="gray.50"
                    border="0.5px solid"
                    borderColor="gray.200"
                    fontSize="sm"
                    color="black"
                    _placeholder={{ color: "gray.400" }}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 2px var(--chakra-colors-brand-100)",
                      bg: "white",
                      color: "black",
                    }}
                    _hover={{ borderColor: "gray.300" }}
                  />
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
                  bg="brand.500"
                  color="white"
                  width="full"
                  size="md"
                  mt={2}
                  borderRadius="md"
                  _hover={{ bg: "brand.600" }}
                  _active={{ bg: "brand.700" }}
                >
                  Sign in →
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default Login;
