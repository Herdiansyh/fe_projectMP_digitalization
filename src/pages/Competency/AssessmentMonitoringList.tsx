import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import competencyService from "../../services/competencyService";
import type { MonitoringItem, MonitoringStatus } from "../../types/competency";

const STATUS_LABEL: Record<MonitoringStatus, string> = {
  not_assessed: "Not Assessed",
  pending_qa: "Pending QA",
  completed: "Completed",
};

const getStatusBadgeStyle = (status: MonitoringStatus): React.CSSProperties => {
  if (status === "not_assessed")
    return {
      backgroundColor: "#f8fafc",
      color: "#64748b",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      padding: "2px 8px",
      fontSize: "12px",
      fontWeight: 500,
    };
  if (status === "pending_qa")
    return {
      backgroundColor: "#fff7ed",
      color: "#c2410c",
      border: "1px solid #fed7aa",
      borderRadius: "6px",
      padding: "2px 8px",
      fontSize: "12px",
      fontWeight: 500,
    };
  return {
    backgroundColor: "#f0fdf4",
    color: "#15803d",
    border: "1px solid #bbf7d0",
    borderRadius: "6px",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: 500,
  };
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const STATUS_FILTERS: { label: string; value: MonitoringStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Not Assessed", value: "not_assessed" },
  { label: "Pending QA", value: "pending_qa" },
  { label: "Completed", value: "completed" },
];

const AssessmentMonitoringList: React.FC = () => {
  const [items, setItems] = useState<MonitoringItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<MonitoringStatus | "all">(
    "all",
  );

  useEffect(() => {
    void fetchMonitoring();
  }, []);

  const fetchMonitoring = async () => {
    try {
      setLoading(true);
      const res = await competencyService.getMonitoring();
      setItems(res.data);
    } catch {
      alert("Failed to fetch assessment monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const search = searchInput.toLowerCase();
    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.npk.toLowerCase().includes(search) ||
        (item.station ?? "").toLowerCase().includes(search) ||
        (item.line ?? "").toLowerCase().includes(search) ||
        (item.area ?? "").toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [items, searchInput, statusFilter]);

  const statusCounts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<MonitoringStatus, number>,
    );
  }, [items]);

  return (
    <MainLayout>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Assessment Monitoring
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              Track competency assessment progress for every manpower
            </Text>
          </Box>
        </Flex>

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          {/* Filter bar */}
          <Flex mb={5} gap={3} wrap="wrap" align="center">
            <Box position="relative" maxW="300px" w="full">
              <Box
                position="absolute"
                left="10px"
                top="50%"
                transform="translateY(-50%)"
                color="gray.400"
                pointerEvents="none"
                zIndex={1}
              >
                <FiSearch size={14} />
              </Box>
              <input
                placeholder="Search name / NPK / station..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </Box>

            <HStack gap={2}>
              {STATUS_FILTERS.map((f) => {
                const isActive = statusFilter === f.value;
                const count =
                  f.value === "all"
                    ? items.length
                    : (statusCounts[f.value] ?? 0);
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setStatusFilter(f.value)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "13px",
                      fontWeight: 500,
                      borderRadius: "8px",
                      border: `1px solid ${isActive ? "#1d4ed8" : "#e2e8f0"}`,
                      backgroundColor: isActive ? "#eff6ff" : "#ffffff",
                      color: isActive ? "#1d4ed8" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {f.label} ({count})
                  </button>
                );
              })}
            </HStack>
          </Flex>

          {/* Table */}
          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500" fontSize="14px">
                Loading...
              </Text>
            </Flex>
          ) : filteredItems.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                No manpower found
              </Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    {[
                      "No",
                      "NPK",
                      "Name",
                      "Station",
                      "Line",
                      "Area",
                      "Status",
                      "Assessed By",
                      "QA By",
                      "Final Score",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: "1px solid #e2e8f0",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => (
                    <tr
                      key={`${item.subject_type}-${item.subject_id}`}
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
                          color: "#475569",
                        }}
                      >
                        {item.npk}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#1e293b",
                          fontWeight: 500,
                        }}
                      >
                        {item.name}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {item.station || "-"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {item.line || "-"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {item.area || "-"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={getStatusBadgeStyle(item.status)}>
                          {STATUS_LABEL[item.status]}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {item.assessor ? (
                          <>
                            {item.assessor.name}
                            <br />
                            <Text as="span" fontSize="11px" color="gray.400">
                              {formatDate(item.assessed_at)}
                            </Text>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {item.qa_reviewer ? (
                          <>
                            {item.qa_reviewer.name}
                            <br />
                            <Text as="span" fontSize="11px" color="gray.400">
                              {formatDate(item.qa_at)}
                            </Text>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#1e293b",
                          fontWeight: 600,
                        }}
                      >
                        {item.final_score ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AssessmentMonitoringList;
