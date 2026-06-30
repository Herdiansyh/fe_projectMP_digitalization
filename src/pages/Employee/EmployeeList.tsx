import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Flex, Input, HStack, Grid } from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import employeeService from "../../services/employeeService";
import { toaster } from "../../components/ui/toaster";
import fptkService from "../../services/fptkService";
import type { Employee } from "../../types/employee";
import DeleteModal from "./DeleteModal";
import EmployeeFormModal from "./EmployeeFormModal";
import type { MasterData } from "../../types/fptk";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Badge ─────────────────────────────────────────────────────────────────────

const Badge = ({
  children,
  color,
  bg,
  border,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      color,
      backgroundColor: bg,
      border: `1px solid ${border}`,
    }}
  >
    {children}
  </span>
);

const employmentTypeBadge = (type: string) => {
  const map: Record<
    string,
    { color: string; bg: string; border: string; label: string }
  > = {
    permanent: {
      color: "#15803d",
      bg: "#f0fdf4",
      border: "#bbf7d0",
      label: "Permanent",
    },
    contract: {
      color: "#92400e",
      bg: "#fffbeb",
      border: "#fde68a",
      label: "Contract",
    },
    apprentice: {
      color: "#1d4ed8",
      bg: "#eff6ff",
      border: "#bfdbfe",
      label: "Apprentice",
    },
  };
  const s = map[type] ?? {
    color: "#64748b",
    bg: "#f8fafc",
    border: "#e2e8f0",
    label: type,
  };
  return <Badge {...s}>{s.label}</Badge>;
};

const statusBadge = (status: string) => {
  const map: Record<
    string,
    { color: string; bg: string; border: string; label: string }
  > = {
    active: {
      color: "#15803d",
      bg: "#f0fdf4",
      border: "#bbf7d0",
      label: "Active",
    },
    nonactive: {
      color: "#64748b",
      bg: "#f8fafc",
      border: "#e2e8f0",
      label: "Non-Active",
    },
    resigned: {
      color: "#be123c",
      bg: "#fff1f2",
      border: "#fecdd3",
      label: "Resigned",
    },
  };
  const s = map[status] ?? {
    color: "#64748b",
    bg: "#f8fafc",
    border: "#e2e8f0",
    label: status,
  };
  return <Badge {...s}>{s.label}</Badge>;
};

// ── Main Component ────────────────────────────────────────────────────────────

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchEmployees = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const res = await employeeService.getEmployees({
          page,
          per_page: 15,
          search: debouncedSearch || undefined,
          department_id: filterDept ? Number(filterDept) : undefined,
          employment_type: filterType || undefined,
          status: filterStatus || undefined,
        });
        setEmployees(res.data.data);
        setTotalPages(res.data.last_page);
        setTotalData(res.data.total);
        setCurrentPage(res.data.current_page);
      } catch {
        toaster.create({ title: "Failed to load employee data", type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filterDept, filterType, filterStatus],
  );

  useEffect(() => {
    void fptkService.getMasterData().then((res) => setMasterData(res.data));
  }, []);

  useEffect(() => {
    void fetchEmployees(1);
  }, [fetchEmployees]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await employeeService.deleteEmployee(deleteTarget.id);
      toaster.create({ title: "Employee deleted successfully", type: "success" });
      setDeleteTarget(null);
      const targetPage =
        employees.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;
      void fetchEmployees(targetPage);
    } catch {
      toaster.create({ title: "Failed to delete employee", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const thStyle: React.CSSProperties = {
    padding: "10px 16px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "left",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  };

  return (
    <MainLayout>
      <EmployeeFormModal
        isOpen={formOpen}
        editTarget={editTarget}
        masterData={masterData}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSaved={() => void fetchEmployees(currentPage)}
      />
      <DeleteModal
        isOpen={!!deleteTarget}
        employee={deleteTarget}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Box>
        {/* Header */}
        <Flex mb={6} justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Manpower Management
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {totalData} total registered employees
            </Text>
          </Box>
          <button
            type="button"
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 600,
              borderRadius: "8px",
              color: "#ffffff",
              backgroundColor: "#1A5EA8",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#154d8c")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#1A5EA8")
            }
          >
            <FiPlus size={15} /> Add Employee
          </button>
        </Flex>

        {/* Filters */}
        <Box
          bg="white"
          borderRadius="12px"
          borderWidth="1px"
          borderColor="gray.100"
          shadow="sm"
          p={4}
          mb={4}
        >
          <Grid
            templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 1fr" }}
            gap={3}
          >
            <Box position="relative">
              <Box
                position="absolute"
                left="10px"
                top="50%"
                style={{ transform: "translateY(-50%)" }}
              >
                <FiSearch size={14} color="#94a3b8" />
              </Box>
              <Input
                pl="32px"
                placeholder="Search NPK or name..."
                value={search}
                fontSize="14px"
                onChange={(e) => setSearch(e.target.value)}
                bg="#f9fafb"
                border="1px solid #e2e8f0"
                borderRadius="8px"
              />
            </Box>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f9fafb",
                fontSize: "14px",
                color: "#1a202c",
              }}
            >
              <option value="">All Departments</option>
              {masterData?.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f9fafb",
                fontSize: "14px",
                color: "#1a202c",
              }}
            >
              <option value="">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="contract">Contract</option>
              <option value="apprentice">Apprentice</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f9fafb",
                fontSize: "14px",
                color: "#1a202c",
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="nonactive">Non-Active</option>
              <option value="resigned">Resigned</option>
            </select>
          </Grid>
        </Box>

        {/* Table */}
        <Box
          bg="white"
          borderRadius="12px"
          borderWidth="1px"
          borderColor="gray.100"
          shadow="sm"
          overflow="hidden"
        >
          <Box style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>NPK</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Position</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>End Contract</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      Loading data...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      No employee data
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => {
                    const isWarning = !!emp.is_near_expiry;
                    return (
                      <tr
                        key={emp.id}
                        style={{
                          backgroundColor: isWarning ? "#fff5f5" : "white",
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isWarning)
                            e.currentTarget.style.backgroundColor = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isWarning
                            ? "#fff5f5"
                            : "white";
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#1a202c",
                          }}
                        >
                          {emp.npk}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "14px",
                            color: "#1a202c",
                          }}
                        >
                          <Text fontWeight="500">{emp.name}</Text>
                          {emp.gender && (
                            <Text fontSize="12px" color="gray.400">
                              {emp.gender === "male"
                                ? "Male"
                                : "Female"}
                            </Text>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          <div>{emp.department?.name ?? "-"}</div>
                          {emp.section && (
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                              {emp.section.name}
                            </div>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {emp.jabatan ?? "-"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {employmentTypeBadge(emp.employment_type)}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {statusBadge(emp.status)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                          {emp.end_contract ? (
                            <Box>
                              <Text
                                fontWeight={isWarning ? 700 : 400}
                                color={isWarning ? "red.600" : "gray.700"}
                              >
                                {isWarning && "⚠️ "}
                                {formatDate(emp.end_contract)}
                              </Text>
                              {isWarning && emp.days_until_expiry !== null && (
                                <Text fontSize="12px" color="red.400">
                                  {emp.days_until_expiry} days left
                                </Text>
                              )}
                            </Box>
                          ) : (
                            <Text color="gray.400">-</Text>
                          )}
                        </td>
                        <td
                          style={{ padding: "12px 16px", textAlign: "center" }}
                        >
                          <HStack justify="center" gap={2}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditTarget(emp);
                                setFormOpen(true);
                              }}
                              style={{
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#1A5EA8",
                                backgroundColor: "#eff6ff",
                                border: "1px solid #bfdbfe",
                                cursor: "pointer",
                              }}
                              title="Edit"
                            >
                              <FiEdit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(emp)}
                              style={{
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#be123c",
                                backgroundColor: "#fff1f2",
                                border: "1px solid #fecdd3",
                                cursor: "pointer",
                              }}
                              title="Delete"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </HStack>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex
              px={6}
              py={4}
              justify="space-between"
              align="center"
              borderTop="1px solid #f1f5f9"
            >
              <Text fontSize="13px" color="gray.500">
                Page {currentPage} of {totalPages}
              </Text>
              <HStack gap={2}>
                <button
                  type="button"
                  disabled={currentPage === 1 || loading}
                  onClick={() => void fetchEmployees(currentPage - 1)}
                  style={{
                    padding: "6px 12px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    color: currentPage === 1 ? "#94a3b8" : "#1A5EA8",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    cursor:
                      currentPage === 1 || loading ? "not-allowed" : "pointer",
                  }}
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages || loading}
                  onClick={() => void fetchEmployees(currentPage + 1)}
                  style={{
                    padding: "6px 12px",
                    fontSize: "13px",
                    borderRadius: "6px",
                    color: currentPage === totalPages ? "#94a3b8" : "#1A5EA8",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    cursor:
                      currentPage === totalPages || loading
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Next →
                </button>
              </HStack>
            </Flex>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default EmployeeList;
