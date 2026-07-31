import type { TourStep } from "../../hooks/useTourGuide";

interface EvaluationListTourParams {
  canSeeWorklist: boolean;
}

export const evaluationListTourSteps = ({
  canSeeWorklist,
}: EvaluationListTourParams): TourStep[] => {
  const steps: TourStep[] = [
    {
      target: "tab-employee-intern",
      title: "Tab Employee & Intern",
      description:
        "Data evaluasi Employee dan Intern dipisah di sini. Angka merah di sebelah tab menunjukkan jumlah evaluasi yang butuh tindakan kamu di masing-masing kategori.",
    },
  ];

  if (canSeeWorklist) {
    steps.push({
      target: "needs-evaluation-table",
      title: "Worklist Perlu Dievaluasi",
      description:
        "Daftar ini muncul otomatis untuk karyawan atau intern yang kontraknya akan berakhir dalam 30 hari ke depan. Klik 'Buat Evaluasi' untuk langsung membuat evaluasi baru dengan data yang sudah terisi otomatis.",
    });
  }

  steps.push(
    {
      target: "history-search-filter",
      title: "Cari & Filter Riwayat",
      description:
        "Gunakan kolom pencarian untuk mencari berdasarkan nama atau NPK, atau gunakan filter status untuk menyaring riwayat evaluasi yang sudah dibuat.",
    },
    {
      target: "history-table",
      title: "Riwayat Evaluasi",
      description:
        "Klik salah satu baris untuk membuka detail evaluasi. Evaluasi berstatus 'Draft' bisa dibatalkan langsung dari sini menggunakan tombol Cancel.",
    },
  );

  return steps;
};
