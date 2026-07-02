import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Flex, Input, HStack, Grid } from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import internService from "../../services/internService";
import { toaster } from "../../components/ui/toaster";
import fptkService from "../../services/fptkService";
import type { Intern } from "../../types/intern";
import DeleteModal from "./DeleteModal";
import InternFormModal from "./InternFormModal";
import type { MasterData } from "../../types/fptk";
import InternDetailModal from "./InternDetailModal";

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

// ── Main Component ────────────────────────────────────────────────────────────
const NeedEvaluationBadge = () => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 8px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 700,
      color: "#be123c",
      backgroundColor: "#fff1f2",
      border: "1px solid #fecdd3",
      marginTop: "4px",
    }}
  >
    ⚠ Need Evaluation
  </span>
);
const InternList: React.FC = () => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Intern | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Intern | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Intern | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchInterns = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const res = await internService.getInterns({
          page,
          per_page: 15,
          search: debouncedSearch || undefined,
          department_id: filterDept ? Number(filterDept) : undefined,
        });
        setInterns(res.data.data);
        setTotalPages(res.data.last_page);
        setTotalData(res.data.total);
        setCurrentPage(res.data.current_page);
      } catch {
        toaster.create({ title: "Failed to load intern data", type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filterDept],
  );

  useEffect(() => {
    void fptkService.getMasterData().then((res) => setMasterData(res.data));
  }, []);

  useEffect(() => {
    void fetchInterns(1);
  }, [fetchInterns]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await internService.deleteIntern(deleteTarget.id);
      toaster.create({ title: "Intern deleted successfully", type: "success" });
      setDeleteTarget(null);
      const targetPage =
        interns.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      void fetchInterns(targetPage);
    } catch {
      toaster.create({ title: "Failed to delete intern", type: "error" });
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
      <InternFormModal
        isOpen={formOpen}
        editTarget={editTarget}
        masterData={masterData}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSaved={() => void fetchInterns(currentPage)}
      />
      <DeleteModal
        isOpen={!!deleteTarget}
        intern={deleteTarget}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <InternDetailModal
        isOpen={!!detailTarget}
        intern={detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      <Box>
        {/* Header */}
        <Flex mb={6} justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Internship Manpower{" "}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {totalData} total registered interns
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
            <FiPlus size={15} /> Add Intern
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
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={3}>
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
                  <th style={thStyle}>Area / Line</th>
                  <th style={thStyle}>End Internship</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
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
                ) : interns.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      No intern data
                    </td>
                  </tr>
                ) : (
                  interns.map((intern) => {
                    const isWarning = !!intern.is_near_expiry;
                    return (
                      <tr
                        key={intern.id}
                        onClick={() => setDetailTarget(intern)}
                        style={{
                          backgroundColor: isWarning ? "#fff5f5" : "white",
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background-color 0.15s",
                          cursor: "pointer",
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
                          {intern.npk}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "14px",
                            color: "#1a202c",
                          }}
                        >
                          <Text fontWeight="500">{intern.name}</Text>
                          {intern.gender && (
                            <Text fontSize="12px" color="gray.400">
                              {intern.gender === "male" ? "Male" : "Female"}
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
                          <div>{intern.department?.name ?? "-"}</div>
                          {intern.section && (
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                              {intern.section.name}
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
                          {intern.jabatan ?? "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {intern.area || "-"}
                          {intern.line && (
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                              {intern.line}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                          {intern.end_contract ? (
                            <Box>
                              <Text
                                fontWeight={isWarning ? 700 : 400}
                                color={isWarning ? "red.600" : "gray.700"}
                              >
                                {isWarning && "⚠️ "}
                                {formatDate(intern.end_contract)}
                              </Text>
                              {isWarning &&
                                intern.days_until_expiry !== null && (
                                  <>
                                    <Box mt={1}>
                                      <NeedEvaluationBadge />
                                    </Box>
                                  </>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTarget(intern);
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(intern);
                              }}
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
                  onClick={() => void fetchInterns(currentPage - 1)}
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
                  onClick={() => void fetchInterns(currentPage + 1)}
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

export default InternList;
