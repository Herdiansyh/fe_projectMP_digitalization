// // import React, { useState, useEffect, useCallback } from "react";
// // import { Box, Text, Flex, HStack } from "@chakra-ui/react";
// // import { FiSearch, FiPrinter, FiPlay, FiAlertTriangle } from "react-icons/fi";
// // import { useNavigate } from "react-router-dom";
// // import MainLayout from "../../components/layout/MainLayout";
// // import fptkService from "../../services/fptkService";
// // import type { Requisition, RequisitionListParams } from "../../types/fptk";
// // import { useAuth } from "../../contexts/AuthContext";

// // // ── Confirm Modal ─────────────────────────────────────────────────────────────
// // const ConfirmModal = ({
// //   isOpen,
// //   noReq,
// //   isLoading,
// //   onConfirm,
// //   onCancel,
// // }: {
// //   isOpen: boolean;
// //   noReq: string;
// //   isLoading: boolean;
// //   onConfirm: () => void;
// //   onCancel: () => void;
// // }) => {
// //   if (!isOpen) return null;
// //   return (
// //     <>
// //       <Box
// //         position="fixed"
// //         inset={0}
// //         zIndex={400}
// //         style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
// //         onClick={!isLoading ? onCancel : undefined}
// //       />
// //       <Box
// //         position="fixed"
// //         top="50%"
// //         left="50%"
// //         zIndex={500}
// //         style={{
// //           transform: "translate(-50%, -50%)",
// //           width: "100%",
// //           maxWidth: "440px",
// //           padding: "0 16px",
// //         }}
// //       >
// //         <Box
// //           bg="white"
// //           borderRadius="12px"
// //           shadow="xl"
// //           borderWidth="1px"
// //           borderColor="gray.100"
// //           overflow="hidden"
// //         >
// //           <Box px={6} pt={6} pb={4}>
// //             <HStack gap={3} align="flex-start">
// //               <Box
// //                 w="40px"
// //                 h="40px"
// //                 borderRadius="10px"
// //                 bg="#eff6ff"
// //                 display="flex"
// //                 alignItems="center"
// //                 justifyContent="center"
// //                 flexShrink={0}
// //               >
// //                 <FiAlertTriangle size={20} color="#1d4ed8" />
// //               </Box>
// //               <Box>
// //                 <Text fontSize="16px" fontWeight="700" color="gray.800" mb={1}>
// //                   HRD Process Confirmation
// //                 </Text>
// //                 <Text fontSize="13px" color="gray.500" lineHeight="1.5">
// //                   You are about to process FPTK{" "}
// //                   <Text as="span" fontWeight="700" color="blue.700">
// //                     {noReq}
// //                   </Text>{" "}
// //                   to start HRD screening. This action cannot be undone.
// //                 </Text>
// //               </Box>
// //             </HStack>
// //           </Box>
// //           <Box h="1px" bg="gray.100" />
// //           <Flex px={6} py={4} justify="flex-end" gap={3}>
// //             <button
// //               type="button"
// //               disabled={isLoading}
// //               onClick={onCancel}
// //               style={{
// //                 padding: "8px 16px",
// //                 fontSize: "14px",
// //                 borderRadius: "8px",
// //                 color: "#4a5568",
// //                 backgroundColor: "#ffffff",
// //                 border: "1px solid #e2e8f0",
// //                 cursor: isLoading ? "not-allowed" : "pointer",
// //                 opacity: isLoading ? 0.6 : 1,
// //               }}
// //             >
// //               Cancel
// //             </button>
// //             <button
// //               type="button"
// //               disabled={isLoading}
// //               onClick={onConfirm}
// //               style={{
// //                 display: "inline-flex",
// //                 alignItems: "center",
// //                 gap: "8px",
// //                 padding: "8px 20px",
// //                 fontSize: "14px",
// //                 fontWeight: "600",
// //                 borderRadius: "8px",
// //                 color: isLoading ? "#94a3b8" : "#ffffff",
// //                 backgroundColor: isLoading ? "#f1f5f9" : "#1d4ed8",
// //                 border: `1px solid ${isLoading ? "#e2e8f0" : "#1d4ed8"}`,
// //                 cursor: isLoading ? "not-allowed" : "pointer",
// //               }}
// //             >
// //               <FiPlay size={13} />
// //               {isLoading ? "Processing..." : "Yes, Process Now"}
// //             </button>
// //           </Flex>
// //         </Box>
// //       </Box>
// //     </>
// //   );
// // };

// // // ── Komponen utama ────────────────────────────────────────────────────────────
// // const FptkApprovedList: React.FC = () => {
// //   const navigate = useNavigate();
// //   const [requisitions, setRequisitions] = useState<Requisition[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [processingId, setProcessingId] = useState<string | null>(null);
// //   const [successMsg, setSuccessMsg] = useState<string | null>(null);

// //   // ── State untuk confirm modal ──
// //   const [confirmModal, setConfirmModal] = useState<{
// //     isOpen: boolean;
// //     noReq: string;
// //   }>({ isOpen: false, noReq: "" });

// //   const [pagination, setPagination] = useState({
// //     current_page: 1,
// //     last_page: 1,
// //     per_page: 10,
// //     total: 0,
// //   });
// //   const [page, setPage] = useState(1);
// //   const [filters, setFilters] = useState<RequisitionListParams>({
// //     status: "Approved,Processed HRD",
// //   });
// //   const [searchInput, setSearchInput] = useState("");
// //   const { user } = useAuth();
// //   const isHrAdmin = user?.role?.name === "HR Admin";

// //   const fetchRequisitions = useCallback(
// //     async (params: RequisitionListParams) => {
// //       try {
// //         setLoading(true);
// //         const cleanParams = Object.fromEntries(
// //           Object.entries(params).filter(
// //             ([, v]) => v !== "" && v !== undefined && v !== null,
// //           ),
// //         ) as RequisitionListParams;
// //         const response = await fptkService.getRequisitions(cleanParams);
// //         setRequisitions(response.data.data);
// //         setPagination({
// //           current_page: response.data.current_page,
// //           last_page: response.data.last_page,
// //           per_page: response.data.per_page,
// //           total: response.data.total,
// //         });
// //       } catch {
// //         alert("Failed to fetch requisitions");
// //       } finally {
// //         setLoading(false);
// //       }
// //     },
// //     [],
// //   );

// //   const [clientSearch, setClientSearch] = useState("");

// //   useEffect(() => {
// //     const timeout = setTimeout(() => {
// //       setClientSearch(searchInput.toLowerCase());
// //       setPage(1);
// //     }, 400);
// //     return () => clearTimeout(timeout);
// //   }, [searchInput]);

// //   useEffect(() => {
// //     void fetchRequisitions({ page, per_page: 10, ...filters });
// //   }, [page, filters, fetchRequisitions]);

// //   const displayedRequisitions = clientSearch
// //     ? requisitions.filter(
// //         (r) =>
// //           r.requester_name.toLowerCase().includes(clientSearch) ||
// //           (r.no_req ?? "").toLowerCase().includes(clientSearch) ||
// //           (r.position ?? "").toLowerCase().includes(clientSearch) ||
// //           (r.department ?? "").toLowerCase().includes(clientSearch),
// //       )
// //     : requisitions;

// //   const showSuccess = (msg: string) => {
// //     setSuccessMsg(msg);
// //     setTimeout(() => setSuccessMsg(null), 3000);
// //   };

// //   // Buka modal konfirmasi — dipanggil saat icon Process diklik
// //   const openConfirmModal = (e: React.MouseEvent, noReq: string) => {
// //     e.stopPropagation();
// //     setConfirmModal({ isOpen: true, noReq });
// //   };

// //   // Eksekusi proses setelah user konfirmasi di modal
// //   const handleConfirmProcess = async () => {
// //     const noReq = confirmModal.noReq;
// //     setConfirmModal({ isOpen: false, noReq: "" });

// //     try {
// //       setProcessingId(noReq);
// //       await fptkService.processHrd(noReq);
// //       showSuccess(`FPTK ${noReq} successfully processed by HRD.`);
// //       void fetchRequisitions({ page, per_page: 10, ...filters });
// //     } catch (err: unknown) {
// //       const e = err as { response?: { data?: { message?: string } } };
// //       alert(e.response?.data?.message ?? "Failed to process FPTK.");
// //     } finally {
// //       setProcessingId(null);
// //     }
// //   };

// //   const handlePrint = (noReq: string) => {
// //     const API_BASE_URL =
// //       import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
// //     const printUrl =
// //       API_BASE_URL.replace(/\/api\/?$/, "") + `/print/fptk/${noReq}`;
// //     window.open(printUrl, "_blank");
// //   };

// //   const getStatusBadgeStyle = (status: string): React.CSSProperties => {
// //     if (status === "Approved")
// //       return {
// //         backgroundColor: "#f0fdf4",
// //         color: "#15803d",
// //         border: "1px solid #bbf7d0",
// //         borderRadius: "6px",
// //         padding: "2px 8px",
// //         fontSize: "12px",
// //         fontWeight: 500,
// //       };
// //     if (status === "Processed HRD")
// //       return {
// //         backgroundColor: "#eff6ff",
// //         color: "#1d4ed8",
// //         border: "1px solid #bfdbfe",
// //         borderRadius: "6px",
// //         padding: "2px 8px",
// //         fontSize: "12px",
// //         fontWeight: 500,
// //       };
// //     return {
// //       backgroundColor: "#f8fafc",
// //       color: "#64748b",
// //       border: "1px solid #e2e8f0",
// //       borderRadius: "6px",
// //       padding: "2px 8px",
// //       fontSize: "12px",
// //       fontWeight: 500,
// //     };
// //   };

// //   const formatDate = (dateString: string) => {
// //     return new Date(dateString).toLocaleDateString("id-ID", {
// //       day: "2-digit",
// //       month: "long",
// //       year: "numeric",
// //     });
// //   };

// //   return (
// //     <MainLayout>
// //       <Box>
// //         {/* ── Confirm Modal ── */}
// //         <ConfirmModal
// //           isOpen={confirmModal.isOpen}
// //           noReq={confirmModal.noReq}
// //           isLoading={processingId === confirmModal.noReq}
// //           onConfirm={handleConfirmProcess}
// //           onCancel={() => setConfirmModal({ isOpen: false, noReq: "" })}
// //         />

// //         {/* Success toast */}
// //         {successMsg && (
// //           <Box
// //             position="fixed"
// //             top={4}
// //             right={4}
// //             zIndex={300}
// //             bg="green.500"
// //             color="white"
// //             px={5}
// //             py={3}
// //             borderRadius="8px"
// //             shadow="lg"
// //             fontSize="14px"
// //             fontWeight="500"
// //           >
// //             {successMsg}
// //           </Box>
// //         )}

// //         {/* Header */}
// //         <Flex justify="space-between" align="center" mb={6}>
// //           <Box>
// //             <Text fontSize="2xl" fontWeight="bold" color="gray.800">
// //               Approved FPTK
// //             </Text>
// //             <Text fontSize="13px" color="gray.500" mt={0.5}>
// //               List of approved FPTK
// //             </Text>
// //           </Box>
// //         </Flex>

// //         <Box bg="white" rounded="lg" shadow="sm" p={6}>
// //           {/* Filter bar */}
// //           <HStack mb={5} gap={3}>
// //             <Box position="relative" maxW="300px" w="full">
// //               <Box
// //                 position="absolute"
// //                 left="10px"
// //                 top="50%"
// //                 transform="translateY(-50%)"
// //                 color="gray.400"
// //                 pointerEvents="none"
// //                 zIndex={1}
// //               >
// //                 <FiSearch size={14} />
// //               </Box>
// //               <input
// //                 placeholder="Search no. req / requester / position..."
// //                 value={searchInput}
// //                 onChange={(e) => setSearchInput(e.target.value)}
// //                 style={{
// //                   width: "100%",
// //                   paddingLeft: "32px",
// //                   paddingRight: "12px",
// //                   paddingTop: "8px",
// //                   paddingBottom: "8px",
// //                   fontSize: "14px",
// //                   color: "#1a202c",
// //                   backgroundColor: "#ffffff",
// //                   border: "1px solid #e2e8f0",
// //                   borderRadius: "8px",
// //                   outline: "none",
// //                 }}
// //                 onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
// //                 onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
// //               />
// //             </Box>
// //           </HStack>

// //           {/* Table */}
// //           {loading ? (
// //             <Flex justify="center" py={10}>
// //               <Text color="gray.500" fontSize="14px">
// //                 Loading...
// //               </Text>
// //             </Flex>
// //           ) : displayedRequisitions.length === 0 ? (
// //             <Flex justify="center" py={10}>
// //               <Text color="gray.400" fontSize="14px">
// //                 No FPTK with Approved / Processed HRD status
// //               </Text>
// //             </Flex>
// //           ) : (
// //             <Box overflowX="auto">
// //               <table style={{ width: "100%", borderCollapse: "collapse" }}>
// //                 <thead>
// //                   <tr style={{ backgroundColor: "#f8fafc" }}>
// //                     {[
// //                       "No",
// //                       "No Requisition",
// //                       "Request Date",
// //                       "Requester",
// //                       "Position",
// //                       "Department",
// //                       "Status",
// //                       "Action",
// //                     ].map((h) => (
// //                       <th
// //                         key={h}
// //                         style={{
// //                           padding: "10px 14px",
// //                           textAlign: "left",
// //                           fontSize: "12px",
// //                           fontWeight: "600",
// //                           color: "#64748b",
// //                           textTransform: "uppercase",
// //                           letterSpacing: "0.05em",
// //                           borderBottom: "1px solid #e2e8f0",
// //                           whiteSpace: "nowrap",
// //                         }}
// //                       >
// //                         {h}
// //                       </th>
// //                     ))}
// //                   </tr>
// //                 </thead>

// //                 <tbody>
// //                   {displayedRequisitions.map((req, index) => (
// //                     <tr
// //                       key={req.no_req}
// //                       style={{
// //                         borderBottom: "1px solid #f1f5f9",
// //                         cursor: "pointer",
// //                       }}
// //                       onClick={() => navigate(`/fptk/${req.no_req}`)}
// //                       onMouseEnter={(e) =>
// //                         (e.currentTarget.style.backgroundColor = "#f8fafc")
// //                       }
// //                       onMouseLeave={(e) =>
// //                         (e.currentTarget.style.backgroundColor = "transparent")
// //                       }
// //                     >
// //                       <td
// //                         style={{
// //                           padding: "12px 14px",
// //                           fontSize: "13px",
// //                           color: "#64748b",
// //                         }}
// //                       >
// //                         {(pagination.current_page - 1) * pagination.per_page +
// //                           index +
// //                           1}
// //                       </td>
// //                       <td
// //                         style={{
// //                           padding: "12px 14px",
// //                           fontSize: "13px",
// //                           color: "#1e293b",
// //                           fontWeight: "500",
// //                         }}
// //                       >
// //                         {req.no_req}
// //                       </td>
// //                       <td
// //                         style={{
// //                           padding: "12px 14px",
// //                           fontSize: "13px",
// //                           color: "#475569",
// //                         }}
// //                       >
// //                         {formatDate(req.request_date)}
// //                       </td>
// //                       <td
// //                         style={{
// //                           padding: "12px 14px",
// //                           fontSize: "13px",
// //                           color: "#1e293b",
// //                         }}
// //                       >
// //                         {req.requester_name}
// //                       </td>
// //                       <td
// //                         style={{
// //                           padding: "12px 14px",
// //                           fontSize: "13px",
// //                           color: "#475569",
// //                         }}
// //                       >
// //                         {req.position || "-"}
// //                       </td>
// //                       <td
// //                         style={{
// //                           padding: "12px 14px",
// //                           fontSize: "13px",
// //                           color: "#475569",
// //                         }}
// //                       >
// //                         {req.department || "-"}
// //                       </td>
// //                       <td style={{ padding: "12px 14px" }}>
// //                         <span style={getStatusBadgeStyle(req.approval_status)}>
// //                           {req.approval_status}
// //                         </span>
// //                       </td>
// //                       <td style={{ padding: "12px 14px" }}>
// //                         <HStack gap={1}>
// //                           {/* Tombol Print */}
// //                           <button
// //                             type="button"
// //                             title="Print"
// //                             onClick={(e) => {
// //                               e.stopPropagation();
// //                               handlePrint(req.no_req);
// //                             }}
// //                             style={{
// //                               width: "30px",
// //                               height: "30px",
// //                               display: "flex",
// //                               alignItems: "center",
// //                               justifyContent: "center",
// //                               borderRadius: "6px",
// //                               color: "#10b981",
// //                               backgroundColor: "#ecfdf5",
// //                               border: "1px solid #a7f3d0",
// //                               cursor: "pointer",
// //                             }}
// //                             onMouseEnter={(e) =>
// //                               (e.currentTarget.style.backgroundColor =
// //                                 "#d1fae5")
// //                             }
// //                             onMouseLeave={(e) =>
// //                               (e.currentTarget.style.backgroundColor =
// //                                 "#ecfdf5")
// //                             }
// //                           >
// //                             <FiPrinter size={14} />
// //                           </button>

// //                           {/* Tombol Process HRD — hanya muncul untuk HR Admin dan status masih Approved */}
// //                           {isHrAdmin && req.approval_status === "Approved" && (
// //                             <button
// //                               type="button"
// //                               title="Process as HRD"
// //                               disabled={processingId === req.no_req}
// //                               onClick={(e) => openConfirmModal(e, req.no_req)}
// //                               style={{
// //                                 width: "30px",
// //                                 height: "30px",
// //                                 display: "flex",
// //                                 alignItems: "center",
// //                                 justifyContent: "center",
// //                                 borderRadius: "6px",
// //                                 color:
// //                                   processingId === req.no_req
// //                                     ? "#94a3b8"
// //                                     : "#3b82f6",
// //                                 backgroundColor:
// //                                   processingId === req.no_req
// //                                     ? "#f1f5f9"
// //                                     : "#eff6ff",
// //                                 border: `1px solid ${processingId === req.no_req ? "#e2e8f0" : "#bfdbfe"}`,
// //                                 cursor:
// //                                   processingId === req.no_req
// //                                     ? "not-allowed"
// //                                     : "pointer",
// //                               }}
// //                               onMouseEnter={(e) => {
// //                                 if (processingId !== req.no_req)
// //                                   e.currentTarget.style.backgroundColor =
// //                                     "#dbeafe";
// //                               }}
// //                               onMouseLeave={(e) => {
// //                                 if (processingId !== req.no_req)
// //                                   e.currentTarget.style.backgroundColor =
// //                                     "#eff6ff";
// //                               }}
// //                             >
// //                               <FiPlay size={13} />
// //                             </button>
// //                           )}
// //                         </HStack>
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </Box>
// //           )}

// //           {/* Pagination */}
// //           <Flex
// //             justify="space-between"
// //             align="center"
// //             mt={5}
// //             pt={4}
// //             borderTop="1px solid"
// //             borderColor="gray.100"
// //           >
// //             <Text fontSize="12px" color="gray.500">
// //               Showing {requisitions.length} of {pagination.total} FPTK
// //             </Text>
// //             <HStack gap={2}>
// //               <button
// //                 type="button"
// //                 disabled={page === 1}
// //                 onClick={() => setPage((p) => p - 1)}
// //                 style={{
// //                   padding: "6px 14px",
// //                   fontSize: "13px",
// //                   borderRadius: "6px",
// //                   border: "1px solid #e2e8f0",
// //                   backgroundColor: page === 1 ? "#f8fafc" : "#ffffff",
// //                   color: page === 1 ? "#94a3b8" : "#475569",
// //                   cursor: page === 1 ? "not-allowed" : "pointer",
// //                 }}
// //               >
// //                 Previous
// //               </button>
// //               <Text fontSize="13px" color="gray.600" px={2}>
// //                 Page {pagination.current_page} of {pagination.last_page}
// //               </Text>
// //               <button
// //                 type="button"
// //                 disabled={page >= pagination.last_page}
// //                 onClick={() => setPage((p) => p + 1)}
// //                 style={{
// //                   padding: "6px 14px",
// //                   fontSize: "13px",
// //                   borderRadius: "6px",
// //                   border: "1px solid #e2e8f0",
// //                   backgroundColor:
// //                     page >= pagination.last_page ? "#f8fafc" : "#ffffff",
// //                   color: page >= pagination.last_page ? "#94a3b8" : "#475569",
// //                   cursor:
// //                     page >= pagination.last_page ? "not-allowed" : "pointer",
// //                 }}
// //               >
// //                 Next
// //               </button>
// //             </HStack>
// //           </Flex>
// //         </Box>
// //       </Box>
// //     </MainLayout>
// //   );
// // };

// // export default FptkApprovedList;

// import React, { useState, useEffect, useCallback } from "react";
// import { Box, Text, Flex, HStack } from "@chakra-ui/react";
// import {
//   FiSearch,
//   FiPrinter,
//   FiPlay,
//   FiAlertTriangle,
//   FiUserPlus,
//   FiMapPin,
// } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import MainLayout from "../../components/layout/MainLayout";
// import fptkService from "../../services/fptkService";
// import type { Requisition, RequisitionListParams } from "../../types/fptk";
// import { useAuth } from "../../contexts/AuthContext";
// import stationService from "../../services/stationService";
// import lineService from "../../services/lineService";
// import areaService from "../../services/areaService";
// import type { Area } from "../../types/area";
// import type { Line } from "../../types/line";
// import type { Station } from "../../types/station";

// // ── Confirm Modal (Process HRD) ─────────────────────────────────────────────
// const ConfirmModal = ({
//   isOpen,
//   noReq,
//   isLoading,
//   onConfirm,
//   onCancel,
// }: {
//   isOpen: boolean;
//   noReq: string;
//   isLoading: boolean;
//   onConfirm: () => void;
//   onCancel: () => void;
// }) => {
//   if (!isOpen) return null;
//   return (
//     <>
//       <Box
//         position="fixed"
//         inset={0}
//         zIndex={400}
//         style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
//         onClick={!isLoading ? onCancel : undefined}
//       />
//       <Box
//         position="fixed"
//         top="50%"
//         left="50%"
//         zIndex={500}
//         style={{
//           transform: "translate(-50%, -50%)",
//           width: "100%",
//           maxWidth: "440px",
//           padding: "0 16px",
//         }}
//       >
//         <Box
//           bg="white"
//           borderRadius="12px"
//           shadow="xl"
//           borderWidth="1px"
//           borderColor="gray.100"
//           overflow="hidden"
//         >
//           <Box px={6} pt={6} pb={4}>
//             <HStack gap={3} align="flex-start">
//               <Box
//                 w="40px"
//                 h="40px"
//                 borderRadius="10px"
//                 bg="#eff6ff"
//                 display="flex"
//                 alignItems="center"
//                 justifyContent="center"
//                 flexShrink={0}
//               >
//                 <FiAlertTriangle size={20} color="#1d4ed8" />
//               </Box>
//               <Box>
//                 <Text fontSize="16px" fontWeight="700" color="gray.800" mb={1}>
//                   HRD Process Confirmation
//                 </Text>
//                 <Text fontSize="13px" color="gray.500" lineHeight="1.5">
//                   You are about to process FPTK{" "}
//                   <Text as="span" fontWeight="700" color="blue.700">
//                     {noReq}
//                   </Text>{" "}
//                   to start HRD screening. This action cannot be undone.
//                 </Text>
//               </Box>
//             </HStack>
//           </Box>
//           <Box h="1px" bg="gray.100" />
//           <Flex px={6} py={4} justify="flex-end" gap={3}>
//             <button
//               type="button"
//               disabled={isLoading}
//               onClick={onCancel}
//               style={{
//                 padding: "8px 16px",
//                 fontSize: "14px",
//                 borderRadius: "8px",
//                 color: "#4a5568",
//                 backgroundColor: "#ffffff",
//                 border: "1px solid #e2e8f0",
//                 cursor: isLoading ? "not-allowed" : "pointer",
//                 opacity: isLoading ? 0.6 : 1,
//               }}
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               disabled={isLoading}
//               onClick={onConfirm}
//               style={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "8px",
//                 padding: "8px 20px",
//                 fontSize: "14px",
//                 fontWeight: "600",
//                 borderRadius: "8px",
//                 color: isLoading ? "#94a3b8" : "#ffffff",
//                 backgroundColor: isLoading ? "#f1f5f9" : "#1d4ed8",
//                 border: `1px solid ${isLoading ? "#e2e8f0" : "#1d4ed8"}`,
//                 cursor: isLoading ? "not-allowed" : "pointer",
//               }}
//             >
//               <FiPlay size={13} />
//               {isLoading ? "Processing..." : "Yes, Process Now"}
//             </button>
//           </Flex>
//         </Box>
//       </Box>
//     </>
//   );
// };

// // ── Generic modal shell ──────────────────────────────────────────────────────
// const ModalShell = ({
//   isOpen,
//   onClose,
//   title,
//   subtitle,
//   iconBg,
//   // iconColor,
//   icon,
//   children,
//   isLoading,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   subtitle: string;
//   iconBg: string;
//   iconColor: string;
//   icon: React.ReactNode;
//   children: React.ReactNode;
//   isLoading: boolean;
// }) => {
//   if (!isOpen) return null;
//   return (
//     <>
//       <Box
//         position="fixed"
//         inset={0}
//         zIndex={400}
//         style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
//         onClick={!isLoading ? onClose : undefined}
//       />
//       <Box
//         position="fixed"
//         top="50%"
//         left="50%"
//         zIndex={500}
//         style={{
//           transform: "translate(-50%, -50%)",
//           width: "100%",
//           maxWidth: "460px",
//           padding: "0 16px",
//         }}
//       >
//         <Box
//           bg="white"
//           borderRadius="12px"
//           shadow="xl"
//           borderWidth="1px"
//           borderColor="gray.100"
//           overflow="hidden"
//         >
//           <Box px={6} pt={6} pb={4}>
//             <HStack gap={3} align="flex-start">
//               <Box
//                 w="40px"
//                 h="40px"
//                 borderRadius="10px"
//                 bg={iconBg}
//                 display="flex"
//                 alignItems="center"
//                 justifyContent="center"
//                 flexShrink={0}
//               >
//                 {icon}
//               </Box>
//               <Box>
//                 <Text fontSize="16px" fontWeight="700" color="gray.800" mb={1}>
//                   {title}
//                 </Text>
//                 <Text fontSize="13px" color="gray.500" lineHeight="1.5">
//                   {subtitle}
//                 </Text>
//               </Box>
//             </HStack>
//           </Box>
//           <Box h="1px" bg="gray.100" />
//           <Box px={6} py={5}>
//             {children}
//           </Box>
//         </Box>
//       </Box>
//     </>
//   );
// };

// const inputStyle: React.CSSProperties = {
//   width: "100%",
//   padding: "8px 12px",
//   fontSize: "14px",
//   color: "#1a202c",
//   backgroundColor: "#ffffff",
//   border: "1px solid #e2e8f0",
//   borderRadius: "8px",
//   outline: "none",
// };

// const labelStyle: React.CSSProperties = {
//   fontSize: "13px",
//   fontWeight: 600,
//   color: "#334155",
//   marginBottom: "6px",
//   display: "block",
// };

// // ── Modal: HRD isi NPK & Kontrak ────────────────────────────────────────────
// const AssignManpowerModal = ({
//   isOpen,
//   noReq,
//   isLoading,
//   onSubmit,
//   onCancel,
// }: {
//   isOpen: boolean;
//   noReq: string;
//   isLoading: boolean;
//   onSubmit: (data: {
//     npk: string;
//     name: string;
//     start_contract: string;
//     end_contract: string;
//   }) => void;
//   onCancel: () => void;
// }) => {
//   const [npk, setNpk] = useState("");
//   const [name, setName] = useState("");
//   const [startContract, setStartContract] = useState("");
//   const [endContract, setEndContract] = useState("");

//   useEffect(() => {
//     if (isOpen) {
//       setNpk("");
//       setName("");
//       setStartContract("");
//       setEndContract("");
//     }
//   }, [isOpen]);

//   const canSubmit =
//     npk.trim() !== "" && name.trim() !== "" && startContract !== "";

//   return (
//     <ModalShell
//       isOpen={isOpen}
//       onClose={onCancel}
//       isLoading={isLoading}
//       title="Assign Manpower"
//       subtitle={`Enter candidate data for FPTK ${noReq} after CV screening is completed.`}
//       iconBg="#eff6ff"
//       iconColor="#1d4ed8"
//       icon={<FiUserPlus size={20} color="#1d4ed8" />}
//     >
//       <Box mb={3}>
//         <label style={labelStyle}>NPK</label>
//         <input
//           style={inputStyle}
//           value={npk}
//           onChange={(e) => setNpk(e.target.value)}
//           placeholder="e.g. 240001"
//         />
//       </Box>
//       <Box mb={3}>
//         <label style={labelStyle}>Employee Name</label>
//         <input
//           style={inputStyle}
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Full name"
//         />
//       </Box>
//       <HStack gap={3} mb={4}>
//         <Box flex={1}>
//           <label style={labelStyle}>Start Contract</label>
//           <input
//             type="date"
//             style={inputStyle}
//             value={startContract}
//             onChange={(e) => setStartContract(e.target.value)}
//           />
//         </Box>
//         <Box flex={1}>
//           <label style={labelStyle}>End Contract (optional)</label>
//           <input
//             type="date"
//             style={inputStyle}
//             value={endContract}
//             onChange={(e) => setEndContract(e.target.value)}
//           />
//         </Box>
//       </HStack>

//       <Flex justify="flex-end" gap={3}>
//         <button
//           type="button"
//           disabled={isLoading}
//           onClick={onCancel}
//           style={{
//             padding: "8px 16px",
//             fontSize: "14px",
//             borderRadius: "8px",
//             color: "#4a5568",
//             backgroundColor: "#ffffff",
//             border: "1px solid #e2e8f0",
//             cursor: isLoading ? "not-allowed" : "pointer",
//             opacity: isLoading ? 0.6 : 1,
//           }}
//         >
//           Cancel
//         </button>
//         <button
//           type="button"
//           disabled={isLoading || !canSubmit}
//           onClick={() =>
//             onSubmit({
//               npk: npk.trim(),
//               name: name.trim(),
//               start_contract: startContract,
//               end_contract: endContract,
//             })
//           }
//           style={{
//             padding: "8px 20px",
//             fontSize: "14px",
//             fontWeight: "600",
//             borderRadius: "8px",
//             color: isLoading || !canSubmit ? "#94a3b8" : "#ffffff",
//             backgroundColor: isLoading || !canSubmit ? "#f1f5f9" : "#1d4ed8",
//             border: `1px solid ${isLoading || !canSubmit ? "#e2e8f0" : "#1d4ed8"}`,
//             cursor: isLoading || !canSubmit ? "not-allowed" : "pointer",
//           }}
//         >
//           {isLoading ? "Saving..." : "Save"}
//         </button>
//       </Flex>
//     </ModalShell>
//   );
// };

// // ── Modal: Requester isi Area & Line ────────────────────────────────────────
// // ── Modal: Requester isi Area & Line ────────────────────────────────────────
// const AssignAreaLineModal = ({
//   isOpen,
//   noReq,
//   requiresLine,
//   isLoading,
//   onSubmit,
//   onCancel,
// }: {
//   isOpen: boolean;
//   noReq: string;
//   requiresLine: boolean;
//   isLoading: boolean;
//   onSubmit: (data: {
//     area_id: number;
//     line_id: number | null;
//     station_id: number | null;
//   }) => void;
//   onCancel: () => void;
// }) => {
//   const [areaId, setAreaId] = useState<number | "">("");
//   const [lineId, setLineId] = useState<number | "">("");
//   const [stationId, setStationId] = useState<number | "">("");

//   const [areas, setAreas] = useState<Area[]>([]);
//   const [lines, setLines] = useState<Line[]>([]);
//   const [stations, setStations] = useState<Station[]>([]);

//   const [loadingAreas, setLoadingAreas] = useState(false);
//   const [loadingLines, setLoadingLines] = useState(false);
//   const [loadingStations, setLoadingStations] = useState(false);

//   // Reset & load Area + Station saat modal dibuka
//   useEffect(() => {
//     if (isOpen) {
//       setAreaId("");
//       setLineId("");
//       setStationId("");
//       setLines([]);

//       setLoadingAreas(true);
//       areaService
//         .getAreas()
//         .then((res) => setAreas(res.data))
//         .catch(() => setAreas([]))
//         .finally(() => setLoadingAreas(false));

//       setLoadingStations(true);
//       stationService
//         .getStations()
//         .then((res) => setStations(res.data))
//         .catch(() => setStations([]))
//         .finally(() => setLoadingStations(false));
//     }
//   }, [isOpen]);

//   // Load Line setiap kali Area berubah
//   useEffect(() => {
//     if (!areaId) {
//       setLines([]);
//       setLineId("");
//       return;
//     }
//     setLoadingLines(true);
//     setLineId(""); // reset pilihan line saat area berganti
//     lineService
//       .getLines({ area_id: Number(areaId) })
//       .then((res) => setLines(res.data))
//       .catch(() => setLines([]))
//       .finally(() => setLoadingLines(false));
//   }, [areaId]);

//   const canSubmit = areaId !== "" && (!requiresLine || lineId !== "");

//   return (
//     <ModalShell
//       isOpen={isOpen}
//       onClose={onCancel}
//       isLoading={isLoading}
//       title="Complete Area & Line"
//       subtitle={`HRD has assigned the candidate for FPTK ${noReq}. Please complete the placement details below.`}
//       iconBg="#fff7ed"
//       iconColor="#c2410c"
//       icon={<FiMapPin size={20} color="#c2410c" />}
//     >
//       <Box mb={3}>
//         <label style={labelStyle}>Area</label>
//         <select
//           style={inputStyle}
//           value={areaId}
//           onChange={(e) =>
//             setAreaId(e.target.value === "" ? "" : Number(e.target.value))
//           }
//           disabled={loadingAreas}
//         >
//           <option value="">
//             {loadingAreas ? "Loading areas..." : "Select area"}
//           </option>
//           {areas.map((a) => (
//             <option key={a.id} value={a.id}>
//               {a.name}
//             </option>
//           ))}
//         </select>
//       </Box>

//       <Box mb={4}>
//         <label style={labelStyle}>
//           Line {requiresLine ? "" : "(optional)"}
//         </label>
//         <select
//           style={inputStyle}
//           value={lineId}
//           onChange={(e) =>
//             setLineId(e.target.value === "" ? "" : Number(e.target.value))
//           }
//           disabled={!areaId || loadingLines}
//         >
//           <option value="">
//             {!areaId
//               ? "Select area first"
//               : loadingLines
//                 ? "Loading lines..."
//                 : lines.length === 0
//                   ? "No lines in this area"
//                   : "Select line"}
//           </option>
//           {lines.map((l) => (
//             <option key={l.id} value={l.id}>
//               {l.name}
//             </option>
//           ))}
//         </select>
//       </Box>

//       <Box mb={4}>
//         <label style={labelStyle}>Station</label>
//         <select
//           style={inputStyle}
//           value={stationId}
//           onChange={(e) =>
//             setStationId(e.target.value === "" ? "" : Number(e.target.value))
//           }
//           disabled={loadingStations}
//         >
//           <option value="">
//             {loadingStations ? "Loading stations..." : "Select station"}
//           </option>
//           {stations.map((s) => (
//             <option key={s.id} value={s.id}>
//               {s.name}
//             </option>
//           ))}
//         </select>
//       </Box>

//       <Flex justify="flex-end" gap={3}>
//         <button
//           type="button"
//           disabled={isLoading}
//           onClick={onCancel}
//           style={{
//             padding: "8px 16px",
//             fontSize: "14px",
//             borderRadius: "8px",
//             color: "#4a5568",
//             backgroundColor: "#ffffff",
//             border: "1px solid #e2e8f0",
//             cursor: isLoading ? "not-allowed" : "pointer",
//             opacity: isLoading ? 0.6 : 1,
//           }}
//         >
//           Cancel
//         </button>
//         <button
//           type="button"
//           disabled={isLoading || !canSubmit}
//           onClick={() =>
//             onSubmit({
//               area_id: Number(areaId),
//               line_id: lineId === "" ? null : lineId,
//               station_id: stationId === "" ? null : stationId,
//             })
//           }
//           style={{
//             padding: "8px 20px",
//             fontSize: "14px",
//             fontWeight: "600",
//             borderRadius: "8px",
//             color: isLoading || !canSubmit ? "#94a3b8" : "#ffffff",
//             backgroundColor: isLoading || !canSubmit ? "#f1f5f9" : "#c2410c",
//             border: `1px solid ${isLoading || !canSubmit ? "#e2e8f0" : "#c2410c"}`,
//             cursor: isLoading || !canSubmit ? "not-allowed" : "pointer",
//           }}
//         >
//           {isLoading ? "Saving..." : "Complete"}
//         </button>
//       </Flex>
//     </ModalShell>
//   );
// };

// // ── Komponen utama ────────────────────────────────────────────────────────────
// const FptkApprovedList: React.FC = () => {
//   const navigate = useNavigate();
//   const [requisitions, setRequisitions] = useState<Requisition[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [processingId, setProcessingId] = useState<string | null>(null);
//   const [successMsg, setSuccessMsg] = useState<string | null>(null);

//   // ── State untuk confirm modal Process HRD ──
//   const [confirmModal, setConfirmModal] = useState<{
//     isOpen: boolean;
//     noReq: string;
//   }>({ isOpen: false, noReq: "" });

//   // ── State untuk modal Assign Manpower (HRD) ──
//   const [manpowerModal, setManpowerModal] = useState<{
//     isOpen: boolean;
//     noReq: string;
//   }>({ isOpen: false, noReq: "" });

//   // ── State untuk modal Area/Line (requester) ──
//   const [areaLineModal, setAreaLineModal] = useState<{
//     isOpen: boolean;
//     req: Requisition | null;
//   }>({ isOpen: false, req: null });

//   const [pagination, setPagination] = useState({
//     current_page: 1,
//     last_page: 1,
//     per_page: 10,
//     total: 0,
//   });
//   const [page, setPage] = useState(1);
//   const [filters] = useState<RequisitionListParams>({
//     status: "Approved,Processed HRD,Manpower Assigned",
//   });
//   const [searchInput, setSearchInput] = useState("");
//   const { user } = useAuth();
//   const isHrAdmin = user?.role?.name === "HR Admin";
//   const isAdmin = user?.role?.name === "Admin";

//   const fetchRequisitions = useCallback(
//     async (params: RequisitionListParams) => {
//       try {
//         setLoading(true);
//         const cleanParams = Object.fromEntries(
//           Object.entries(params).filter(
//             ([, v]) => v !== "" && v !== undefined && v !== null,
//           ),
//         ) as RequisitionListParams;
//         const response = await fptkService.getRequisitions(cleanParams);
//         setRequisitions(response.data.data);
//         setPagination({
//           current_page: response.data.current_page,
//           last_page: response.data.last_page,
//           per_page: response.data.per_page,
//           total: response.data.total,
//         });
//       } catch {
//         alert("Failed to fetch requisitions");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [],
//   );

//   const [clientSearch, setClientSearch] = useState("");

//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       setClientSearch(searchInput.toLowerCase());
//       setPage(1);
//     }, 400);
//     return () => clearTimeout(timeout);
//   }, [searchInput]);

//   useEffect(() => {
//     void fetchRequisitions({ page, per_page: 10, ...filters });
//   }, [page, filters, fetchRequisitions]);

//   const displayedRequisitions = clientSearch
//     ? requisitions.filter(
//         (r) =>
//           r.requester_name.toLowerCase().includes(clientSearch) ||
//           (r.no_req ?? "").toLowerCase().includes(clientSearch) ||
//           (r.position ?? "").toLowerCase().includes(clientSearch) ||
//           (r.department ?? "").toLowerCase().includes(clientSearch),
//       )
//     : requisitions;

//   const showSuccess = (msg: string) => {
//     setSuccessMsg(msg);
//     setTimeout(() => setSuccessMsg(null), 3000);
//   };

//   const refresh = () =>
//     void fetchRequisitions({ page, per_page: 10, ...filters });

//   // ── Process HRD ──
//   const openConfirmModal = (e: React.MouseEvent, noReq: string) => {
//     e.stopPropagation();
//     setConfirmModal({ isOpen: true, noReq });
//   };

//   const handleConfirmProcess = async () => {
//     const noReq = confirmModal.noReq;
//     setConfirmModal({ isOpen: false, noReq: "" });

//     try {
//       setProcessingId(noReq);
//       await fptkService.processHrd(noReq);
//       showSuccess(`FPTK ${noReq} successfully processed by HRD.`);
//       refresh();
//     } catch (err: unknown) {
//       const e = err as { response?: { data?: { message?: string } } };
//       alert(e.response?.data?.message ?? "Failed to process FPTK.");
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   // ── Assign Manpower (HRD isi NPK/kontrak) ──
//   const openManpowerModal = (e: React.MouseEvent, noReq: string) => {
//     e.stopPropagation();
//     setManpowerModal({ isOpen: true, noReq });
//   };

//   const handleSubmitManpower = async (data: {
//     npk: string;
//     name: string;
//     start_contract: string;
//     end_contract: string;
//   }) => {
//     const noReq = manpowerModal.noReq;
//     try {
//       setProcessingId(noReq);
//       await fptkService.assignManpower(noReq, {
//         npk: data.npk,
//         name: data.name,
//         start_contract: data.start_contract,
//         end_contract: data.end_contract || null,
//       });
//       setManpowerModal({ isOpen: false, noReq: "" });
//       showSuccess(
//         `Manpower data for FPTK ${noReq} saved. Waiting for requester to fill area/line.`,
//       );
//       refresh();
//     } catch (err: unknown) {
//       const e = err as { response?: { data?: { message?: string } } };
//       alert(e.response?.data?.message ?? "Failed to save manpower data.");
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   // ── Assign Area/Line (requester) ──
//   const openAreaLineModal = (e: React.MouseEvent, req: Requisition) => {
//     e.stopPropagation();
//     setAreaLineModal({ isOpen: true, req });
//   };

//   const handleSubmitAreaLine = async (data: {
//     area_id: number;
//     line_id: number | null;
//     station_id: number | null;
//   }) => {
//     const req = areaLineModal.req;
//     if (!req) return;
//     try {
//       setProcessingId(req.no_req);
//       await fptkService.assignAreaLine(req.no_req, {
//         area_id: data.area_id,
//         line_id: data.line_id,
//         station_id: data.station_id,
//       });
//       setAreaLineModal({ isOpen: false, req: null });
//       showSuccess(`FPTK ${req.no_req} completed — manpower has been created.`);
//       refresh();
//     } catch (err: unknown) {
//       const e = err as { response?: { data?: { message?: string } } };
//       alert(e.response?.data?.message ?? "Failed to save area/line.");
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   const handlePrint = (noReq: string) => {
//     const API_BASE_URL =
//       import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
//     const printUrl =
//       API_BASE_URL.replace(/\/api\/?$/, "") + `/print/fptk/${noReq}`;
//     window.open(printUrl, "_blank");
//   };

//   const getStatusBadgeStyle = (status: string): React.CSSProperties => {
//     if (status === "Approved")
//       return {
//         backgroundColor: "#f0fdf4",
//         color: "#15803d",
//         border: "1px solid #bbf7d0",
//         borderRadius: "6px",
//         padding: "2px 8px",
//         fontSize: "12px",
//         fontWeight: 500,
//       };
//     if (status === "Processed HRD")
//       return {
//         backgroundColor: "#eff6ff",
//         color: "#1d4ed8",
//         border: "1px solid #bfdbfe",
//         borderRadius: "6px",
//         padding: "2px 8px",
//         fontSize: "12px",
//         fontWeight: 500,
//       };
//     if (status === "Manpower Assigned")
//       return {
//         backgroundColor: "#faf5ff",
//         color: "#7e22ce",
//         border: "1px solid #d8b4fe",
//         borderRadius: "6px",
//         padding: "2px 8px",
//         fontSize: "12px",
//         fontWeight: 500,
//       };
//     return {
//       backgroundColor: "#f8fafc",
//       color: "#64748b",
//       border: "1px solid #e2e8f0",
//       borderRadius: "6px",
//       padding: "2px 8px",
//       fontSize: "12px",
//       fontWeight: 500,
//     };
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("id-ID", {
//       day: "2-digit",
//       month: "long",
//       year: "numeric",
//     });
//   };

//   return (
//     <MainLayout>
//       <Box>
//         {/* ── Confirm Modal Process HRD ── */}
//         <ConfirmModal
//           isOpen={confirmModal.isOpen}
//           noReq={confirmModal.noReq}
//           isLoading={processingId === confirmModal.noReq}
//           onConfirm={handleConfirmProcess}
//           onCancel={() => setConfirmModal({ isOpen: false, noReq: "" })}
//         />

//         {/* ── Modal Assign Manpower ── */}
//         <AssignManpowerModal
//           isOpen={manpowerModal.isOpen}
//           noReq={manpowerModal.noReq}
//           isLoading={processingId === manpowerModal.noReq}
//           onSubmit={handleSubmitManpower}
//           onCancel={() => setManpowerModal({ isOpen: false, noReq: "" })}
//         />

//         {/* ── Modal Assign Area/Line ── */}
//         <AssignAreaLineModal
//           isOpen={areaLineModal.isOpen}
//           noReq={areaLineModal.req?.no_req ?? ""}
//           requiresLine={
//             (areaLineModal.req?.department ?? "").toLowerCase() ===
//             "manufacturing"
//           }
//           isLoading={processingId === areaLineModal.req?.no_req}
//           onSubmit={handleSubmitAreaLine}
//           onCancel={() => setAreaLineModal({ isOpen: false, req: null })}
//         />

//         {/* Success toast */}
//         {successMsg && (
//           <Box
//             position="fixed"
//             top={4}
//             right={4}
//             zIndex={300}
//             bg="green.500"
//             color="white"
//             px={5}
//             py={3}
//             borderRadius="8px"
//             shadow="lg"
//             fontSize="14px"
//             fontWeight="500"
//           >
//             {successMsg}
//           </Box>
//         )}

//         {/* Header */}
//         <Flex justify="space-between" align="center" mb={6}>
//           <Box>
//             <Text fontSize="2xl" fontWeight="bold" color="gray.800">
//               Approved FPTK
//             </Text>
//             <Text fontSize="13px" color="gray.500" mt={0.5}>
//               List of approved FPTK
//             </Text>
//           </Box>
//         </Flex>

//         <Box bg="white" rounded="lg" shadow="sm" p={6}>
//           {/* Filter bar */}
//           <HStack mb={5} gap={3}>
//             <Box position="relative" maxW="300px" w="full">
//               <Box
//                 position="absolute"
//                 left="10px"
//                 top="50%"
//                 transform="translateY(-50%)"
//                 color="gray.400"
//                 pointerEvents="none"
//                 zIndex={1}
//               >
//                 <FiSearch size={14} />
//               </Box>
//               <input
//                 placeholder="Search no. req / requester / position..."
//                 value={searchInput}
//                 onChange={(e) => setSearchInput(e.target.value)}
//                 style={{
//                   width: "100%",
//                   paddingLeft: "32px",
//                   paddingRight: "12px",
//                   paddingTop: "8px",
//                   paddingBottom: "8px",
//                   fontSize: "14px",
//                   color: "#1a202c",
//                   backgroundColor: "#ffffff",
//                   border: "1px solid #e2e8f0",
//                   borderRadius: "8px",
//                   outline: "none",
//                 }}
//                 onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
//                 onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
//               />
//             </Box>
//           </HStack>

//           {/* Table */}
//           {loading ? (
//             <Flex justify="center" py={10}>
//               <Text color="gray.500" fontSize="14px">
//                 Loading...
//               </Text>
//             </Flex>
//           ) : displayedRequisitions.length === 0 ? (
//             <Flex justify="center" py={10}>
//               <Text color="gray.400" fontSize="14px">
//                 No FPTK with Approved / Processed HRD / Manpower Assigned status
//               </Text>
//             </Flex>
//           ) : (
//             <Box overflowX="auto">
//               <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                 <thead>
//                   <tr style={{ backgroundColor: "#f8fafc" }}>
//                     {[
//                       "No",
//                       "No Requisition",
//                       "Request Date",
//                       "Requester",
//                       "Position",
//                       "Department",
//                       "Apprenticeship",
//                       "Status",
//                       "Action",
//                     ].map((h) => (
//                       <th
//                         key={h}
//                         style={{
//                           padding: "10px 14px",
//                           textAlign: "left",
//                           fontSize: "12px",
//                           fontWeight: "600",
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
//                   {displayedRequisitions.map((req, index) => {
//                     const needsAreaLine = !!req.needs_area_line;
//                     const isSameDepartment =
//                       !!user?.department?.name &&
//                       user.department.name === req.department;
//                     const canFillAreaLine =
//                       needsAreaLine && (isAdmin || isSameDepartment);
//                     const canAssignManpower =
//                       isHrAdmin &&
//                       req.approval_status === "Processed HRD" &&
//                       !req.hrd_assigned_at;

//                     return (
//                       <tr
//                         key={req.no_req}
//                         style={{
//                           borderBottom: "1px solid #f1f5f9",
//                           cursor: "pointer",
//                           backgroundColor: needsAreaLine
//                             ? "#fff7ed"
//                             : undefined,
//                         }}
//                         onClick={() => navigate(`/fptk/${req.no_req}`)}
//                         onMouseEnter={(e) =>
//                           (e.currentTarget.style.backgroundColor = needsAreaLine
//                             ? "#ffedd5"
//                             : "#f8fafc")
//                         }
//                         onMouseLeave={(e) =>
//                           (e.currentTarget.style.backgroundColor = needsAreaLine
//                             ? "#fff7ed"
//                             : "transparent")
//                         }
//                       >
//                         <td
//                           style={{
//                             padding: "12px 14px",
//                             fontSize: "13px",
//                             color: "#64748b",
//                           }}
//                         >
//                           {(pagination.current_page - 1) * pagination.per_page +
//                             index +
//                             1}
//                         </td>
//                         <td
//                           style={{
//                             padding: "12px 14px",
//                             fontSize: "13px",
//                             color: "#1e293b",
//                             fontWeight: "500",
//                           }}
//                         >
//                           {req.no_req}
//                         </td>
//                         <td
//                           style={{
//                             padding: "12px 14px",
//                             fontSize: "13px",
//                             color: "#475569",
//                           }}
//                         >
//                           {formatDate(req.request_date)}
//                         </td>
//                         <td
//                           style={{
//                             padding: "12px 14px",
//                             fontSize: "13px",
//                             color: "#1e293b",
//                           }}
//                         >
//                           {req.requester_name}
//                         </td>
//                         <td
//                           style={{
//                             padding: "12px 14px",
//                             fontSize: "13px",
//                             color: "#475569",
//                           }}
//                         >
//                           {req.position || "-"}
//                         </td>
//                         <td
//                           style={{
//                             padding: "12px 14px",
//                             fontSize: "13px",
//                             color: "#475569",
//                           }}
//                         >
//                           {req.department || "-"}
//                         </td>
//                         <td style={{ padding: "12px 14px" }}>
//                           <span
//                             style={{
//                               backgroundColor: req.apprenticeship_period
//                                 ? "#eff6ff"
//                                 : "#f8fafc",
//                               color: req.apprenticeship_period
//                                 ? "#1d4ed8"
//                                 : "#64748b",
//                               border: `1px solid ${req.apprenticeship_period ? "#bfdbfe" : "#e2e8f0"}`,
//                               borderRadius: "6px",
//                               padding: "2px 8px",
//                               fontSize: "12px",
//                               fontWeight: 500,
//                             }}
//                           >
//                             {req.apprenticeship_period ? "Yes" : "No"}
//                           </span>
//                         </td>
//                         <td style={{ padding: "12px 14px" }}>
//                           <HStack gap={2}>
//                             <span
//                               style={getStatusBadgeStyle(req.approval_status)}
//                             >
//                               {req.approval_status}
//                             </span>
//                             {needsAreaLine && (
//                               <span
//                                 style={{
//                                   backgroundColor: "#fff7ed",
//                                   color: "#c2410c",
//                                   border: "1px solid #fed7aa",
//                                   borderRadius: "6px",
//                                   padding: "2px 8px",
//                                   fontSize: "11px",
//                                   fontWeight: 600,
//                                 }}
//                               >
//                                 Needs Area/Line
//                               </span>
//                             )}
//                           </HStack>
//                         </td>
//                         <td style={{ padding: "12px 14px" }}>
//                           <HStack gap={1}>
//                             {/* Tombol Print */}
//                             <button
//                               type="button"
//                               title="Print"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handlePrint(req.no_req);
//                               }}
//                               style={{
//                                 width: "30px",
//                                 height: "30px",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 borderRadius: "6px",
//                                 color: "#10b981",
//                                 backgroundColor: "#ecfdf5",
//                                 border: "1px solid #a7f3d0",
//                                 cursor: "pointer",
//                               }}
//                               onMouseEnter={(e) =>
//                                 (e.currentTarget.style.backgroundColor =
//                                   "#d1fae5")
//                               }
//                               onMouseLeave={(e) =>
//                                 (e.currentTarget.style.backgroundColor =
//                                   "#ecfdf5")
//                               }
//                             >
//                               <FiPrinter size={14} />
//                             </button>

//                             {/* Process HRD — HR Admin, status Approved */}
//                             {isHrAdmin &&
//                               req.approval_status === "Approved" && (
//                                 <button
//                                   type="button"
//                                   title="Process as HRD"
//                                   disabled={processingId === req.no_req}
//                                   onClick={(e) =>
//                                     openConfirmModal(e, req.no_req)
//                                   }
//                                   style={{
//                                     width: "30px",
//                                     height: "30px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     borderRadius: "6px",
//                                     color:
//                                       processingId === req.no_req
//                                         ? "#94a3b8"
//                                         : "#3b82f6",
//                                     backgroundColor:
//                                       processingId === req.no_req
//                                         ? "#f1f5f9"
//                                         : "#eff6ff",
//                                     border: `1px solid ${processingId === req.no_req ? "#e2e8f0" : "#bfdbfe"}`,
//                                     cursor:
//                                       processingId === req.no_req
//                                         ? "not-allowed"
//                                         : "pointer",
//                                   }}
//                                   onMouseEnter={(e) => {
//                                     if (processingId !== req.no_req)
//                                       e.currentTarget.style.backgroundColor =
//                                         "#dbeafe";
//                                   }}
//                                   onMouseLeave={(e) => {
//                                     if (processingId !== req.no_req)
//                                       e.currentTarget.style.backgroundColor =
//                                         "#eff6ff";
//                                   }}
//                                 >
//                                   <FiPlay size={13} />
//                                 </button>
//                               )}

//                             {/* Assign Manpower — HR Admin, status Processed HRD, belum diisi */}
//                             {canAssignManpower && (
//                               <button
//                                 type="button"
//                                 title="Assign Manpower (NPK & Contract)"
//                                 disabled={processingId === req.no_req}
//                                 onClick={(e) =>
//                                   openManpowerModal(e, req.no_req)
//                                 }
//                                 style={{
//                                   width: "30px",
//                                   height: "30px",
//                                   display: "flex",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                   borderRadius: "6px",
//                                   color:
//                                     processingId === req.no_req
//                                       ? "#94a3b8"
//                                       : "#7c3aed",
//                                   backgroundColor:
//                                     processingId === req.no_req
//                                       ? "#f1f5f9"
//                                       : "#f5f3ff",
//                                   border: `1px solid ${processingId === req.no_req ? "#e2e8f0" : "#ddd6fe"}`,
//                                   cursor:
//                                     processingId === req.no_req
//                                       ? "not-allowed"
//                                       : "pointer",
//                                 }}
//                                 onMouseEnter={(e) => {
//                                   if (processingId !== req.no_req)
//                                     e.currentTarget.style.backgroundColor =
//                                       "#ede9fe";
//                                 }}
//                                 onMouseLeave={(e) => {
//                                   if (processingId !== req.no_req)
//                                     e.currentTarget.style.backgroundColor =
//                                       "#f5f3ff";
//                                 }}
//                               >
//                                 <FiUserPlus size={14} />
//                               </button>
//                             )}

//                             {/* Fill Area/Line — user dari department yang sama dengan FPTK ini, saat needs_area_line */}
//                             {canFillAreaLine && (
//                               <button
//                                 type="button"
//                                 title="Complete Area/Line"
//                                 disabled={processingId === req.no_req}
//                                 onClick={(e) => openAreaLineModal(e, req)}
//                                 style={{
//                                   width: "30px",
//                                   height: "30px",
//                                   display: "flex",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                   borderRadius: "6px",
//                                   color:
//                                     processingId === req.no_req
//                                       ? "#94a3b8"
//                                       : "#c2410c",
//                                   backgroundColor:
//                                     processingId === req.no_req
//                                       ? "#f1f5f9"
//                                       : "#fff7ed",
//                                   border: `1px solid ${processingId === req.no_req ? "#e2e8f0" : "#fed7aa"}`,
//                                   cursor:
//                                     processingId === req.no_req
//                                       ? "not-allowed"
//                                       : "pointer",
//                                 }}
//                                 onMouseEnter={(e) => {
//                                   if (processingId !== req.no_req)
//                                     e.currentTarget.style.backgroundColor =
//                                       "#ffedd5";
//                                 }}
//                                 onMouseLeave={(e) => {
//                                   if (processingId !== req.no_req)
//                                     e.currentTarget.style.backgroundColor =
//                                       "#fff7ed";
//                                 }}
//                               >
//                                 <FiMapPin size={14} />
//                               </button>
//                             )}
//                           </HStack>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </Box>
//           )}

//           {/* Pagination */}
//           <Flex
//             justify="space-between"
//             align="center"
//             mt={5}
//             pt={4}
//             borderTop="1px solid"
//             borderColor="gray.100"
//           >
//             <Text fontSize="12px" color="gray.500">
//               Showing {requisitions.length} of {pagination.total} FPTK
//             </Text>
//             <HStack gap={2}>
//               <button
//                 type="button"
//                 disabled={page === 1}
//                 onClick={() => setPage((p) => p - 1)}
//                 style={{
//                   padding: "6px 14px",
//                   fontSize: "13px",
//                   borderRadius: "6px",
//                   border: "1px solid #e2e8f0",
//                   backgroundColor: page === 1 ? "#f8fafc" : "#ffffff",
//                   color: page === 1 ? "#94a3b8" : "#475569",
//                   cursor: page === 1 ? "not-allowed" : "pointer",
//                 }}
//               >
//                 Previous
//               </button>
//               <Text fontSize="13px" color="gray.600" px={2}>
//                 Page {pagination.current_page} of {pagination.last_page}
//               </Text>
//               <button
//                 type="button"
//                 disabled={page >= pagination.last_page}
//                 onClick={() => setPage((p) => p + 1)}
//                 style={{
//                   padding: "6px 14px",
//                   fontSize: "13px",
//                   borderRadius: "6px",
//                   border: "1px solid #e2e8f0",
//                   backgroundColor:
//                     page >= pagination.last_page ? "#f8fafc" : "#ffffff",
//                   color: page >= pagination.last_page ? "#94a3b8" : "#475569",
//                   cursor:
//                     page >= pagination.last_page ? "not-allowed" : "pointer",
//                 }}
//               >
//                 Next
//               </button>
//             </HStack>
//           </Flex>
//         </Box>
//       </Box>
//     </MainLayout>
//   );
// };

// export default FptkApprovedList;
import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import {
  FiSearch,
  FiPrinter,
  FiPlay,
  FiAlertTriangle,
  FiUserPlus,
  FiMapPin,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import fptkService from "../../services/fptkService";
import type { Requisition, RequisitionListParams } from "../../types/fptk";
import { useAuth } from "../../contexts/AuthContext";
import stationService from "../../services/stationService";
import lineService from "../../services/lineService";
import areaService from "../../services/areaService";
import type { Area } from "../../types/area";
import type { Line } from "../../types/line";
import type { Station } from "../../types/station";
import { v4 as uuidv4 } from "uuid";

// ── Confirm Modal (Process HRD) ─────────────────────────────────────────────
const ConfirmModal = ({
  isOpen,
  noReq,
  isLoading,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  noReq: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <>
      <Box
        position="fixed"
        inset={0}
        zIndex={400}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={!isLoading ? onCancel : undefined}
      />
      <Box
        position="fixed"
        top="50%"
        left="50%"
        zIndex={500}
        style={{
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "440px",
          padding: "0 16px",
        }}
      >
        <Box
          bg="white"
          borderRadius="12px"
          shadow="xl"
          borderWidth="1px"
          borderColor="gray.100"
          overflow="hidden"
        >
          <Box px={6} pt={6} pb={4}>
            <HStack gap={3} align="flex-start">
              <Box
                w="40px"
                h="40px"
                borderRadius="10px"
                bg="#eff6ff"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <FiAlertTriangle size={20} color="#1d4ed8" />
              </Box>
              <Box>
                <Text fontSize="16px" fontWeight="700" color="gray.800" mb={1}>
                  HRD Process Confirmation
                </Text>
                <Text fontSize="13px" color="gray.500" lineHeight="1.5">
                  You are about to process FPTK{" "}
                  <Text as="span" fontWeight="700" color="blue.700">
                    {noReq}
                  </Text>{" "}
                  to start HRD screening. This action cannot be undone.
                </Text>
              </Box>
            </HStack>
          </Box>
          <Box h="1px" bg="gray.100" />
          <Flex px={6} py={4} justify="flex-end" gap={3}>
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                borderRadius: "8px",
                color: "#4a5568",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "8px",
                color: isLoading ? "#94a3b8" : "#ffffff",
                backgroundColor: isLoading ? "#f1f5f9" : "#1d4ed8",
                border: `1px solid ${isLoading ? "#e2e8f0" : "#1d4ed8"}`,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              <FiPlay size={13} />
              {isLoading ? "Processing..." : "Yes, Process Now"}
            </button>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

// ── Generic modal shell ──────────────────────────────────────────────────────
const ModalShell = ({
  isOpen,
  onClose,
  title,
  subtitle,
  iconBg,
  icon,
  children,
  isLoading,
  maxWidth = "460px",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isLoading: boolean;
  maxWidth?: string;
}) => {
  if (!isOpen) return null;
  return (
    <>
      <Box
        position="fixed"
        inset={0}
        zIndex={400}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={!isLoading ? onClose : undefined}
      />
      <Box
        position="fixed"
        top="50%"
        left="50%"
        zIndex={500}
        style={{
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth,
          padding: "0 16px",
          maxHeight: "90vh",
        }}
      >
        <Box
          bg="white"
          borderRadius="12px"
          shadow="xl"
          borderWidth="1px"
          borderColor="gray.100"
          overflow="hidden"
          style={{
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box px={6} pt={6} pb={4} flexShrink={0}>
            <HStack gap={3} align="flex-start">
              <Box
                w="40px"
                h="40px"
                borderRadius="10px"
                bg={iconBg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                {icon}
              </Box>
              <Box>
                <Text fontSize="16px" fontWeight="700" color="gray.800" mb={1}>
                  {title}
                </Text>
                <Text fontSize="13px" color="gray.500" lineHeight="1.5">
                  {subtitle}
                </Text>
              </Box>
            </HStack>
          </Box>
          <Box h="1px" bg="gray.100" flexShrink={0} />
          <Box px={6} py={5} style={{ overflowY: "auto", flex: 1 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  fontSize: "14px",
  color: "#1a202c",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#334155",
  marginBottom: "6px",
  display: "block",
};

const candidateCardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "14px",
  backgroundColor: "#f9fafb",
  position: "relative",
};

const addButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 14px",
  fontSize: "13px",
  fontWeight: 600,
  borderRadius: "8px",
  color: "#1d4ed8",
  backgroundColor: "#eff6ff",
  border: "1px dashed #bfdbfe",
  cursor: "pointer",
  width: "100%",
  justifyContent: "center",
};

const removeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "10px",
  right: "10px",
  width: "26px",
  height: "26px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "6px",
  color: "#be123c",
  backgroundColor: "#fff1f2",
  border: "1px solid #fecdd3",
  cursor: "pointer",
};

// ── Tipe data satu kandidat (Assign Manpower) ───────────────────────────────
interface ManpowerCandidate {
  key: string;
  npk: string;
  name: string;
  join_date: string;
  start_contract: string;
  end_contract: string;
}

const makeEmptyManpowerCandidate = (): ManpowerCandidate => ({
  key: uuidv4(),
  npk: "",
  name: "",
  join_date: "",
  start_contract: "",
  end_contract: "",
});

// ── Modal: HRD isi NPK & Kontrak — mendukung banyak kandidat ────────────────
const AssignManpowerModal = ({
  isOpen,
  noReq,
  isLoading,
  onSubmit,
  onCancel,
}: {
  isOpen: boolean;
  noReq: string;
  isLoading: boolean;
  onSubmit: (
    candidates: {
      npk: string;
      name: string;
      join_date: string;
      start_contract: string;
      end_contract: string | null;
    }[],
  ) => void;
  onCancel: () => void;
}) => {
  const [candidates, setCandidates] = useState<ManpowerCandidate[]>([
    makeEmptyManpowerCandidate(),
  ]);

  useEffect(() => {
    if (isOpen) {
      setCandidates([makeEmptyManpowerCandidate()]);
    }
  }, [isOpen]);

  const updateCandidate = (
    key: string,
    field: keyof Omit<ManpowerCandidate, "key">,
    value: string,
  ) => {
    setCandidates((prev) =>
      prev.map((c) => (c.key === key ? { ...c, [field]: value } : c)),
    );
  };

  const addCandidate = () => {
    setCandidates((prev) => [...prev, makeEmptyManpowerCandidate()]);
  };

  const removeCandidate = (key: string) => {
    setCandidates((prev) => prev.filter((c) => c.key !== key));
  };

  const canSubmit =
    candidates.length > 0 &&
    candidates.every(
      (c) =>
        c.npk.trim() !== "" &&
        c.name.trim() !== "" &&
        c.join_date !== "" &&
        c.start_contract !== "",
    );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onCancel}
      isLoading={isLoading}
      title="Assign Manpower"
      subtitle={`Enter candidate data for FPTK ${noReq} after CV screening is completed. Add more candidates if this FPTK covers several positions.`}
      iconBg="#eff6ff"
      icon={<FiUserPlus size={20} color="#1d4ed8" />}
      maxWidth="560px"
    >
      <Flex direction="column" gap={3} mb={4}>
        {candidates.map((c, idx) => (
          <Box key={c.key} style={candidateCardStyle}>
            <Text
              fontSize="12px"
              fontWeight={700}
              color="gray.500"
              mb={2}
              textTransform="uppercase"
              letterSpacing="0.05em"
            >
              Candidate {idx + 1}
            </Text>

            {candidates.length > 1 && (
              <button
                type="button"
                title="Remove this candidate"
                onClick={() => removeCandidate(c.key)}
                style={removeButtonStyle}
              >
                <FiTrash2 size={13} />
              </button>
            )}

            <Box mb={3}>
              <label style={labelStyle}>NPK</label>
              <input
                style={inputStyle}
                value={c.npk}
                onChange={(e) => updateCandidate(c.key, "npk", e.target.value)}
                placeholder="e.g. 240001"
              />
            </Box>
            <Box mb={3}>
              <label style={labelStyle}>Employee Name</label>
              <input
                style={inputStyle}
                value={c.name}
                onChange={(e) => updateCandidate(c.key, "name", e.target.value)}
                placeholder="Full name"
              />
            </Box>
            <Box mb={3}>
              <label style={labelStyle}>Join Date</label>
              <input
                type="date"
                style={inputStyle}
                value={c.join_date}
                onChange={(e) =>
                  updateCandidate(c.key, "join_date", e.target.value)
                }
              />
            </Box>
            <HStack gap={3}>
              <Box flex={1}>
                <label style={labelStyle}>Start Contract</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={c.start_contract}
                  onChange={(e) =>
                    updateCandidate(c.key, "start_contract", e.target.value)
                  }
                />
              </Box>
              <Box flex={1}>
                <label style={labelStyle}>End Contract (optional)</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={c.end_contract}
                  onChange={(e) =>
                    updateCandidate(c.key, "end_contract", e.target.value)
                  }
                />
              </Box>
            </HStack>
          </Box>
        ))}

        <button type="button" onClick={addCandidate} style={addButtonStyle}>
          <FiPlus size={14} /> Add another candidate
        </button>
      </Flex>

      <Flex justify="flex-end" gap={3}>
        <button
          type="button"
          disabled={isLoading}
          onClick={onCancel}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            borderRadius: "8px",
            color: "#4a5568",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isLoading || !canSubmit}
          onClick={() =>
            onSubmit(
              candidates.map((c) => ({
                npk: c.npk.trim(),
                name: c.name.trim(),
                join_date: c.join_date,
                start_contract: c.start_contract,
                end_contract: c.end_contract || null,
              })),
            )
          }
          style={{
            padding: "8px 20px",
            fontSize: "14px",
            fontWeight: "600",
            borderRadius: "8px",
            color: isLoading || !canSubmit ? "#94a3b8" : "#ffffff",
            backgroundColor: isLoading || !canSubmit ? "#f1f5f9" : "#1d4ed8",
            border: `1px solid ${isLoading || !canSubmit ? "#e2e8f0" : "#1d4ed8"}`,
            cursor: isLoading || !canSubmit ? "not-allowed" : "pointer",
          }}
        >
          {isLoading
            ? "Saving..."
            : `Save ${candidates.length > 1 ? `${candidates.length} Candidates` : ""}`}
        </button>
      </Flex>
    </ModalShell>
  );
};

// ── Tipe data satu kandidat (Area/Line/Station) ─────────────────────────────
interface AreaLineCandidate {
  key: string;
  npk: string; // dari pending_candidates — read-only, WAJIB dikirim balik
  name: string; // dari pending_candidates — read-only, hanya tampilan
  areaId: number | "";
  lineId: number | "";
  stationId: number | "";
  lines: Line[];
  loadingLines: boolean;
}

const makeAreaLineCandidatesFromPending = (
  pending: { npk: string; name: string }[],
): AreaLineCandidate[] =>
  pending.map((p) => ({
    key: p.npk, // pakai npk sebagai key, sudah pasti unik
    npk: p.npk,
    name: p.name,
    areaId: "",
    lineId: "",
    stationId: "",
    lines: [],
    loadingLines: false,
  }));
const AssignAreaLineModal = ({
  isOpen,
  noReq,
  pendingCandidates, // <-- BARU: diteruskan dari parent, dari req.pending_candidates
  requiresLine,
  isLoading,
  onSubmit,
  onCancel,
}: {
  isOpen: boolean;
  noReq: string;
  pendingCandidates: { npk: string; name: string }[];
  requiresLine: boolean;
  isLoading: boolean;
  onSubmit: (
    candidates: {
      npk: string;
      area_id: number;
      line_id: number | null;
      station_id: number | null;
    }[],
  ) => void;
  onCancel: () => void;
}) => {
  const [candidates, setCandidates] = useState<AreaLineCandidate[]>([]);

  const [areas, setAreas] = useState<Area[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Baris dibangun otomatis dari data HRD — BUKAN array kosong lagi
      setCandidates(makeAreaLineCandidatesFromPending(pendingCandidates));

      setLoadingAreas(true);
      areaService
        .getAreas()
        .then((res) => setAreas(res.data))
        .catch(() => setAreas([]))
        .finally(() => setLoadingAreas(false));

      setLoadingStations(true);
      stationService
        .getStations()
        .then((res) => setStations(res.data))
        .catch(() => setStations([]))
        .finally(() => setLoadingStations(false));
    }
  }, [isOpen, pendingCandidates]);

  // addCandidate & removeCandidate DIHAPUS — jumlah baris fix sesuai HRD

  const handleAreaChange = (key: string, areaId: number | "") => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.key === key
          ? { ...c, areaId, lineId: "", lines: [], loadingLines: !!areaId }
          : c,
      ),
    );
    if (!areaId) return;

    lineService
      .getLines({ area_id: Number(areaId) })
      .then((res) => {
        setCandidates((prev) =>
          prev.map((c) =>
            c.key === key ? { ...c, lines: res.data, loadingLines: false } : c,
          ),
        );
      })
      .catch(() => {
        setCandidates((prev) =>
          prev.map((c) =>
            c.key === key ? { ...c, lines: [], loadingLines: false } : c,
          ),
        );
      });
  };

  const handleLineChange = (key: string, lineId: number | "") => {
    setCandidates((prev) =>
      prev.map((c) => (c.key === key ? { ...c, lineId } : c)),
    );
  };

  const handleStationChange = (key: string, stationId: number | "") => {
    setCandidates((prev) =>
      prev.map((c) => (c.key === key ? { ...c, stationId } : c)),
    );
  };

  const canSubmit =
    candidates.length > 0 &&
    candidates.every(
      (c) => c.areaId !== "" && (!requiresLine || c.lineId !== ""),
    );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onCancel}
      isLoading={isLoading}
      title="Complete Area & Line"
      subtitle={`HRD has assigned ${candidates.length} candidate(s) for FPTK ${noReq}. Please complete the placement details for each person below.`}
      iconBg="#fff7ed"
      icon={<FiMapPin size={20} color="#c2410c" />}
      maxWidth="560px"
    >
      <Flex direction="column" gap={3} mb={4}>
        {candidates.map((c, idx) => (
          <Box key={c.key} style={candidateCardStyle}>
            <Box mb={2}>
              <Text
                fontSize="12px"
                fontWeight={700}
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="0.05em"
              >
                Candidate {idx + 1}
              </Text>
              {/* NPK & Nama read-only, supaya requester tahu ini untuk siapa */}
              <Text fontSize="14px" fontWeight={600} color="gray.800">
                {c.name}
              </Text>
              <Text fontSize="12px" color="gray.500">
                NPK: {c.npk}
              </Text>
            </Box>

            <Box mb={3}>
              <label style={labelStyle}>Area</label>
              <select
                style={inputStyle}
                value={c.areaId}
                onChange={(e) =>
                  handleAreaChange(
                    c.key,
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                disabled={loadingAreas}
              >
                <option value="">
                  {loadingAreas ? "Loading areas..." : "Select area"}
                </option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Box>

            <Box mb={3}>
              <label style={labelStyle}>
                Line {requiresLine ? "" : "(optional)"}
              </label>
              <select
                style={inputStyle}
                value={c.lineId}
                onChange={(e) =>
                  handleLineChange(
                    c.key,
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                disabled={!c.areaId || c.loadingLines}
              >
                <option value="">
                  {!c.areaId
                    ? "Select area first"
                    : c.loadingLines
                      ? "Loading lines..."
                      : c.lines.length === 0
                        ? "No lines in this area"
                        : "Select line"}
                </option>
                {c.lines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Box>

            <Box>
              <label style={labelStyle}>Station</label>
              <select
                style={inputStyle}
                value={c.stationId}
                onChange={(e) =>
                  handleStationChange(
                    c.key,
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                disabled={loadingStations}
              >
                <option value="">
                  {loadingStations ? "Loading stations..." : "Select station"}
                </option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Box>
          </Box>
        ))}
      </Flex>

      <Flex justify="flex-end" gap={3}>
        <button
          type="button"
          disabled={isLoading}
          onClick={onCancel}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            borderRadius: "8px",
            color: "#4a5568",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = "#ffffff";
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isLoading || !canSubmit}
          onClick={() =>
            onSubmit(
              candidates.map((c) => ({
                npk: c.npk,
                area_id: Number(c.areaId),
                line_id: c.lineId === "" ? null : Number(c.lineId),
                station_id: c.stationId === "" ? null : Number(c.stationId),
              })),
            )
          }
          style={{
            padding: "8px 20px",
            fontSize: "14px",
            fontWeight: "600",
            borderRadius: "8px",
            color: isLoading || !canSubmit ? "#94a3b8" : "#ffffff",
            backgroundColor: isLoading || !canSubmit ? "#f1f5f9" : "#1A5EA8",
            border: `1px solid ${
              isLoading || !canSubmit ? "#e2e8f0" : "#1A5EA8"
            }`,
            cursor: isLoading || !canSubmit ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!isLoading && canSubmit)
              e.currentTarget.style.backgroundColor = "#164e8a";
          }}
          onMouseLeave={(e) => {
            if (!isLoading && canSubmit)
              e.currentTarget.style.backgroundColor = "#1A5EA8";
          }}
        >
          {isLoading
            ? "Saving..."
            : `Complete ${
                candidates.length > 1 ? `${candidates.length} Candidates` : ""
              }`}
        </button>
      </Flex>
    </ModalShell>
  );
};

// ── Komponen utama ────────────────────────────────────────────────────────────
const FptkApprovedList: React.FC = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── State untuk confirm modal Process HRD ──
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    noReq: string;
  }>({ isOpen: false, noReq: "" });

  // ── State untuk modal Assign Manpower (HRD) ──
  const [manpowerModal, setManpowerModal] = useState<{
    isOpen: boolean;
    noReq: string;
  }>({ isOpen: false, noReq: "" });

  // ── State untuk modal Area/Line (requester) ──
  const [areaLineModal, setAreaLineModal] = useState<{
    isOpen: boolean;
    req: Requisition | null;
  }>({ isOpen: false, req: null });

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [filters] = useState<RequisitionListParams>({
    status: "Approved,Processed HRD,Manpower Assigned",
  });
  const [searchInput, setSearchInput] = useState("");
  const { user } = useAuth();
  const isHrAdmin = user?.role?.name === "HR Admin";
  const isAdmin = user?.role?.name === "Admin";

  const fetchRequisitions = useCallback(
    async (params: RequisitionListParams) => {
      try {
        setLoading(true);
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(
            ([, v]) => v !== "" && v !== undefined && v !== null,
          ),
        ) as RequisitionListParams;
        const response = await fptkService.getRequisitions(cleanParams);
        setRequisitions(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
      } catch {
        alert("Failed to fetch requisitions");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setClientSearch(searchInput.toLowerCase());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    void fetchRequisitions({ page, per_page: 10, ...filters });
  }, [page, filters, fetchRequisitions]);

  const displayedRequisitions = clientSearch
    ? requisitions.filter(
        (r) =>
          r.requester_name.toLowerCase().includes(clientSearch) ||
          (r.no_req ?? "").toLowerCase().includes(clientSearch) ||
          (r.position ?? "").toLowerCase().includes(clientSearch) ||
          (r.department ?? "").toLowerCase().includes(clientSearch),
      )
    : requisitions;

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const refresh = () =>
    void fetchRequisitions({ page, per_page: 10, ...filters });

  // ── Process HRD ──
  const openConfirmModal = (e: React.MouseEvent, noReq: string) => {
    e.stopPropagation();
    setConfirmModal({ isOpen: true, noReq });
  };

  const handleConfirmProcess = async () => {
    const noReq = confirmModal.noReq;
    setConfirmModal({ isOpen: false, noReq: "" });

    try {
      setProcessingId(noReq);
      await fptkService.processHrd(noReq);
      showSuccess(`FPTK ${noReq} successfully processed by HRD.`);
      refresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "Failed to process FPTK.");
    } finally {
      setProcessingId(null);
    }
  };

  // ── Assign Manpower (HRD isi NPK/kontrak) — mendukung banyak kandidat ──
  const openManpowerModal = (e: React.MouseEvent, noReq: string) => {
    e.stopPropagation();
    setManpowerModal({ isOpen: true, noReq });
  };

  const handleSubmitManpower = async (
    candidates: {
      npk: string;
      name: string;
      join_date: string;
      start_contract: string;
      end_contract: string | null;
    }[],
  ) => {
    const noReq = manpowerModal.noReq;
    try {
      setProcessingId(noReq);
      // NOTE: endpoint saat ini (assignManpower) hanya menerima satu kandidat.
      // Perlu diubah di backend agar menerima array `candidates` dan membuat
      // banyak entri di bawah satu no_req yang sama. Lihat catatan di chat.
      await fptkService.assignManpower(noReq, { candidates });
      setManpowerModal({ isOpen: false, noReq: "" });
      showSuccess(
        `Manpower data for FPTK ${noReq} saved (${candidates.length} candidate${
          candidates.length > 1 ? "s" : ""
        }). Waiting for requester to fill area/line.`,
      );
      refresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "Failed to save manpower data.");
    } finally {
      setProcessingId(null);
    }
  };

  // ── Assign Area/Line (requester) — mendukung banyak kandidat ──
  const openAreaLineModal = (e: React.MouseEvent, req: Requisition) => {
    e.stopPropagation();
    setAreaLineModal({ isOpen: true, req });
  };

  const handleSubmitAreaLine = async (
    candidates: {
      npk: string;
      area_id: number;
      line_id: number | null;
      station_id: number | null;
    }[],
  ) => {
    const req = areaLineModal.req;
    if (!req) return;
    try {
      setProcessingId(req.no_req);
      await fptkService.assignAreaLine(req.no_req, { candidates });
      setAreaLineModal({ isOpen: false, req: null });
      showSuccess(
        `FPTK ${req.no_req} completed — ${candidates.length} manpower record${
          candidates.length > 1 ? "s" : ""
        } created.`,
      );
      refresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "Failed to save area/line.");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePrint = (noReq: string) => {
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    const printUrl =
      API_BASE_URL.replace(/\/api\/?$/, "") + `/print/fptk/${noReq}`;
    window.open(printUrl, "_blank");
  };

  const getStatusBadgeStyle = (status: string): React.CSSProperties => {
    if (status === "Approved")
      return {
        backgroundColor: "#f0fdf4",
        color: "#15803d",
        border: "1px solid #bbf7d0",
        borderRadius: "6px",
        padding: "2px 8px",
        fontSize: "12px",
        fontWeight: 500,
      };
    if (status === "Processed HRD")
      return {
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        borderRadius: "6px",
        padding: "2px 8px",
        fontSize: "12px",
        fontWeight: 500,
      };
    if (status === "Manpower Assigned")
      return {
        backgroundColor: "#faf5ff",
        color: "#7e22ce",
        border: "1px solid #d8b4fe",
        borderRadius: "6px",
        padding: "2px 8px",
        fontSize: "12px",
        fontWeight: 500,
      };
    return {
      backgroundColor: "#f8fafc",
      color: "#64748b",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      padding: "2px 8px",
      fontSize: "12px",
      fontWeight: 500,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <MainLayout>
      <Box>
        {/* ── Confirm Modal Process HRD ── */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          noReq={confirmModal.noReq}
          isLoading={processingId === confirmModal.noReq}
          onConfirm={handleConfirmProcess}
          onCancel={() => setConfirmModal({ isOpen: false, noReq: "" })}
        />

        {/* ── Modal Assign Manpower ── */}
        <AssignManpowerModal
          isOpen={manpowerModal.isOpen}
          noReq={manpowerModal.noReq}
          isLoading={processingId === manpowerModal.noReq}
          onSubmit={handleSubmitManpower}
          onCancel={() => setManpowerModal({ isOpen: false, noReq: "" })}
        />

        {/* ── Modal Assign Area/Line ── */}
        <AssignAreaLineModal
          isOpen={areaLineModal.isOpen}
          noReq={areaLineModal.req?.no_req ?? ""}
          pendingCandidates={areaLineModal.req?.pending_candidates ?? []}
          requiresLine={
            (areaLineModal.req?.department ?? "").toLowerCase() ===
            "manufacturing"
          }
          isLoading={processingId === areaLineModal.req?.no_req}
          onSubmit={handleSubmitAreaLine}
          onCancel={() => setAreaLineModal({ isOpen: false, req: null })}
        />

        {/* Success toast */}
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

        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Approved FPTK
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              List of approved FPTK
            </Text>
          </Box>
        </Flex>

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          {/* Filter bar */}
          <HStack mb={5} gap={3}>
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
                placeholder="Search no. req / requester / position..."
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
          </HStack>

          {/* Table */}
          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500" fontSize="14px">
                Loading...
              </Text>
            </Flex>
          ) : displayedRequisitions.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                No FPTK with Approved / Processed HRD / Manpower Assigned status
              </Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    {[
                      "No",
                      "No Requisition",
                      "Request Date",
                      "Requester",
                      "Position",
                      "Department",
                      "Apprenticeship",
                      "Status",
                      "Action",
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
                  {displayedRequisitions.map((req, index) => {
                    const needsAreaLine = !!req.needs_area_line;
                    const isSameDepartment =
                      !!user?.department?.name &&
                      user.department.name === req.department;
                    const canFillAreaLine =
                      needsAreaLine && (isAdmin || isSameDepartment);
                    const canAssignManpower =
                      isHrAdmin &&
                      req.approval_status === "Processed HRD" &&
                      !req.hrd_assigned_at;

                    return (
                      <tr
                        key={req.no_req}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          cursor: "pointer",
                          backgroundColor: needsAreaLine
                            ? "#fff7ed"
                            : undefined,
                        }}
                        onClick={() => navigate(`/fptk/${req.no_req}`)}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = needsAreaLine
                            ? "#ffedd5"
                            : "#f8fafc")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = needsAreaLine
                            ? "#fff7ed"
                            : "transparent")
                        }
                      >
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          {(pagination.current_page - 1) * pagination.per_page +
                            index +
                            1}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#1e293b",
                            fontWeight: "500",
                          }}
                        >
                          {req.no_req}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {formatDate(req.request_date)}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#1e293b",
                          }}
                        >
                          {req.requester_name}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {req.position || "-"}
                        </td>
                        <td
                          style={{
                            padding: "12px 14px",
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {req.department || "-"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span
                            style={{
                              backgroundColor: req.apprenticeship_period
                                ? "#eff6ff"
                                : "#f8fafc",
                              color: req.apprenticeship_period
                                ? "#1d4ed8"
                                : "#64748b",
                              border: `1px solid ${req.apprenticeship_period ? "#bfdbfe" : "#e2e8f0"}`,
                              borderRadius: "6px",
                              padding: "2px 8px",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}
                          >
                            {req.apprenticeship_period ? "Yes" : "No"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <HStack gap={2}>
                            <span
                              style={getStatusBadgeStyle(req.approval_status)}
                            >
                              {req.approval_status}
                            </span>
                            {needsAreaLine && (
                              <span
                                style={{
                                  backgroundColor: "#fff7ed",
                                  color: "#c2410c",
                                  border: "1px solid #fed7aa",
                                  borderRadius: "6px",
                                  padding: "2px 8px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                }}
                              >
                                Needs Area/Line
                              </span>
                            )}
                          </HStack>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <HStack gap={1}>
                            {/* Tombol Print */}
                            <button
                              type="button"
                              title="Print"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrint(req.no_req);
                              }}
                              style={{
                                width: "30px",
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#10b981",
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#d1fae5")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#ecfdf5")
                              }
                            >
                              <FiPrinter size={14} />
                            </button>

                            {/* Process HRD — HR Admin, status Approved */}
                            {isHrAdmin &&
                              req.approval_status === "Approved" && (
                                <button
                                  type="button"
                                  title="Process as HRD"
                                  disabled={processingId === req.no_req}
                                  onClick={(e) =>
                                    openConfirmModal(e, req.no_req)
                                  }
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: "6px",
                                    color:
                                      processingId === req.no_req
                                        ? "#94a3b8"
                                        : "#3b82f6",
                                    backgroundColor:
                                      processingId === req.no_req
                                        ? "#f1f5f9"
                                        : "#eff6ff",
                                    border: `1px solid ${processingId === req.no_req ? "#e2e8f0" : "#bfdbfe"}`,
                                    cursor:
                                      processingId === req.no_req
                                        ? "not-allowed"
                                        : "pointer",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (processingId !== req.no_req)
                                      e.currentTarget.style.backgroundColor =
                                        "#dbeafe";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (processingId !== req.no_req)
                                      e.currentTarget.style.backgroundColor =
                                        "#eff6ff";
                                  }}
                                >
                                  <FiPlay size={13} />
                                </button>
                              )}

                            {/* Assign Manpower — HR Admin, status Processed HRD, belum diisi */}
                            {canAssignManpower && (
                              <button
                                type="button"
                                title="Assign Manpower (NPK & Contract)"
                                disabled={processingId === req.no_req}
                                onClick={(e) =>
                                  openManpowerModal(e, req.no_req)
                                }
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "6px",
                                  color:
                                    processingId === req.no_req
                                      ? "#94a3b8"
                                      : "#7c3aed",
                                  backgroundColor:
                                    processingId === req.no_req
                                      ? "#f1f5f9"
                                      : "#f5f3ff",
                                  border: `1px solid ${processingId === req.no_req ? "#e2e8f0" : "#ddd6fe"}`,
                                  cursor:
                                    processingId === req.no_req
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                                onMouseEnter={(e) => {
                                  if (processingId !== req.no_req)
                                    e.currentTarget.style.backgroundColor =
                                      "#ede9fe";
                                }}
                                onMouseLeave={(e) => {
                                  if (processingId !== req.no_req)
                                    e.currentTarget.style.backgroundColor =
                                      "#f5f3ff";
                                }}
                              >
                                <FiUserPlus size={14} />
                              </button>
                            )}

                            {/* Fill Area/Line — user dari department yang sama dengan FPTK ini, saat needs_area_line */}
                            {canFillAreaLine && (
                              <button
                                type="button"
                                title="Complete Area/Line"
                                disabled={processingId === req.no_req}
                                onClick={(e) => openAreaLineModal(e, req)}
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: "6px",
                                  color:
                                    processingId === req.no_req
                                      ? "#94a3b8"
                                      : "#c2410c",
                                  backgroundColor:
                                    processingId === req.no_req
                                      ? "#f1f5f9"
                                      : "#fff7ed",
                                  border: `1px solid ${processingId === req.no_req ? "#e2e8f0" : "#fed7aa"}`,
                                  cursor:
                                    processingId === req.no_req
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                                onMouseEnter={(e) => {
                                  if (processingId !== req.no_req)
                                    e.currentTarget.style.backgroundColor =
                                      "#ffedd5";
                                }}
                                onMouseLeave={(e) => {
                                  if (processingId !== req.no_req)
                                    e.currentTarget.style.backgroundColor =
                                      "#fff7ed";
                                }}
                              >
                                <FiMapPin size={14} />
                              </button>
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

          {/* Pagination */}
          <Flex
            justify="space-between"
            align="center"
            mt={5}
            pt={4}
            borderTop="1px solid"
            borderColor="gray.100"
          >
            <Text fontSize="12px" color="gray.500">
              Showing {requisitions.length} of {pagination.total} FPTK
            </Text>
            <HStack gap={2}>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: "6px 14px",
                  fontSize: "13px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: page === 1 ? "#f8fafc" : "#ffffff",
                  color: page === 1 ? "#94a3b8" : "#475569",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
              <Text fontSize="13px" color="gray.600" px={2}>
                Page {pagination.current_page} of {pagination.last_page}
              </Text>
              <button
                type="button"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: "6px 14px",
                  fontSize: "13px",
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
        </Box>
      </Box>
    </MainLayout>
  );
};

export default FptkApprovedList;
