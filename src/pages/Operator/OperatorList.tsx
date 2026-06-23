import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";
import MainLayout from "../../components/layout/MainLayout";
import operatorService from "../../services/operatorService";
import type { Operator, OperatorFormData } from "../../types/auth";
import OperatorFormModal from "../../components/OperatorFormModal";

// Icons
const IconSearch = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const IconEdit = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconDelete = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconChevronLeft = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

// Dialog komponen sederhana
interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
const Dialog: React.FC<DialogProps> = ({ open, onClose, children }) => {
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
        {children}
      </Box>
    </Box>
  );
};

const OperatorList: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Form dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [form, setForm] = useState<OperatorFormData>({ name: "", nrp: "" });
  const [formErrors, setFormErrors] = useState<Partial<OperatorFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState<Operator | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async (page = 1, search = "") => {
    setIsRefreshing(true);
    try {
      const response = await operatorService.getAll({
        page,
        per_page: itemsPerPage,
        search: search.trim() || undefined,
      });

      // response.data.data karena Laravel pagination membungkus data di dalam .data
      const items = Array.isArray(response.data)
        ? response.data
        : ((response.data as any)?.data ?? []);
      setOperators(items);
      setTotalItems(response.pagination?.total ?? 0);
      setTotalPages(response.pagination?.last_page ?? 1);
    } catch {
      setOperators([]);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage, searchQuery);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length === 1) return;
    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1);
      fetchData(1, value);
    }, 400);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    fetchData(1, "");
  };

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchData(page, searchQuery);
  };

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const openDialog = (operator?: Operator) => {
    if (operator) {
      setEditingOperator(operator);
      setForm({ name: operator.name, nrp: operator.nrp });
    } else {
      setEditingOperator(null);
      setForm({ name: "", nrp: "" });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingOperator(null);
    setForm({ name: "", nrp: "" });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<OperatorFormData> = {};
    if (!form.name.trim()) errors.name = "Nama wajib diisi.";
    if (!form.nrp.trim()) errors.nrp = "NRP wajib diisi.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (editingOperator) {
        await operatorService.update(editingOperator.id, form);
      } else {
        await operatorService.store(form);
      }
      closeDialog();
      fetchData(currentPage, searchQuery);
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        setFormErrors({ name: apiErrors.name?.[0], nrp: apiErrors.nrp?.[0] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (operator: Operator) => {
    setOperatorToDelete(operator);
    setDeleteDialogOpen(true);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setOperatorToDelete(null);
  };

  const handleDelete = async () => {
    if (!operatorToDelete) return;
    setIsDeleting(true);
    try {
      await operatorService.destroy(operatorToDelete.id);
      cancelDelete();
      fetchData(currentPage, searchQuery);
    } catch {
      // error handled silently
    } finally {
      setIsDeleting(false);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <MainLayout>
      <Box p={6}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading fontSize="lg" fontWeight="500" color="gray.900">
              Data Operator
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={0.5}>
              Daftar operator yang terdaftar
            </Text>
          </Box>
          <Button
            bg="brand.500"
            color="white"
            size="sm"
            borderRadius="md"
            _hover={{ bg: "brand.600" }}
            _active={{ bg: "brand.700" }}
            onClick={() => openDialog()}
          >
            + Tambah Operator
          </Button>
        </Flex>

        {/* Card */}
        <Box
          bg="white"
          border="0.5px solid"
          borderColor="gray.200"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="sm"
        >
          <Box
            h="4px"
            bgGradient="to-r"
            gradientFrom="brand.500"
            gradientTo="accent.400"
          />

          {isLoading ? (
            <Flex justify="center" align="center" py={16}>
              <Spinner color="brand.500" />
            </Flex>
          ) : (
            <Box p={5}>
              {/* Search */}
              <Flex align="center" gap={2} mb={4} maxW="320px">
                <Box position="relative" flex={1}>
                  <Box
                    position="absolute"
                    left={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                    pointerEvents="none"
                  >
                    <IconSearch />
                  </Box>
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Cari nama atau NRP..."
                    pl={8}
                    h="34px"
                    fontSize="sm"
                    bg="white"
                    border="0.5px solid"
                    borderColor="gray.200"
                    color="black"
                    _placeholder={{ color: "gray.400" }}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 2px var(--chakra-colors-brand-100)",
                    }}
                    _hover={{ borderColor: "gray.300" }}
                  />
                </Box>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    color="gray.400"
                    _hover={{ color: "gray.600" }}
                    onClick={clearSearch}
                    minW="auto"
                    px={2}
                  >
                    ✕
                  </Button>
                )}
                {isRefreshing && <Spinner size="sm" color="gray.400" />}
              </Flex>

              {/* Table */}
              <Table.Root size="sm" variant="outline" w="full">
                <Table.Header>
                  <Table.Row bg="gray.50">
                    {[
                      { label: "No", w: "60px" },
                      { label: "Nama" },
                      { label: "NRP" },
                      { label: "Dibuat Oleh" },
                      { label: "Aksi", w: "80px" },
                    ].map((col) => (
                      <Table.ColumnHeader
                        key={col.label}
                        px={4}
                        py={3}
                        w={col.w}
                        fontSize="11px"
                        fontWeight="500"
                        color="gray.500"
                        textTransform="uppercase"
                        letterSpacing="wider"
                      >
                        {col.label}
                      </Table.ColumnHeader>
                    ))}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {operators.length === 0 ? (
                    <Table.Row>
                      <Table.Cell
                        colSpan={5}
                        textAlign="center"
                        py={12}
                        color="gray.400"
                        fontSize="sm"
                      >
                        {searchQuery
                          ? `Tidak ada hasil untuk "${searchQuery}"`
                          : "Belum ada data operator."}
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    operators.map((op, index) => (
                      <Table.Row
                        key={op.id}
                        _hover={{ bg: "gray.50" }}
                        borderTop="0.5px solid"
                        borderColor="gray.100"
                      >
                        <Table.Cell
                          px={4}
                          py={3}
                          fontSize="sm"
                          color="gray.500"
                        >
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </Table.Cell>
                        <Table.Cell
                          px={4}
                          py={3}
                          fontSize="sm"
                          color="gray.900"
                          fontWeight="500"
                        >
                          {op.name}
                        </Table.Cell>
                        <Table.Cell
                          px={4}
                          py={3}
                          fontSize="sm"
                          color="gray.700"
                        >
                          {op.nrp}
                        </Table.Cell>
                        <Table.Cell
                          px={4}
                          py={3}
                          fontSize="sm"
                          color="gray.500"
                        >
                          {op.created_by.name}
                        </Table.Cell>
                        <Table.Cell px={4} py={3}>
                          <Flex gap={1}>
                            <Button
                              variant="outline"
                              size="xs"
                              p={1}
                              borderColor="gray.200"
                              color="gray.600"
                              _hover={{ bg: "gray.50" }}
                              onClick={() => openDialog(op)}
                            >
                              <IconEdit />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              p={1}
                              color="red.500"
                              bg="red.50"
                              _hover={{ bg: "red.100" }}
                              onClick={() => confirmDelete(op)}
                            >
                              <IconDelete />
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table.Root>

              {/* Pagination */}
              {totalPages > 0 && (
                <Flex
                  justify="space-between"
                  align="center"
                  pt={4}
                  mt={2}
                  borderTop="0.5px solid"
                  borderColor="gray.100"
                >
                  <Text fontSize="xs" color="gray.500">
                    Showing {startItem}–{endItem} of {totalItems} items
                  </Text>
                  <Flex align="center" gap={1}>
                    <Button
                      variant="outline"
                      size="xs"
                      p={1}
                      borderColor="gray.200"
                      color="gray.600"
                      _hover={{ bg: "gray.50" }}
                      disabled={currentPage === 1}
                      onClick={() => changePage(currentPage - 1)}
                    >
                      <IconChevronLeft />
                    </Button>
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <Flex
                          key={`dots-${idx}`}
                          w="28px"
                          h="28px"
                          align="center"
                          justify="center"
                        >
                          <Text fontSize="xs" color="gray.400">
                            ...
                          </Text>
                        </Flex>
                      ) : (
                        <Button
                          key={page}
                          size="xs"
                          w="28px"
                          h="28px"
                          p={0}
                          variant={page === currentPage ? "solid" : "outline"}
                          bg={page === currentPage ? "brand.500" : "white"}
                          color={page === currentPage ? "white" : "gray.700"}
                          borderColor={
                            page === currentPage ? "brand.500" : "gray.200"
                          }
                          _hover={{
                            bg: page === currentPage ? "brand.600" : "gray.50",
                          }}
                          onClick={() => changePage(page as number)}
                        >
                          {page}
                        </Button>
                      ),
                    )}
                    <Button
                      variant="outline"
                      size="xs"
                      p={1}
                      borderColor="gray.200"
                      color="gray.600"
                      _hover={{ bg: "gray.50" }}
                      disabled={currentPage === totalPages}
                      onClick={() => changePage(currentPage + 1)}
                    >
                      <IconChevronRight />
                    </Button>
                  </Flex>
                </Flex>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Form Dialog */}
      <OperatorFormModal
        open={dialogOpen}
        onClose={closeDialog}
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        errors={formErrors}
        isSubmitting={isSubmitting}
        isEditing={!!editingOperator}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <Box h="4px" bg="red.500" />
        <Box px={7} pt={6} pb={7}>
          <Heading fontSize="md" fontWeight="500" color="gray.900" mb={1}>
            Konfirmasi Hapus
          </Heading>
          <Text fontSize="sm" color="gray.500" mb={5}>
            Yakin ingin menghapus operator{" "}
            <Box as="span" fontWeight="500" color="gray.900">
              "{operatorToDelete?.name}"
            </Box>
            ? Tindakan ini tidak dapat dibatalkan.
          </Text>
          <Flex justify="flex-end" gap={2}>
            <Button
              variant="outline"
              size="sm"
              borderColor="gray.200"
              color="gray.600"
              _hover={{ bg: "gray.50" }}
              disabled={isDeleting}
              onClick={cancelDelete}
            >
              Batal
            </Button>
            <Button
              size="sm"
              bg="red.500"
              color="white"
              _hover={{ bg: "red.600" }}
              _active={{ bg: "red.700" }}
              loading={isDeleting}
              loadingText="Menghapus..."
              onClick={handleDelete}
            >
              Hapus
            </Button>
          </Flex>
        </Box>
      </Dialog>
    </MainLayout>
  );
};

export default OperatorList;
