import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import type { Evaluation } from "../../types/evaluation";
import {
  useExtendContract,
  usePromoteIntern,
  useCloseContract,
  useConvertToPermanent,
} from "../../hooks/queries/useEvaluationQueries";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { FiAlertTriangle } from "react-icons/fi";
import { useTourGuide } from "../../hooks/useTourGuide";
import SpotlightTour from "../../components/common/SpotLightTour";
import HelpButton from "../../components/common/HelpButton";
import {
  hrDecisionTourSteps,
  type HrDecisionMode,
} from "../../hooks/tours/hrDecisionTour";

interface HrDecisionModalProps {
  evaluation: Evaluation;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const HrDecisionModal: React.FC<HrDecisionModalProps> = ({
  evaluation,
  onClose,
  onSuccess,
  onError,
}) => {
  const isInternSubject = !!evaluation.intern_id;
  const subject = isInternSubject ? evaluation.intern : evaluation.employee;
  const subjectLabel = isInternSubject ? "Intern" : "Employee";

  const employeeStatus = evaluation.recommendation?.employee_status;
  const extendPkwt = !!evaluation.recommendation?.extend_pkwt;
  const pkwtNumber = evaluation.recommendation?.pkwt_number;

  // === Acuan intern naik jadi employee: employee_status ===
  // "perpanjang_kontrak" DAN extend_pkwt === true (plus pkwt_number
  // terisi). Kalau extend_pkwt false, intern TETAP magang, hanya
  // kontraknya diperpanjang (mode "extend_intern").
  const isPromotingIntern =
    isInternSubject &&
    employeeStatus === "perpanjang_kontrak" &&
    extendPkwt &&
    !!pkwtNumber;

  const mode: HrDecisionMode =
    employeeStatus === "permanen"
      ? "permanent"
      : employeeStatus === "perpanjang_kontrak"
        ? isPromotingIntern
          ? "promote"
          : isInternSubject
            ? "extend_intern"
            : "extend"
        : "close";

  const extendMonths = evaluation.recommendation?.extend_months ?? null;

  const [notes, setNotes] = useState("");
  const [closeAction, setCloseAction] = useState<"deactivate" | "delete">(
    "deactivate",
  );
  const [startDate, setStartDate] = useState(
    evaluation.end_date ? evaluation.end_date.split("T")[0] : "",
  );
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { mutate: extendContract, isPending: extending } = useExtendContract();
  const { mutate: promoteIntern, isPending: promoting } = usePromoteIntern();
  const { mutate: closeContract, isPending: closing } = useCloseContract();
  const { mutate: convertToPermanent, isPending: converting } =
    useConvertToPermanent();

  // ─── Tour Guide ──────────────────────────────────────────────────────────
  const modalTourSteps = hrDecisionTourSteps({ mode, isInternSubject });
  const tour = useTourGuide(`hr_decision_${mode}_v1`, modalTourSteps);

  const handleConvertToPermanent = () => {
    convertToPermanent(
      {
        id: evaluation.id,
        payload: { notes: notes || null },
      },
      {
        onSuccess: () => onSuccess(),
        onError: () => onError("Failed to convert to permanent employee"),
      },
    );
  };

  // === FIX: payload disesuaikan dengan backend extend-contract endpoint
  // yang menggunakan start_date dan extend_months
  const handlePromoteToEmployee = () => {
    if (!startDate) {
      onError("Tanggal mulai kontrak PKWT wajib diisi");
      return;
    }
    const months = Number(extendMonths);
    if (!months || months <= 0) {
      onError(
        "Durasi PKWT belum ditentukan pada evaluation ini. Lengkapi durasi (extend_months) di form evaluation terlebih dahulu.",
      );
      return;
    }
    if (!pkwtNumber) {
      onError(
        "Nomor PKWT belum ditentukan pada evaluation ini. Lengkapi nomor PKWT di form evaluation terlebih dahulu.",
      );
      return;
    }

    promoteIntern(
      {
        id: evaluation.id,
        payload: {
          employment_type: "contract",
          jabatan: subject?.jabatan ?? null,
          department_id: evaluation.department_id ?? null,
          start_date: startDate,
          extend_months: months,
          pkwt_number: pkwtNumber,
          notes: notes || null,
        },
      },
      {
        onSuccess: () => onSuccess(),
        onError: () => onError("Failed to promote intern to employee"),
      },
    );
  };

  const computedEndDatePreview = useMemo(() => {
    const months = Number(extendMonths);
    if (!months || months <= 0 || !startDate) return null;

    const baseDate = new Date(startDate);
    const result = new Date(baseDate);
    result.setMonth(result.getMonth() + months);
    return result.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [extendMonths, startDate]);

  const handleExtend = () => {
    if (!startDate) {
      onError("Tanggal mulai kontrak baru wajib diisi");
      return;
    }
    if (!extendMonths || extendMonths <= 0) {
      onError(
        "Lama kontrak belum ditentukan pada evaluation ini. Silakan lengkapi durasi kontrak (extend_months) saat pembuatan evaluation terlebih dahulu.",
      );
      return;
    }

    const payload = {
      start_date: startDate,
      extend_months: extendMonths,
      notes: notes || null,
    };

    // Backend extendContract sekarang otomatis handle:
    // - Employee: extend employee contract
    // - Intern dengan extend_pkwt = true: naik jadi employee
    // - Intern dengan extend_pkwt = false: tetap intern, perpanjang magang
    extendContract(
      { id: evaluation.id, payload },
      {
        onSuccess: () => onSuccess(),
        onError: () => onError("Failed to extend contract"),
      },
    );
  };

  const executeClose = () => {
    closeContract(
      {
        id: evaluation.id,
        payload: {
          action: closeAction,
          reason: reason || null,
        },
      },
      {
        onSuccess: () => {
          setConfirmCloseOpen(false);
          onSuccess();
        },
        onError: () => {
          setConfirmCloseOpen(false);
          onError("Failed to close contract");
        },
      },
    );
  };

  const requestClose = () => {
    if (closeAction === "delete") {
      setConfirmCloseOpen(true);
    } else {
      executeClose();
    }
  };

  const decisionLabel =
    mode === "extend_intern"
      ? "Perpanjang Magang"
      : mode === "extend"
        ? "Perpanjang Kontrak"
        : mode === "promote"
          ? "Naik Menjadi Karyawan (PKWT)"
          : mode === "permanent"
            ? "Diangkat Karyawan Tetap (Permanen)"
            : "Tidak Diperpanjang / Tutup Kontrak";

  const decisionColor =
    mode === "extend_intern" || mode === "extend"
      ? "green"
      : mode === "promote"
        ? "purple"
        : mode === "permanent"
          ? "blue"
          : "red";

  return (
    <Box
      position="fixed"
      inset={0}
      bg="blackAlpha.600"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={onClose}
    >
      <Box
        bg="white"
        rounded="lg"
        shadow="lg"
        p={6}
        maxW="480px"
        w="full"
        onClick={(e) => e.stopPropagation()}
      >
        <Flex justify="space-between" align="flex-start" mb={1}>
          <Text fontSize="18px" fontWeight="700" color="gray.800">
            {subject?.name ?? "-"}
          </Text>
          <HelpButton onClick={tour.start} label="Help" />
        </Flex>
        <Text fontSize="13px" color="gray.500" mb={2}>
          {subjectLabel} · NPK: {subject?.npk ?? evaluation.npk ?? "-"} · End
          Contract:{" "}
          {evaluation.end_date
            ? new Date(evaluation.end_date).toLocaleDateString("id-ID")
            : "-"}
        </Text>

        {/* Info keputusan yang sudah ditentukan sejak evaluation dibuat */}
        <Box
          bg={`${decisionColor}.50`}
          border="1px solid"
          borderColor={`${decisionColor}.200`}
          rounded="md"
          px={3}
          py={2}
          mb={5}
          data-tour="decision-info-box"
        >
          <Text fontSize="13px" fontWeight="600" color={`${decisionColor}.700`}>
            Keputusan: {decisionLabel}
          </Text>
        </Box>

        {mode === "permanent" && (
          <Flex direction="column" gap={3}>
            <Box
              bg="blue.50"
              border="1px solid"
              borderColor="blue.200"
              rounded="md"
              p={3}
              data-tour="permanent-notice-box"
            >
              <Text fontSize="12px" color="blue.700">
                {subjectLabel} ini akan diubah menjadi karyawan tetap
                (permanent). Kontrak dan tanggal berakhir kontrak tidak berlaku
                lagi setelah ini.
              </Text>
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.500" mb={1}>
                Catatan
              </Text>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Opsional"
              />
            </Box>
            <HStack gap={2} mt={2}>
              <Button
                type="button"
                colorPalette="blue"
                loading={converting}
                loadingText="Memproses..."
                onClick={handleConvertToPermanent}
              >
                Konfirmasi Jadi Karyawan Tetap
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Batal
              </Button>
            </HStack>
          </Flex>
        )}

        {mode === "promote" && (
          <Flex direction="column" gap={3}>
            <Box data-tour="promote-start-date">
              <Text fontSize="12px" color="gray.500" mb={1}>
                Tanggal Mulai Kontrak PKWT *
              </Text>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Box>

            <Box data-tour="promote-duration-box">
              <Text fontSize="12px" color="gray.500" mb={1}>
                Durasi kontrak
              </Text>
              {extendMonths ? (
                <Box
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  rounded="md"
                  px={3}
                  py={2}
                >
                  <Text fontSize="14px" fontWeight="300" color="gray.700">
                    {extendMonths} bulan{" "}
                  </Text>
                </Box>
              ) : (
                <Box
                  bg="red.50"
                  border="1px solid"
                  borderColor="red.200"
                  rounded="md"
                  px={3}
                  py={2}
                >
                  <Text fontSize="12px" color="red.700">
                    Durasi belum diisi pada evaluation ini. Lengkapi durasi
                    (extend_months) di form evaluation terlebih dahulu.
                  </Text>
                </Box>
              )}
              {computedEndDatePreview && (
                <Text fontSize="12px" color="green.600" mt={1}>
                  Kontrak PKWT akan berakhir pada:{" "}
                  <b>{computedEndDatePreview}</b>
                </Text>
              )}
            </Box>

            <Box>
              <Text fontSize="12px" color="gray.500" mb={1}>
                Catatan
              </Text>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Opsional"
              />
            </Box>
            <HStack gap={2} mt={2}>
              <Button
                type="button"
                colorPalette="purple"
                loading={promoting}
                loadingText="Memproses..."
                onClick={handlePromoteToEmployee}
                disabled={!extendMonths || !pkwtNumber}
              >
                Konfirmasi Naik Jadi Karyawan
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Batal
              </Button>
            </HStack>
          </Flex>
        )}

        {(mode === "extend" || mode === "extend_intern") && (
          <Flex direction="column" gap={3}>
            <Box data-tour="extend-start-date">
              <Text fontSize="12px" color="gray.500" mb={1}>
                {mode === "extend_intern"
                  ? "Tanggal Mulai Magang Baru *"
                  : "Tanggal Mulai Kontrak Baru *"}
              </Text>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Box>

            <Box data-tour="extend-duration-box">
              <Text fontSize="12px" color="gray.500" mb={1}>
                {mode === "extend_intern"
                  ? "Lama Perpanjangan Magang"
                  : "Lama Perpanjangan"}
              </Text>
              {extendMonths ? (
                <Box
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                  rounded="md"
                  px={3}
                  py={2}
                >
                  <Text fontSize="14px" fontWeight="600" color="gray.700">
                    {extendMonths} bulan
                  </Text>
                </Box>
              ) : (
                <Box
                  bg="red.50"
                  border="1px solid"
                  borderColor="red.200"
                  rounded="md"
                  px={3}
                  py={2}
                >
                  <Text fontSize="12px" color="red.700">
                    Durasi belum diisi pada evaluation ini. Lengkapi durasi
                    (extend_months) di form evaluation terlebih dahulu.
                  </Text>
                </Box>
              )}
              {computedEndDatePreview && (
                <Text fontSize="12px" color="green.600" mt={1}>
                  {mode === "extend_intern" ? "Magang" : "Kontrak"} baru akan
                  berakhir pada: <b>{computedEndDatePreview}</b>
                </Text>
              )}
            </Box>

            <Box>
              <Text fontSize="12px" color="gray.500" mb={1}>
                Catatan
              </Text>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Opsional"
              />
            </Box>
            <HStack gap={2} mt={2}>
              <Button
                type="button"
                colorPalette="green"
                loading={extending}
                loadingText="Menyimpan..."
                onClick={handleExtend}
                disabled={!extendMonths}
              >
                Konfirmasi Perpanjangan
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Batal
              </Button>
            </HStack>
          </Flex>
        )}

        {mode === "close" && (
          <Flex direction="column" gap={3}>
            <Box data-tour="close-action-buttons">
              <Text fontSize="12px" color="gray.500" mb={2}>
                Pilih tindakan terhadap data manpower ini:
              </Text>
              <HStack gap={3}>
                <Button
                  type="button"
                  size="sm"
                  variant={closeAction === "deactivate" ? "solid" : "outline"}
                  colorPalette="orange"
                  onClick={() => setCloseAction("deactivate")}
                >
                  Nonaktifkan
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={closeAction === "delete" ? "solid" : "outline"}
                  colorPalette="red"
                  onClick={() => setCloseAction("delete")}
                >
                  Hapus Permanen
                </Button>
              </HStack>
            </Box>
            {closeAction === "delete" && (
              <Box
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                rounded="md"
                p={3}
              >
                <Text fontSize="12px" color="red.700" fontWeight="600">
                  ⚠️ Data {subjectLabel.toLowerCase()} dan seluruh riwayat
                  evaluasi terkait akan terhapus permanen. Tindakan ini tidak
                  bisa dibatalkan.
                </Text>
              </Box>
            )}
            <Box data-tour="close-reason">
              <Text fontSize="12px" color="gray.500" mb={1}>
                Alasan
              </Text>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Opsional"
              />
            </Box>
            <HStack gap={2} mt={2}>
              <Button
                type="button"
                colorPalette="red"
                loading={closing}
                loadingText="Memproses..."
                onClick={requestClose}
              >
                Konfirmasi
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Batal
              </Button>
            </HStack>
          </Flex>
        )}
      </Box>
      <ConfirmDialog
        open={confirmCloseOpen}
        onClose={() => setConfirmCloseOpen(false)}
        onConfirm={executeClose}
        title="Delete Contract Record"
        message={`Are you sure you want to permanently delete this ${subjectLabel.toLowerCase()}'s contract record? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="#ef4444"
        loading={closing}
        loadingText="Deleting..."
        icon={<FiAlertTriangle size={22} />}
      />
      {tour.isOpen && tour.currentStep && (
        <SpotlightTour
          step={tour.currentStep}
          stepIndex={tour.stepIndex}
          totalSteps={modalTourSteps.length}
          isLastStep={tour.isLastStep}
          onNext={tour.next}
          onSkip={tour.skip}
        />
      )}
    </Box>
  );
};

export default HrDecisionModal;
