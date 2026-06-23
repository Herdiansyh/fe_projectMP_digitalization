import React from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { OperatorFormData } from "../types/auth";

interface Props {
  open: boolean;
  onClose: () => void;
  form: OperatorFormData;
  onChange: (form: OperatorFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  errors: Partial<OperatorFormData>;
  isSubmitting: boolean;
  isEditing: boolean;
}

const OperatorFormModal: React.FC<Props> = ({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  errors,
  isSubmitting,
  isEditing,
}) => {
  if (!open) return null;

  return (
    <Box position="fixed" inset={0} zIndex={200}>
      <Box
        position="absolute"
        inset={0}
        bg="blackAlpha.700"
        onClick={onClose}
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="full"
        maxW="480px"
        bg="white"
        borderRadius="lg"
        border="0.5px solid"
        borderColor="gray.200"
        boxShadow="lg"
        overflow="hidden"
      >
        <Box
          h="4px"
          bgGradient="to-r"
          gradientFrom="brand.500"
          gradientTo="accent.400"
        />
        <Box px={7} pt={6} pb={7}>
          <Heading fontSize="md" fontWeight="500" color="gray.900" mb={1}>
            {isEditing ? "Edit Operator" : "Tambah Operator"}
          </Heading>
          <Text fontSize="sm" color="gray.500" mb={5}>
            {isEditing
              ? "Update informasi operator."
              : "Tambah operator baru ke sistem."}
          </Text>

          <Box as="form" onSubmit={onSubmit}>
            <Stack gap={4}>
              {/* Nama */}
              <Box>
                <Text
                  fontSize="11px"
                  fontWeight="500"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb={1}
                >
                  Nama Operator
                </Text>
                <Input
                  value={form.name}
                  onChange={(e) => onChange({ ...form, name: e.target.value })}
                  placeholder="Nama lengkap operator"
                  bg="white"
                  border="0.5px solid"
                  borderColor={errors.name ? "red.300" : "gray.200"}
                  fontSize="sm"
                  color="black"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{
                    borderColor: "brand.500",
                    boxShadow: "0 0 0 2px var(--chakra-colors-brand-100)",
                  }}
                  _hover={{ borderColor: "gray.300" }}
                />
                {errors.name && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {errors.name}
                  </Text>
                )}
              </Box>

              {/* NRP */}
              <Box>
                <Text
                  fontSize="11px"
                  fontWeight="500"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb={1}
                >
                  NRP
                </Text>
                <Input
                  value={form.nrp}
                  onChange={(e) => onChange({ ...form, nrp: e.target.value })}
                  placeholder="Nomor Registrasi Pegawai"
                  bg="white"
                  border="0.5px solid"
                  borderColor={errors.nrp ? "red.300" : "gray.200"}
                  fontSize="sm"
                  color="black"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{
                    borderColor: "brand.500",
                    boxShadow: "0 0 0 2px var(--chakra-colors-brand-100)",
                  }}
                  _hover={{ borderColor: "gray.300" }}
                />
                {errors.nrp && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    {errors.nrp}
                  </Text>
                )}
              </Box>

              <Flex justify="flex-end" gap={2} pt={1}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  borderColor="gray.200"
                  color="gray.600"
                  _hover={{ bg: "gray.50" }}
                  disabled={isSubmitting}
                  onClick={onClose}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  bg="brand.500"
                  color="white"
                  _hover={{ bg: "brand.600" }}
                  _active={{ bg: "brand.700" }}
                  loading={isSubmitting}
                  loadingText="Menyimpan..."
                >
                  {isEditing ? "Update" : "Simpan"}
                </Button>
              </Flex>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OperatorFormModal;
