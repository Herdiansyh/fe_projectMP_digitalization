import React, { useRef, useState } from "react";
import { Badge, Box, Flex, HStack, Text } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import { useHrDecisionHistory } from "../../hooks/queries/useEvaluationQueries";

type HistoryTab = "employee" | "intern";

const HrDecisionHistory: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<HistoryTab>("employee");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTabChange = (tab: HistoryTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 500);
  };

  const { data: pagination, isLoading: loading } = useHrDecisionHistory({
    page,
    per_page: 10,
    type: activeTab,
    status: status || undefined,
    search: debouncedSearch || undefined,
  });

  const evaluations = pagination?.data ?? [];

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDecisionInfo = (status: string) => {
    if (status === "completed_extended") {
      return { label: "Diperpanjang", color: "green" };
    }
    if (status === "completed_not_extended") {
      return { label: "Tidak Diperpanjang", color: "red" };
    }
    return { label: status.replace(/_/g, " "), color: "gray" };
  };

  const tabButtonStyle = (tab: HistoryTab): React.CSSProperties => ({
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
        <Box mb={6}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            HR Decision History
          </Text>
          <Text fontSize="13px" color="gray.500" mt={0.5}>
            Riwayat keputusan perpanjangan / penutupan kontrak
          </Text>
        </Box>

        <HStack gap={2} mb={6} borderBottom="1px solid" borderColor="gray.100">
          <button
            type="button"
            style={tabButtonStyle("employee")}
            onClick={() => handleTabChange("employee")}
          >
            Employee
          </button>
          <Text color="gray.300" fontSize="14px">
            |
          </Text>
          <button
            type="button"
            style={tabButtonStyle("intern")}
            onClick={() => handleTabChange("intern")}
          >
            Intern
          </button>
        </HStack>

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
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
              onChange={(e) => {
                setStatus(e.target.value);
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
              <option value="">All Decisions</option>
              <option value="completed_extended">Diperpanjang</option>
              <option value="completed_not_extended">Tidak Diperpanjang</option>
            </select>
          </HStack>

          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500">Loading...</Text>
            </Flex>
          ) : evaluations.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400">No decision history found</Text>
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
                      "Decision",
                      "New End Contract",
                      "Decided At",
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
                    const subject =
                      activeTab === "intern"
                        ? evaluation.intern
                        : evaluation.employee;
                    const decision = getDecisionInfo(evaluation.status);
                    const latestExtension =
                      evaluation.contract_extensions?.[
                        evaluation.contract_extensions.length - 1
                      ];

                    return (
                      <tr
                        key={evaluation.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
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
                          <Badge colorPalette={decision.color}>
                            {decision.label}
                          </Badge>
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {latestExtension
                            ? formatDate(latestExtension.new_end_contract)
                            : "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {formatDateTime(evaluation.updated_at)}
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
      </Box>
    </MainLayout>
  );
};

export default HrDecisionHistory;
