import React, { useEffect, useState } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import MainLayout from "../../components/layout/MainLayout";
import axiosInstance from "../../api/axios";
import { toaster } from "../../components/ui/toaster";

interface Permission {
  id: number;
  key: string;
  group: string;
  label: string;
}

interface RoleOption {
  id: number;
  name: string;
}

type MatrixData = Record<number, number[]>; // role_level_id -> permission_id[]

const PermissionMatrixPage: React.FC = () => {
  const [permissionsByGroup, setPermissionsByGroup] = useState<
    Record<string, Permission[]>
  >({});
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [matrix, setMatrix] = useState<MatrixData>({});
  const [loading, setLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);
  const [dirtyRoles, setDirtyRoles] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/permission-matrix");
        const data = res.data.data;
        setPermissionsByGroup(data.permissions);
        setRoles(data.roles);

        // Normalisasi matrix jadi Record<number, number[]>
        const normalized: MatrixData = {};
        Object.entries(data.matrix).forEach(([roleId, permIds]) => {
          normalized[Number(roleId)] = permIds as number[];
        });
        setMatrix(normalized);
      } catch {
        toaster.create({
          title: "Failed to load permission matrix",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const isChecked = (roleId: number, permissionId: number) =>
    matrix[roleId]?.includes(permissionId) ?? false;

  const toggle = (roleId: number, permissionId: number) => {
    setMatrix((prev) => {
      const current = prev[roleId] ?? [];
      const next = current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId];
      return { ...prev, [roleId]: next };
    });
    setDirtyRoles((prev) => new Set(prev).add(roleId));
  };

  const saveRole = async (roleId: number) => {
    setSavingRoleId(roleId);
    try {
      await axiosInstance.put("/permission-matrix", {
        role_level_id: roleId,
        permission_ids: matrix[roleId] ?? [],
      });
      toaster.create({ title: "Permission updated", type: "success" });
      setDirtyRoles((prev) => {
        const next = new Set(prev);
        next.delete(roleId);
        return next;
      });
    } catch {
      toaster.create({ title: "Failed to save changes", type: "error" });
    } finally {
      setSavingRoleId(null);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box p={6}>
          <Text color="gray.500" fontSize="14px">
            Loading permission matrix...
          </Text>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box p={6}>
        <Text fontSize="2xl" fontWeight="bold" color="brand.800" mb={1}>
          Permission Matrix
        </Text>
        <Text fontSize="13px" color="gray.500" mb={6}>
          Atur hak akses tiap role. Role Admin selalu memiliki akses penuh dan
          tidak perlu diatur di sini.
        </Text>

        <Box
          bg="white"
          rounded="xl"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.100"
          overflow="hidden"
        >
          <Box overflowX="auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #e2e8f0",
                      position: "sticky",
                      left: 0,
                      backgroundColor: "#f8fafc",
                      minWidth: "260px",
                    }}
                  >
                    Permission
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#64748b",
                        borderBottom: "1px solid #e2e8f0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionsByGroup).map(([group, perms]) => (
                  <React.Fragment key={group}>
                    <tr>
                      <td
                        colSpan={roles.length + 1}
                        style={{
                          padding: "8px 16px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#1A5EA8",
                          backgroundColor: "#eaf1f9",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {group}
                      </td>
                    </tr>
                    {perms.map((perm) => (
                      <tr
                        key={perm.id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td
                          style={{
                            padding: "10px 16px",
                            fontSize: "13px",
                            color: "#1e293b",
                            position: "sticky",
                            left: 0,
                            backgroundColor: "#ffffff",
                          }}
                        >
                          {perm.label}
                          <Text
                            as="span"
                            fontSize="11px"
                            color="gray.400"
                            ml={2}
                          >
                            {perm.key}
                          </Text>
                        </td>
                        {roles.map((role) => (
                          <td
                            key={role.id}
                            style={{
                              padding: "10px 16px",
                              textAlign: "center",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked(role.id, perm.id)}
                              onChange={() => toggle(role.id, perm.id)}
                              style={{
                                width: "16px",
                                height: "16px",
                                accentColor: "#1A5EA8",
                                cursor: "pointer",
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>

        <Flex mt={6} wrap="wrap" gap={3}>
          {roles
            .filter((role) => dirtyRoles.has(role.id))
            .map((role) => (
              <HStack
                key={role.id}
                bg="#fffbeb"
                border="1px solid #fde68a"
                borderRadius="8px"
                px={3}
                py={2}
                gap={3}
              >
                <Text fontSize="13px" color="#92400e">
                  Unsaved changes for <b>{role.name}</b>
                </Text>
                <button
                  type="button"
                  disabled={savingRoleId === role.id}
                  onClick={() => saveRole(role.id)}
                  style={{
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    color: "#fff",
                    backgroundColor:
                      savingRoleId === role.id ? "#7fb3d3" : "#1A5EA8",
                    border: "none",
                    cursor:
                      savingRoleId === role.id ? "not-allowed" : "pointer",
                  }}
                >
                  {savingRoleId === role.id ? "Saving..." : "Save"}
                </button>
              </HStack>
            ))}
        </Flex>
      </Box>
    </MainLayout>
  );
};

export default PermissionMatrixPage;
