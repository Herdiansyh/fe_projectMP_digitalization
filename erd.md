# ERD — Sistem FPTK & Master Data Karyawan

## Daftar Tabel

### 1. `departments`

| Kolom      | Tipe      | Keterangan      |
| ---------- | --------- | --------------- |
| id         | bigint PK |                 |
| name       | varchar   | Nama department |
| created_at | timestamp |                 |
| updated_at | timestamp |                 |

---

### 2. `sections`

| Kolom         | Tipe      | Keterangan       |
| ------------- | --------- | ---------------- |
| id            | bigint PK |                  |
| name          | varchar   | Nama section     |
| department_id | bigint FK | → departments.id |
| created_at    | timestamp |                  |
| updated_at    | timestamp |                  |

---

### 3. `role_levels`

| Kolom      | Tipe      | Keterangan                           |
| ---------- | --------- | ------------------------------------ |
| id         | bigint PK |                                      |
| name       | varchar   | Misal: Operator, Staff, Manager, dll |
| created_at | timestamp |                                      |
| updated_at | timestamp |                                      |

---

### 4. `users`

| Kolom                | Tipe               | Keterangan            |
| -------------------- | ------------------ | --------------------- |
| id                   | bigint PK          |                       |
| npk                  | varchar unique     |                       |
| name                 | varchar            |                       |
| username             | varchar unique     |                       |
| email                | varchar unique     |                       |
| password             | varchar            | Hashed                |
| department_id        | bigint FK          | → departments.id      |
| section_id           | bigint FK          | → sections.id         |
| role_level_id        | bigint FK          | → role_levels.id      |
| director_id          | bigint FK nullable | → users.id (self-ref) |
| approver_manager_id  | bigint FK nullable | → users.id            |
| approver_division_id | bigint FK nullable | → users.id            |
| approver_director_id | bigint FK nullable | → users.id            |
| is_admin             | boolean            | Default false         |
| created_at           | timestamp          |                       |
| updated_at           | timestamp          |                       |

---

### 5. `employees` ← NEW

| Kolom           | Tipe               | Keterangan                                 |
| --------------- | ------------------ | ------------------------------------------ |
| id              | bigint PK          |                                            |
| npk             | varchar unique     |                                            |
| name            | varchar            |                                            |
| gender          | enum               | male / female                              |
| department_id   | bigint FK nullable | → departments.id                           |
| section_id      | bigint FK nullable | → sections.id                              |
| role_level_id   | bigint FK nullable | → role_levels.id                           |
| jabatan         | varchar nullable   | Nama jabatan spesifik                      |
| employment_type | enum               | permanent / contract / apprentice          |
| status          | enum               | active / nonactive / resigned              |
| start_contract  | date               | Tanggal mulai kontrak                      |
| end_contract    | date nullable      | Tanggal akhir kontrak. NULL jika permanent |
| created_at      | timestamp          |                                            |
| updated_at      | timestamp          |                                            |

> **Catatan:**
>
> - `end_contract` wajib diisi jika `employment_type` = contract atau apprentice
> - `end_contract` = NULL jika `employment_type` = permanent
> - Warning baris merah ditampilkan jika `end_contract` ≤ 30 hari dari hari ini

---

### 6. `fptk`

| Kolom                   | Tipe               | Keterangan                             |
| ----------------------- | ------------------ | -------------------------------------- |
| id                      | bigint PK          |                                        |
| nomor_fptk              | varchar unique     | Nomor dokumen FPTK                     |
| request_type            | enum               | new_position / replacement             |
| replacement_employee_id | bigint FK nullable | → employees.id. Wajib jika replacement |
| headcount               | int                | Jumlah orang yang diminta              |
| apprenticeship_period   | boolean            | Yes / No — apakah butuh magang         |
| department_id           | bigint FK          | → departments.id                       |
| section_id              | bigint FK nullable | → sections.id                          |
| role_level_id           | bigint FK nullable | → role_levels.id                       |
| jabatan                 | varchar nullable   | Posisi yang diminta                    |
| alasan                  | text               | Alasan pengajuan                       |
| status                  | enum               | draft / pending / approved / rejected  |
| created_by              | bigint FK          | → users.id (pembuat FPTK)              |
| created_at              | timestamp          |                                        |
| updated_at              | timestamp          |                                        |

---

### 7. `fptk_approvals`

| Kolom       | Tipe               | Keterangan                    |
| ----------- | ------------------ | ----------------------------- |
| id          | bigint PK          |                               |
| fptk_id     | bigint FK          | → fptk.id                     |
| approver_id | bigint FK          | → users.id                    |
| role        | enum               | manager / division / director |
| status      | enum               | pending / approved / rejected |
| note        | text nullable      | Catatan approver              |
| approved_at | timestamp nullable |                               |
| created_at  | timestamp          |                               |
| updated_at  | timestamp          |                               |

---

### 8. `recruitments` ← NEW

| Kolom       | Tipe      | Keterangan                                         |
| ----------- | --------- | -------------------------------------------------- |
| id          | bigint PK |                                                    |
| fptk_id     | bigint FK | → fptk.id                                          |
| employee_id | bigint FK | → employees.id (karyawan baru yang direkrut)       |
| status      | enum      | pending_placement / placed / apprentice / contract |
| created_by  | bigint FK | → users.id (HR yang input)                         |
| created_at  | timestamp |                                                    |
| updated_at  | timestamp |                                                    |

---

### 9. `placements` ← NEW

| Kolom            | Tipe             | Keterangan                                    |
| ---------------- | ---------------- | --------------------------------------------- |
| id               | bigint PK        |                                               |
| recruitment_id   | bigint FK        | → recruitments.id                             |
| placement_type   | enum             | operator / non_operator                       |
| area             | varchar          |                                               |
| line             | varchar nullable | Hanya jika operator                           |
| station          | varchar nullable | Hanya jika operator                           |
| placement_detail | text nullable    | Hanya jika non_operator                       |
| placed_by        | bigint FK        | → users.id (pembuat FPTK yang isi penempatan) |
| placed_at        | timestamp        |                                               |
| created_at       | timestamp        |                                               |
| updated_at       | timestamp        |                                               |

---

## Relasi Antar Tabel

```
departments ──< sections
departments ──< users
departments ──< employees
departments ──< fptk

sections ──< users
sections ──< employees
sections ──< fptk

role_levels ──< users
role_levels ──< employees
role_levels ──< fptk

users >── users (self-ref: director, approver_manager, approver_division, approver_director)
users ──< fptk (created_by)
users ──< fptk_approvals (approver_id)
users ──< recruitments (created_by)
users ──< placements (placed_by)

employees ──< fptk (replacement_employee_id) [nullable]
employees ──< recruitments (employee_id)

fptk ──< fptk_approvals
fptk ──< recruitments

recruitments ──1 placements
```

---

## Diagram Alur Status

### Status FPTK

```
draft → pending → approved → rejected
                     ↓
              "Ready for Recruitment"
              (semua fptk_approvals = approved)
```

### Status Recruitment

```
pending_placement
       ↓
    placed
       ↓
  ┌────┴────┐
  ↓         ↓
apprentice  contract
(magang)   (langsung)
```

---

## Skenario Bisnis

### A. FPTK New Position

```
User buat FPTK
├── request_type = new_position
├── replacement_employee_id = NULL
├── headcount = 2
└── apprenticeship_period = true

→ Approved semua
→ HR input 2 karyawan baru (2 records di employees + recruitments)
→ Pembuat FPTK isi penempatan (2 records di placements)
→ Karena apprenticeship_period = true
  └── status recruitment = "apprentice"
      (nanti masuk Matrix Penilaian — fase berikutnya)
```

### B. FPTK Replacement

```
User buat FPTK
├── request_type = replacement
├── replacement_employee_id = 5 (Budi Santoso — karyawan lama)
├── headcount = 1
└── apprenticeship_period = false

→ Approved semua
→ HR input 1 karyawan baru
→ Pembuat FPTK isi penempatan
→ Karena apprenticeship_period = false
  └── status recruitment = "contract"
```

### C. Warning End Contract di Master Data

```
Hari ini: 2026-06-26

employees
├── Andi Pratama — end_contract: 2026-07-10 → ⚠️ MERAH (14 hari lagi)
├── Sari Dewi    — end_contract: 2026-09-01 → ✅ Normal (67 hari lagi)
└── Budi Santoso — employment_type: permanent → end_contract: NULL → ✅ Normal
```

---

## Fase Pengerjaan

| Fase      | Modul                                                                               | Status         |
| --------- | ----------------------------------------------------------------------------------- | -------------- |
| ✅ Done   | User Management                                                                     | Selesai        |
| 🔨 Fase 1 | Master Data Karyawan (`employees`)                                                  | Selanjutnya    |
| 🔨 Fase 2 | Tambah kolom FPTK (`replacement_employee_id`, `headcount`, `apprenticeship_period`) | Selanjutnya    |
| 🔨 Fase 3 | Modul Rekrutmen (`recruitments`) — HR input karyawan                                | Setelah Fase 2 |
| 🔨 Fase 4 | Modul Penempatan (`placements`) — pembuat FPTK isi area/line/station                | Setelah Fase 3 |
| 🔜 Fase 5 | Matrix Penilaian Magang                                                             | Nanti          |
