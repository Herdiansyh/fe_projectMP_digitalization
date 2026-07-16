import React, { useEffect, useMemo, useState } from "react";
import { Box, Flex, HStack, Input, Text, Textarea } from "@chakra-ui/react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import evaluationService from "../../services/evaluationService";
import employeeService from "../../services/employeeService";
import type {
  Evaluation,
  EvaluationGroup,
  EvaluationRecommendationPayload,
  EvaluationScorePayload,
} from "../../types/evaluation";
import type { Employee } from "../../types/employee";
import ScoringRubricTable from "./ScoringRubricTable";

const EvaluationForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const roleName = user?.role?.name;

  const isEditMode = Boolean(id);

  const prefillEmployeeId = searchParams.get("employee_id");
  const isPrefilled = Boolean(prefillEmployeeId) && !isEditMode;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [criteriaGroups, setCriteriaGroups] = useState<EvaluationGroup[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">(
    prefillEmployeeId ? Number(prefillEmployeeId) : "",
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

  // "scores" = skor milik role yang SEDANG login & berhak edit di stage ini
  // "leaderScores" = skor Leader, dipakai sebagai referensi read-only saat SH mengisi
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

  // Mode form penilaian ditentukan dari role user & stage evaluation saat ini.
  // - create mode (belum ada evaluation) selalu dianggap "leader"
  // - Section Head hanya bisa edit (mode "section_head") saat stage-nya "section_head"
  // - Leader hanya bisa edit (mode "leader") saat stage-nya "leader"
  // - selain itu (Manager, atau giliran bukan miliknya) -> readonly
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
        const [employeesResponse, criteriaResponse] = await Promise.all([
          employeeService.getEmployees({ per_page: 100 }),
          evaluationService.getCriteria(),
        ]);
        setEmployees(employeesResponse.data?.data ?? []);
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
        setSelectedEmployeeId(item.employee_id);
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

  useEffect(() => {
    if (!isEditMode && !isPrefilled && selectedEmployeeId) {
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
  }, [selectedEmployeeId, employees, isEditMode, isPrefilled]);

  const handleCreate = async () => {
    if (!selectedEmployeeId) return;
    setSaving(true);
    try {
      let payload;
      if (isPrefilled) {
        payload = {
          employee_id: Number(selectedEmployeeId),
          npk: form.npk || undefined,
          jabatan: form.jabatan || undefined,
          join_date: form.join_date || null,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          pkwt: form.pkwt || null,
        };
      } else {
        const employee = employees.find(
          (item) => item.id === selectedEmployeeId,
        );
        payload = {
          employee_id: Number(selectedEmployeeId),
          npk: employee?.npk,
          jabatan: employee?.jabatan,
          join_date: employee?.join_date ?? null,
          start_date: employee?.start_contract ?? null,
          end_date: employee?.end_contract ?? null,
          pkwt: form.pkwt || null,
        };
      }
      const response = await evaluationService.createEvaluation(payload);

      // Kirim skor yang sudah diisi Leader di form create (kalau ada),
      // supaya tidak hilang begitu saja setelah evaluation dibuat.
      if (Object.keys(scores).length > 0) {
        const scorePayload: EvaluationScorePayload = {
          scores: Object.entries(scores).map(([criteriaId, score]) => ({
            criteria_id: Number(criteriaId),
            score,
          })),
        };
        await evaluationService.updateScores(response.data.id, scorePayload);
      }

      navigate(`/evaluations/${response.data.id}`);
    } catch {
      alert("Failed to create evaluation");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!evaluation) return;
    setSaving(true);
    try {
      await evaluationService.updateEvaluation(evaluation.id, form);

      // Hanya kirim skor kalau user memang sedang di mode yang boleh edit
      // (leader/section_head). Mode readonly tidak boleh mengirim scores.
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
      alert("Failed to save evaluation");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !evaluation ||
      !window.confirm("Are you sure you want to delete this draft?")
    )
      return;
    setSaving(true);
    try {
      await evaluationService.deleteEvaluation(evaluation.id);
      navigate("/evaluations");
    } catch {
      alert("Failed to delete evaluation");
      setSaving(false);
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

  return (
    <MainLayout>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              {isEditMode ? "Edit Evaluation" : "Create Evaluation"}
            </Text>
            <Text fontSize="13px" color="gray.500" mt={0.5}>
              Fill the employee details and scoring rubric.
            </Text>
          </Box>
          <HStack gap={2}>
            {isEditMode && evaluation?.status === "draft" && (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                }}
                disabled={saving}
              >
                Cancel Evaluation
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/evaluations")}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#fff",
                color: "#475569",
              }}
            >
              Cancel
            </button>
            {!isScoringReadonly && (
              <button
                type="button"
                onClick={isEditMode ? handleSave : handleCreate}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                }}
              >
                {saving
                  ? "Saving..."
                  : isEditMode
                    ? "Save Evaluation"
                    : "Create Evaluation"}
              </button>
            )}
          </HStack>
        </Flex>

        <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
          <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
            Employee Details
          </Text>
          {isPrefilled ? (
            <Box
              bg="orange.50"
              p={4}
              rounded="md"
              border="1px solid"
              borderColor="orange.200"
            >
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                {prefillName || `Employee #${selectedEmployeeId}`}
              </Text>
              <Text fontSize="13px" color="gray.500">
                {form.npk}
              </Text>
              <Text fontSize="12px" color="orange.700" mt={1}>
                Triggered from contract expiry reminder
              </Text>
            </Box>
          ) : !isEditMode ? (
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
          ) : (
            <Box bg="gray.50" p={4} rounded="md">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                {evaluation?.employee?.name}
              </Text>
              <Text fontSize="13px" color="gray.500">
                {evaluation?.employee?.npk}
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
                isDisabled
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
                isDisabled
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
                isDisabled
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
            onChange={(criteriaId, value) =>
              setScores((prev) => ({ ...prev, [criteriaId]: value }))
            }
          />
        </Box>

        <Box bg="white" rounded="lg" shadow="sm" p={6}>
          <Text fontSize="16px" fontWeight="700" color="gray.800" mb={4}>
            Recommendation
          </Text>
          <HStack gap={4} wrap="wrap" mb={4}>
            <Box flex={1} minW="220px">
              <Text fontSize="13px" fontWeight="600" mb={2}>
                Employee Status
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
              </select>
            </Box>
            <Box flex={1} minW="220px">
              <Text fontSize="13px" fontWeight="600" mb={2}>
                PKWT Number
              </Text>
              <Input
                value={recommendation.pkwt_number ?? ""}
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
                Extend Months
              </Text>
              <Input
                type="number"
                value={recommendation.extend_months ?? ""}
                onChange={(event) =>
                  setRecommendation((prev) => ({
                    ...prev,
                    extend_months: Number(event.target.value) || null,
                  }))
                }
              />
            </Box>
          </HStack>
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
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "gray.700",
            }}
          >
            <input
              type="checkbox"
              checked={recommendation.extend_pkwt ?? false}
              onChange={(event) =>
                setRecommendation((prev) => ({
                  ...prev,
                  extend_pkwt: event.target.checked,
                }))
              }
            />
            Extend PKWT
          </label>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default EvaluationForm;
