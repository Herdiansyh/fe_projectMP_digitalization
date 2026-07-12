import type { CompetencyMatrix } from "../../types/competency";

export interface ExistingGroup {
  sequence: number;
  mainProcess: string;
}

// ── Kumpulkan semua kombinasi (sequence, main_process) unik yang sudah
//    dipakai di seluruh kategori pada satu matrix — dipakai sebagai daftar
//    pilihan (datalist) supaya admin gampang menyambungkan checkpoint baru
//    ke grup/baris main-process yang sudah ada. ──
export function collectExistingGroups(
  matrix: CompetencyMatrix,
): ExistingGroup[] {
  const map = new Map<string, ExistingGroup>();

  matrix.categories.forEach((cat) => {
    cat.checkpoints.forEach((cp) => {
      if (cp.sequence != null && cp.main_process) {
        map.set(`${cp.sequence}-${cp.main_process}`, {
          sequence: cp.sequence,
          mainProcess: cp.main_process,
        });
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => a.sequence - b.sequence);
}
