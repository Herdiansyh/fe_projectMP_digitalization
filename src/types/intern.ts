// // export interface Department {
// //   id: number;
// //   name: string;
// // }

// // export interface Section {
// //   id: number;
// //   name: string;
// // }

// // export interface RoleLevel {
// //   id: number;
// //   name: string;
// // }

// // export interface Area {
// //   id: number;
// //   name: string;
// // }

// // export interface Line {
// //   id: number;
// //   name: string;
// //   area_id: number;
// //   area?: Area;
// // }

// // export interface Station {
// //   id: number;
// //   name: string;
// //   line_id: number;
// //   line?: Line;
// // }

// // export interface Intern {
// //   id: number;
// //   npk: string;
// //   name: string;
// //   gender: "male" | "female";
// //   department_id: number | null;
// //   section_id: number | null;
// //   role_level?: string | null;
// //   jabatan: string | null;

// //   // Foreign keys (baru)
// //   area_id?: number | null;
// //   line_id?: number | null;
// //   station_id?: number | null;

// //   // Relasi objek (dikembalikan oleh InternResource, bukan string lagi)
// //   area?: Area | null;
// //   line?: Line | null;
// //   station?: Station | null;
// //   join_date: string;

// //   start_contract: string;
// //   end_contract: string | null;
// //   is_near_expiry?: boolean;
// //   days_until_expiry?: number | null;
// //   department?: Department | null;
// //   section?: Section | null;
// //   created_at?: string;
// //   updated_at?: string;
// //   group: "A" | "B" | null;
// // }

// // export interface CreateInternInput {
// //   npk: string;
// //   name: string;
// //   gender: "male" | "female";
// //   department_id: number | null;
// //   section_id: number | null;
// //   role_level?: string | null;
// //   jabatan: string;
// //   area_id: number | null;
// //   line_id?: number | null;
// //   station_id: number | null;
// //   join_date: string;
// //   start_contract: string;
// //   end_contract: string | null;
// //   group: "A" | "B" | null;
// // }

// // export type UpdateInternInput = Partial<CreateInternInput>;

// // export interface InternListParams {
// //   page?: number;
// //   per_page?: number;
// //   search?: string;
// //   department_id?: number;
// //   section_id?: number;
// //   near_expiry?: boolean;
// //   all?: boolean;

// //   area_id?: number;
// //   line_id?: number;
// //   station_id?: number;
// //   group?: string;
// // }

// export interface Department {
//   id: number;
//   name: string;
// }

// export interface Section {
//   id: number;
//   name: string;
// }

// export interface RoleLevel {
//   id: number;
//   name: string;
// }

// export interface Area {
//   id: number;
//   name: string;
// }

// export interface Line {
//   id: number;
//   name: string;
//   area_id: number;
//   area?: Area;
// }

// export interface Station {
//   id: number;
//   name: string;
//   line_id: number;
//   line?: Line;
// }

// export interface EmployeeSummary {
//   id: number;
//   npk: string;
//   name: string;
// }

// export interface Intern {
//   id: number;
//   npk: string;
//   name: string;
//   gender: "male" | "female";
//   department_id: number | null;
//   section_id: number | null;
//   role_level?: string | null;
//   jabatan: string | null;
//   area_id?: number | null;
//   line_id?: number | null;
//   station_id?: number | null;
//   area?: Area | null;
//   line?: Line | null;
//   station?: Station | null;
//   join_date: string;
//   start_contract: string;
//   end_contract: string | null;
//   is_near_expiry?: boolean;
//   days_until_expiry?: number | null;
//   department?: Department | null;
//   section?: Section | null;
//   created_at?: string;
//   updated_at?: string;
//   group: "A" | "B" | null;

//   // === TAMBAHAN INTERN: outcome dari alur evaluasi HR Admin ===
//   outcome_status: "active" | "converted" | "ended";
//   converted_employee_id: number | null;
//   converted_employee?: EmployeeSummary | null;
//   outcome_at: string | null;
//   outcome_note: string | null;
// }

// export interface CreateInternInput {
//   npk: string;
//   name: string;
//   gender: "male" | "female";
//   department_id: number | null;
//   section_id: number | null;
//   role_level?: string | null;
//   jabatan: string;
//   area_id: number | null;
//   line_id?: number | null;
//   station_id: number | null;
//   join_date: string;
//   start_contract: string;
//   end_contract: string | null;
//   group: "A" | "B" | null;
// }

// export type UpdateInternInput = Partial<CreateInternInput>;

// export interface InternListParams {
//   page?: number;
//   per_page?: number;
//   search?: string;
//   department_id?: number;
//   section_id?: number;
//   near_expiry?: boolean;
//   all?: boolean;

//   area_id?: number;
//   line_id?: number;
//   station_id?: number;
//   group?: string;
// }

export interface Department {
  id: number;
  name: string;
}

export interface Section {
  id: number;
  name: string;
}

export interface RoleLevel {
  id: number;
  name: string;
}

export interface Area {
  id: number;
  name: string;
}

export interface Line {
  id: number;
  name: string;
  area_id: number;
  area?: Area;
}

export interface Station {
  id: number;
  name: string;
  line_id: number;
  line?: Line;
}

// === TAMBAHAN INTERN (outcome dari evaluasi HR Admin) ===
// Mirror kolom migration `interns` (lihat plan poin "Perubahan Skema Database").
export interface EmployeeSummary {
  id: number;
  npk: string;
  name: string;
}

export interface Intern {
  id: number;
  npk: string;
  name: string;
  gender: "male" | "female";
  department_id: number | null;
  section_id: number | null;
  role_level?: string | null;
  jabatan: string | null;

  // Foreign keys (baru)
  area_id?: number | null;
  line_id?: number | null;
  station_id?: number | null;

  // Relasi objek (dikembalikan oleh InternResource, bukan string lagi)
  area?: Area | null;
  line?: Line | null;
  station?: Station | null;
  join_date: string;

  start_contract: string;
  end_contract: string | null;
  is_near_expiry?: boolean;
  days_until_expiry?: number | null;
  department?: Department | null;
  section?: Section | null;
  created_at?: string;
  updated_at?: string;
  group: "A" | "B" | null;

  // === TAMBAHAN INTERN: outcome dari alur evaluasi HR Admin ===
  outcome_status: "active" | "converted" | "ended";
  converted_employee_id: number | null;
  // Objek ringkas Employee hasil promosi — ASUMSI: saya menamakan field ini
  // `converted_employee` mengikuti konvensi relasi lain di file ini
  // (department, section, area, dst pakai nama relasi tanpa `_id`).
  // Tolong dikoreksi kalau EvaluationResource/InternResource backend
  // memakai nama key lain untuk relasi ini.
  converted_employee?: EmployeeSummary | null;
  outcome_at: string | null;
  outcome_note: string | null;
}

export interface CreateInternInput {
  npk: string;
  name: string;
  gender: "male" | "female";
  department_id: number | null;
  section_id: number | null;
  role_level?: string | null;
  jabatan: string;
  area_id: number | null;
  line_id?: number | null;
  station_id: number | null;
  join_date: string;
  start_contract: string;
  end_contract: string | null;
  group: "A" | "B" | null;
}

export type UpdateInternInput = Partial<CreateInternInput>;

export interface InternListParams {
  page?: number;
  per_page?: number;
  search?: string;
  department_id?: number;
  section_id?: number;
  near_expiry?: boolean;
  all?: boolean;

  area_id?: number;
  line_id?: number;
  station_id?: number;
  group?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
