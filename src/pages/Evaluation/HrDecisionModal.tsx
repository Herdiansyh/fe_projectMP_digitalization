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
  useCloseContract,
} from "../../hooks/queries/useEvaluationQueries";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { FiAlertTriangle } from "react-icons/fi";

interface HrDecisionModalProps {
  evaluation: Evaluation;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

type Mode = "choose" | "extend" | "close";

const HrDecisionModal: React.FC<HrDecisionModalProps> = ({
  evaluation,
  onClose,
  onSuccess,
  onError,
}) => {
  const [mode, setMode] = useState<Mode>("choose");
  const isInternSubject = !!evaluation.intern_id;
  const subject = isInternSubject ? evaluation.intern : evaluation.employee;
  const subjectLabel = isInternSubject ? "Intern" : "Employee";
  const [extendMonths, setExtendMonths] = useState("");
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
  const { mutate: closeContract, isPending: closing } = useCloseContract();
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
    const months = Number(extendMonths);
    if (!startDate) {
      onError("Tanggal mulai kontrak baru wajib diisi");
      return;
    }
    if (!months || months <= 0) {
      onError("Lama perpanjangan (bulan) wajib diisi");
      return;
    }
    extendContract(
      {
        id: evaluation.id,
        payload: {
          start_date: startDate,
          extend_months: months,
          notes: notes || null,
        },
      },
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
        <Text fontSize="18px" fontWeight="700" color="gray.800" mb={1}>
          {subject?.name ?? "-"}
        </Text>
        <Text fontSize="13px" color="gray.500" mb={5}>
          {subjectLabel} · NPK: {subject?.npk ?? evaluation.npk ?? "-"} · End
          Contract:{" "}
          {evaluation.end_date
            ? new Date(evaluation.end_date).toLocaleDateString("id-ID")
            : "-"}
        </Text>

        {mode === "choose" && (
          <Flex direction="column" gap={3}>
            <Button
              type="button"
              colorPalette="green"
              onClick={() => setMode("extend")}
            >
              Perpanjang Kontrak
            </Button>
            <Button
              type="button"
              colorPalette="red"
              variant="outline"
              onClick={() => setMode("close")}
            >
              Tidak Diperpanjang / Tutup Kontrak
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
          </Flex>
        )}

        {mode === "extend" && (
          <Flex direction="column" gap={3}>
            <Box>
              <Text fontSize="12px" color="gray.500" mb={1}>
                Tanggal Mulai Kontrak Baru *
              </Text>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.500" mb={1}>
                Lama Perpanjangan (bulan) *
              </Text>
              <Input
                type="number"
                min={1}
                value={extendMonths}
                onChange={(e) => setExtendMonths(e.target.value)}
                placeholder="Contoh: 3"
              />
              {computedEndDatePreview && (
                <Text fontSize="12px" color="green.600" mt={1}>
                  Kontrak baru akan berakhir pada:{" "}
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
                colorPalette="green"
                loading={extending}
                loadingText="Menyimpan..."
                onClick={handleExtend}
              >
                Konfirmasi Perpanjangan
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode("choose")}
              >
                Kembali
              </Button>
            </HStack>
          </Flex>
        )}

        {mode === "close" && (
          <Flex direction="column" gap={3}>
            <Box>
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
            <Box>
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
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode("choose")}
              >
                Kembali
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
    </Box>
  );
};

export default HrDecisionModal;
