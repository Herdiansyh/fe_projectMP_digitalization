# Ringkasan Rencana: Modul Competency Assessment

## Konteks Sistem yang Sudah Ada

1. Requester buat FPTK → melalui approval chain (Manager → Division Head → Director).
2. HR Admin proses FPTK yang sudah `Approved` → status jadi `Processed HRD`.
3. HR Admin isi data kandidat (**bisa lebih dari 1 orang per FPTK**) lewat modal Assign Manpower — data sementara disimpan di kolom JSON `pending_candidates` pada tabel `requisitions`.
4. Requester (atau siapa pun dari department yang sama) lengkapi Area/Line/Station untuk **setiap kandidat** (jumlah baris otomatis mengikuti jumlah kandidat dari HRD, masing-masing bisa beda Area/Line/Station).
5. Saat disubmit, backend membuat banyak record `Employee`/`Intern` sekaligus (satu per kandidat), semuanya terhubung ke FPTK yang sama lewat kolom `no_req` (bukan relasi 1:1 lama).
6. Status FPTK jadi `Manpower Assigned`, `pending_candidates` dikosongkan.

### Tabel & Model yang Relevan (sudah ada)

- `requisitions` (PK: `no_req`, string) — status approval, data FPTK, `pending_candidates` (JSON).
- `employees`, `interns` — masing-masing punya `npk`, `name`, `department_id`, `section_id`, `area_id`, `line_id`, `station_id`, `no_req` (FK ke requisitions).
- `areas`, `lines`, `stations` — tabel master lokasi kerja (hierarkis: Area → Line → Station).
- `departments`, `sections`, `role_levels` — tabel master organisasi.
- `users` — punya `department_id`, `section_id`, `role_level_id`, `director_id`, plus approver chain (`approver_manager_id`, dst). **Belum dipastikan apakah user (khususnya Leader/Supervisor) punya `line_id`/`area_id` sendiri** — perlu dicek sebelum implementasi hak akses modul baru ini.

---

## Modul Baru yang Direncanakan: Competency Assessment

### Sumber Rujukan

User mengunggah file Excel `TECHNICAL_COMPETENCY_MATRIX_Final_Assembly.xlsx` berisi **12 sheet**, masing-masing mewakili satu proses/station kerja (mis. "PWBA Assy (L5)", "Inner Case Assy", "Knob Leak Test", dst).

### Struktur Rubrik (per sheet/proses)

Setiap sheet berisi beberapa **kategori** (kolom besar), masing-masing berisi beberapa **checkpoint** (kriteria penilaian):

```
Kategori (contoh): Material Handling, Mechanical Assembly, Manual Inspection,
                    Equipment Operation, ESD Aspect & Abnormality, Speed Process

Tiap Kategori berisi beberapa Checkpoint, contoh:
  "Operator memahami standard cleaning komponen"  → Weight: 3, Point: 1-4 (nilai aktual)
```

### Rumus Perhitungan (dikonfirmasi dari formula Excel asli)

```
Total Point (per checkpoint)   = Weight × Point
Total Point (per kategori)     = SUM semua checkpoint dalam kategori itu
Average Point (per kategori)   = Total Point kategori ÷ JUMLAH CHECKPOINT dalam kategori itu
                                  (bukan dibagi total weight!)
Skor Akhir (Total Matrix Skill) = AVERAGE dari semua Average Point kategori yang TERISI
                                  (rata-rata sederhana/unweighted; kategori kosong tidak ikut dihitung)
```

Contoh dari sheet asli: 6 kategori terisi → skor akhir = `AVERAGE(avg_kat1, avg_kat2, ..., avg_kat6)`.

### Keputusan yang Sudah Disepakati (hasil diskusi dengan user)

| Pertanyaan                                                           | Keputusan                                                                              |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Siapa yang mengisi penilaian?                                        | **Leader/Supervisor per line**                                                         |
| Frekuensi penilaian?                                                 | **Berkala/berulang** (perlu riwayat & tren per periode, bukan sekali saja)             |
| Cara setup rubrik matrix di awal?                                    | **Input manual via form** (bukan import Excel)                                         |
| Siapa yang boleh mengelola rubrik matrix (Manage Competency Matrix)? | **Admin saja** (bukan HR Admin)                                                        |
| Rumus skor akhir                                                     | **Rata-rata sederhana antar kategori** (dikonfirmasi dari formula asli, lihat di atas) |

### Yang Masih Perlu Dicek/Diputuskan

1. **Apakah user (Leader/Supervisor) sudah punya `line_id`/`area_id` di tabel `users`?** — ini menentukan bagaimana hak akses "leader hanya bisa menilai employee di line-nya sendiri" diimplementasikan. Perlu cek `Schema::getColumnListing('users')` atau model `User.php` terbaru.
2. Detail UI final untuk form penilaian & dashboard (sudah ada wireframe kasar, lihat di bawah).

---

## Rancangan Skema Data (Diusulkan, Belum Diimplementasikan)

```
competency_matrices
├─ id
├─ station_id        (FK → stations; 1 matrix = 1 proses/station kerja)
├─ name               (mis. "PWBA Assy (L5)")
└─ is_active          (boolean; nonaktifkan matrix lama tanpa hapus riwayat penilaian)

competency_categories
├─ id
├─ matrix_id          (FK → competency_matrices)
├─ name                (mis. "Material Handling")
└─ order

competency_checkpoints
├─ id
├─ category_id         (FK → competency_categories)
├─ description
├─ weight
└─ order

employee_assessments
├─ id
├─ employee_id (nullable, FK → employees)
├─ intern_id (nullable, FK → interns)      — salah satu diisi
├─ matrix_id           (FK → competency_matrices)
├─ assessed_by         (FK → users; leader/supervisor yang menilai)
├─ period_label         (mis. "Q3 2026" — untuk pengelompokan tren per periode)
├─ assessed_at
└─ notes (nullable)

assessment_scores
├─ id
├─ assessment_id       (FK → employee_assessments)
├─ checkpoint_id       (FK → competency_checkpoints)
└─ point                 (nilai aktual yang diberikan, biasanya 1-4)
```

**Catatan desain:**

- `Total Point`/`Average Point` **tidak disimpan** sebagai kolom — dihitung on-the-fly dari `assessment_scores` × `weight` checkpoint, supaya tidak ada data yang out-of-sync kalau rubrik diubah di kemudian hari.
- Setiap kali dinilai, dibuat **record baru** di `employee_assessments` (bukan update record lama) — supaya riwayat & tren per periode bisa dilihat.

---

## Rancangan Alur & Halaman (Wireframe Kasar)

### 1. Halaman "Competency Assessment" (untuk Leader/Supervisor)

- Ringkasan card: jumlah manpower di line, sudah/belum dinilai bulan ini.
- Tabel manpower di line leader tsb: Nama, NPK, Station, Skor Terakhir (dengan indikator naik/turun dari periode sebelumnya), Tanggal Terakhir Dinilai, tombol "Nilai".

### 2. Form Penilaian (per employee, per station)

- Otomatis load matrix sesuai `station_id` employee.
- Render per kategori (accordion/collapsible), tiap checkpoint pakai pilihan 1-4.
- Total & average per kategori serta skor akhir **update live** saat mengisi, sebelum submit.
- Submit → buat record baru `employee_assessments` + `assessment_scores`.

### 3. Halaman "Manage Competency Matrix" (khusus role Admin — setup rubrik)

- Pilih Station → tambah Kategori → dalam kategori tambah Checkpoint (deskripsi + weight).
- Form builder dinamis (tombol "+ Add Category", "+ Add Checkpoint").
- **Hanya role `Admin`** yang boleh akses halaman ini — HR Admin, Leader, maupun role lain tidak berwenang mengubah rubrik, meskipun mereka bisa melihat/menggunakan hasilnya.

### 4. Halaman "Competency Overview" (untuk HR/Admin — dashboard lintas line, read-only)

- Rata-rata skor per station (bar chart).
- Daftar manpower yang belum dinilai > 3 bulan.
- Link ke "Manage Competency Matrix".

### 5. Tab "Competency History" di halaman detail employee (existing)

- Tabel riwayat assessment dari waktu ke waktu.
- Grafik tren (garis) skor per periode — per kategori atau skor total.

---

## Status Pengerjaan

Rencana ini **baru di tahap desain/diskusi** — belum ada kode (migration/model/controller/komponen React) yang dibuat untuk modul ini. Langkah selanjutnya yang disepakati: mulai dari **gambaran halaman/wireframe** (sudah dituangkan di atas), sebelum lanjut ke implementasi migration & model.
