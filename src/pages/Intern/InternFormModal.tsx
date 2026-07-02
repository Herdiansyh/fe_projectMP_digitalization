import React, { useState, useEffect } from "react";
import { Box, Text, Flex, Grid, Stack } from "@chakra-ui/react";
import { FiX, FiSave } from "react-icons/fi";
import type {
  CreateInternInput,
  Intern,
  UpdateInternInput,
} from "../../types/intern";
import type { MasterData } from "../UserManagement/UserFormModal";
import internService from "../../services/internService";
import { toaster } from "../../components/ui/toaster";

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: CreateInternInput = {
  npk: "",
  name: "",
  gender: "male",
  department_id: null,
  section_id: null,
  role_level: "",
  jabatan: "",
  area: "",
  line: "",
  station: "",
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

interface InternFormModalProps {
  isOpen: boolean;
  editTarget: Intern | null;
  masterData: MasterData | null;
  onClose: () => void;
  onSaved: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const InternFormModal: React.FC<InternFormModalProps> = ({
  isOpen,
  editTarget,
  masterData,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState<CreateInternInput>(EMPTY_FORM);
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
        role_level: editTarget.role_level ?? "",
        jabatan: editTarget.jabatan ?? "",
        area: editTarget.area ?? "",
        line: editTarget.line ?? "",
        station: editTarget.station ?? "",
        start_contract: editTarget.start_contract,
        end_contract: editTarget.end_contract ?? null,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editTarget, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof CreateInternInput, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...form };
      if (editTarget) {
        await internService.updateIntern(
          editTarget.id,
          payload as UpdateInternInput,
        );
        toaster.create({
          title: "Intern updated successfully",
          type: "success",
        });
      } else {
        await internService.createIntern(payload);
        toaster.create({
          title: "Intern added successfully",
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
              {editTarget ? "Edit Intern" : "Add Intern"}
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
            <form id="intern-form" onSubmit={handleSubmit}>
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
                      placeholder="Example: INT001"
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

                {/* Gender */}
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
                    <label style={labelStyle}>Position</label>
                    <input
                      style={inputStyle}
                      value={form.jabatan ?? ""}
                      onChange={(e) => handleChange("jabatan", e.target.value)}
                      placeholder="Specific position name"
                    />
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

                {/* Role Level & Area */}
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <label style={labelStyle}>Role Level</label>
                    <input
                      style={inputStyle}
                      value={form.role_level ?? ""}
                      onChange={(e) =>
                        handleChange("role_level", e.target.value)
                      }
                      placeholder="Example: Junior, Senior, Staff (optional)"
                    />
                  </Box>
                  <Box>
                    <label style={labelStyle}>Area</label>
                    <input
                      style={inputStyle}
                      value={form.area ?? ""}
                      onChange={(e) => handleChange("area", e.target.value)}
                      placeholder="Example: Assembly"
                    />
                  </Box>
                </Grid>

                {/* Line & Station */}
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <label style={labelStyle}>Line</label>
                    <input
                      style={inputStyle}
                      value={form.line ?? ""}
                      onChange={(e) => handleChange("line", e.target.value)}
                      placeholder="Example: Line A"
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

                {/* Start & End Contract */}
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <label style={labelStyle}>Internship Start Date *</label>
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
                  <Box>
                    <label style={labelStyle}>Internship End Date *</label>
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
              form="intern-form"
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
                  : "Add Intern"}
            </button>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default InternFormModal;
