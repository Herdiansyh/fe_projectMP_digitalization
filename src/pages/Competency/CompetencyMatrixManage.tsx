import React, { useState, useEffect } from "react";
import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { FiLayers } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import matrixManagementService from "../../services/matrixManagementService";
import stationService from "../../services/stationService";
import type { CompetencyMatrix } from "../../types/competency";
import type { Station } from "../../types/station";
import CreateMatrixForm from "../../components/CreateMatrixForm";
import MatrixCard from "../../components/MatrixCard";

// ── Halaman utama: Manage Competency Matrix ──
const CompetencyMatrixManage: React.FC = () => {
  const [matrices, setMatrices] = useState<CompetencyMatrix[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchAll = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const [matrixRes, stationRes] = await Promise.all([
        matrixManagementService.getMatrices(),
        stationService.getStations(),
      ]);
      setMatrices(matrixRes.data);
      setStations(stationRes.data);
    } catch {
      alert("Failed to load competency matrices.");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  return (
    <MainLayout>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <HStack gap={3}>
            <Box
              w="40px"
              h="40px"
              borderRadius="10px"
              bg="#eaf1f9"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiLayers size={18} color="#1A5EA8" />
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Manage Competency Matrix
              </Text>
              <Text fontSize="13px" color="gray.500" mt={0.5}>
                Setup rubrik penilaian kompetensi per station
              </Text>
            </Box>
          </HStack>
        </Flex>

        <CreateMatrixForm stations={stations} onCreated={fetchAll} />

        {loading ? (
          <Flex justify="center" py={10}>
            <Text color="gray.500" fontSize="14px">
              Loading...
            </Text>
          </Flex>
        ) : matrices.length === 0 ? (
          <Flex justify="center" py={10}>
            <Text color="gray.400" fontSize="14px">
              No competency matrix created yet
            </Text>
          </Flex>
        ) : (
          matrices.map((m) => (
            <MatrixCard
              key={m.id}
              matrix={m}
              stations={stations}
              onRefresh={() => fetchAll({ silent: true })}
            />
          ))
        )}
      </Box>
    </MainLayout>
  );
};

export default CompetencyMatrixManage;
