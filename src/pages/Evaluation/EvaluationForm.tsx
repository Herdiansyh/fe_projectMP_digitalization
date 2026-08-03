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
import {
  useEvaluationCriteria,
  useEvaluationDetail,
} from "../../hooks/queries/useEvaluationQueries";
import evaluationService from "../../services/evaluationService";
import employeeService from "../../services/employeeService";
import internService from "../../services/internService";
import type {
  Evaluation,
  EvaluationRecommendationPayload,
  EvaluationScorePayload,
} from "../../types/evaluation";
import type { Employee } from "../../types/employee";
import type { Intern } from "../../types/intern";
import ScoringRubricTable from "./ScoringRubricTable";
import AlertDialog from "../../components/common/AlertDialog";
import { notify } from "../../utils/toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useTourGuide } from "../../hooks/useTourGuide";
import SpotlightTour from "../../components/common/SpotLightTour";
import HelpButton from "../../components/common/HelpButton";
import { evaluationFormTourSteps } from "../../hooks/tours/evaluationFormTour";

type AlertVariant = "warning" | "error";

interface AlertState {
  title: string;
  message: string;
  variant: AlertVariant;
}

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

  // Untuk Intern, kenaikan Intern -> Employee TIDAK ditentukan oleh scoring
  // evaluasi. Leader hanya isi Recommendation; checkbox "Extend PKWT" yang
  // menentukan apakah intern tetap magang (extend_pkwt = false) atau naik
  // jadi employee (extend_pkwt = true, dengan pkwt_number wajib diisi).
  const isIntern = subjectType === "intern";

  // ─── TanStack Query ──────────────────────────────────────────────────────
  // Scoring rubric & detail evaluasi diambil via query (shared cache), bukan
  // fetch manual per-mount — jadi tidak re-fetch tiap kali masuk halaman.
  const { data: criteriaRes } = useEvaluationCriteria();
  const { data: evaluationDetailRes, isLoading: loadingEvaluation } =
    useEvaluationDetail(Number(id), isEditMode);
  const criteriaGroups = criteriaRes?.data ?? [];

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">(
    prefillEmployeeId ? Number(prefillEmployeeId) : "",
  );
  const [selectedInternId, setSelectedInternId] = useState<number | "">(
    prefillInternId ? Number(prefillInternId) : "",
  );
  const [form, setForm] = useState({
    npk: searchParams.get("npk") ?? "",
    jabatan: searchParams.get("jabatan") ?? "",
    join_date: searchParams.get("join_date") ?? "",
    start_date: searchParams.get("start_date") ?? "",
    end_date: searchParams.get("end_date") ?? "",
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

  // ─── Tour Guide ──────────────────────────────────────────────────────────
  const formTourSteps = useMemo(
    () => evaluationFormTourSteps(isIntern, isEditMode, isPrefilled),
    [isIntern, isEditMode, isPrefilled],
  );
  const tour = useTourGuide(
    `evaluation_form_${isIntern ? "intern" : "employee"}_v1`,
    formTourSteps,
  );

  const scoringMode: "leader" | "section_head" | "readonly" = useMemo(() => {
    if (!isEditMode || !evaluation) return "leader";

    if (roleName === "Admin") {
      if (!isIntern && evaluation.current_stage === "section_head") {
        return "section_head";
      }
      return "leader";
    }

    if (
      !isIntern &&
      roleName === "Section Head" &&
      evaluation.current_stage === "section_head"
    ) {
      return "section_head";
    }
    if (roleName === "Leader" && evaluation.current_stage === "leader") {
      return "leader";
    }
    return "readonly";
  }, [isEditMode, evaluation, roleName, isIntern]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesResponse, internsResponse] = await Promise.all([
          employeeService.getActiveEmployees(),
          internService.getActiveInterns(),
        ]);
        setEmployees(employeesResponse.data ?? []);
        setInterns(internsResponse.data ?? []);
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

    const item = evaluationDetailRes?.data ?? null;
    if (!item) {
      return;
    }

    setLoading(loadingEvaluation);
    setEvaluation(item);

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

    if (loadedSubjectType === "intern") {
      setLeaderScores({});
      setScores({});
    } else {
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
    }
  }, [id, isEditMode, navigate, roleName, evaluationDetailRes, loadingEvaluation]);

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

  const allCriteriaIds = useMemo(() => {
    return criteriaGroups.flatMap((group) =>
      group.subgroups.flatMap((subgroup) =>
        subgroup.criteria.map((criterion) => criterion.id),
      ),
    );
  }, [criteriaGroups]);

  const [unfilledIds, setUnfilledIds] = useState<number[]>([]);

  const getUnfilledCriteria = () => {
    if (isIntern) return [];
    return allCriteriaIds.filter(
      (criteriaId) =>
        scores[criteriaId] === undefined || scores[criteriaId] === null,
    );
  };

  // === Validasi tambahan: durasi selalu wajib untuk perpanjang kontrak/magang,
  // pkwt_number hanya wajib jika extend_pkwt dicentang.
  const validateRecommendation = (): string | null => {
    if (recommendation.employee_status === "perpanjang_kontrak") {
      // Duration selalu wajib diisi — baik untuk perpanjang magang (Intern
      // tetap intern) maupun perpanjang kontrak PKWT (Employee, atau Intern
      // yang naik jadi karyawan).
      if (!recommendation.extend_months || recommendation.extend_months <= 0) {
        return "Durasi (bulan) wajib diisi.";
      }
      // PKWT number hanya wajib jika extend_pkwt dicentang (Employee
      // perpanjang kontrak, atau Intern naik jadi karyawan).
      if (recommendation.extend_pkwt && !recommendation.pkwt_number) {
        return "Nomor PKWT wajib diisi jika 'Extend PKWT' dicentang.";
      }
    }
    return null;
  };

  const handleCreate = async () => {
    const selectedSubjectId =
      subjectType === "intern" ? selectedInternId : selectedEmployeeId;
    if (!selectedSubjectId) return;
    if (saving) return;

    if (!isIntern) {
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

    const recommendationError = validateRecommendation();
    if (recommendationError) {
      showAlert("Data Belum Lengkap", recommendationError);
      return;
    }

    setSaving(true);
    try {
      let basePayload;
      if (isPrefilled) {
        basePayload = {
          employee_id:
            subjectType === "employee" ? Number(selectedSubjectId) : undefined,
          intern_id:
            subjectType === "intern" ? Number(selectedSubjectId) : undefined,
          npk: form.npk || undefined,
          jabatan: form.jabatan || undefined,
          join_date: form.join_date || null,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
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
        };
      }

      const payload = {
        ...basePayload,
        scores: isIntern
          ? []
          : Object.entries(scores).map(([criteriaId, score]) => ({
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

    if (
      !isIntern &&
      (scoringMode === "leader" || scoringMode === "section_head")
    ) {
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

    const recommendationError = validateRecommendation();
    if (recommendationError) {
      showAlert("Data Belum Lengkap", recommendationError);
      return;
    }

    setSaving(true);
    try {
      await evaluationService.updateEvaluation(evaluation.id, form);

      if (
        !isIntern &&
        (scoringMode === "leader" || scoringMode === "section_head")
      ) {
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
  const selectedSubjectId =
    subjectType === "intern" ? selectedInternId : selectedEmployeeId;
  const isContractEnded = recommendation.employee_status === "kontrak_berakhir";

  return (
    <MainLayout>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              {isEditMode ? "Edit Evaluation" : "Create Evaluation"}
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              {isIntern
                ? "Fill the intern details and recommendation. Scoring rubric is not required for interns."
                : "Fill the employee details and scoring rubric."}
            </Text>
          </Box>
          <Stack
            gap={2}
            direction={{ base: "column", sm: "row" }}
            w={{ base: "100%", sm: "auto" }}
          >
            <HelpButton onClick={tour.start} />
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
            {!isEditMode && !isPrefilled && (
              <HStack gap={2} data-tour="subject-type-tabs">
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
                data-tour="subject-select"
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
                data-tour="subject-select"
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
                PKWT Number
              </Text>
              <Box
                bg="gray.50"
                border="1px solid #e2e8f0"
                borderRadius="8px"
                px={3}
                py="8px"
                minH="38px"
                display="flex"
                alignItems="center"
              >
                {isIntern ? (
                  <Text fontSize="13px" color="gray.400">
                    Belum mempunyai PKWT
                  </Text>
                ) : isEditMode ? (
                  <Text fontSize="14px" color="gray.700" fontWeight={500}>
                    {evaluation?.employee?.pkwt_number ?? "-"}
                  </Text>
                ) : (
                  <Text fontSize="14px" color="gray.700" fontWeight={500}>
                    {employees.find((e) => e.id === selectedEmployeeId)
                      ?.pkwt_number ?? "-"}
                  </Text>
                )}
              </Box>
            </Box>
          </HStack>
        </Box>

        {/*
          FIX: data-tour="scoring-rubric" DIPINDAH dari Box pembungkus besar
          (yang membungkus seluruh tabel rubric, tinggi > viewport) ke Flex
          header di dalamnya. Ini menghilangkan bug spotlight raksasa /
          tooltip kepotong di step "Isi Evaluation Assessment".
        */}
        {!isIntern ? (
          <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
            <Flex
              justify="space-between"
              align="center"
              mb={4}
              data-tour="scoring-rubric"
            >
              <Text fontSize="16px" fontWeight="700" color="gray.800">
                Evaluation Assessment
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
                setUnfilledIds((prev) =>
                  prev.filter((id) => id !== criteriaId),
                );
              }}
            />
          </Box>
        ) : (
          <Box
            bg="blue.50"
            border="1px solid"
            borderColor="blue.200"
            rounded="lg"
            p={4}
            mb={6}
            data-tour="intern-no-scoring-note"
          >
            <Text fontSize="13px" color="blue.700">
              Penilaian Evaluasi tidak diperlukan untuk Intern. Kenaikan status
              intern ditentukan sepenuhnya dari bagian Recommendation di bawah.
            </Text>
          </Box>
        )}

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
            Recommendation
          </Text>

          <Box mb={4} maxW="320px" data-tour="decision-dropdown">
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
              <option value="permanen">
                {isIntern ? "Permanen (Langsung Karyawan Tetap)" : "Permanen"}
              </option>
              <option value="kontrak_berakhir">
                {isIntern
                  ? "Magang Selesai / Tidak Dilanjutkan"
                  : "Kontrak Berakhir"}
              </option>
              <option value="perpanjang_kontrak">
                {isIntern
                  ? "Perpanjang Kontrak / Magang"
                  : "Perpanjang Kontrak"}
              </option>
            </select>

            {isIntern &&
              recommendation.employee_status === "perpanjang_kontrak" && (
                <Text fontSize="12px" color="gray.500" mt="8px">
                  {recommendation.extend_pkwt
                    ? "Intern akan diangkat menjadi karyawan (PKWT) sesuai nomor & durasi di bawah."
                    : "Intern tetap berstatus magang, hanya kontrak magangnya diperpanjang."}
                </Text>
              )}
          </Box>

          <Box mb={4}>
            <label
              data-tour="extend-pkwt-checkbox"
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
                    // Hanya reset pkwt_number saat uncheck — extend_months TETAP dipakai
                    // baik untuk durasi magang (intern tetap intern) maupun durasi PKWT
                    // (intern naik jadi karyawan / employee perpanjang kontrak).
                    ...(checked ? {} : { pkwt_number: "" }),
                  }));
                }}
              />
              Extend PKWT
              {isIntern && (
                <Text
                  as="span"
                  fontSize="11px"
                  color="#94a3b8"
                  fontWeight={500}
                >
                  (centang = naik jadi karyawan PKWT)
                </Text>
              )}
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

            <HStack gap={4} wrap="wrap" data-tour="pkwt-number-input">
              {/* PKWT Number: untuk Employee selalu tampil (disabled sesuai
                  extend_pkwt seperti perilaku lama). Untuk Intern, field ini HANYA
                  dirender kalau extend_pkwt dicentang — kalau tidak dicentang berarti
                  Intern tetap magang dan belum punya PKWT sama sekali, jadi field ini
                  tidak relevan ditampilkan (bukan sekadar di-disable). */}
              {(!isIntern || recommendation.extend_pkwt) && (
                <Box flex={1} minW="220px">
                  <Text fontSize="13px" fontWeight="600" mb={2}>
                    PKWT Baru
                  </Text>
                  <Input
                    placeholder="PKWT 1/2/3/4"
                    value={recommendation.pkwt_number ?? ""}
                    disabled={
                      isContractEnded ||
                      (!isIntern && !recommendation.extend_pkwt)
                    }
                    onChange={(event) =>
                      setRecommendation((prev) => ({
                        ...prev,
                        pkwt_number: event.target.value,
                      }))
                    }
                  />
                </Box>
              )}

              {/* Duration: SELALU aktif selama status "Perpanjang Kontrak/Magang"
                  dipilih — dipakai baik untuk durasi perpanjangan magang (Intern,
                  extend_pkwt = false) maupun durasi kontrak PKWT (Employee, atau
                  Intern yang naik jadi karyawan). TIDAK bergantung ke extend_pkwt. */}
              <Box flex={1} minW="220px">
                <Text fontSize="13px" fontWeight="600" mb={2}>
                  Duration (Months)
                </Text>
                <Input
                  type="number"
                  placeholder="Berapa Bulan"
                  value={recommendation.extend_months ?? ""}
                  disabled={isContractEnded}
                  onChange={(event) =>
                    setRecommendation((prev) => ({
                      ...prev,
                      extend_months: Number(event.target.value) || null,
                    }))
                  }
                />
              </Box>
            </HStack>
          </Box>

          <Box mb={4} data-tour="recommendation-notes">
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
      {tour.isOpen && tour.currentStep && (
        <SpotlightTour
          step={tour.currentStep}
          stepIndex={tour.stepIndex}
          totalSteps={formTourSteps.length}
          isLastStep={tour.isLastStep}
          onNext={tour.next}
          onSkip={tour.skip}
        />
      )}
    </MainLayout>
  );
};

export default EvaluationForm;
