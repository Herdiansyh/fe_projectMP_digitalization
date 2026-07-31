import type { TourStep } from "../../hooks/useTourGuide";

export const evaluationFormTourSteps = (
  isIntern: boolean,
  isEditMode: boolean,
  isPrefilled: boolean,
): TourStep[] => {
  const steps: TourStep[] = [];

  if (!isEditMode && !isPrefilled) {
    steps.push(
      {
        target: "subject-type-tabs",
        title: "Pilih Jenis Subjek",
        description:
          "Tentukan apakah evaluasi ini untuk Employee (karyawan kontrak) atau Intern (peserta magang). Alur pengisian akan menyesuaikan secara otomatis.",
      },
      {
        target: "subject-select",
        title: "Pilih Orang yang Dievaluasi",
        description:
          "Data NPK, jabatan, dan tanggal kontrak akan otomatis terisi setelah kamu memilih.",
      },
    );
  }

  if (!isIntern) {
    steps.push({
      target: "scoring-rubric",
      title: "Isi Penilaian Evaluasi",
      description:
        "Wajib diisi untuk Employee. Kamu mengisi skor sebagai Leader (LD), lalu Section Head akan mengisi skornya sendiri (SH) di tahap berikutnya sebagai pembanding.",
    });
  } else {
    steps.push({
      target: "intern-no-scoring-note",
      title: "Intern Tidak Perlu Penilaian Evaluasi",
      description:
        "Kenaikan status Intern tidak ditentukan dari skor penilaian, melainkan langsung dari keputusan di bagian Recommendation di bawah.",
    });
  }

  steps.push({
    target: "decision-dropdown",
    title: "Tentukan Keputusan",
    description: isIntern
      ? "Pilih 'Perpanjang Kontrak' baik untuk memperpanjang masa magang MAUPUN menaikkan intern jadi karyawan — perbedaannya ada di langkah berikutnya."
      : "Pilih status akhir: Permanen, Kontrak Berakhir, atau Perpanjang Kontrak.",
  });

  steps.push({
    target: "extend-pkwt-checkbox",
    title: isIntern
      ? "Ini yang Menentukan Intern Naik Jadi Employee"
      : "Perpanjangan Kontrak Employee",
    description: isIntern
      ? "Centang 'Extend PKWT' jika intern akan diangkat menjadi karyawan (PKWT). Jika TIDAK dicentang, intern tetap berstatus magang — hanya kontraknya diperpanjang."
      : "Centang jika status 'Perpanjang Kontrak' dipilih, lalu isi nomor PKWT dan durasinya di bawah.",
  });

  steps.push({
    target: "pkwt-number-input",
    title: "Isi Nomor & Durasi PKWT",
    description: isIntern
      ? "Wajib diisi kalau Extend PKWT dicentang — ini jadi dasar HR membuatkan kontrak karyawan baru untuk intern ini."
      : "Isi nomor PKWT dan durasi perpanjangan dalam bulan.",
  });

  steps.push({
    target: "recommendation-notes",
    title: "Catatan Tambahan",
    description:
      "Opsional. Gunakan untuk menjelaskan alasan atau konteks keputusan ke Section Head maupun HR.",
  });

  return steps;
};
