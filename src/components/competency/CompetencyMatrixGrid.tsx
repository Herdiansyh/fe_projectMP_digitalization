import React, { useMemo } from "react";
import { Box, Text } from "@chakra-ui/react";
import type {
  CompetencyMatrix,
  CompetencyCheckpoint,
} from "../../types/competency";

interface Props {
  matrix: CompetencyMatrix;
  mode: "setup" | "assessment";
  scores?: Record<number, number>;
  onScoreChange?: (checkpointId: number, point: number) => void;
  /** Opsional: nilai Leader, ditampilkan sebagai referensi kecil saat QA menilai. */
  referenceScores?: Record<number, number>;
}

interface RowGroup {
  key: string;
  sequence: number | null;
  mainProcess: string | null;
}

const BORDER = "1px solid #d9e2ec";
const HEADER_BG = "#eaf1f9";
const SUBHEADER_BG = "#f4f8fc";
const AGG_BG = "#f1f5f9";
const AGG_BG_2 = "#f8fafc";

// ── Kumpulkan baris unik (sequence + main_process), urut berdasarkan sequence
//    (yang tanpa sequence ditaruh di akhir sebagai "General"). ──
function buildRowGroups(matrix: CompetencyMatrix): RowGroup[] {
  const map = new Map<string, RowGroup>();

  matrix.categories.forEach((cat) => {
    cat.checkpoints.forEach((cp) => {
      const seq = cp.sequence ?? null;
      const label = cp.main_process ?? null;
      const key = seq !== null ? `seq-${seq}` : "general";
      if (!map.has(key)) {
        map.set(key, { key, sequence: seq, mainProcess: label });
      } else if (!map.get(key)!.mainProcess && label) {
        map.get(key)!.mainProcess = label;
      }
    });
  });

  const groups = Array.from(map.values());
  groups.sort((a, b) => {
    if (a.sequence === null) return 1;
    if (b.sequence === null) return -1;
    return a.sequence - b.sequence;
  });
  return groups;
}

function checkpointsFor(
  cat: CompetencyMatrix["categories"][number],
  row: RowGroup,
): CompetencyCheckpoint[] {
  return cat.checkpoints
    .filter((cp) => {
      const seq = cp.sequence ?? null;
      return row.sequence === null ? seq === null : seq === row.sequence;
    })
    .sort((a, b) => a.order - b.order);
}

const PointSelect: React.FC<{
  value: number | null;
  onChange?: (point: number) => void;
}> = ({ value, onChange }) => {
  const hasValue = value !== null && value !== undefined;
  return (
    <select
      value={hasValue ? value : ""}
      disabled={!onChange}
      onChange={(e) => onChange?.(Number(e.target.value))}
      style={{
        width: "44px",
        padding: "3px 2px",
        fontSize: "12px",
        fontWeight: 700,
        textAlign: "center",
        color: hasValue ? "#1A5EA8" : "#94a3b8",
        backgroundColor: hasValue ? "#eaf1f9" : "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        cursor: onChange ? "pointer" : "not-allowed",
      }}
    >
      <option value="" disabled>
        -
      </option>
      {[0, 1].map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
};

const CompetencyMatrixGrid: React.FC<Props> = ({
  matrix,
  mode,
  scores,
  onScoreChange,
  referenceScores,
}) => {
  const rowGroups = useMemo(() => buildRowGroups(matrix), [matrix]);

  // ── Untuk tiap row group, hitung berapa baris fisik dibutuhkan
  //    (= jumlah checkpoint terbanyak di antara semua kategori pada group itu). ──
  const rowsWithHeight = useMemo(() => {
    return rowGroups.map((group) => {
      const perCategory = matrix.categories.map((cat) =>
        checkpointsFor(cat, group),
      );
      const height = Math.max(1, ...perCategory.map((cps) => cps.length));
      return { group, perCategory, height };
    });
  }, [rowGroups, matrix]);

  // ── Total/Average per kategori. Setup: total weight. Assessment: rumus asli. ──
  const categoryStats = useMemo(() => {
    return matrix.categories.map((cat) => {
      if (mode === "setup") {
        const totalWeight = cat.checkpoints.reduce((s, cp) => s + cp.weight, 0);
        const count = cat.checkpoints.length;
        return {
          categoryId: cat.id,
          total: totalWeight,
          average: count > 0 ? totalWeight / count : 0,
          filledCount: 0,
        };
      }
      const filled = cat.checkpoints.filter(
        (cp) => scores?.[cp.id] !== undefined,
      );
      const total = filled.reduce(
        (s, cp) => s + cp.weight * (scores![cp.id] ?? 0),
        0,
      );
      return {
        categoryId: cat.id,
        total,
        average: filled.length > 0 ? total / filled.length : 0,
        filledCount: filled.length,
      };
    });
  }, [matrix, mode, scores]);

  const finalScore = useMemo(() => {
    if (mode !== "assessment") return null;
    const withData = categoryStats.filter((c) => c.filledCount > 0);
    if (withData.length === 0) return null;
    const sum = withData.reduce((s, c) => s + c.average, 0);
    return sum / withData.length;
  }, [categoryStats, mode]);

  const aggLabel = mode === "setup" ? "WEIGHT" : "POINT";

  return (
    <Box overflowX="auto" borderRadius="8px" border={BORDER}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          {/* Baris 1: SEQ | MAIN PROCESS | nama kategori (colSpan 4) */}
          <tr>
            <th
              rowSpan={2}
              style={{
                border: BORDER,
                background: HEADER_BG,
                padding: "8px",
                fontSize: "10px",
                width: "50px",
              }}
            >
              SEQ
            </th>
            <th
              rowSpan={2}
              style={{
                border: BORDER,
                background: HEADER_BG,
                padding: "8px",
                fontSize: "10px",
                minWidth: "150px",
              }}
            >
              MAIN PROCESS
            </th>
            {matrix.categories.map((cat) => (
              <th
                key={cat.id}
                colSpan={4}
                style={{
                  border: BORDER,
                  background: HEADER_BG,
                  padding: "8px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#1A5EA8",
                  textTransform: "uppercase",
                }}
              >
                {cat.name}
              </th>
            ))}
          </tr>
          {/* Baris 2: CHECK POINT | WEIGHT | POINT | TOTAL POINT per kategori */}
          <tr>
            {matrix.categories.map((cat) => (
              <React.Fragment key={cat.id}>
                <th
                  style={{
                    border: BORDER,
                    background: SUBHEADER_BG,
                    padding: "6px",
                    fontSize: "10px",
                    minWidth: "220px",
                  }}
                >
                  CHECK POINT
                </th>
                <th
                  style={{
                    border: BORDER,
                    background: SUBHEADER_BG,
                    padding: "6px",
                    fontSize: "10px",
                    width: "56px",
                  }}
                >
                  WEIGHT
                </th>
                <th
                  style={{
                    border: BORDER,
                    background: SUBHEADER_BG,
                    padding: "6px",
                    fontSize: "10px",
                    width: "56px",
                  }}
                >
                  POINT
                </th>
                <th
                  style={{
                    border: BORDER,
                    background: SUBHEADER_BG,
                    padding: "6px",
                    fontSize: "10px",
                    width: "64px",
                  }}
                >
                  TOTAL POINT
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowsWithHeight.map(({ group, perCategory, height }) => (
            <React.Fragment key={group.key}>
              {Array.from({ length: height }).map((_, rowIdx) => (
                <tr key={`${group.key}-${rowIdx}`}>
                  {rowIdx === 0 && (
                    <>
                      <td
                        rowSpan={height}
                        style={{
                          border: BORDER,
                          padding: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#334155",
                          background: "#fbfcfe",
                          textAlign: "center",
                        }}
                      >
                        {group.sequence ?? "-"}
                      </td>
                      <td
                        rowSpan={height}
                        style={{
                          border: BORDER,
                          padding: "6px 8px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#334155",
                          background: "#fbfcfe",
                        }}
                      >
                        {group.mainProcess ??
                          (group.sequence === null ? "General" : "-")}
                      </td>
                    </>
                  )}

                  {matrix.categories.map((cat, catIdx) => {
                    const cp = perCategory[catIdx][rowIdx];
                    if (!cp) {
                      return (
                        <React.Fragment key={cat.id}>
                          <td style={{ border: BORDER, padding: "6px" }} />
                          <td style={{ border: BORDER, padding: "6px" }} />
                          <td style={{ border: BORDER, padding: "6px" }} />
                          <td style={{ border: BORDER, padding: "6px" }} />
                        </React.Fragment>
                      );
                    }
                    const point = scores?.[cp.id] ?? null;
                    const totalPoint =
                      point !== null ? cp.weight * point : null;
                    return (
                      <React.Fragment key={cat.id}>
                        <td
                          style={{
                            border: BORDER,
                            padding: "6px 8px",
                            fontSize: "12px",
                            color: "#374151",
                          }}
                        >
                          {cp.description}
                        </td>
                        <td
                          style={{
                            border: BORDER,
                            padding: "6px",
                            fontSize: "12px",
                            textAlign: "center",
                            color: "#1A5EA8",
                            fontWeight: 700,
                          }}
                        >
                          {cp.weight}
                        </td>
                        <td
                          style={{
                            border: BORDER,
                            padding: "6px",
                            textAlign: "center",
                          }}
                        >
                          {mode === "assessment" ? (
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              gap="2px"
                            >
                              <PointSelect
                                value={point}
                                onChange={
                                  onScoreChange
                                    ? (p) => onScoreChange(cp.id, p)
                                    : undefined
                                }
                              />
                              {referenceScores?.[cp.id] !== undefined && (
                                <Text fontSize="9px" color="gray.400">
                                  Leader: {referenceScores[cp.id]}
                                </Text>
                              )}
                            </Box>
                          ) : (
                            <Text fontSize="12px" color="gray.300">
                              -
                            </Text>
                          )}
                        </td>
                        <td
                          style={{
                            border: BORDER,
                            padding: "6px",
                            fontSize: "12px",
                            textAlign: "center",
                            fontWeight: 700,
                            color: "#334155",
                          }}
                        >
                          {mode === "assessment" ? (totalPoint ?? "-") : "-"}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}

          {/* Baris TOTAL — label "TOTAL POINT" di kiri (rowSpan 2, gaya dashed teal),
              lalu tiap kategori: label "TOTAL <AGG> <NAMA KATEGORI>" (colSpan 3) + value (colSpan 1) */}
          <tr>
            <td
              rowSpan={2}
              style={{
                border: "1px dashed #0f766e",
                padding: "8px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#0f766e",
                background: "#ffffff",
                textAlign: "center",
              }}
              colSpan={2}
            >
              TOTAL {aggLabel}
            </td>
            {categoryStats.map((c, idx) => (
              <React.Fragment key={c.categoryId}>
                <td
                  colSpan={3}
                  style={{
                    border: BORDER,
                    padding: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    background: AGG_BG,
                  }}
                >
                  TOTAL {aggLabel} {matrix.categories[idx].name.toUpperCase()}
                </td>
                <td
                  style={{
                    border: BORDER,
                    padding: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#1A5EA8",
                    background: AGG_BG,
                    textAlign: "center",
                  }}
                >
                  {c.total}
                </td>
              </React.Fragment>
            ))}
          </tr>
          {/* Baris AVERAGE */}
          <tr>
            {categoryStats.map((c, idx) => (
              <React.Fragment key={c.categoryId}>
                <td
                  colSpan={3}
                  style={{
                    border: BORDER,
                    padding: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    background: AGG_BG_2,
                  }}
                >
                  AVERAGE {aggLabel} {matrix.categories[idx].name.toUpperCase()}
                </td>
                <td
                  style={{
                    border: BORDER,
                    padding: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#334155",
                    background: AGG_BG_2,
                    textAlign: "center",
                  }}
                >
                  {c.average.toFixed(2)}
                </td>
              </React.Fragment>
            ))}
          </tr>

          {/* Baris TOTAL POINT MATRIX SKILL — hanya relevan saat sudah ada nilai (mode assessment) */}
          {mode === "assessment" && (
            <tr>
              <td
                colSpan={1 + matrix.categories.length * 4}
                style={{
                  border: BORDER,
                  padding: "10px",
                  fontSize: "13px",
                  fontWeight: 800,
                  textAlign: "center",
                  background: "#fbd38d",
                  color: "#1a202c",
                }}
              >
                TOTAL POINT MATRIX SKILL
              </td>
              <td
                style={{
                  border: BORDER,
                  padding: "10px",
                  fontSize: "14px",
                  fontWeight: 800,
                  textAlign: "center",
                  background: "#fbd38d",
                  color: "#1a202c",
                }}
              >
                {finalScore !== null ? finalScore.toFixed(2) : "-"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Box>
  );
};

export default CompetencyMatrixGrid;
