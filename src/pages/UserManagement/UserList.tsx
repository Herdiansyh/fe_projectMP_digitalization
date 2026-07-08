import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, Badge, Flex, HStack } from "@chakra-ui/react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiLock,
  FiShield,
} from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import userService from "../../services/userService";
import fptkService from "../../services/fptkService";
import type { UserItem, UserListParams } from "../../types/user";
import type { MasterData } from "./UserFormModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import UserFormModal from "./UserFormModal";
import ResetPasswordModal from "./ResetPasswordModal";
import UserDetailModal from "./UserDetailModal";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserListParams>({ search: "" });
  const [searchInput, setSearchInput] = useState("");

  // ─── Master data di-fetch SEKALI di level ini ──────────────────────────────
  const [masterData, setMasterData] = useState<MasterData | null>(null);

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [res, appRes] = await Promise.all([
          userService.getMasterData(),
          fptkService.getApprovers(),
        ]);
        setMasterData({
          departments: res.data.departments ?? [],
          sections: res.data.sections ?? [],
          roleLevels: res.data.role_levels ?? [],
          areas: res.data.areas ?? [],
          approvers: appRes.data,
        });
      } catch {
        // Dropdown kosong tapi tidak crash
      }
    };
    void loadMaster();
  }, []);

  // ─── Modal states ──────────────────────────────────────────────────────────
  const [formModal, setFormModal] = useState<{
    open: boolean;
    user: UserItem | null;
  }>({ open: false, user: null });

  const [resetModal, setResetModal] = useState<{
    open: boolean;
    user: UserItem | null;
  }>({ open: false, user: null });

  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    user: UserItem | null;
  }>({ open: false, user: null });

  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ─── Fetch users ───────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (params: UserListParams) => {
    try {
      setLoading(true);
      const response = await userService.getUsers(params);
      setUsers(response.data.data);
      const resData = response.data as any;
      setPagination({
        current_page: resData.meta?.current_page ?? resData.current_page ?? 1,
        last_page: resData.meta?.last_page ?? resData.last_page ?? 1,
        per_page: resData.meta?.per_page ?? resData.per_page ?? 10,
        total: resData.meta?.total ?? resData.total ?? 0,
      });
    } catch {
      alert("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput) return prev;
        setPage(1);
        return { ...prev, search: searchInput };
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Fetch on page / filter change
  useEffect(() => {
    void fetchUsers({ page, per_page: 10, ...filters });
  }, [page, filters, fetchUsers]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userService.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      showSuccess(`User ${deleteTarget.name} deleted successfully.`);
      void fetchUsers({ page, per_page: 10, ...filters });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  const iconBtn = (
    color: string,
    bg: string,
    hoverBg: string,
    border: string,
    onClick: (e: React.MouseEvent) => void,
    icon: React.ReactNode,
    title?: string,
  ) => (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      style={{
        width: "30px",
        height: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px",
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bg)}
    >
      {icon}
    </button>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <Box>
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
              User Management
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              Manage system user accounts
            </Text>
          </Box>
          <button
            type="button"
            onClick={() => setFormModal({ open: true, user: null })}
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
            <FiPlus size={15} /> Add User
          </button>
        </Flex>

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          {/* Filter bar */}
          <HStack mb={5} gap={3} flexWrap="wrap">
            <Box position="relative" maxW="280px" w="full">
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
                placeholder="Search name, email, NPK..."
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

            <select
              value={
                filters.is_admin === undefined ? "" : String(filters.is_admin)
              }
              onChange={(e) => {
                setPage(1);
                const val = e.target.value;
                setFilters((prev) => ({
                  ...prev,
                  is_admin: val === "" ? undefined : val === "true",
                }));
              }}
              style={{
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
              <option value="">All Roles</option>
              <option value="true">Admin</option>
              <option value="false">Non-Admin</option>
            </select>
          </HStack>

          {/* Table */}
          {loading ? (
            <Flex justify="center" py={10}>
              <Text color="gray.500" fontSize="14px">
                Loading...
              </Text>
            </Flex>
          ) : users.length === 0 ? (
            <Flex justify="center" py={10}>
              <Text color="gray.400" fontSize="14px">
                No user data
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
                      "Email",
                      "Department",
                      "Section", // ← ditambahkan
                      "Role Level",
                      "Admin",
                      "MP Access",
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
                  {users.map((u, index) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                      }}
                      onClick={() => setDetailModal({ open: true, user: u })}
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
                          color: "#475569",
                          fontFamily: "monospace",
                        }}
                      >
                        {u.npk}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <Text fontSize="13px" fontWeight="500" color="gray.800">
                          {u.name}
                        </Text>
                        <Text fontSize="11px" color="gray.400">
                          {u.username}
                        </Text>
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {u.email}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {u.department?.name ?? "-"}
                      </td>
                      {/* Section — ditambahkan */}
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {u.section?.name ?? "-"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {u.role_level?.name ?? "-"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {u.is_admin ? (
                          <Badge
                            colorPalette="blue"
                            display="inline-flex"
                            alignItems="center"
                            gap={1}
                          >
                            <FiShield size={10} /> Admin
                          </Badge>
                        ) : (
                          <Badge colorPalette="gray">User</Badge>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {u.can_view_manpower ? (
                          <Badge colorPalette="green">Yes</Badge>
                        ) : (
                          <Badge colorPalette="gray">No</Badge>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <HStack gap={1}>
                          {iconBtn(
                            "#16a34a",
                            "#f0fdf4",
                            "#dcfce7",
                            "#bbf7d0",
                            () => setFormModal({ open: true, user: u }),
                            <FiEdit size={14} />,
                            "Edit User",
                          )}
                          {iconBtn(
                            "#f97316",
                            "#fff7ed",
                            "#ffedd5",
                            "#fed7aa",
                            () => setResetModal({ open: true, user: u }),
                            <FiLock size={14} />,
                            "Reset Password",
                          )}
                          {iconBtn(
                            "#ef4444",
                            "#fff5f5",
                            "#fee2e2",
                            "#fecaca",
                            () => setDeleteTarget(u),
                            <FiTrash2 size={14} />,
                            "Delete User",
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
              Showing {users.length} of {pagination.total} users
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

      {/* ── Modals ── */}
      {formModal.open && (
        <UserFormModal
          user={formModal.user}
          masterData={masterData}
          onClose={() => setFormModal({ open: false, user: null })}
          onSuccess={() => {
            showSuccess(
              formModal.user
                ? "User updated successfully."
                : "User added successfully.",
            );
            void fetchUsers({ page, per_page: 10, ...filters });
          }}
        />
      )}

      {resetModal.open && resetModal.user && (
        <ResetPasswordModal
          user={resetModal.user}
          onClose={() => setResetModal({ open: false, user: null })}
          onSuccess={() =>
            showSuccess(
              `Password for ${resetModal.user!.name} reset successfully.`,
            )
          }
        />
      )}

      {detailModal.open && detailModal.user && (
        <UserDetailModal
          user={detailModal.user}
          onClose={() => setDetailModal({ open: false, user: null })}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete User?"
        message={
          <>
            You are about to delete user{" "}
            <Text as="span" fontWeight="600" color="gray.700">
              {deleteTarget?.name}
            </Text>{" "}
            ({deleteTarget?.npk}). This action cannot be undone.
          </>
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="#ef4444"
        icon={<FiTrash2 size={22} color="#ef4444" />}
      />
    </MainLayout>
  );
};

export default UserList;
