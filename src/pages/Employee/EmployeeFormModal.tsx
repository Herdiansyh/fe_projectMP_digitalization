import React, { useState, useEffect } from "react";
import { Box, Text, Flex, Grid, Stack } from "@chakra-ui/react";
import { FiX, FiSave } from "react-icons/fi";
import type {
  CreateEmployeeInput,
  Employee,
  UpdateEmployeeInput,
} from "../../types/employee";
import type { MasterData } from "../UserManagement/UserFormModal";
import employeeService from "../../services/employeeService";
import { toaster } from "../../components/ui/toaster";

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: CreateEmployeeInput = {
  npk: "",
  name: "",
  gender: "male",
  department_id: null,
  section_id: null,
  role_level_id: null,
  jabatan: "",
  area: "",
  station: "",
  employment_type: "permanent",
  status: "active",
  start_contract: "",
  end_contract: null,
};

// ── Styles ────────────────────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#f9fafb",
  fontSize: "14px",
  color: "#1a202c",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#f9fafb",
  fontSize: "14px",
  color: "#1a202c",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "4px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface EmployeeFormModalProps {
  isOpen: boolean;
  editTarget: Employee | null;
  masterData: MasterData | null;
  onClose: () => void;
  onSaved: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  editTarget,
  masterData,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState<CreateEmployeeInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (editTarget) {
      setForm({
        npk: editTarget.npk,
        name: editTarget.name,
        gender: editTarget.gender,
        department_id: editTarget.department_id,
        section_id: editTarget.section_id,
        role_level_id: editTarget.role_level_id,
        jabatan: editTarget.jabatan ?? "",
        area: editTarget.area ?? "",
        station: editTarget.station ?? "",
        employment_type: editTarget.employment_type,
        status: editTarget.status,
        start_contract: editTarget.start_contract,
        end_contract: editTarget.end_contract ?? null,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editTarget, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof CreateEmployeeInput, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...form,
        end_contract:
          form.employment_type === "permanent" ? null : form.end_contract,
      };
      if (editTarget) {
        await employeeService.updateEmployee(
          editTarget.id,
          payload as UpdateEmployeeInput,
        );
        toaster.create({
          title: "Employee updated successfully",
          type: "success",
        });
      } else {
        await employeeService.createEmployee(payload);
        toaster.create({
          title: "Employee added successfully",
          type: "success",
        });
      }
      onSaved();
      onClose();
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (
          error as {
            response?: { data?: { errors?: Record<string, string[]> } };
          }
        ).response?.data?.errors
      ) {
        setErrors(
          (
            error as {
              response: { data: { errors: Record<string, string[]> } };
            }
          ).response.data.errors,
        );
      } else {
        toaster.create({ title: "An error occurred", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const errorText = (field: string) =>
    errors[field]?.[0] ? (
      <Text fontSize="12px" color="red.500" mt="2px">
        {errors[field][0]}
      </Text>
    ) : null;

  return (
    <>
      <Box
        position="fixed"
        inset={0}
        zIndex={400}
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={!loading ? onClose : undefined}
      />
      <Box
        position="fixed"
        top="50%"
        left="50%"
        zIndex={500}
        style={{
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "680px",
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
          {/* Header */}
          <Flex
            px={6}
            py={4}
            justify="space-between"
            align="center"
            borderBottom="1px solid #e2e8f0"
          >
            <Text fontSize="16px" fontWeight="700" color="gray.800">
              {editTarget ? "Edit Employee" : "Add Employee"}
            </Text>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                cursor: "pointer",
              }}
            >
              <FiX size={16} color="#64748b" />
            </button>
          </Flex>

          {/* Body */}
          <Box px={6} py={5} style={{ overflowY: "auto", flex: 1 }}>
            <form id="employee-form" onSubmit={handleSubmit}>
              <Stack gap={5}>
                {/* NPK & Nama */}
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <label style={labelStyle}>NPK *</label>
                    <input
                      style={inputStyle}
                      required
                      value={form.npk}
                      onChange={(e) => handleChange("npk", e.target.value)}
                      placeholder="Example: AVI001"
                    />
                    {errorText("npk")}
                  </Box>
                  <Box>
                    <label style={labelStyle}>Name *</label>
                    <input
                      style={inputStyle}
                      required
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Full name"
                    />
                    {errorText("name")}
                  </Box>
                </Grid>

                {/* Gender & Status */}
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <label style={labelStyle}>Gender *</label>
                    <select
                      style={selectStyle}
                      value={form.gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {errorText("gender")}
                  </Box>
                  <Box>
                    <label style={labelStyle}>Status *</label>
                    <select
                      style={selectStyle}
                      value={form.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="nonactive">Non-Active</option>
                      <option value="resigned">Resigned</option>
                    </select>
                    {errorText("status")}
                  </Box>
                </Grid>

                {/* Department & Section */}
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <label style={labelStyle}>Department</label>
                    <select
                      style={selectStyle}
                      value={form.department_id ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "department_id",
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    >
                      <option value="">Select Department</option>
                      {masterData?.departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <Box>
                    <label style={labelStyle}>Section</label>
                    <select
                      style={selectStyle}
                      value={form.section_id ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "section_id",
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    >
                      <option value="">Select Section</option>
                      {masterData?.sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </Box>
                </Grid>

                {/* Role Level & Jabatan */}
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <label style={labelStyle}>Role Level</label>
                    <select
                      style={selectStyle}
                      value={form.role_level_id ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "role_level_id",
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                    >
                      <option value="">Select Role Level</option>
                      {masterData?.role_levels.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <Box>
                    <label style={labelStyle}>Position</label>
                    <input
                      style={inputStyle}
                      value={form.jabatan ?? ""}
                      onChange={(e) => handleChange("jabatan", e.target.value)}
                      placeholder="Specific position name"
                    />
                  </Box>
                </Grid>

                {/* Area & Station */}
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <label style={labelStyle}>Area</label>
                    <input
                      style={inputStyle}
                      value={form.area ?? ""}
                      onChange={(e) => handleChange("area", e.target.value)}
                      placeholder="Example: Assembly"
                    />
                  </Box>
                  <Box>
                    <label style={labelStyle}>Station</label>
                    <input
                      style={inputStyle}
                      value={form.station ?? ""}
                      onChange={(e) => handleChange("station", e.target.value)}
                      placeholder="Example: ST-01"
                    />
                  </Box>
                </Grid>

                {/* Employment Type */}
                <Box>
                  <label style={labelStyle}>Employee Type *</label>
                  <select
                    style={selectStyle}
                    value={form.employment_type}
                    onChange={(e) => {
                      handleChange("employment_type", e.target.value);
                      if (e.target.value === "permanent")
                        handleChange("end_contract", null);
                    }}
                  >
                    <option value="permanent">Permanent</option>
                    <option value="contract">Contract</option>
                    <option value="apprentice">Apprentice</option>
                  </select>
                  {errorText("employment_type")}
                </Box>

                {/* Start & End Contract */}
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <label style={labelStyle}>Contract Start Date *</label>
                    <input
                      type="date"
                      style={inputStyle}
                      required
                      value={form.start_contract}
                      onChange={(e) =>
                        handleChange("start_contract", e.target.value)
                      }
                    />
                    {errorText("start_contract")}
                  </Box>
                  {form.employment_type !== "permanent" && (
                    <Box>
                      <label style={labelStyle}>Contract End Date *</label>
                      <input
                        type="date"
                        style={inputStyle}
                        required
                        value={form.end_contract ?? ""}
                        onChange={(e) =>
                          handleChange("end_contract", e.target.value || null)
                        }
                      />
                      {errorText("end_contract")}
                    </Box>
                  )}
                </Grid>
              </Stack>
            </form>
          </Box>

          {/* Footer */}
          <Box h="1px" bg="gray.100" />
          <Flex px={6} py={4} justify="flex-end" gap={3}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                borderRadius: "8px",
                color: "#4a5568",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              form="employee-form"
              type="submit"
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                fontSize: "14px",
                fontWeight: "600",
                borderRadius: "8px",
                color: loading ? "#94a3b8" : "#ffffff",
                backgroundColor: loading ? "#f1f5f9" : "#1A5EA8",
                border: `1px solid ${loading ? "#e2e8f0" : "#1A5EA8"}`,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <FiSave size={14} />
              {loading
                ? "Saving..."
                : editTarget
                  ? "Save Changes"
                  : "Add Employee"}
            </button>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default EmployeeFormModal;
