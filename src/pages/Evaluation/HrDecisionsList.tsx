import React, { useState } from "react";
import { Badge, Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import MainLayout from "../../components/layout/MainLayout";
import type { Evaluation } from "../../types/evaluation";
import AlertDialog from "../../components/common/AlertDialog";
import { FiAlertCircle, FiInfo } from "react-icons/fi";
import HrDecisionModal from "./HrDecisionModal";
import { usePendingHrDecisions } from "../../hooks/queries/useEvaluationQueries";
import { notify } from "../../utils/toast";
import HrDecisionDetailModal from "./HrdecisionDetailModal";

type AlertVariant = "warning" | "error";
interface AlertState {
  title: string;
  message: string;
  variant: AlertVariant;
}

// === TAMBAHAN INTERN ===
type HrDecisionTab = "employee" | "intern";

const HrDecisionsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [activeEvaluation, setActiveEvaluation] = useState<Evaluation | null>(
    null,
  );

  const [detailEvaluation, setDetailEvaluation] = useState<Evaluation | null>(
    null,
  );
  const [alertInfo, setAlertInfo] = useState<AlertState | null>(null);

  // === TAMBAHAN INTERN: tab switcher ===
  const [activeTab, setActiveTab] = useState<HrDecisionTab>("employee");
  const handleTabChange = (tab: HrDecisionTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const showAlert = (
    title: string,
    message: string,
    variant: AlertVariant = "warning",
  ) => setAlertInfo({ title, message, variant });
  const handleDecisionSuccess = () => {
    notify.success(
      activeTab === "intern"
        ? "Intern contract decision saved successfully"
        : "Employee contract decision saved successfully",
    );
    setActiveEvaluation(null);
  };

  const handleDecisionError = (message: string) => {
    showAlert("Gagal Menyimpan", message, "error");
  };

  const { data: pagination, isLoading: loading } = usePendingHrDecisions({
    page,
    per_page: 10,
    type: activeTab,
  });

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const evaluations = pagination?.data ?? [];

  const tabButtonStyle = (tab: HrDecisionTab): React.CSSProperties => ({
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
            HR Admin — Contract Decisions
          </Text>
          <Text fontSize="13px" color="gray.500" mt={0.5}>
            Evaluation approved, awaiting a decision on contract extension
          </Text>
        </Box>

        {/* === TAMBAHAN INTERN: Tab switcher Employee / Intern === */}
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
          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500">Loading...</Text>
            </Flex>
          ) : evaluations.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400">
                Tidak ada evaluasi yang menunggu keputusan HR Admin
              </Text>
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
                      "Recommendation",
                      activeTab === "intern"
                        ? "End Internship"
                        : "End Contract",
                      "Forwarded By",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
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
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((evaluation, index) => {
                    const forwardEntry = evaluation.approvals
                      .filter((a) => a.action === "forward_to_hr_admin")
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.acted_at ?? 0).getTime() -
                          new Date(a.acted_at ?? 0).getTime(),
                      )[0];

                    // === TAMBAHAN INTERN: subjek employee atau intern
                    // tergantung tab aktif. ===
                    const subject =
                      activeTab === "intern"
                        ? evaluation.intern
                        : evaluation.employee;

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
                            fontWeight: 500,
                            color: "#1e293b",
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
                          {/* ASUMSI: field rekomendasi masih pakai
                              extend_pkwt yang sama untuk Intern (belum
                              diputuskan — lihat plan "Open Question #1").
                              Untuk tab Intern label diganti jadi
                              "Lanjut/Tidak Lanjut" tapi logikanya masih
                              baca extend_pkwt yang sama. Tolong dikoreksi
                              begitu field final untuk rekomendasi Intern
                              sudah diputuskan. */}
                          <Badge
                            colorPalette={
                              evaluation.recommendation?.extend_pkwt
                                ? "green"
                                : "orange"
                            }
                          >
                            {activeTab === "intern"
                              ? evaluation.recommendation?.extend_pkwt
                                ? "Rekomendasi: Lanjut"
                                : "Rekomendasi: Tidak Lanjut"
                              : evaluation.recommendation?.extend_pkwt
                                ? "Rekomendasi: Perpanjang"
                                : "Rekomendasi: Tidak Perpanjang"}
                          </Badge>
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#b91c1c",
                            fontWeight: 600,
                          }}
                        >
                          {formatDate(evaluation.end_date)}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {evaluation.section_head?.name ?? "-"}
                          {forwardEntry?.acted_at && (
                            <Text fontSize="11px" color="gray.400">
                              {new Date(
                                forwardEntry.acted_at,
                              ).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </Text>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            mr={2}
                            mb={1}
                            onClick={() => setDetailEvaluation(evaluation)}
                          >
                            Detail
                          </Button>
                          <Button
                            type="button"
                            size="xs"
                            mb={1}
                            colorPalette="blue"
                            onClick={() => setActiveEvaluation(evaluation)}
                          >
                            Process
                          </Button>
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
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Text fontSize="13px" color="gray.600">
                  Page {pagination.current_page} of {pagination.last_page}
                </Text>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={page >= pagination.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          )}
        </Box>
      </Box>
      {activeEvaluation && (
        <HrDecisionModal
          evaluation={activeEvaluation}
          onClose={() => setActiveEvaluation(null)}
          onSuccess={handleDecisionSuccess}
          onError={handleDecisionError}
        />
      )}{" "}
      {detailEvaluation && (
        <HrDecisionDetailModal
          evaluation={detailEvaluation}
          subjectType={activeTab}
          onClose={() => setDetailEvaluation(null)}
        />
      )}
      <AlertDialog
        open={alertInfo !== null}
        onClose={() => setAlertInfo(null)}
        title={alertInfo?.title ?? ""}
        message={alertInfo?.message ?? ""}
        confirmColor={alertInfo?.variant === "error" ? "#ef4444" : "#3b82f6"}
        icon={
          alertInfo?.variant === "error" ? (
            <FiAlertCircle size={24} color="#ef4444" />
          ) : (
            <FiInfo size={24} color="#f59e0b" />
          )
        }
      />
    </MainLayout>
  );
};

export default HrDecisionsList;
