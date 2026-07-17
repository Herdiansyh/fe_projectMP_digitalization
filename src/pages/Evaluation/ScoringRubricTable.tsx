// components/evaluation/ScoringRubricTable.tsx
import React, { useMemo } from "react";
import { Box, Text } from "@chakra-ui/react";
import type { EvaluationGroup } from "../../types/evaluation";

type Mode = "leader" | "section_head" | "readonly";

interface Props {
  criteriaGroups: EvaluationGroup[];
  /** Scores for current editor (LD when mode=leader, SH when mode=section_head) */
  scores: Record<number, number>;
  /** Leader scores — only used in mode=section_head to display disabled LD row */
  leaderScores?: Record<number, number>;
  onChange: (criteriaId: number, value: number) => void;
  mode?: Mode;
  unfilledIds?: number[]; // tambahan
}

// Grid kolom tetap: Kriteria | Bobot | N1 | N2 | N3 | N4 | N5 | Persetujuan
const GRID_TEMPLATE = "220px 70px repeat(5, 1fr) 90px";

const ScoringRubricTable: React.FC<Props> = ({
  criteriaGroups,
  scores,
  leaderScores = {},
  onChange,
  mode = "leader",
  unfilledIds = [],
}) => {
  const isSectionHead = mode === "section_head";
  const isReadonly = mode === "readonly";

  const totalWeight = useMemo(
    () =>
      criteriaGroups.reduce(
        (sum, g) =>
          sum +
          g.subgroups.reduce(
            (s, sg) =>
              s +
              sg.criteria.reduce((c, cr) => c + (Number(cr.weight) || 0), 0),
            0,
          ),
        0,
      ),
    [criteriaGroups],
  );

  const finalScore = useMemo(() => {
    let total = 0;
    criteriaGroups.forEach((g) =>
      g.subgroups.forEach((sg) =>
        sg.criteria.forEach((cr) => {
          const val = scores[cr.id];
          if (val) total += Number(val) * (Number(cr.weight) || 0);
        }),
      ),
    );
    return totalWeight ? Math.round((total / totalWeight) * 100) / 100 : 0;
  }, [criteriaGroups, scores, totalWeight]);

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      rounded="14px"
      overflow="hidden"
    >
      <Box overflowX="auto">
        <Box minW="960px">
          {/* ── Header ── */}
          <Box
            display="grid"
            style={{ gridTemplateColumns: GRID_TEMPLATE }}
            bg="#eef2f7"
            borderBottom="1px solid #dde3ea"
          >
            <HeaderCell>Kriteria</HeaderCell>
            <HeaderCell>
              Bobot
              <br />
              (B)
            </HeaderCell>
            <Box gridColumn="span 5">
              <Box textAlign="center" py={2} fontWeight="700" fontSize="13px">
                Nilai (N)
              </Box>
              <Box
                display="grid"
                gridTemplateColumns="repeat(5, 1fr)"
                borderTop="1px solid #dde3ea"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <Box
                    key={n}
                    textAlign="center"
                    py={2}
                    fontSize="13px"
                    fontWeight="700"
                    borderLeft={n > 1 ? "1px solid #dde3ea" : undefined}
                  >
                    {n}
                  </Box>
                ))}
              </Box>
            </Box>
            <HeaderCell>
              Persetujuan
              <br />
              Akhir
            </HeaderCell>
          </Box>

          {criteriaGroups.map((group) => (
            <Box key={group.id}>
              {/* Group row */}
              <Box
                display="grid"
                style={{ gridTemplateColumns: GRID_TEMPLATE }}
                bg="#e2e8f0"
                borderTop="1px solid #dde3ea"
              >
                <Box px={4} py={2.5} display="flex" alignItems="center">
                  <Text fontSize="13px" fontWeight="700" color="#1e293b">
                    {group.name}
                  </Text>
                </Box>
                <Box
                  gridColumn="span 6"
                  px={4}
                  py={2.5}
                  display="flex"
                  alignItems="center"
                >
                  {group.description && (
                    <Text fontSize="12px" fontWeight="600" color="#334155">
                      {group.description}
                    </Text>
                  )}
                </Box>
                <Box
                  px={2}
                  py={2.5}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="12px" fontWeight="700" color="#1e293b">
                    N X B
                  </Text>
                </Box>
              </Box>

              {group.subgroups.map((subgroup) => (
                <Box key={subgroup.id}>
                  {(subgroup.name || subgroup.description) && (
                    <Box
                      display="grid"
                      style={{ gridTemplateColumns: GRID_TEMPLATE }}
                      bg="#cbd5e1"
                      borderTop="1px solid #dde3ea"
                    >
                      <Box px={4} py={1.5} display="flex" alignItems="center">
                        {subgroup.name && (
                          <Text
                            fontSize="12px"
                            fontWeight="700"
                            color="#1e293b"
                          >
                            {subgroup.name}
                          </Text>
                        )}
                      </Box>
                      <Box
                        gridColumn="span 7"
                        px={4}
                        py={1.5}
                        display="flex"
                        alignItems="center"
                      >
                        {subgroup.description && (
                          <Text
                            fontSize="11px"
                            fontWeight="600"
                            color="#334155"
                            fontStyle="italic"
                          >
                            {subgroup.description}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  )}

                  {subgroup.criteria.map((criterion, idx) => {
                    const rowBg = idx % 2 === 0 ? "#eef6fb" : "#fdf6e8";
                    const shScore = scores[criterion.id];
                    const ldScore = leaderScores[criterion.id];
                    const isUnfilled = unfilledIds.includes(criterion.id);
                    const shSelectedOption = criterion.scale_options.find(
                      (o) => o.score === shScore,
                    );
                    const shNxB =
                      shSelectedOption && criterion.weight != null
                        ? Math.round(
                            Number(shSelectedOption.score) *
                              Number(criterion.weight) *
                              100,
                          ) / 100
                        : null;

                    // For leader/readonly mode, use single-row scores
                    const singleScore = scores[criterion.id];
                    const singleOption = criterion.scale_options.find(
                      (o) => o.score === singleScore,
                    );
                    const singleNxB =
                      singleOption && criterion.weight != null
                        ? Math.round(
                            Number(singleOption.score) *
                              Number(criterion.weight) *
                              100,
                          ) / 100
                        : null;

                    if (isSectionHead) {
                      // ── Single row: LD & SH radio side-by-side in each score cell ──
                      return (
                        <Box
                          key={criterion.id}
                          display="grid"
                          style={{ gridTemplateColumns: GRID_TEMPLATE }}
                          bg={isUnfilled ? "#fef2f2" : rowBg}
                          borderTop="1px solid #ffffff"
                          borderLeft={
                            isUnfilled
                              ? "3px solid #ef4444"
                              : "3px solid transparent"
                          }
                        >
                          {/* Kriteria */}
                          <Box px={4} py={3} display="flex" alignItems="center">
                            <Text
                              fontSize="13px"
                              fontWeight="700"
                              color="gray.800"
                            >
                              {criterion.name}
                            </Text>
                          </Box>
                          {/* Bobot */}
                          <Box
                            px={2}
                            py={3}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text
                              fontSize="13px"
                              fontWeight="600"
                              color="gray.700"
                            >
                              {criterion.weight}
                            </Text>
                          </Box>
                          {/* 5 score cells — each contains LD + SH radio side by side */}
                          {criterion.scale_options
                            .sort((a, b) => a.order - b.order)
                            .map((option, oIdx) => {
                              const isLdActive = ldScore === option.score;
                              const isShActive = shScore === option.score;
                              return (
                                <Box
                                  key={option.id}
                                  borderLeft={
                                    oIdx > 0 ? "1px solid #e2e8f0" : undefined
                                  }
                                  px={1}
                                  py={2}
                                  display="flex"
                                  flexDirection="column"
                                  alignItems="center"
                                  gap={1}
                                  bg={
                                    isLdActive && isShActive
                                      ? "linear-gradient(135deg, #dbeafe 50%, #dcfce7 50%)"
                                      : isLdActive
                                        ? "#dbeafe"
                                        : isShActive
                                          ? "#dcfce7"
                                          : "transparent"
                                  }
                                  transition="background 0.15s"
                                >
                                  {/* Description text (shared) */}
                                  <Text
                                    fontSize="10px"
                                    color={
                                      isLdActive || isShActive
                                        ? "gray.700"
                                        : "gray.500"
                                    }
                                    fontWeight={
                                      isLdActive || isShActive ? "600" : "400"
                                    }
                                    textAlign="center"
                                    lineHeight="1.3"
                                    mb={1}
                                  >
                                    {option.description}
                                  </Text>
                                  {/* LD & SH radio buttons side by side */}
                                  <Box
                                    display="flex"
                                    gap={2}
                                    alignItems="center"
                                  >
                                    {/* LD — disabled */}
                                    <Box
                                      display="flex"
                                      flexDirection="column"
                                      alignItems="center"
                                      gap={0.5}
                                    >
                                      <Text
                                        fontSize="9px"
                                        fontWeight="700"
                                        color={
                                          isLdActive ? "#1d4ed8" : "#94a3b8"
                                        }
                                      >
                                        LD
                                      </Text>
                                      <Box
                                        w="18px"
                                        h="18px"
                                        rounded="full"
                                        border="2.5px solid"
                                        borderColor={
                                          isLdActive ? "#2563eb" : "#cbd5e1"
                                        }
                                        bg={isLdActive ? "#2563eb" : "#f1f5f9"}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                        cursor="not-allowed"
                                        title="Leader score (read-only)"
                                        boxShadow={
                                          isLdActive
                                            ? "0 0 0 3px #bfdbfe"
                                            : "none"
                                        }
                                      >
                                        {isLdActive && (
                                          <Box
                                            w="7px"
                                            h="7px"
                                            rounded="full"
                                            bg="white"
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                    {/* SH — editable */}
                                    <Box
                                      display="flex"
                                      flexDirection="column"
                                      alignItems="center"
                                      gap={0.5}
                                      as="button"
                                      type="button"
                                      onClick={() =>
                                        onChange(criterion.id, option.score)
                                      }
                                      cursor="pointer"
                                      title="Section Head score"
                                    >
                                      <Text
                                        fontSize="9px"
                                        fontWeight="700"
                                        color={
                                          isShActive ? "#16a34a" : "#94a3b8"
                                        }
                                      >
                                        SH
                                      </Text>
                                      <Box
                                        w="18px"
                                        h="18px"
                                        rounded="full"
                                        border="2.5px solid"
                                        borderColor={
                                          isShActive ? "#16a34a" : "#94a3b8"
                                        }
                                        bg={
                                          isShActive ? "#16a34a" : "transparent"
                                        }
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                        _hover={{
                                          borderColor: "#16a34a",
                                          bg: isShActive
                                            ? "#16a34a"
                                            : "#f0fdf4",
                                        }}
                                        transition="all 0.12s"
                                        boxShadow={
                                          isShActive
                                            ? "0 0 0 3px #bbf7d0"
                                            : "none"
                                        }
                                      >
                                        {isShActive && (
                                          <Box
                                            w="7px"
                                            h="7px"
                                            rounded="full"
                                            bg="white"
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                  </Box>
                                </Box>
                              );
                            })}
                          {/* Persetujuan Akhir — SH N×B */}
                          <Box
                            px={2}
                            py={3}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderLeft="1px solid #e2e8f0"
                          >
                            <Text
                              fontSize="13px"
                              fontWeight="700"
                              color={
                                shNxB !== null && !isNaN(shNxB)
                                  ? "#15803d"
                                  : "gray.400"
                              }
                            >
                              {shNxB !== null && !isNaN(shNxB) ? shNxB : "-"}
                            </Text>
                          </Box>
                        </Box>
                      );
                    }

                    // ── Single row: leader or readonly ──
                    return (
                      <Box
                        key={criterion.id}
                        display="grid"
                        style={{ gridTemplateColumns: GRID_TEMPLATE }}
                        bg={isUnfilled ? "#fef2f2" : rowBg}
                        borderTop="1px solid #ffffff"
                        borderLeft={
                          isUnfilled
                            ? "3px solid #ef4444"
                            : "3px solid transparent"
                        }
                      >
                        <Box px={4} py={3} display="flex" alignItems="center">
                          <Text
                            fontSize="13px"
                            fontWeight="700"
                            color="gray.800"
                          >
                            {criterion.name}
                          </Text>
                          {isUnfilled && (
                            <Text
                              fontSize="10px"
                              fontWeight="700"
                              color="#ef4444"
                              mt={0.5}
                            >
                              Wajib diisi
                            </Text>
                          )}
                        </Box>
                        <Box
                          px={2}
                          py={3}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text
                            fontSize="13px"
                            fontWeight="600"
                            color="gray.700"
                          >
                            {criterion.weight}
                          </Text>
                        </Box>

                        {criterion.scale_options
                          .sort((a, b) => a.order - b.order)
                          .map((option, oIdx) => {
                            const isActive = singleScore === option.score;
                            return (
                              <Box
                                key={option.id}
                                as={isReadonly ? "div" : "button"}
                                type={isReadonly ? undefined : "button"}
                                onClick={
                                  isReadonly
                                    ? undefined
                                    : () => onChange(criterion.id, option.score)
                                }
                                borderLeft={
                                  oIdx > 0 ? "1px solid #ffffff" : undefined
                                }
                                px={2}
                                py={2}
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="space-between"
                                gap={2}
                                cursor={isReadonly ? "default" : "pointer"}
                                bg={isActive ? "#dbeafe" : "transparent"}
                                _hover={
                                  isReadonly
                                    ? undefined
                                    : { bg: isActive ? "#dbeafe" : "#ffffffaa" }
                                }
                                transition="background-color 0.12s"
                              >
                                <Text
                                  fontSize="11.5px"
                                  color={isActive ? "#1d4ed8" : "gray.600"}
                                  fontWeight={isActive ? "600" : "400"}
                                  textAlign="center"
                                  lineHeight="1.35"
                                >
                                  {option.description}
                                </Text>
                                <Box
                                  w="18px"
                                  h="18px"
                                  rounded="full"
                                  border="2px solid"
                                  borderColor={isActive ? "#2563eb" : "#94a3b8"}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  flexShrink={0}
                                >
                                  {isActive && (
                                    <Box
                                      w="9px"
                                      h="9px"
                                      rounded="full"
                                      bg="#2563eb"
                                    />
                                  )}
                                </Box>
                              </Box>
                            );
                          })}

                        <Box
                          px={2}
                          py={3}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          borderLeft="1px solid #ffffff"
                        >
                          <Text
                            fontSize="13px"
                            fontWeight="700"
                            color={
                              singleNxB !== null && !isNaN(singleNxB)
                                ? "#1d4ed8"
                                : "gray.400"
                            }
                          >
                            {singleNxB !== null && !isNaN(singleNxB)
                              ? singleNxB
                              : "-"}
                          </Text>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          ))}

          {/* Total */}
          <Box
            display="grid"
            style={{ gridTemplateColumns: GRID_TEMPLATE }}
            bg="#1e293b"
            borderTop="1px solid #0f172a"
          >
            <Box
              gridColumn="span 7"
              px={4}
              py={3}
              display="flex"
              alignItems="center"
              gap={3}
            >
              <Text fontSize="14px" fontWeight="700" color="white">
                Hasil Nilai {isSectionHead ? "(SH)" : ""}
              </Text>
              <Text
                fontSize="12px"
                fontWeight="600"
                color={totalWeight === 100 ? "#4ade80" : "#fca5a5"}
              >
                (Total Bobot: {totalWeight})
              </Text>
            </Box>
            <Box
              px={2}
              py={3}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="16px" fontWeight="800" color="#60a5fa">
                {!isNaN(finalScore) ? finalScore : 0}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const HeaderCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    px={3}
    py={2}
    display="flex"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    fontSize="13px"
    fontWeight="700"
    color="gray.800"
  >
    {children}
  </Box>
);

export default ScoringRubricTable;
