import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import MainLayout from "../../components/layout/MainLayout";
import operatorService from "../../services/operatorService";
import type { OperatorFormData } from "../../types/auth";

const OperatorCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<OperatorFormData>({ name: "", nrp: "" });
  const [errors, setErrors] = useState<Partial<OperatorFormData>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<OperatorFormData> = {};
    if (!form.name.trim()) newErrors.name = "Nama wajib diisi.";
    if (!form.nrp.trim()) newErrors.nrp = "NRP wajib diisi.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setApiError("");
    try {
      await operatorService.store(form);
      navigate("/operators");
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        setErrors({ name: apiErrors.name?.[0], nrp: apiErrors.nrp?.[0] });
      } else {
        setApiError(err?.response?.data?.message || "Terjadi kesalahan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Box p={6}>
        <Box mb={6}>
          <Heading fontSize="lg" fontWeight="500" color="gray.900">
            Tambah Operator
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={0.5}>
            Input nama dan NRP operator baru
          </Text>
        </Box>

        <Box
          bg="white"
          border="0.5px solid"
          borderColor="gray.200"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="sm"
          maxW="480px"
        >
          <Box
            h="4px"
            bgGradient="to-r"
            gradientFrom="brand.500"
            gradientTo="accent.400"
          />

          <Box px={8} pt={7} pb={8}>
            <Box as="form" onSubmit={handleSubmit}>
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

                <Field.Root invalid={!!errors.name}>
                  <Field.Label
                    fontSize="11px"
                    fontWeight="500"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Nama Operator
                  </Field.Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nama lengkap operator"
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
                    }}
                    _hover={{ borderColor: "gray.300" }}
                  />
                  {errors.name && (
                    <Field.ErrorText fontSize="xs">
                      {errors.name}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.nrp}>
                  <Field.Label
                    fontSize="11px"
                    fontWeight="500"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    NRP
                  </Field.Label>
                  <Input
                    value={form.nrp}
                    onChange={(e) => setForm({ ...form, nrp: e.target.value })}
                    placeholder="Nomor Registrasi Pegawai"
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
                    }}
                    _hover={{ borderColor: "gray.300" }}
                  />
                  {errors.nrp && (
                    <Field.ErrorText fontSize="xs">
                      {errors.nrp}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Flex gap={3} pt={1}>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    loadingText="Menyimpan..."
                    bg="brand.500"
                    color="white"
                    size="sm"
                    borderRadius="md"
                    _hover={{ bg: "brand.600" }}
                    _active={{ bg: "brand.700" }}
                  >
                    Simpan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    borderRadius="md"
                    borderColor="gray.200"
                    color="gray.600"
                    _hover={{ bg: "gray.50" }}
                    onClick={() => navigate("/operators")}
                  >
                    Batal
                  </Button>
                </Flex>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default OperatorCreate;
