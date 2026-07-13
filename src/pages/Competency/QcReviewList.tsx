import React, { useEffect, useState } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { FiCheckCircle } from "react-icons/fi";
import competencyService from "../../services/competencyService";
import type { QcQueueItem } from "../../types/competency";
import MainLayout from "../../components/layout/MainLayout";
import QcReviewModal from "./QcReviewModal";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const QcReviewList: React.FC = () => {
  const [queue, setQueue] = useState<QcQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<QcQueueItem | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await competencyService.getQcQueue();
      setQueue(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setErrorMsg(e.response?.data?.message ?? "Failed to load QC queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchQueue();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <MainLayout>
      <Box>
        {successMsg && (
          <Box
            position="fixed"
            top={4}
            right={4}
            zIndex={300}
            bg="green.500"
            color="white"
            px={5}
            py={3}
            borderRadius="8px"
            shadow="lg"
            fontSize="14px"
            fontWeight="500"
          >
            {successMsg}
          </Box>
        )}

        <QcReviewModal
          key={selected?.id ?? "none"}
          isOpen={selected !== null}
          item={selected}
          onClose={() => setSelected(null)}
          onSuccess={(msg) => {
            setSelected(null);
            showSuccess(msg);
            void fetchQueue();
          }}
        />

        <Box mb={6}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            QC Review Queue
          </Text>
          <Text fontSize="13px" color="gray.500" mt={0.5}>
            Assessments submitted by Leaders, waiting for QC final score
          </Text>
        </Box>

        {errorMsg && (
          <Box
            mb={4}
            p={3}
            bg="#fff1f2"
            border="1px solid #fecdd3"
            borderRadius="8px"
          >
            <Text fontSize="13px" color="#be123c">
              {errorMsg}
            </Text>
          </Box>
        )}

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500" fontSize="14px">
                Loading...
              </Text>
            </Flex>
          ) : queue.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                No assessments waiting for QC review
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
                      "Period",
                      "Submitted By",
                      "Submitted At",
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
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item, index) => (
                    <tr
                      key={item.id}
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
                          color: "#1e293b",
                          fontWeight: 500,
                        }}
                      >
                        {item.subject.npk}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#1e293b",
                        }}
                      >
                        {item.subject.name}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {item.period_label}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {item.assessor.name}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {formatDate(item.assessed_at)}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            fontSize: "13px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            color: "#ffffff",
                            backgroundColor: "#1A5EA8",
                            border: "1px solid #1A5EA8",
                            cursor: "pointer",
                          }}
                        >
                          <FiCheckCircle size={13} /> Review
                        </button>
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

export default QcReviewList;
