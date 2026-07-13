// import React, { useEffect, useState } from "react";
// import { Box, Text, Flex, HStack } from "@chakra-ui/react";
// import { FiTrendingUp, FiTrendingDown, FiEye } from "react-icons/fi";
// import competencyService from "../../services/competencyService";
// import type { MyReviewItem } from "../../types/competency";
// import MainLayout from "../../components/layout/MainLayout";
// import SubmissionDetailModal from "./SubmissionDetailModal";

// const formatDate = (dateString: string) =>
//   new Date(dateString).toLocaleDateString("id-ID", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

// const MyReviewsList: React.FC = () => {
//   const [reviews, setReviews] = useState<MyReviewItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);
//   const [detailId, setDetailId] = useState<number | null>(null);

//   const fetchReviews = async () => {
//     setLoading(true);
//     setErrorMsg(null);
//     try {
//       const res = await competencyService.getMyReviews();
//       setReviews(res.data);
//     } catch (err: unknown) {
//       const e = err as { response?: { data?: { message?: string } } };
//       setErrorMsg(e.response?.data?.message ?? "Failed to load your reviews.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     void fetchReviews();
//   }, []);

//   return (
//     <MainLayout>
//       <Box>
//         <SubmissionDetailModal
//           isOpen={detailId !== null}
//           assessmentId={detailId}
//           onClose={() => setDetailId(null)}
//         />

//         <Box mb={6}>
//           <Text fontSize="2xl" fontWeight="bold" color="gray.800">
//             My Reviews
//           </Text>
//           <Text fontSize="13px" color="gray.500" mt={0.5}>
//             Assessments you have reviewed and approved as QC
//           </Text>
//         </Box>

//         {errorMsg && (
//           <Box
//             mb={4}
//             p={3}
//             bg="#fff1f2"
//             border="1px solid #fecdd3"
//             borderRadius="8px"
//           >
//             <Text fontSize="13px" color="#be123c">
//               {errorMsg}
//             </Text>
//           </Box>
//         )}

//         <Box bg="white" rounded="lg" shadow="sm" p={6}>
//           {loading ? (
//             <Flex justify="center" py={10}>
//               <Text color="gray.500" fontSize="14px">
//                 Loading...
//               </Text>
//             </Flex>
//           ) : reviews.length === 0 ? (
//             <Flex justify="center" py={10}>
//               <Text color="gray.400" fontSize="14px">
//                 You haven't reviewed any assessments yet.
//               </Text>
//             </Flex>
//           ) : (
//             <Box overflowX="auto">
//               <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                 <thead>
//                   <tr style={{ backgroundColor: "#f8fafc" }}>
//                     {[
//                       "No",
//                       "NPK",
//                       "Name",
//                       "Station",
//                       "Period",
//                       "Submitted By",
//                       "Final Score",
//                       "Reviewed At",
//                       "Detail",
//                     ].map((h) => (
//                       <th
//                         key={h}
//                         style={{
//                           padding: "10px 14px",
//                           textAlign: "left",
//                           fontSize: "12px",
//                           fontWeight: 600,
//                           color: "#64748b",
//                           textTransform: "uppercase",
//                           letterSpacing: "0.05em",
//                           borderBottom: "1px solid #e2e8f0",
//                           whiteSpace: "nowrap",
//                         }}
//                       >
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reviews.map((r, index) => (
//                     <tr
//                       key={r.id}
//                       style={{ borderBottom: "1px solid #f1f5f9" }}
//                     >
//                       <td
//                         style={{
//                           padding: "12px 14px",
//                           fontSize: "13px",
//                           color: "#64748b",
//                         }}
//                       >
//                         {index + 1}
//                       </td>
//                       <td
//                         style={{
//                           padding: "12px 14px",
//                           fontSize: "13px",
//                           color: "#1e293b",
//                           fontWeight: 500,
//                         }}
//                       >
//                         {r.subject.npk}
//                       </td>
//                       <td
//                         style={{
//                           padding: "12px 14px",
//                           fontSize: "13px",
//                           color: "#1e293b",
//                         }}
//                       >
//                         {r.subject.name}
//                       </td>
//                       <td
//                         style={{
//                           padding: "12px 14px",
//                           fontSize: "13px",
//                           color: "#475569",
//                         }}
//                       >
//                         {r.subject.station?.name || "-"}
//                       </td>
//                       <td
//                         style={{
//                           padding: "12px 14px",
//                           fontSize: "13px",
//                           color: "#475569",
//                         }}
//                       >
//                         {r.period_label}
//                       </td>
//                       <td
//                         style={{
//                           padding: "12px 14px",
//                           fontSize: "13px",
//                           color: "#475569",
//                         }}
//                       >
//                         {r.assessor.name}
//                       </td>
//                       <td style={{ padding: "12px 14px" }}>
//                         <HStack gap={1}>
//                           <Text
//                             fontSize="14px"
//                             fontWeight="700"
//                             color="#1A5EA8"
//                           >
//                             {r.final_score.toFixed(2)}
//                           </Text>
//                           {r.final_score >= 3 ? (
//                             <FiTrendingUp size={13} color="#15803d" />
//                           ) : (
//                             <FiTrendingDown size={13} color="#c2410c" />
//                           )}
//                         </HStack>
//                       </td>
//                       <td
//                         style={{
//                           padding: "12px 14px",
//                           fontSize: "13px",
//                           color: "#475569",
//                         }}
//                       >
//                         {formatDate(r.qc_at)}
//                       </td>
//                       <td style={{ padding: "12px 14px" }}>
//                         <button
//                           type="button"
//                           onClick={() => setDetailId(r.id)}
//                           style={{
//                             display: "inline-flex",
//                             alignItems: "center",
//                             gap: "6px",
//                             padding: "6px 14px",
//                             fontSize: "13px",
//                             fontWeight: 600,
//                             borderRadius: "8px",
//                             color: "#1A5EA8",
//                             backgroundColor: "#eaf1f9",
//                             border: "1px solid #cfe0f2",
//                             cursor: "pointer",
//                           }}
//                         >
//                           <FiEye size={13} /> Detail
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </Box>
//           )}
//         </Box>
//       </Box>
//     </MainLayout>
//   );
// };

// export default MyReviewsList;

import React, { useEffect, useState } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown, FiEye } from "react-icons/fi";
import competencyService from "../../services/competencyService";
import type { MyReviewItem } from "../../types/competency";
import MainLayout from "../../components/layout/MainLayout";
import SubmissionDetailModal from "./SubmissionDetailModal";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const MyReviewsList: React.FC = () => {
  const [reviews, setReviews] = useState<MyReviewItem[]>([]);
  const [loading, setLoading] = useState(true); // ← initial true, bukan di-set di effect
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  // ── Effect murni untuk fetch awal saat mount ──
  useEffect(() => {
    let cancelled = false;

    competencyService
      .getMyReviews()
      .then((res) => {
        if (!cancelled) setReviews(res.data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } } };
        setErrorMsg(
          e.response?.data?.message ?? "Failed to load your reviews.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MainLayout>
      <Box>
        <SubmissionDetailModal
          key={detailId ?? "none"}
          isOpen={detailId !== null}
          assessmentId={detailId}
          onClose={() => setDetailId(null)}
        />

        <Box mb={6}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            My Reviews
          </Text>
          <Text fontSize="13px" color="gray.500" mt={0.5}>
            Assessments you have reviewed and approved as QC
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
          ) : reviews.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                You haven't reviewed any assessments yet.
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
                      "Period",
                      "Submitted By",
                      "Final Score",
                      "Reviewed At",
                      "Detail",
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
                  {reviews.map((r, index) => (
                    <tr
                      key={r.id}
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
                        {r.subject.npk}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#1e293b",
                        }}
                      >
                        {r.subject.name}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {r.subject.station?.name || "-"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {r.period_label}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {r.assessor.name}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <HStack gap={1}>
                          <Text
                            fontSize="14px"
                            fontWeight="700"
                            color="#1A5EA8"
                          >
                            {r.final_score.toFixed(2)}
                          </Text>
                          {r.final_score >= 3 ? (
                            <FiTrendingUp size={13} color="#15803d" />
                          ) : (
                            <FiTrendingDown size={13} color="#c2410c" />
                          )}
                        </HStack>
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {formatDate(r.qc_at)}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          type="button"
                          onClick={() => setDetailId(r.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            fontSize: "13px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            color: "#1A5EA8",
                            backgroundColor: "#eaf1f9",
                            border: "1px solid #cfe0f2",
                            cursor: "pointer",
                          }}
                        >
                          <FiEye size={13} /> Detail
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

export default MyReviewsList;
