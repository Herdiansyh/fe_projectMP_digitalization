import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import evaluationService from "../../services/evaluationService";
import type { Evaluation } from "../../types/evaluation";

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
  const [saving, setSaving] = useState(false);

  // Extend form state
  const [newEndContract, setNewEndContract] = useState("");
  const [pkwtNumber, setPkwtNumber] = useState("");
  const [extendMonths, setExtendMonths] = useState("");
  const [notes, setNotes] = useState("");

  // Close form state
  const [closeAction, setCloseAction] = useState<"deactivate" | "delete">(
    "deactivate",
  );
  const [reason, setReason] = useState("");

  const handleExtend = async () => {
    if (!newEndContract) {
      onError("Tanggal kontrak baru wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await evaluationService.extendContract(evaluation.id, {
        new_end_contract: newEndContract,
        pkwt_number: pkwtNumber || null,
        extend_months: extendMonths ? Number(extendMonths) : null,
        notes: notes || null,
      });
      onSuccess();
    } catch {
      onError("Failed to extend contract");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    setSaving(true);
    try {
      await evaluationService.closeContract(evaluation.id, {
        action: closeAction,
        reason: reason || null,
      });
      onSuccess();
    } catch {
      onError("Failed to close contract");
    } finally {
      setSaving(false);
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
          {evaluation.employee?.name ?? "-"}
        </Text>
        <Text fontSize="13px" color="gray.500" mb={5}>
          NPK: {evaluation.employee?.npk ?? evaluation.npk ?? "-"} · End
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
                Tanggal Kontrak Baru *
              </Text>
              <Input
                type="date"
                value={newEndContract}
                onChange={(e) => setNewEndContract(e.target.value)}
              />
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.500" mb={1}>
                Nomor PKWT
              </Text>
              <Input
                value={pkwtNumber}
                onChange={(e) => setPkwtNumber(e.target.value)}
                placeholder="Opsional"
              />
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.500" mb={1}>
                Lama Perpanjangan (bulan)
              </Text>
              <Input
                type="number"
                value={extendMonths}
                onChange={(e) => setExtendMonths(e.target.value)}
                placeholder="Opsional"
              />
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
                loading={saving}
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
                  ⚠️ Data employee dan seluruh riwayat evaluasi terkait akan
                  terhapus permanen. Tindakan ini tidak bisa dibatalkan.
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
                loading={saving}
                loadingText="Memproses..."
                onClick={handleClose}
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
    </Box>
  );
};

export default HrDecisionModal;
