import React, { useRef, useState } from "react";
import { Badge, Box, Flex, HStack, Text } from "@chakra-ui/react";
import { FiPlus, FiSearch, FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import {
  useEvaluationList,
  usePendingTriggers,
  useDeleteEvaluation,
} from "../../hooks/queries/useEvaluationQueries";
import type {
  PendingTrigger,
  PendingInternTrigger,
} from "../../types/evaluation";
import { notify } from "../../utils/toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// === TAMBAHAN INTERN ===
type EvaluationTab = "employee" | "intern";

const EvaluationList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ─── Filter state ──────────────────────────────────────────────────────────
  // searchInput: nilai langsung di input box (tidak menyebabkan request)
  // debouncedSearch: dikirim ke server setelah 500ms berhenti mengetik
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeTab, setActiveTab] = useState<EvaluationTab>("employee");
  const handleTabChange = (tab: EvaluationTab) => {
    setActiveTab(tab);
    setPage(1);
  };
  const isLeader = user?.role?.name === "Leader";
  const isAdmin = user?.role?.name === "Admin";
  const { data: pagination, isLoading: loading } = useEvaluationList({
    page,
    per_page: 10,
    status: status || undefined,
    type: activeTab,
    search: debouncedSearch || undefined,
  });
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const {
    data: employeePendingTriggers = [],
    isLoading: loadingEmployeeTriggers,
  } = usePendingTriggers(isLeader || isAdmin, "employee");
  const { data: internPendingTriggers = [], isLoading: loadingInternTriggers } =
    usePendingTriggers(isLeader || isAdmin, "intern");

  const pendingTriggers =
    activeTab === "intern" ? internPendingTriggers : employeePendingTriggers;
  const loadingTriggers =
    activeTab === "intern" ? loadingInternTriggers : loadingEmployeeTriggers;

  const employeePendingCount = employeePendingTriggers.length;
  const internPendingCount = internPendingTriggers.length;
  const { mutate: deleteDraft } = useDeleteEvaluation();

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 500);
  };

  const requestDeleteDraft = (id: number) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteDraft = () => {
    if (deleteTargetId === null) return;
    deleteDraft(deleteTargetId, {
      onSuccess: () => {
        notify.success("Evaluation cancelled successfully");
        setDeleteTargetId(null);
      },
      onError: () => {
        notify.error("Failed to delete evaluation");
        setDeleteTargetId(null);
      },
    });
  };

  const handleStartEvaluation = (
    subject: PendingTrigger | PendingInternTrigger,
  ) => {
    const params = new URLSearchParams({
      name: subject.name ?? "",
      npk: subject.npk ?? "",
      jabatan: subject.jabatan ?? "",
      department_id: subject.department_id ? String(subject.department_id) : "",
      join_date: subject.join_date ?? "",
      start_date: subject.start_contract ?? "",
      end_date: subject.end_contract ?? "",
    });
    if (activeTab === "intern") {
      params.set("intern_id", String(subject.id));
    } else {
      params.set("employee_id", String(subject.id));
    }
    navigate(`/evaluations/create?${params.toString()}`);
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const getStatusColor = (value: string) => {
    if (
      value?.includes("completed_not_extend") ||
      value?.includes("not_extend")
    )
      return "gray";
    if (value?.includes("approved")) return "green";
    if (value?.includes("rejected")) return "red";
    if (value?.includes("reviewed_by_section_head")) return "cyan";
    if (value?.includes("submitted")) return "orange";
    if (value?.includes("draft")) return "purple";
    return "blue";
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const evaluations = pagination?.data ?? [];

  // === TAMBAHAN INTERN: style tab switcher, sederhana (mengikuti pola
  // filter select yang sudah ada di file ini, bukan komponen Chakra Tabs
  // baru — supaya tidak menambah dependency). ===
  const tabButtonStyle = (tab: EvaluationTab): React.CSSProperties => ({
    padding: "8px 4px",
    fontSize: "14px",
    fontWeight: activeTab === tab ? 700 : 500,
    border: "none",
    borderBottom: "2px solid",
    borderBottomColor: activeTab === tab ? "#1A5EA8" : "transparent",
    backgroundColor: "transparent",
    color: activeTab === tab ? "#1A5EA8" : "#94a3b8",
    cursor: "pointer",
    transition: "color 0.15s, border-color 0.15s",
  });
  return (
    <MainLayout>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Evaluation Management
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              Leader assessment workflow and review history
            </Text>
          </Box>
          {(isLeader || isAdmin) && (
            <Box
              as="button"
              onClick={() => navigate("/evaluations/create")}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              w={{ base: "100%", sm: "auto" }}
              gap="8px"
              px="clamp(14px, 3vw, 20px)"
              py="clamp(8px, 2vw, 10px)"
              fontSize="clamp(12px, 2vw, 14px)"
              fontWeight={600}
              borderRadius="8px"
              color="#ffffff"
              bg="#1A5EA8"
              border="none"
              cursor="pointer"
              whiteSpace="nowrap"
              transition="all 0.2s ease"
              _hover={{
                bg: "#3A76B8",
                transform: "translatey(-1px) scale(1.02)",
                boxShadow: "0 4px 12px rgba(26,94,168,0.35)",
              }}
            >
              <FiPlus size={15} /> Create New
            </Box>
          )}
        </Flex>

        {/* === TAMBAHAN INTERN: Tab switcher Employee / Intern === */}
        <HStack gap={2} mb={6} borderBottom="1px solid" borderColor="gray.100">
          <Box position="relative" display="inline-block">
            <button
              type="button"
              style={tabButtonStyle("employee")}
              onClick={() => handleTabChange("employee")}
            >
              Employee
            </button>
            {employeePendingCount > 0 && (
              <Box
                position="absolute"
                top="-2px"
                right="-10px"
                minW="16px"
                h="16px"
                px="4px"
                borderRadius="full"
                bg="#ef4444"
                color="white"
                fontSize="10px"
                fontWeight="700"
                display="flex"
                alignItems="center"
                justifyContent="center"
                lineHeight="1"
                boxShadow="0 0 0 2px white"
              >
                {employeePendingCount > 99 ? "99+" : employeePendingCount}
              </Box>
            )}
          </Box>

          <Text color="gray.300" fontSize="14px">
            |
          </Text>

          <Box position="relative" display="inline-block">
            <button
              type="button"
              style={tabButtonStyle("intern")}
              onClick={() => handleTabChange("intern")}
            >
              Intern
            </button>
            {internPendingCount > 0 && (
              <Box
                position="absolute"
                top="-2px"
                right="-10px"
                minW="16px"
                h="16px"
                px="4px"
                borderRadius="full"
                bg="#ef4444"
                color="white"
                fontSize="10px"
                fontWeight="700"
                display="flex"
                alignItems="center"
                justifyContent="center"
                lineHeight="1"
                boxShadow="0 0 0 2px white"
              >
                {internPendingCount > 99 ? "99+" : internPendingCount}
              </Box>
            )}
          </Box>
        </HStack>

        {(isLeader || isAdmin) && (
          <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
            <HStack mb={4} gap={2}>
              <FiAlertTriangle color="#c2410c" size={16} />
              <Text fontSize="16px" fontWeight="700" color="gray.800">
                Perlu Dievaluasi
              </Text>
              <Text fontSize="12px" color="gray.400">
                (kontrak berakhir dalam 30 hari)
              </Text>
            </HStack>

            {loadingTriggers ? (
              <Flex justify="center" py={8}>
                <Text color="gray.500">Loading...</Text>
              </Flex>
            ) : pendingTriggers.length === 0 ? (
              <Flex justify="center" py={8}>
                <Text color="gray.400">
                  There is no workforce that needs to be evaluated at this
                  time{" "}
                </Text>
              </Flex>
            ) : (
              <Box overflowX="auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#fff7ed" }}>
                      {[
                        "No",
                        "Nama",
                        "NPK",
                        "Jabatan",
                        "End Contract",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 14px",
                            textAlign: "left",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#9a3412",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "1px solid #fed7aa",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTriggers.map((emp, index) => (
                      <tr
                        key={emp.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          {index + 1}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#1e293b",
                          }}
                        >
                          {emp.name}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {emp.npk}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {emp.jabatan ?? "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#b91c1c",
                            fontWeight: 600,
                          }}
                        >
                          {formatDate(emp.end_contract)}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <button
                            type="button"
                            onClick={() => handleStartEvaluation(emp)}
                            style={{
                              padding: "6px 14px",
                              fontSize: "12px",
                              fontWeight: 600,
                              borderRadius: "6px",
                              color: "#ffffff",
                              backgroundColor: "#ea580c",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Buat Evaluasi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Box>
        )}

        {/* ── Table 2: Riwayat evaluation yang sudah dibuat ── */}
        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
            Riwayat Evaluasi
          </Text>

          <HStack mb={5} gap={3} wrap="wrap">
            <Box position="relative" maxW="320px" w="full">
              <Box
                position="absolute"
                left="10px"
                top="50%"
                transform="translateY(-50%)"
                color="gray.400"
                pointerEvents="none"
              >
                <FiSearch size={14} />
              </Box>
              <input
                placeholder="Search by name or NPK"
                value={searchInput}
                onChange={handleSearchChange}
                style={{
                  width: "100%",
                  paddingLeft: "32px",
                  paddingRight: "12px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  fontSize: "14px",
                  color: "#1a202c",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  outline: "none",
                }}
              />
            </Box>

            <select
              value={status}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              style={{
                maxWidth: "220px",
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                fontSize: "14px",
                color: "#1a202c",
              }}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted_to_section_head">
                Submitted to Section Head
              </option>
              <option value="reviewed_by_section_head">
                Reviewed by Section Head
              </option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </HStack>

          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500">Loading...</Text>
            </Flex>
          ) : evaluations.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400">No evaluation records found</Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    {[
                      "No",
                      activeTab === "intern" ? "Intern" : "Employee",
                      "NPK",
                      "Status",
                      "Stage",
                      "Updated",
                      "Action",
                    ].map((header) => (
                      <th
                        key={header}
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((evaluation, index) => {
                    // === TAMBAHAN INTERN: subjek bisa employee atau intern,
                    // tergantung tab aktif (keduanya tidak akan pernah
                    // sama-sama terisi, sesuai CHECK constraint exclusive
                    // di DB). ===
                    const subject =
                      activeTab === "intern"
                        ? evaluation.intern
                        : evaluation.employee;
                    return (
                      <tr
                        key={evaluation.id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          navigate(`/evaluations/${evaluation.id}`)
                        }
                      >
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          {(page - 1) * 10 + index + 1}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#1e293b",
                            fontWeight: 500,
                          }}
                        >
                          {subject?.name ?? "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {subject?.npk ?? evaluation.npk ?? "-"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <Badge
                            colorPalette={getStatusColor(evaluation.status)}
                          >
                            {evaluation.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {evaluation.current_stage.replace(/_/g, " ")}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {formatDate(evaluation.updated_at)}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <HStack gap={3}>
                            <Box
                              as="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/evaluations/${evaluation.id}`);
                              }}
                              display="inline-flex"
                              alignItems="center"
                              justifyContent="center"
                              px="8px"
                              py="4px"
                              fontSize="12px"
                              fontWeight={600}
                              borderRadius="4px"
                              color="#1A5EA8"
                              border="1px solid"
                              borderColor="#1A5EA8"
                              bg="transparent"
                              cursor="pointer"
                              whiteSpace="nowrap"
                              transition="all 0.15s ease"
                              _hover={{
                                bg: "#eff6ff",
                              }}
                            >
                              Open
                            </Box>
                            {evaluation.status === "draft" && (
                              <Box
                                as="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestDeleteDraft(evaluation.id);
                                }}
                                display="inline-flex"
                                alignItems="center"
                                justifyContent="center"
                                px="8px"
                                py="4px"
                                fontSize="12px"
                                fontWeight={600}
                                borderRadius="4px"
                                color="#ef4444"
                                border="1px solid"
                                borderColor="#ef4444"
                                bg="transparent"
                                cursor="pointer"
                                whiteSpace="nowrap"
                                transition="all 0.15s ease"
                                _hover={{
                                  bg: "#fef2f2",
                                }}
                              >
                                Cancel
                              </Box>
                            )}
                          </HStack>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          )}

          {pagination && pagination.last_page > 1 && (
            <Flex
              justify="space-between"
              align="center"
              mt={5}
              pt={4}
              borderTop="1px solid"
              borderColor="gray.100"
            >
              <Text fontSize="12px" color="gray.500">
                Showing {evaluations.length} of {pagination.total} entries
              </Text>
              <HStack gap={2}>
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: page === 1 ? "#f8fafc" : "#ffffff",
                    color: page === 1 ? "#94a3b8" : "#475569",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <Text fontSize="13px" color="gray.600">
                  Page {pagination.current_page} of {pagination.last_page}
                </Text>
                <button
                  type="button"
                  disabled={page >= pagination.last_page}
                  onClick={() => setPage((prev) => prev + 1)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    backgroundColor:
                      page >= pagination.last_page ? "#f8fafc" : "#ffffff",
                    color: page >= pagination.last_page ? "#94a3b8" : "#475569",
                    cursor:
                      page >= pagination.last_page ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </HStack>
            </Flex>
          )}
        </Box>
      </Box>{" "}
      <ConfirmDialog
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteDraft}
        title="Cancel Evaluation"
        message="Are you sure you want to cancel this evaluation? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No"
        confirmColor="#ef4444"
        icon={<FiTrash2 size={22} />}
      />
    </MainLayout>
  );
};

export default EvaluationList;
