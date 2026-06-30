import React, { useState, useEffect, useRef } from "react";
import { Box, Text, Badge, Flex, HStack } from "@chakra-ui/react";
import { FiPlus, FiTrash2, FiSearch, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import fptkService from "../../services/fptkService";
import { useAuth } from "../../contexts/AuthContext";
import type { Requisition, RequisitionListParams } from "../../types/fptk";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { FiTrash2 as FiTrashIcon } from "react-icons/fi";

interface FilterState {
  page: number;
  manager: string;
  status: string;
  exclude_status: string;
}

const FptkList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const [filterState, setFilterState] = useState<FilterState>({
    page: 1,
    manager: "",
    status: "",
    exclude_status: "Approved,Rejected,Processed HRD",
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canCreateEdit =
    user?.role?.name !== "Manager" &&
    user?.role?.name !== "Division Head" &&
    user?.role?.name !== "Director";

  const canApprove =
    user?.role?.name === "Manager" ||
    user?.role?.name === "Division Head" ||
    user?.role?.name === "Director";

  // Fetch langsung di dalam useEffect — tidak ada useCallback,
  // tidak ada setState di luar async block
  useEffect(() => {
    const cleanParams = Object.fromEntries(
      Object.entries({
        page: filterState.page,
        per_page: 10,
        manager: filterState.manager,
        status: filterState.status,
        exclude_status: filterState.exclude_status,
      }).filter(([, v]) => v !== "" && v !== undefined && v !== null),
    ) as RequisitionListParams;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const response = await fptkService.getRequisitions(cleanParams);
        if (cancelled) return;
        setRequisitions(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
      } catch {
        if (cancelled) return;
        alert("Failed to fetch requisitions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    // Cleanup: abaikan response jika effect re-run sebelum request selesai
    return () => {
      cancelled = true;
    };
  }, [filterState, refreshKey]);

  // Cleanup debounce timer saat unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setFilterState((prev) => {
        if (prev.manager === value) return prev;
        return { ...prev, manager: value, page: 1 };
      });
    }, 500);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterState((prev) => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handleDelete = (noReq: string) => {
    setDeleteTarget(noReq);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fptkService.deleteRequisition(deleteTarget);
      setDeleteTarget(null);
      setRefreshKey((prev) => prev + 1);
    } catch {
      alert("Failed to delete requisition");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes("Approved")) return "green";
    if (status.includes("Rejected")) return "red";
    if (status.includes("Menunggu")) return "orange";
    return "gray";
  };

  const canApproveThis = (req: Requisition) => {
    if (!user) return false;
    const currentStatus = req.approval_status;
    const userRole = user.role?.name;
    const userName = user.name;

    if (currentStatus === "Menunggu Approval Manager") {
      return userRole === "Manager" && req.manager === userName;
    }
    if (currentStatus === "Menunggu Approval Division Head") {
      return userRole === "Division Head" && req.division === userName;
    }
    if (currentStatus === "Menunggu Approval Director") {
      return userRole === "Director" && req.director === userName;
    }
    return false;
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
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            On Progress FPTK
          </Text>
          {canCreateEdit && (
            <button
              type="button"
              onClick={() => navigate("/fptk/create")}
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#2563eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#3b82f6")
              }
            >
              <FiPlus size={15} /> Create New
            </button>
          )}
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
                placeholder="Search by requester name..."
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
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </Box>

            <select
              value={filterState.status || ""}
              onChange={handleStatusChange}
              style={{
                maxWidth: "280px",
                width: "100%",
                padding: "8px 12px",
                fontSize: "14px",
                color: "#1a202c",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">All status (except Approved)</option>
              <option value="Menunggu Approval Manager">
                Waiting for Manager Approval
              </option>
              <option value="Menunggu Approval Division Head">
                Waiting for Division Head Approval
              </option>
              <option value="Menunggu Approval Director">
                Waiting for Director Approval
              </option>
              <option value="Rejected">Rejected</option>
            </select>
          </HStack>

          {/* Table */}
          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500" fontSize="14px">
                Loading...
              </Text>
            </Flex>
          ) : requisitions.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                No data found
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
                      "Status",
                      "Actions",
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
                  {requisitions.map((req, index) => (
                    <tr
                      key={req.no_req}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/fptk/${req.no_req}`)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
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

                      <td style={{ padding: "12px 14px" }}>
                        <Badge
                          colorPalette={getStatusColor(req.approval_status)}
                        >
                          {req.approval_status}
                        </Badge>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <HStack gap={1}>
                          {canCreateEdit && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(req.no_req);
                              }}
                              style={{
                                width: "30px",
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#ef4444",
                                backgroundColor: "#fff5f5",
                                border: "1px solid #fecaca",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#fee2e2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#fff5f5")
                              }
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}

                          {canApprove && canApproveThis(req) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/fptk/${req.no_req}/review`);
                              }}
                              style={{
                                width: "30px",
                                height: "30px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                color: "#0891b2",
                                backgroundColor: "#ecfeff",
                                border: "1px solid #a5f3fc",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#cffafe")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#ecfeff")
                              }
                              title="Review for Approval"
                            >
                              <FiCheck size={14} />
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
              Showing {requisitions.length} of {pagination.total} entries
            </Text>

            <HStack gap={2}>
              <button
                type="button"
                disabled={filterState.page === 1}
                onClick={() =>
                  setFilterState((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                style={{
                  padding: "6px 14px",
                  fontSize: "13px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  backgroundColor:
                    filterState.page === 1 ? "#f8fafc" : "#ffffff",
                  color: filterState.page === 1 ? "#94a3b8" : "#475569",
                  cursor: filterState.page === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>

              <Text fontSize="13px" color="gray.600" px={2}>
                Page {pagination.current_page} of {pagination.last_page}
              </Text>

              <button
                type="button"
                disabled={filterState.page >= pagination.last_page}
                onClick={() =>
                  setFilterState((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                style={{
                  padding: "6px 14px",
                  fontSize: "13px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  backgroundColor:
                    filterState.page >= pagination.last_page
                      ? "#f8fafc"
                      : "#ffffff",
                  color:
                    filterState.page >= pagination.last_page
                      ? "#94a3b8"
                      : "#475569",
                  cursor:
                    filterState.page >= pagination.last_page
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Next
              </button>
            </HStack>
          </Flex>
        </Box>
      </Box>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Requisition?"
        message={
          <>
            You are about to delete requisition{" "}
            <Text as="span" fontWeight="600" color="gray.700">
              {deleteTarget}
            </Text>
            . This action cannot be undone.
          </>
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="#ef4444"
        icon={<FiTrashIcon size={22} color="#ef4444" />}
      />
    </MainLayout>
  );
};

export default FptkList;
