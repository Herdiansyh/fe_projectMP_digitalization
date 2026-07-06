import React, { useState, useEffect } from "react";
import { Box, Text, Flex, Grid } from "@chakra-ui/react";
import { FiUser, FiX } from "react-icons/fi";
import userService from "../../services/userService";
import type { ApproverList } from "../../types/fptk";
import type {
  UserItem,
  UserFormData,
  Department,
  Section,
  RoleLevel,
} from "../../types/user";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MasterData {
  departments: Department[];
  sections: Section[];
  roleLevels: RoleLevel[];
  approvers: ApproverList;
}

export interface UserFormModalProps {
  user?: UserItem | null;
  /** Data master dikirim dari parent agar tidak di-fetch ulang setiap buka modal */
  masterData: MasterData | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "8px 12px",
  fontSize: "14px",
  color: "#1a202c",
  backgroundColor: "#ffffff",
  border: `1px solid ${hasError ? "#fc8181" : "#e2e8f0"}`,
  borderRadius: "8px",
  outline: "none",
});

const selectStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "8px 12px",
  fontSize: "14px",
  color: "#1a202c",
  backgroundColor: "#ffffff",
  border: `1px solid ${hasError ? "#fc8181" : "#e2e8f0"}`,
  borderRadius: "8px",
  outline: "none",
  cursor: "pointer",
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldLabel: React.FC<{ label: string; required?: boolean }> = ({
  label,
  required,
}) => (
  <Text fontSize="13px" fontWeight="500" color="gray.700" mb={1}>
    {label}{" "}
    {required && (
      <Text as="span" color="red.400">
        *
      </Text>
    )}
  </Text>
);

const FieldError: React.FC<{ errors?: string[] }> = ({ errors }) =>
  errors ? (
    <Text fontSize="12px" color="red.500" mt={1}>
      {errors[0]}
    </Text>
  ) : null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_APPROVERS: ApproverList = {
  managers: [],
  division_heads: [],
  directors: [],
};

const buildInitialForm = (user?: UserItem | null): UserFormData => ({
  npk: user?.npk ?? "",
  name: user?.name ?? "",
  username: user?.username ?? "",
  email: user?.email ?? "",
  password: "",
  password_confirmation: "",
  department_id: user?.department?.id ?? "",
  section_id: user?.section?.id ?? "",
  role_level_id: user?.role_level?.id ?? "",
  approver_manager_id: user?.approver_manager?.id ?? "",
  approver_division_id: user?.approver_division?.id ?? "",
  approver_director_id: user?.approver_director?.id ?? "",
  is_admin: user?.is_admin ?? false,
  can_view_manpower: user?.can_view_manpower ?? false,
});

// ─── Component ────────────────────────────────────────────────────────────────

const UserFormModal: React.FC<UserFormModalProps> = ({
  user,
  masterData,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!user;

  // Form langsung diisi dari `user` — tidak perlu efek terpisah
  const [form, setForm] = useState<UserFormData>(() => buildInitialForm(user));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Reset form setiap kali modal dibuka dengan user berbeda
  useEffect(() => {
    setForm(buildInitialForm(user));
    setErrors({});
  }, [user]);

  // Destrukturisasi master data dari props — tidak ada fetch di dalam modal
  const departments = masterData?.departments ?? [];
  const sections = masterData?.sections ?? [];
  const roleLevels = masterData?.roleLevels ?? [];
  const approvers = masterData?.approvers ?? EMPTY_APPROVERS;

  // Role level yang sedang dipilih di form saat ini
  const selectedRoleLevel = roleLevels.find(
    (r) => String(r.id) === String(form.role_level_id),
  );
  // True jika role level yang dipilih adalah "Admin" — checkbox "Make Admin"
  // akan dikunci (disabled) dan otomatis tercentang, karena status admin
  // seharusnya mengikuti role level, bukan diatur manual.
  const isAdminRole = selectedRoleLevel?.name?.toLowerCase() === "admin";

  const set = (key: keyof UserFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Sinkronkan is_admin setiap kali role level berubah menjadi Admin
  useEffect(() => {
    if (isAdminRole && !form.is_admin) {
      set("is_admin", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminRole]);

  const handleSubmit = async () => {
    setErrors({});
    try {
      setLoading(true);

      const payload: UserFormData = {
        ...form,
        department_id: form.department_id || null,
        section_id: form.section_id || null,
        role_level_id: form.role_level_id || null,
        approver_manager_id: form.approver_manager_id || null,
        approver_division_id: form.approver_division_id || null,
        approver_director_id: form.approver_director_id || null,
      };

      if (isEdit) {
        delete payload.password;
        delete payload.password_confirmation;
        await userService.updateUser(user.id, payload);
      } else {
        await userService.createUser(payload);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as {
        response?: {
          data?: { errors?: Record<string, string[]>; message?: string };
        };
      };
      if (e.response?.data?.errors) {
        setErrors(e.response.data.errors);
      } else {
        alert(e.response?.data?.message ?? "An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={200}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Backdrop */}
      <Box
        position="absolute"
        inset={0}
        bg="blackAlpha.500"
        backdropFilter="blur(2px)"
        onClick={onClose}
      />

      {/* Modal */}
      <Box
        position="relative"
        bg="white"
        borderRadius="12px"
        shadow="xl"
        w="full"
        maxW="620px"
        mx={4}
        maxH="90vh"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Flex
          align="center"
          justify="space-between"
          px={6}
          py={4}
          borderBottom="1px solid"
          borderColor="gray.100"
          flexShrink={0}
        >
          <Flex align="center" gap={2}>
            <Box color="blue.500">
              <FiUser size={18} />
            </Box>
            <Text fontWeight="600" fontSize="15px" color="gray.800">
              {isEdit ? "Edit User" : "Add New User"}
            </Text>
          </Flex>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
            }}
          >
            <FiX size={16} />
          </button>
        </Flex>

        {/* Body */}
        <Box px={6} py={5} overflowY="auto" flex={1}>
          <Grid templateColumns="1fr 1fr" gap={4}>
            {/* NPK */}
            <Box>
              <FieldLabel label="NPK" required />
              <input
                placeholder="Example: 12345"
                value={form.npk}
                onChange={(e) => set("npk", e.target.value)}
                style={inputStyle(!!errors.npk)}
              />
              <FieldError errors={errors.npk} />
            </Box>

            {/* Name */}
            <Box>
              <FieldLabel label="Full Name" required />
              <input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                style={inputStyle(!!errors.name)}
              />
              <FieldError errors={errors.name} />
            </Box>

            {/* Username */}
            <Box>
              <FieldLabel label="Username" required />
              <input
                placeholder="Login username"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                style={inputStyle(!!errors.username)}
              />
              <FieldError errors={errors.username} />
            </Box>

            {/* Email */}
            <Box>
              <FieldLabel label="Email" required />
              <input
                type="email"
                placeholder="email@company.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                style={inputStyle(!!errors.email)}
              />
              <FieldError errors={errors.email} />
            </Box>

            {/* Password — hanya saat create */}
            {!isEdit && (
              <>
                <Box>
                  <FieldLabel label="Password" required />
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={form.password ?? ""}
                    onChange={(e) => set("password", e.target.value)}
                    style={inputStyle(!!errors.password)}
                  />
                  <FieldError errors={errors.password} />
                </Box>

                <Box>
                  <FieldLabel label="Confirm Password" required />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={form.password_confirmation ?? ""}
                    onChange={(e) =>
                      set("password_confirmation", e.target.value)
                    }
                    style={inputStyle(!!errors.password_confirmation)}
                  />
                  <FieldError errors={errors.password_confirmation} />
                </Box>
              </>
            )}

            {/* Department */}
            <Box>
              <FieldLabel label="Department" />
              <select
                value={form.department_id ?? ""}
                onChange={(e) => set("department_id", e.target.value)}
                style={selectStyle(!!errors.department_id)}
              >
                <option value="">-- Select Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <FieldError errors={errors.department_id} />
            </Box>

            {/* Section */}
            <Box>
              <FieldLabel label="Section" />
              <select
                value={form.section_id ?? ""}
                onChange={(e) => set("section_id", e.target.value)}
                style={selectStyle(!!errors.section_id)}
              >
                <option value="">-- Select Section --</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <FieldError errors={errors.section_id} />
            </Box>

            {/* Role Level */}
            <Box>
              <FieldLabel label="Role Level" />
              <select
                value={form.role_level_id ?? ""}
                onChange={(e) => set("role_level_id", e.target.value)}
                style={selectStyle(!!errors.role_level_id)}
              >
                <option value="">-- Select Role Level --</option>
                {roleLevels.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <FieldError errors={errors.role_level_id} />
            </Box>

            {/* Approver Manager */}
            <Box>
              <FieldLabel label="Approver Manager" />
              <select
                value={form.approver_manager_id ?? ""}
                onChange={(e) => set("approver_manager_id", e.target.value)}
                style={selectStyle(!!errors.approver_manager_id)}
              >
                <option value="">-- Select Approver Manager --</option>
                {approvers.managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <FieldError errors={errors.approver_manager_id} />
            </Box>

            {/* Approver Division */}
            <Box>
              <FieldLabel label="Approver Division Head" />
              <select
                value={form.approver_division_id ?? ""}
                onChange={(e) => set("approver_division_id", e.target.value)}
                style={selectStyle(!!errors.approver_division_id)}
              >
                <option value="">-- Select Approver Div Head --</option>
                {approvers.division_heads.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <FieldError errors={errors.approver_division_id} />
            </Box>

            {/* Approver Director */}
            <Box>
              <FieldLabel label="Approver Director" />
              <select
                value={form.approver_director_id ?? ""}
                onChange={(e) => set("approver_director_id", e.target.value)}
                style={selectStyle(!!errors.approver_director_id)}
              >
                <option value="">-- Select Approver Director --</option>
                {approvers.directors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <FieldError errors={errors.approver_director_id} />
            </Box>

            {/* Is Admin */}
            <Box gridColumn="1 / -1">
              <Flex align="center" gap={3} mt={1}>
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={form.is_admin ?? false}
                  disabled={isAdminRole}
                  onChange={(e) => set("is_admin", e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: isAdminRole ? "not-allowed" : "pointer",
                    accentColor: "#3b82f6",
                    opacity: isAdminRole ? 0.6 : 1,
                  }}
                />
                <Box>
                  <Text fontSize="13px" fontWeight="500" color="gray.700">
                    Make Admin
                  </Text>
                  <Text fontSize="12px" color="gray.400">
                    {isAdminRole
                      ? "Automatically enabled because role level is Admin"
                      : "Admin can access User Management module"}
                  </Text>
                </Box>
              </Flex>
            </Box>
            {/* Can View Manpower */}
            <Box gridColumn="1 / -1">
              <Flex align="center" gap={3} mt={1}>
                <input
                  type="checkbox"
                  id="can_view_manpower"
                  checked={form.can_view_manpower ?? false}
                  onChange={(e) => set("can_view_manpower", e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                    accentColor: "#3b82f6",
                  }}
                />
                <Box>
                  <Text fontSize="13px" fontWeight="500" color="gray.700">
                    Can View Manpower Data
                  </Text>
                  <Text fontSize="12px" color="gray.400">
                    Allow access to Manpower Management & Pemagangan modules
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Grid>
        </Box>

        {/* Footer */}
        <Flex
          gap={3}
          px={6}
          py={4}
          borderTop="1px solid"
          borderColor="gray.100"
          justify="flex-end"
          flexShrink={0}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: "500",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              color: "#475569",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: "500",
              borderRadius: "8px",
              border: "none",
              backgroundColor: loading ? "#93c5fd" : "#3b82f6",
              color: "#ffffff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Add User"}
          </button>
        </Flex>
      </Box>
    </Box>
  );
};

export default UserFormModal;
