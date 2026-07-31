import type { TourStep } from "../../hooks/useTourGuide";

export type HrDecisionMode =
  | "extend"
  | "extend_intern"
  | "promote"
  | "permanent"
  | "close";

interface HrDecisionTourParams {
  mode: HrDecisionMode;
  isInternSubject: boolean;
}

export const hrDecisionTourSteps = ({
  mode,
  isInternSubject,
}: HrDecisionTourParams): TourStep[] => {
  const steps: TourStep[] = [
    {
      target: "decision-info-box",
      title: "Keputusan Sudah Ditentukan Leader",
      description:
        "Kotak ini menampilkan keputusan yang sudah dipilih Leader dan sudah approve section head saat membuat evaluasi. HR tidak perlu memilih ulang, cukup mengeksekusi sesuai keputusan yang tertera.",
    },
  ];

  if (mode === "extend_intern") {
    steps.push(
      {
        target: "extend-start-date",
        title: "Tanggal Mulai Magang Baru",
        description:
          "Isi tanggal mulai kontrak magang yang baru. Intern ini TETAP berstatus magang — hanya durasinya diperpanjang.",
      },
      {
        target: "extend-duration-box",
        title: "Durasi Sudah Otomatis",
        description:
          "Durasi perpanjangan magang sudah diisi Leader di form evaluasi. HR tidak perlu mengubahnya di sini.",
      },
    );
  }

  if (mode === "extend") {
    steps.push(
      {
        target: "extend-start-date",
        title: "Tanggal Mulai Kontrak Baru",
        description:
          "Isi tanggal mulai berlakunya kontrak yang baru. Tanggal akhir kontrak akan dihitung otomatis dari durasi yang sudah ditentukan Leader.",
      },
      {
        target: "extend-duration-box",
        title: "Durasi Sudah Otomatis Terisi",
        description:
          "Durasi perpanjangan kontrak ini sudah diisi Leader di form evaluasi. HR tidak perlu mengubahnya di sini.",
      },
    );
  }

  if (mode === "promote") {
    steps.push({
      target: "promote-notice-box",
      title: "Intern Akan Diangkat Jadi Karyawan",
      description:
        "Leader mencentang 'Sign PKWT' saat membuat evaluasi ini dan sudah approve, artinya intern akan dipindahkan menjadi Employee baru dengan kontrak PKWT sesuai nomor & durasi yang sudah ditentukan. Data magang tetap tersimpan sebagai riwayat.",
    });
  }

  if (mode === "permanent") {
    steps.push({
      target: "permanent-notice-box",
      title: isInternSubject
        ? "Intern Akan Diangkat Jadi Karyawan Tetap"
        : "Karyawan Akan Menjadi Permanen",
      description: isInternSubject
        ? "Intern ini akan langsung menjadi karyawan permanen tanpa melalui kontrak PKWT terlebih dahulu."
        : "Setelah dikonfirmasi, karyawan ini tidak lagi memiliki tanggal berakhir kontrak dan berstatus permanen.",
    });
  }

  if (mode === "close") {
    steps.push(
      {
        target: "close-action-buttons",
        title: "Pilih Tindakan",
        description:
          "'Nonaktifkan' akan menyimpan data namun menandainya tidak aktif. 'Hapus Permanen' akan menghapus seluruh data dan riwayat evaluasi terkait secara permanen — gunakan dengan hati-hati.",
      },
      {
        target: "close-reason",
        title: "Alasan (Opsional)",
        description:
          "Catat alasan kontrak/magang tidak dilanjutkan untuk keperluan dokumentasi HR.",
      },
    );
  }

  return steps;
};
