import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FiAlertCircle, FiInfo, FiTrash2 } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import evaluationService from "../../services/evaluationService";
import employeeService from "../../services/employeeService";
import internService from "../../services/internService";
import type {
  Evaluation,
  EvaluationGroup,
  EvaluationRecommendationPayload,
  EvaluationScorePayload,
} from "../../types/evaluation";
import type { Employee } from "../../types/employee";
import type { Intern } from "../../types/intern";
import ScoringRubricTable from "./ScoringRubricTable";
import AlertDialog from "../../components/common/AlertDialog";
import { notify } from "../../utils/toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";

type AlertVariant = "warning" | "error";

interface AlertState {
  title: string;
  message: string;
  variant: AlertVariant;
}

// === TAMBAHAN INTERN ===
type SubjectType = "employee" | "intern";

const EvaluationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const roleName = user?.role?.name;

  const isEditMode = Boolean(id);

  const prefillEmployeeId = searchParams.get("employee_id");
  const prefillInternId = searchParams.get("intern_id");
  const isPrefilled =
    (Boolean(prefillEmployeeId) || Boolean(prefillInternId)) && !isEditMode;

  const [subjectType, setSubjectType] = useState<SubjectType>(
    prefillInternId ? "intern" : "employee",
  );

  const [employees, setEmployees] = useState<Employee[]>([]);
  // === TAMBAHAN INTERN ===
  const [interns, setInterns] = useState<Intern[]>([]);
  const [criteriaGroups, setCriteriaGroups] = useState<EvaluationGroup[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">(
    prefillEmployeeId ? Number(prefillEmployeeId) : "",
  );
  // === TAMBAHAN INTERN ===
  const [selectedInternId, setSelectedInternId] = useState<number | "">(
    prefillInternId ? Number(prefillInternId) : "",
  );
  const [form, setForm] = useState({
    npk: searchParams.get("npk") ?? "",
    jabatan: searchParams.get("jabatan") ?? "",
    join_date: searchParams.get("join_date") ?? "",
    start_date: searchParams.get("start_date") ?? "",
    end_date: searchParams.get("end_date") ?? "",
    pkwt: "",
    reminder_date: "",
    reminder_note: "",
  });
  const prefillName = searchParams.get("name") ?? "";
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [leaderScores, setLeaderScores] = useState<Record<number, number>>({});

  const [recommendation, setRecommendation] =
    useState<EvaluationRecommendationPayload>({
      employee_status: "",
      extend_pkwt: false,
      pkwt_number: "",
      extend_months: null,
      notes: "",
    });

  const [alertInfo, setAlertInfo] = useState<AlertState | null>(null);

  const showAlert = (
    title: string,
    message: string,
    variant: AlertVariant = "warning",
  ) => {
    setAlertInfo({ title, message, variant });
  };

  const scoringMode: "leader" | "section_head" | "readonly" = useMemo(() => {
    if (!isEditMode || !evaluation) return "leader";
    if (
      roleName === "Section Head" &&
      evaluation.current_stage === "section_head"
    ) {
      return "section_head";
    }
    if (roleName === "Leader" && evaluation.current_stage === "leader") {
      return "leader";
    }
    return "readonly";
  }, [isEditMode, evaluation, roleName]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesResponse, internsResponse, criteriaResponse] =
          await Promise.all([
            employeeService.getActiveEmployees(),
            internService.getActiveInterns(),
            evaluationService.getCriteria(),
          ]);
        setEmployees(employeesResponse.data ?? []);
        setInterns(internsResponse.data ?? []);
        setCriteriaGroups(criteriaResponse.data ?? []);
      } catch {
        // ignore for now
      }
    };
    void loadData();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    const loadEvaluation = async () => {
      try {
        setLoading(true);
        const response = await evaluationService.getEvaluation(Number(id));
        const item = response.data;
        setEvaluation(item);

        // === TAMBAHAN INTERN: tentukan subjectType dari data tersimpan ===
        const loadedSubjectType: SubjectType = item.intern_id
          ? "intern"
          : "employee";
        setSubjectType(loadedSubjectType);
        setSelectedEmployeeId(item.employee_id ?? "");
        setSelectedInternId(item.intern_id ?? "");

        setForm({
          npk: item.npk ?? "",
          jabatan: item.jabatan ?? "",
          join_date: item.join_date ?? "",
          start_date: item.start_date ?? "",
          end_date: item.end_date ?? "",
          pkwt: item.pkwt ?? "",
          reminder_date: item.reminder_date ?? "",
          reminder_note: item.reminder_note ?? "",
        });
        setRecommendation({
          employee_status: item.recommendation?.employee_status ?? "",
          extend_pkwt: item.recommendation?.extend_pkwt ?? false,
          pkwt_number: item.recommendation?.pkwt_number ?? "",
          extend_months: item.recommendation?.extend_months ?? null,
          notes: item.recommendation?.notes ?? "",
        });

        // Pisahkan skor Leader (selalu jadi referensi) dari skor role yang
        // sedang login & berhak edit di stage saat ini.
        const currentRoleKey =
          roleName === "Section Head"
            ? "section_head"
            : roleName === "Leader"
              ? "leader"
              : null;

        const initialLeaderScores: Record<number, number> = {};
        const initialEditableScores: Record<number, number> = {};

        item.scores.forEach((score) => {
          if (score.score === null) return;
          if (score.filled_by_role === "leader") {
            initialLeaderScores[score.criteria_id] = score.score;
          }
          if (currentRoleKey && score.filled_by_role === currentRoleKey) {
            initialEditableScores[score.criteria_id] = score.score;
          }
        });

        setLeaderScores(initialLeaderScores);

        // Untuk mode readonly (mis. Manager melihat), tampilkan skor SH kalau
        // ada, fallback ke skor Leader kalau SH belum isi — supaya viewer
        // tetap lihat hasil terakhir yang relevan.
        if (currentRoleKey) {
          setScores(initialEditableScores);
        } else {
          const shScores: Record<number, number> = {};
          item.scores.forEach((score) => {
            if (
              score.score !== null &&
              score.filled_by_role === "section_head"
            ) {
              shScores[score.criteria_id] = score.score;
            }
          });
          setScores(
            Object.keys(shScores).length > 0 ? shScores : initialLeaderScores,
          );
        }
      } catch {
        navigate("/evaluations");
      } finally {
        setLoading(false);
      }
    };

    void loadEvaluation();
  }, [id, isEditMode, navigate, roleName]);

  // Auto-fill dari Employee yang dipilih manual (bukan prefill dari trigger)
  useEffect(() => {
    if (
      !isEditMode &&
      !isPrefilled &&
      subjectType === "employee" &&
      selectedEmployeeId
    ) {
      const employee = employees.find((e) => e.id === selectedEmployeeId);
      if (employee) {
        setForm((prev) => ({
          ...prev,
          npk: employee.npk ?? "",
          jabatan: employee.jabatan ?? "",
          join_date: employee.join_date ? employee.join_date.split("T")[0] : "",
          start_date: employee.start_contract
            ? employee.start_contract.split("T")[0]
            : "",
          end_date: employee.end_contract
            ? employee.end_contract.split("T")[0]
            : "",
        }));
      }
    }
  }, [selectedEmployeeId, employees, isEditMode, isPrefilled, subjectType]);

  // === TAMBAHAN INTERN: auto-fill dari Intern yang dipilih manual ===
  useEffect(() => {
    if (
      !isEditMode &&
      !isPrefilled &&
      subjectType === "intern" &&
      selectedInternId
    ) {
      const intern = interns.find((i) => i.id === selectedInternId);
      if (intern) {
        setForm((prev) => ({
          ...prev,
          npk: intern.npk ?? "",
          jabatan: intern.jabatan ?? "",
          join_date: intern.join_date ? intern.join_date.split("T")[0] : "",
          start_date: intern.start_contract
            ? intern.start_contract.split("T")[0]
            : "",
          end_date: intern.end_contract
            ? intern.end_contract.split("T")[0]
            : "",
        }));
      }
    }
  }, [selectedInternId, interns, isEditMode, isPrefilled, subjectType]);

  useEffect(() => {
    if (recommendation.employee_status === "kontrak_berakhir") {
      setRecommendation((prev) => ({
        ...prev,
        extend_pkwt: false,
        pkwt_number: "",
        extend_months: null,
      }));
    }
  }, [recommendation.employee_status]);
  // Kumpulkan semua criteria_id dari seluruh grup & subgrup rubrik
  const allCriteriaIds = useMemo(() => {
    return criteriaGroups.flatMap((group) =>
      group.subgroups.flatMap((subgroup) =>
        subgroup.criteria.map((criterion) => criterion.id),
      ),
    );
  }, [criteriaGroups]);

  // State untuk menyimpan id kriteria yang belum diisi (dipakai untuk highlight)
  const [unfilledIds, setUnfilledIds] = useState<number[]>([]);

  // Cek apakah masih ada kriteria yang skornya belum diisi
  const getUnfilledCriteria = () => {
    return allCriteriaIds.filter(
      (criteriaId) =>
        scores[criteriaId] === undefined || scores[criteriaId] === null,
    );
  };
  const handleCreate = async () => {
    // === UBAH (Intern): validasi subjek terpilih tergantung subjectType ===
    const selectedSubjectId =
      subjectType === "intern" ? selectedInternId : selectedEmployeeId;
    if (!selectedSubjectId) return;
    if (saving) return; // cegah double-submit kalau user klik berkali-kali

    const unfilled = getUnfilledCriteria();
    if (unfilled.length > 0) {
      setUnfilledIds(unfilled);
      showAlert(
        "Skor Belum Lengkap",
        "Harap isi seluruh skor penilaian sebelum menyimpan evaluasi.",
      );
      return;
    }
    setUnfilledIds([]);

    setSaving(true);
    try {
      let basePayload;
      if (isPrefilled) {
        basePayload = {
          // === UBAH (Intern): employee_id ATAU intern_id, exclusive ===
          employee_id:
            subjectType === "employee" ? Number(selectedSubjectId) : undefined,
          intern_id:
            subjectType === "intern" ? Number(selectedSubjectId) : undefined,
          npk: form.npk || undefined,
          jabatan: form.jabatan || undefined,
          join_date: form.join_date || null,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          pkwt: form.pkwt || null,
        };
      } else if (subjectType === "intern") {
        const intern = interns.find((item) => item.id === selectedSubjectId);
        basePayload = {
          employee_id: undefined,
          intern_id: Number(selectedSubjectId),
          npk: intern?.npk,
          jabatan: intern?.jabatan,
          join_date: intern?.join_date ?? null,
          start_date: intern?.start_contract ?? null,
          end_date: intern?.end_contract ?? null,
          pkwt: form.pkwt || null,
        };
      } else {
        const employee = employees.find(
          (item) => item.id === selectedSubjectId,
        );
        basePayload = {
          employee_id: Number(selectedSubjectId),
          intern_id: undefined,
          npk: employee?.npk,
          jabatan: employee?.jabatan,
          join_date: employee?.join_date ?? null,
          start_date: employee?.start_contract ?? null,
          end_date: employee?.end_contract ?? null,
          pkwt: form.pkwt || null,
        };
      }

      const payload = {
        ...basePayload,
        scores: Object.entries(scores).map(([criteriaId, score]) => ({
          criteria_id: Number(criteriaId),
          score,
        })),
        recommendation,
      };

      const response = await evaluationService.createEvaluation(payload);
      const newId = response.data.id;

      notify.success("Evaluation created successfully");
      navigate(`/evaluations/${newId}`);
    } catch {
      showAlert("Gagal Menyimpan", "Failed to create evaluation", "error");
    } finally {
      setSaving(false);
    }
  };
  const handleSave = async () => {
    if (!evaluation) return;

    if (scoringMode === "leader" || scoringMode === "section_head") {
      const unfilled = getUnfilledCriteria();
      if (unfilled.length > 0) {
        setUnfilledIds(unfilled);
        showAlert(
          "Skor Belum Lengkap",
          "Harap isi seluruh skor penilaian sebelum menyimpan evaluasi.",
        );
        return;
      }
    }
    setUnfilledIds([]);

    setSaving(true);
    try {
      await evaluationService.updateEvaluation(evaluation.id, form);

      if (scoringMode === "leader" || scoringMode === "section_head") {
        const payload: EvaluationScorePayload = {
          scores: Object.entries(scores).map(([criteriaId, score]) => ({
            criteria_id: Number(criteriaId),
            score,
          })),
        };
        await evaluationService.updateScores(evaluation.id, payload);
      }

      await evaluationService.updateRecommendation(
        evaluation.id,
        recommendation,
      );
      navigate(`/evaluations/${evaluation.id}`);
    } catch {
      showAlert("Gagal Menyimpan", "Failed to save evaluation", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!evaluation) return;
    setSaving(true);
    try {
      await evaluationService.deleteEvaluation(evaluation.id);
      notify.success("Evaluation deleted successfully");
      navigate("/evaluations");
    } catch {
      showAlert("Gagal Menghapus", "Failed to delete evaluation", "error");
      setSaving(false);
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box p={8} textAlign="center" color="gray.500">
          Loading...
        </Box>
      </MainLayout>
    );
  }

  const isScoringReadonly = scoringMode === "readonly";
  // === TAMBAHAN INTERN ===
  const selectedSubjectId =
    subjectType === "intern" ? selectedInternId : selectedEmployeeId;

  return (
    <MainLayout>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              {isEditMode ? "Edit Evaluation" : "Create Evaluation"}
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              {/* === TAMBAHAN INTERN === */}
              Fill the {subjectType === "intern" ? "intern" : "employee"}{" "}
              details and scoring rubric.
            </Text>
          </Box>
          <Stack
            gap={2}
            direction={{ base: "column", sm: "row" }}
            w={{ base: "100%", sm: "auto" }}
          >
            {isEditMode && evaluation?.status === "draft" && (
              <Box
                as="button"
                onClick={saving ? undefined : () => setDeleteConfirmOpen(true)}
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                w={{ base: "100%", sm: "auto" }}
                px="clamp(14px, 3vw, 20px)"
                py="clamp(8px, 2vw, 10px)"
                fontSize="clamp(12px, 2vw, 14px)"
                fontWeight={600}
                borderRadius="8px"
                color="#ffffff"
                bg="#ef4444"
                border="none"
                cursor={saving ? "not-allowed" : "pointer"}
                opacity={saving ? 0.6 : 1}
                whiteSpace="nowrap"
                transition="all 0.2s ease"
                _hover={
                  saving
                    ? {}
                    : {
                        bg: "#dc2626",
                        transform: "translatey(-1px) scale(1.02)",
                        boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
                      }
                }
              >
                Cancel Evaluation
              </Box>
            )}

            <Box
              as="button"
              onClick={() => navigate("/evaluations")}
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              w={{ base: "100%", sm: "auto" }}
              px="clamp(14px, 3vw, 20px)"
              py="clamp(8px, 2vw, 10px)"
              fontSize="clamp(12px, 2vw, 14px)"
              fontWeight={600}
              borderRadius="8px"
              color="#475569"
              bg="#ffffff"
              border="1px solid"
              borderColor="#e2e8f0"
              cursor="pointer"
              whiteSpace="nowrap"
              transition="all 0.2s ease"
              _hover={{
                bg: "#f8fafc",
                transform: "translatey(-1px) scale(1.02)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              Cancel
            </Box>

            {!isScoringReadonly && (
              <Box
                as="button"
                onClick={
                  saving ? undefined : isEditMode ? handleSave : handleCreate
                }
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                w={{ base: "100%", sm: "auto" }}
                px="clamp(14px, 3vw, 20px)"
                py="clamp(8px, 2vw, 10px)"
                fontSize="clamp(12px, 2vw, 14px)"
                fontWeight={600}
                borderRadius="8px"
                color="#ffffff"
                bg="#1A5EA8"
                border="none"
                cursor={saving ? "not-allowed" : "pointer"}
                opacity={saving ? 0.6 : 1}
                whiteSpace="nowrap"
                transition="all 0.2s ease"
                _hover={
                  saving
                    ? {}
                    : {
                        bg: "#3A76B8",
                        transform: "translatey(-1px) scale(1.02)",
                        boxShadow: "0 4px 12px rgba(26,94,168,0.35)",
                      }
                }
              >
                {saving
                  ? "Saving..."
                  : isEditMode
                    ? "Save Evaluation"
                    : "Create Evaluation"}
              </Box>
            )}
          </Stack>
        </Flex>

        <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="16px" fontWeight="700" color="gray.800">
              {subjectType === "intern" ? "Intern" : "Employee"} Details
            </Text>
            {/* === TAMBAHAN INTERN: tab Employee/Intern, teks dipisah "|",
                hanya muncul saat create manual (bukan prefill, bukan edit)
                — di edit mode subjectType sudah fix dari data tersimpan. === */}
            {!isEditMode && !isPrefilled && (
              <HStack gap={2}>
                {(["employee", "intern"] as SubjectType[]).map(
                  (type, index) => (
                    <React.Fragment key={type}>
                      {index > 0 && (
                        <Text fontSize="13px" color="#cbd5e1" userSelect="none">
                          |
                        </Text>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSubjectType(type);
                          setSelectedEmployeeId("");
                          setSelectedInternId("");
                        }}
                        style={{
                          fontSize: "13px",
                          fontWeight: subjectType === type ? 700 : 500,
                          color: subjectType === type ? "#1A5EA8" : "#94a3b8",
                          cursor: "pointer",
                          background: "transparent",
                          border: "none",
                          padding: 0,
                        }}
                      >
                        {type === "employee" ? "Employee" : "Intern"}
                      </button>
                    </React.Fragment>
                  ),
                )}
              </HStack>
            )}
          </Flex>

          {isPrefilled ? (
            <Box
              bg="orange.50"
              p={4}
              rounded="md"
              border="1px solid"
              borderColor="orange.200"
            >
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                {prefillName ||
                  `${subjectType === "intern" ? "Intern" : "Employee"} #${selectedSubjectId}`}
              </Text>
              <Text fontSize="13px" color="gray.500">
                {form.npk}
              </Text>
              <Text fontSize="12px" color="orange.700" mt={1}>
                Triggered from contract expiry reminder
              </Text>
            </Box>
          ) : !isEditMode ? (
            subjectType === "intern" ? (
              <select
                value={selectedInternId}
                onChange={(event) =>
                  setSelectedInternId(Number(event.target.value))
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#fff",
                  fontSize: "14px",
                  color: "#1a202c",
                }}
              >
                <option value="">Select intern</option>
                {interns.map((intern) => (
                  <option key={intern.id} value={intern.id}>
                    {intern.name} ({intern.npk})
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedEmployeeId}
                onChange={(event) =>
                  setSelectedEmployeeId(Number(event.target.value))
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#fff",
                  fontSize: "14px",
                  color: "#1a202c",
                }}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.npk})
                  </option>
                ))}
              </select>
            )
          ) : (
            <Box bg="gray.50" p={4} rounded="md">
              {/* === TAMBAHAN INTERN: tampilkan intern atau employee sesuai subjectType === */}
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                {subjectType === "intern"
                  ? evaluation?.intern?.name
                  : evaluation?.employee?.name}
              </Text>
              <Text fontSize="13px" color="gray.500">
                {subjectType === "intern"
                  ? evaluation?.intern?.npk
                  : evaluation?.employee?.npk}
              </Text>
            </Box>
          )}

          <HStack gap={4} mt={4} wrap="wrap">
            <Box flex={1} minW="220px">
              <Text fontSize="13px" fontWeight="600" mb={2}>
                NPK
              </Text>
              <Input
                value={form.npk}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, npk: event.target.value }))
                }
                disabled
              />
            </Box>
            <Box flex={1} minW="220px">
              <Text fontSize="13px" fontWeight="600" mb={2}>
                Position
              </Text>
              <Input
                value={form.jabatan}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, jabatan: event.target.value }))
                }
                disabled
              />
            </Box>
            <Box flex={1} minW="220px">
              <Text fontSize="13px" fontWeight="600" mb={2}>
                Join Date
              </Text>
              <Input
                type="date"
                value={form.join_date ? form.join_date.split("T")[0] : ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    join_date: event.target.value,
                  }))
                }
                disabled
              />
            </Box>
          </HStack>

          <HStack gap={4} mt={4} wrap="wrap">
            <Box flex={1} minW="220px">
              <Text fontSize="13px" fontWeight="600" mb={2}>
                Start Contract
              </Text>
              <Input
                type="date"
                value={form.start_date ? form.start_date.split("T")[0] : ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    start_date: event.target.value,
                  }))
                }
                disabled
              />
            </Box>
            <Box flex={1} minW="220px">
              <Text fontSize="13px" fontWeight="600" mb={2}>
                End Contract
              </Text>
              <Input
                type="date"
                value={form.end_date ? form.end_date.split("T")[0] : ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, end_date: event.target.value }))
                }
                disabled
              />
            </Box>
            <Box flex={1} minW="220px">
              <Text fontSize="13px" fontWeight="600" mb={2}>
                PKWT
              </Text>
              <Input
                value={form.pkwt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, pkwt: event.target.value }))
                }
              />
            </Box>
          </HStack>
        </Box>

        <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="16px" fontWeight="700" color="gray.800">
              Scoring Rubric
            </Text>
            {scoringMode === "section_head" && (
              <Text fontSize="12px" color="gray.500">
                Skor{" "}
                <Text as="span" fontWeight="700" color="#1d4ed8">
                  LD
                </Text>{" "}
                ditampilkan sebagai referensi (tidak bisa diubah). Isi skor{" "}
                <Text as="span" fontWeight="700" color="#16a34a">
                  SH
                </Text>{" "}
                di sebelahnya.
              </Text>
            )}
            {isScoringReadonly && (
              <Text fontSize="12px" color="gray.500">
                Tampilan saja — tidak bisa diedit di tahap ini
              </Text>
            )}
          </Flex>
          <ScoringRubricTable
            criteriaGroups={criteriaGroups}
            scores={scores}
            leaderScores={leaderScores}
            mode={scoringMode}
            unfilledIds={unfilledIds}
            onChange={(criteriaId, value) => {
              setScores((prev) => ({ ...prev, [criteriaId]: value }));
              // hapus highlight begitu user mengisi kriteria tsb
              setUnfilledIds((prev) => prev.filter((id) => id !== criteriaId));
            }}
          />
        </Box>

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
            Recommendation
          </Text>
          {/* NOTE (Intern): dropdown & value di bawah ini REUSE APA ADANYA
              dari Employee (permanen/kontrak_berakhir/perpanjang_kontrak),
              termasuk saat subjectType === "intern" — sesuai keputusan
              Anda, sementara sampai skema final diputuskan. Tidak ada
              percabangan label untuk Intern di sini. */}
          <Box mb={4} maxW="320px">
            <Text fontSize="13px" fontWeight="600" mb={2}>
              Decision
            </Text>
            <select
              value={recommendation.employee_status ?? ""}
              onChange={(event) =>
                setRecommendation((prev) => ({
                  ...prev,
                  employee_status: event.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                fontSize: "14px",
                color: "#1a202c",
              }}
            >
              <option value="">Pilih status</option>
              <option value="permanen">Permanen</option>
              <option value="kontrak_berakhir">Kontrak Berakhir</option>
              <option value="perpanjang_kontrak">Perpanjang Kontrak</option>
            </select>
          </Box>

          <Box mb={4}>
            {(() => {
              const isContractEnded =
                recommendation.employee_status === "kontrak_berakhir";

              return (
                <>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: isContractEnded ? "#9ca3af" : "#374151",
                      marginBottom: isContractEnded ? "4px" : "12px",
                      cursor: isContractEnded ? "not-allowed" : "pointer",
                      width: "fit-content",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={recommendation.extend_pkwt ?? false}
                      disabled={isContractEnded}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setRecommendation((prev) => ({
                          ...prev,
                          extend_pkwt: checked,
                          ...(checked
                            ? {}
                            : { pkwt_number: "", extend_months: null }),
                        }));
                      }}
                    />
                    Extend PKWT
                  </label>

                  {isContractEnded && (
                    <Text fontSize="12px" color="gray.500" mb="12px">
                      Tidak tersedia karena status keputusan adalah{" "}
                      <Text as="span" fontWeight="600" color="gray.600">
                        "Kontrak Berakhir"
                      </Text>
                      .
                    </Text>
                  )}

                  <HStack gap={4} wrap="wrap">
                    <Box flex={1} minW="220px">
                      <Text fontSize="13px" fontWeight="600" mb={2}>
                        PKWT
                      </Text>
                      <Input
                        placeholder="PKWT 1/2/3/4"
                        value={recommendation.pkwt_number ?? ""}
                        disabled={
                          !recommendation.extend_pkwt || isContractEnded
                        }
                        onChange={(event) =>
                          setRecommendation((prev) => ({
                            ...prev,
                            pkwt_number: event.target.value,
                          }))
                        }
                      />
                    </Box>
                    <Box flex={1} minW="220px">
                      <Text fontSize="13px" fontWeight="600" mb={2}>
                        Duration (Months)
                      </Text>
                      <Input
                        type="number"
                        placeholder="Berapa Bulan"
                        value={recommendation.extend_months ?? ""}
                        disabled={
                          !recommendation.extend_pkwt || isContractEnded
                        }
                        onChange={(event) =>
                          setRecommendation((prev) => ({
                            ...prev,
                            extend_months: Number(event.target.value) || null,
                          }))
                        }
                      />
                    </Box>
                  </HStack>
                </>
              );
            })()}
          </Box>

          <Box mb={4}>
            <Text fontSize="13px" fontWeight="600" mb={2}>
              Notes
            </Text>
            <Textarea
              value={recommendation.notes ?? ""}
              onChange={(event) =>
                setRecommendation((prev) => ({
                  ...prev,
                  notes: event.target.value,
                }))
              }
            />
          </Box>
        </Box>
      </Box>
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
      />{" "}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Draft Evaluation"
        message="Are you sure you want to delete this draft? This action cannot be undone."
        confirmText="Delete"
        confirmColor="#ef4444"
        loading={saving}
        loadingText="Deleting..."
        icon={<FiTrash2 size={22} />}
      />
    </MainLayout>
  );
};

export default EvaluationForm;
