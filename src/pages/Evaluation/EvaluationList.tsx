import React, { useEffect, useMemo, useState } from "react";
import { Badge, Box, Flex, HStack, Text } from "@chakra-ui/react";
import { FiPlus, FiSearch, FiAlertTriangle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import evaluationService from "../../services/evaluationService";
import type {
  Evaluation,
  PaginatedResponse,
  PendingTrigger,
} from "../../types/evaluation";

const EvaluationList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] =
    useState<PaginatedResponse<Evaluation> | null>(null);

  const [pendingTriggers, setPendingTriggers] = useState<PendingTrigger[]>([]);
  const [loadingTriggers, setLoadingTriggers] = useState(true);

  const isLeader = user?.role?.name === "Leader";
  const isAdmin = user?.role?.name === "Admin";
  console.log(isAdmin, user?.role?.name);
  const loadPendingTriggers = async () => {
    if (!isLeader && !isAdmin) {
      setLoadingTriggers(false);
      return;
    }
    setLoadingTriggers(true);
    try {
      const res = await evaluationService.getPendingTriggers();
      setPendingTriggers(res.data);
    } catch {
      setPendingTriggers([]);
    } finally {
      setLoadingTriggers(false);
    }
  };

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      const response = await evaluationService.getEvaluations({
        page,
        per_page: 10,
        status: status || undefined,
      });
      setPagination(response);
    } catch {
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this evaluation?"))
      return;
    try {
      await evaluationService.deleteEvaluation(id);
      void loadEvaluations();
      void loadPendingTriggers();
    } catch {
      alert("Failed to delete evaluation");
    }
  };

  useEffect(() => {
    void loadPendingTriggers();
  }, [isLeader, isAdmin]);

  useEffect(() => {
    void loadEvaluations();
  }, [page, status]);

  // Dipanggil setelah user kembali dari form create — refresh kedua tabel
  // sekaligus supaya employee yang baru dibuatkan evaluasi hilang dari
  // worklist dan muncul di riwayat.
  useEffect(() => {
    const handleFocus = () => {
      void loadPendingTriggers();
      void loadEvaluations();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isLeader, page, status, isAdmin]);

  const filteredEvaluations = useMemo(() => {
    const list = pagination?.data ?? [];
    if (!search.trim()) return list;
    const query = search.toLowerCase();
    return list.filter((evaluation) => {
      const employeeName = evaluation.employee?.name?.toLowerCase() ?? "";
      const npk = evaluation.employee?.npk?.toLowerCase() ?? "";
      return employeeName.includes(query) || npk.includes(query);
    });
  }, [pagination, search]);

  const getStatusColor = (value: string) => {
    if (value?.includes("approved")) return "green";
    if (value?.includes("rejected")) return "red";
    if (value?.includes("submitted")) return "orange";
    return "gray";
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleStartEvaluation = (emp: PendingTrigger) => {
    const params = new URLSearchParams({
      employee_id: String(emp.id),
      name: emp.name ?? "",
      npk: emp.npk ?? "",
      jabatan: emp.jabatan ?? "",
      department_id: emp.department_id ? String(emp.department_id) : "",
      join_date: emp.join_date ?? "",
      start_date: emp.start_contract ?? "",
      end_date: emp.end_contract ?? "",
    });
    navigate(`/evaluations/create?${params.toString()}`);
  };

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
          {isLeader ||
            (isAdmin && (
              <button
                type="button"
                onClick={() => navigate("/evaluations/create")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  borderRadius: "8px",
                  color: "#ffffff",
                  backgroundColor: "#3b82f6",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FiPlus size={15} /> Create New
              </button>
            ))}
        </Flex>

        {/* ── Table 1: Worklist — MP yang perlu dievaluasi ── */}
        {isLeader ||
          (isAdmin && (
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
                    Tidak ada manpower yang perlu dievaluasi saat ini
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
          ))}

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
                placeholder="Search by employee name or NPK"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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
          ) : filteredEvaluations.length === 0 ? (
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
                      "Employee",
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
                  {filteredEvaluations.map((evaluation, index) => (
                    <tr
                      key={evaluation.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/evaluations/${evaluation.id}`)}
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
                        {evaluation.employee?.name ?? "-"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {evaluation.employee?.npk ?? evaluation.npk ?? "-"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <Badge colorPalette={getStatusColor(evaluation.status)}>
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
                          <Text fontSize="13px" color="blue.600">
                            Open
                          </Text>
                          {evaluation.status === "draft" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleDeleteDraft(evaluation.id);
                              }}
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                fontWeight: 600,
                                borderRadius: "4px",
                                color: "#ef4444",
                                border: "1px solid #ef4444",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </HStack>
                      </td>
                    </tr>
                  ))}
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
                Showing {filteredEvaluations.length} of {pagination.total}{" "}
                entries
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
      </Box>
    </MainLayout>
  );
};

export default EvaluationList;
